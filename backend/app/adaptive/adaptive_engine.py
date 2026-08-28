from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.recommendation_engine import RecommendationEngine
from backend.app.engine.fingerprint import StateFingerprinter
from backend.app.adaptive.event_processor import EventProcessor
from backend.app.adaptive.change_detector import ChangeDetector
from backend.app.adaptive.roadmap_adapter import RoadmapAdapter
from backend.app.adaptive.config import ADAPTIVE_ALGORITHM_VERSION
from backend.app.core.logger import logger

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

    def adapt_from_intelligence_signals(
        self,
        profile_id: str,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Phase 7 Stage 4: Advanced Adaptive Roadmap Evaluation
        Consumes Velocity, Mastery, and Decay signals to execute deterministic adaptation rules.
        """
        from backend.app.intelligence.velocity_model import LearningVelocityEngine
        from backend.app.intelligence.decay_engine import SkillDecayEngine
        from backend.app.intelligence.mastery_engine import SkillMasteryEngine

        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        goal = self.db.query(Goal).filter(Goal.profile_id == profile.id, Goal.is_primary == True).first()
        if not goal:
            goal = self.db.query(Goal).filter(Goal.profile_id == profile.id).first()
        if not goal:
            raise ValueError(f"No goal found for profile {profile_id}")

        velocity_engine = LearningVelocityEngine(self.db)
        decay_engine = SkillDecayEngine(self.db)
        mastery_engine = SkillMasteryEngine(self.db)

        velocity_data = velocity_engine.calculate_velocity(profile_id=profile_id)
        decay_summary = decay_engine.get_mastery_and_decay_summary(profile_id=profile_id)
        mastery_list = decay_summary.mastery

        trigger = "routine_evaluation"
        reason = "Routine roadmap optimization"
        should_adapt = force

        # Rule C: Skill Decay Trigger
        decayed_skills = [d.skill_slug for d in decay_summary.decay if d.decay_state in ("Review Recommended", "Decay Risk")]
        if decayed_skills:
            trigger = "skill_decay"
            reason = f"Skill freshness decline detected for: {', '.join(decayed_skills[:3])}. Injected review priorities."
            should_adapt = True

        # Rule A: Accelerated Velocity Trigger
        elif velocity_data.pacing_state == "accelerated" and velocity_data.velocity_score >= 0.75:
            trigger = "velocity_accelerated"
            reason = "Learning velocity is accelerated. Pacing adjusted to prioritize advanced competencies."
            should_adapt = True

        # Rule B: Behind Schedule Workload Streamlining
        elif velocity_data.pacing_state == "behind_schedule" and velocity_data.abandonment_rate >= 0.30:
            trigger = "velocity_behind_schedule"
            reason = "Velocity indicates behind-schedule pacing. Workload streamlined to focus on critical core topics."
            should_adapt = True

        # Rule D: High Mastery Bypass
        elif any(m.mastery_score >= 0.85 and m.competency_tier == "Mastery" for m in mastery_list):
            high_mastery_skills = [m.skill_slug for m in mastery_list if m.mastery_score >= 0.85]
            trigger = "mastery_bypass"
            reason = f"Demonstrated high mastery in {', '.join(high_mastery_skills[:2])}. Accelerated past introductory repetition."
            should_adapt = True

        # Rule E: Inactive Recovery
        elif velocity_data.pacing_state == "inactive" and velocity_data.confidence != "insufficient_data":
            trigger = "inactivity_recovery"
            reason = "Inactivity period detected. Created gentle recovery pacing preserving all completed modules."
            should_adapt = True

        if not should_adapt:
            return {
                "adaptation_applied": False,
                "trigger": trigger,
                "reason": "Current roadmap remains optimal with respect to learning velocity and skill freshness.",
                "new_version": None,
                "changes": []
            }

        # Regenerate recommendations and adapt roadmap
        rec_result = self.rec_engine.generate(
            profile_id=profile.id,
            goal_id=goal.id,
            top_k=10,
            persist=True
        )

        new_fingerprint = StateFingerprinter.generate_fingerprint(profile=profile, goal=goal)
        profile.state_hash = new_fingerprint

        roadmap_changed, new_version, changes = self.roadmap_adapter.adapt_roadmap(
            profile=profile,
            goal=goal,
            new_recommendations=rec_result.get("recommendations", []),
            new_phases=rec_result.get("phases", []),
            trigger=trigger,
            reason=reason,
            fingerprint=new_fingerprint
        )

        self.db.commit()

        return {
            "adaptation_applied": roadmap_changed,
            "trigger": trigger,
            "reason": reason,
            "new_version": new_version.version_number if new_version else None,
            "version_hash": new_version.version_hash if new_version else None,
            "changes": changes,
            "explanation": f"Roadmap adapted via {trigger}: {reason}"
        }
