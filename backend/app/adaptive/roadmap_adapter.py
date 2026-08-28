import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Set
from sqlalchemy.orm import Session
from backend.app.models.learning_path import (
    LearningPath, LearningPathVersion, LearningPathItem, RoadmapChange, RecommendationExplanation
)
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.adaptive.config import ROADMAP_ADAPTATION_VERSION

class RoadmapAdapter:
    def __init__(self, db: Session):
        self.db = db

    def adapt_roadmap(
        self,
        profile: LearnerProfile,
        goal: Goal,
        new_recommendations: List[Dict[str, Any]],
        new_phases: List[Dict[str, Any]],
        trigger: str,
        reason: str,
        fingerprint: str,
        idempotency_key: Optional[str] = None
    ) -> Tuple[bool, Optional[LearningPathVersion], List[Dict[str, Any]]]:
        """
        Compares existing active roadmap version with new sequenced recommendations.
        Persists a new immutable LearningPathVersion only if a structural change is detected.
        """
        # 1. Fetch or create learning path
        learning_path = (
            self.db.query(LearningPath)
            .filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True)
            .first()
        )
        if not learning_path:
            learning_path = LearningPath(
                profile_id=profile.id,
                goal_id=goal.id,
                title=f"PathFinder: {goal.target_role} Curriculum",
                is_active=True,
                algorithm_version=ROADMAP_ADAPTATION_VERSION
            )
            self.db.add(learning_path)
            self.db.flush()

        # 2. Fetch current active version
        active_version = (
            self.db.query(LearningPathVersion)
            .filter(
                LearningPathVersion.learning_path_id == learning_path.id,
                LearningPathVersion.is_active == True
            )
            .first()
        )

        old_resource_ids: List[str] = []
        if active_version:
            old_resource_ids = [item.resource_id for item in active_version.items]

        # Extract new ordered resource items from recommendations/phases
        new_items_flattened = []
        seq = 1
        for p in new_phases:
            for it in p.get("items", []):
                new_items_flattened.append({
                    "resource_id": it["resource_id"],
                    "phase_number": p["phase_number"],
                    "phase_name": p["phase_name"],
                    "sequence_order": seq,
                    "planned_hours": it.get("estimated_hours", 5.0),
                    "score": it.get("score", 0.80)
                })
                seq += 1

        new_resource_ids = [it["resource_id"] for it in new_items_flattened]

        # 3. Detect Diff
        # Canonical hash of the roadmap structure and learner state
        ver_hash = hashlib.sha256(f"{learning_path.id}:{fingerprint}:{new_resource_ids}".encode()).hexdigest()

        # If active version already has the exact same version hash, do not create duplicate version
        if active_version and active_version.version_hash == ver_hash:
            return False, active_version, []

        # If items, ordering, or competency state meaningfully changed, create new version
        is_structurally_changed = (old_resource_ids != new_resource_ids)
        if active_version and not is_structurally_changed and trigger in ("heartbeat", "view", "course_started", "repeat"):
            return False, active_version, []

        # 4. Create New LearningPathVersion
        next_ver_num = (active_version.version_number + 1) if active_version else 1
        ver_hash = hashlib.sha256(f"{learning_path.id}:{next_ver_num}:{fingerprint}".encode()).hexdigest()

        new_version = LearningPathVersion(
            learning_path_id=learning_path.id,
            version_number=next_ver_num,
            version_hash=ver_hash,
            trigger=trigger,
            change_summary=reason,
            is_active=True,
            idempotency_key=idempotency_key
        )
        self.db.add(new_version)
        self.db.flush()

        # Map new items and explanations
        rec_by_res_id = {r["resource"]["id"]: r for r in new_recommendations}
        changes_recorded: List[Dict[str, Any]] = []

        old_set = set(old_resource_ids)
        new_set = set(new_resource_ids)

        for it_data in new_items_flattened:
            r_id = it_data["resource_id"]
            lp_item = LearningPathItem(
                version_id=new_version.id,
                resource_id=r_id,
                phase_number=it_data["phase_number"],
                phase_name=it_data["phase_name"],
                sequence_order=it_data["sequence_order"],
                planned_hours=it_data["planned_hours"],
                is_completed=False,
                is_locked=it_data["phase_number"] > 1
            )
            self.db.add(lp_item)
            self.db.flush()

            # Attach explanation if present
            rec_match = rec_by_res_id.get(r_id)
            if rec_match and "explanation" in rec_match:
                expl_data = rec_match["explanation"]
                expl = RecommendationExplanation(
                    path_item_id=lp_item.id,
                    goal_relevance_score=expl_data.get("goal_relevance_score", 0.0),
                    skill_gap_score=expl_data.get("skill_gap_score", 0.0),
                    prereq_score=expl_data.get("prereq_score", 0.0),
                    difficulty_score=expl_data.get("difficulty_score", 0.0),
                    pref_score=expl_data.get("pref_score", 0.0),
                    time_score=expl_data.get("time_score", 0.0),
                    engagement_score=expl_data.get("engagement_score", 0.0),
                    diversity_score=expl_data.get("diversity_score", 0.0),
                    composite_score=expl_data.get("composite_score", 0.0),
                    structured_reasons=expl_data.get("structured_reasons", []),
                    human_readable_explanation=expl_data.get("human_readable_explanation", "")
                )
                self.db.add(expl)

            # Record RoadmapChange
            if r_id not in old_set:
                change_type = "added"
                change_reason = f"Resource unlocked and added to {it_data['phase_name']} due to competency progress."
            else:
                change_type = "reordered"
                change_reason = f"Resource updated to sequence position {it_data['sequence_order']}."

            rc = RoadmapChange(
                learning_path_id=learning_path.id,
                version_id=new_version.id,
                previous_item_id=None,
                new_item_id=lp_item.id,
                change_type=change_type,
                reason=change_reason,
                trigger=trigger
            )
            self.db.add(rc)
            changes_recorded.append({
                "resource_id": r_id,
                "change_type": change_type,
                "reason": change_reason
            })

        for removed_id in (old_set - new_set):
            rc_rem = RoadmapChange(
                learning_path_id=learning_path.id,
                version_id=new_version.id,
                previous_item_id=removed_id,
                new_item_id=None,
                change_type="removed",
                reason="Resource removed / completed from active curriculum.",
                trigger=trigger
            )
            self.db.add(rc_rem)
            changes_recorded.append({
                "resource_id": removed_id,
                "change_type": "removed",
                "reason": "Resource completed or replaced."
            })

        # 5. Deactivate old version and update learning path
        if active_version:
            active_version.is_active = False

        learning_path.current_version_id = new_version.id
        self.db.flush()

        return True, new_version, changes_recorded
