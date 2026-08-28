from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.recommendation_engine import RecommendationEngine
from backend.app.engine.fingerprint import StateFingerprinter
from backend.app.adaptive.event_processor import EventProcessor
from backend.app.adaptive.change_detector import ChangeDetector
from backend.app.adaptive.roadmap_adapter import RoadmapAdapter
from backend.app.adaptive.config import ADAPTIVE_ALGORITHM_VERSION

class AdaptiveEngine:
    def __init__(self, db: Session):
        self.db = db
        self.event_processor = EventProcessor(db)
        self.change_detector = ChangeDetector()
        self.roadmap_adapter = RoadmapAdapter(db)
        self.rec_engine = RecommendationEngine(db)

    def process_event(
        self,
        event_id: str,
        profile_id: str,
        event_type: str,
        resource_id: Optional[str] = None,
        skill_slug: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes full transactional adaptive learning pipeline:
        Event -> Validate -> Idempotency -> Update State -> Fingerprint ->
        Change Detection -> (If Meaningful) RecEngine.generate ->
        Roadmap Adaptation (Version + Changes) -> Commit & Return
        """
        # 1. Load Learner Profile
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"LearnerProfile with id '{profile_id}' not found")

        goal = self.db.query(Goal).filter(Goal.profile_id == profile.id, Goal.is_primary == True).first()
        if not goal:
            goal = self.db.query(Goal).filter(Goal.profile_id == profile.id).first()

        # 2. Process Event with Idempotency
        event_res = self.event_processor.process(
            event_id=event_id,
            profile=profile,
            event_type=event_type,
            resource_id=resource_id,
            skill_slug=skill_slug,
            payload=payload
        )

        if event_res.get("is_duplicate", False):
            # Duplicate event: return early with previous state, zero duplicate updates
            return {
                "event_processed": True,
                "is_duplicate": True,
                "state_changed": False,
                "meaningful_change": False,
                "recommendations_regenerated": False,
                "roadmap_changed": False,
                "fingerprint": profile.state_hash,
                "explanation": "Event was already processed previously (Idempotent bypass)."
            }

        diff_summary = event_res.get("diff", {})

        # 3. Compute New Fingerprint
        new_fingerprint = StateFingerprinter.generate_fingerprint(profile=profile, goal=goal)
        profile.state_hash = new_fingerprint

        # 4. Change Detection
        is_meaningful, reason, transitions = self.change_detector.detect_meaningful_change(
            event_type=event_type,
            diff_summary=diff_summary
        )

        if not is_meaningful:
            self.db.commit()
            return {
                "event_processed": True,
                "is_duplicate": False,
                "state_changed": True,
                "meaningful_change": False,
                "recommendations_regenerated": False,
                "roadmap_changed": False,
                "fingerprint": new_fingerprint,
                "diff": diff_summary,
                "explanation": "Learner state updated; no curriculum re-optimization needed."
            }

        # 5. Recommendation Regeneration
        rec_result = self.rec_engine.generate(
            profile_id=profile.id,
            goal_id=goal.id,
            top_k=10,
            persist=True
        )

        # 6. Roadmap Comparison & Versioning
        roadmap_changed, new_version, changes = self.roadmap_adapter.adapt_roadmap(
            profile=profile,
            goal=goal,
            new_recommendations=rec_result.get("recommendations", []),
            new_phases=rec_result.get("phases", []),
            trigger=event_type,
            reason=reason,
            fingerprint=new_fingerprint,
            idempotency_key=event_id
        )

        self.db.commit()

        explanation_msg = (
            f"Your roadmap was re-optimized because {reason.lower()} "
            f"Curriculum version {new_version.version_number if new_version else 1} is now active."
            if roadmap_changed
            else f"Competency updated. Active roadmap remains optimal."
        )

        return {
            "event_processed": True,
            "is_duplicate": False,
            "state_changed": True,
            "meaningful_change": True,
            "recommendations_regenerated": True,
            "roadmap_changed": roadmap_changed,
            "new_version": new_version.version_number if new_version else None,
            "version_hash": new_version.version_hash if new_version else None,
            "changes": changes,
            "fingerprint": new_fingerprint,
            "algorithm_version": ADAPTIVE_ALGORITHM_VERSION,
            "explanation": explanation_msg
        }
