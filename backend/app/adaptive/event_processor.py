from typing import Dict, Any, Optional, Set
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource
from backend.app.models.interaction import Interaction
from backend.app.models.feedback import Feedback
from backend.app.models.progress import Progress
from backend.app.adaptive.state_updater import AdaptiveStateUpdater

VALID_EVENT_TYPES: Set[str] = {
    "course_started",
    "course_completed",
    "quiz_completed",
    "quiz_answered",
    "difficulty_feedback",
    "relevance_feedback",
    "resource_liked",
    "resource_disliked",
    "resource_skipped",
    "resource_saved",
    "resource_abandoned"
}

class EventProcessor:
    def __init__(self, db: Session):
        self.db = db

    def check_idempotency(self, event_id: str) -> bool:
        """
        Returns True if event_id was already processed in database.
        """
        if not event_id:
            return False

        # 1. Check feedback records
        exists_feedback = (
            self.db.query(Feedback)
            .filter(Feedback.idempotency_key == event_id)
            .first()
        )
        if exists_feedback:
            return True

        # 2. Check interaction logs
        all_interactions = self.db.query(Interaction).all()
        for inter in all_interactions:
            if inter.meta_data and inter.meta_data.get("event_id") == event_id:
                return True

        return False

    def process(
        self,
        event_id: str,
        profile: LearnerProfile,
        event_type: str,
        resource_id: Optional[str] = None,
        skill_slug: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processes learner events transactionally and updates state.
        """
        if event_type not in VALID_EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{event_type}'. Must be one of {sorted(VALID_EVENT_TYPES)}")

        # Check idempotency
        if event_id and self.check_idempotency(event_id):
            return {
                "event_processed": True,
                "is_duplicate": True,
                "state_changed": False,
                "event_id": event_id
            }

        payload = payload or {}
        resource = None
        if resource_id:
            resource = self.db.query(LearningResource).filter(LearningResource.id == resource_id).first()

        diff_summary: Dict[str, Any] = {}

        # 1. Handle course completion
        if event_type == "course_completed" and resource:
            diff_summary = AdaptiveStateUpdater.apply_resource_completion(profile, resource)
            # Update Progress model
            prog = self.db.query(Progress).filter(
                Progress.profile_id == profile.id,
                Progress.resource_id == resource.id
            ).first()
            if not prog:
                prog = Progress(
                    profile_id=profile.id,
                    resource_id=resource.id,
                    status="completed",
                    completion_percentage=100.0,
                    time_spent_minutes=int(resource.estimated_hours * 60)
                )
                self.db.add(prog)
            else:
                prog.status = "completed"
                prog.completion_percentage = 100.0

        # 2. Handle quiz performance
        elif event_type in ("quiz_completed", "quiz_answered") and skill_slug:
            score_ratio = float(payload.get("score_ratio", 1.0 if payload.get("is_correct", True) else 0.0))
            diff_summary = AdaptiveStateUpdater.apply_quiz_result(profile, skill_slug, score_ratio)

        # 3. Handle difficulty feedback
        elif event_type == "difficulty_feedback" and resource:
            feedback_subtype = payload.get("feedback_type", "too_difficult")
            diff_summary = AdaptiveStateUpdater.apply_difficulty_feedback(profile, resource, feedback_subtype)
            # Persist Feedback record
            fb = Feedback(
                profile_id=profile.id,
                resource_id=resource.id,
                feedback_type=feedback_subtype,
                rating=int(payload.get("rating", 3)),
                comment=str(payload.get("comment", "")),
                idempotency_key=event_id
            )
            self.db.add(fb)

        # 4. Handle relevance / engagement feedback
        elif event_type in ("relevance_feedback", "resource_liked", "resource_disliked", "resource_skipped", "resource_saved", "resource_abandoned"):
            if resource:
                fb_type = payload.get("feedback_type", event_type)
                fb = Feedback(
                    profile_id=profile.id,
                    resource_id=resource.id,
                    feedback_type=fb_type,
                    rating=5 if event_type == "resource_liked" else 1 if event_type == "resource_disliked" else 3,
                    comment=str(payload.get("comment", "")),
                    idempotency_key=event_id
                )
                self.db.add(fb)
                diff_summary = {"event": event_type, "resource_id": resource.id}

        # Log Interaction record
        interaction = Interaction(
            profile_id=profile.id,
            resource_id=resource.id if resource else None,
            event_type=event_type,
            meta_data={"event_id": event_id, "payload": payload, "diff": diff_summary}
        )
        self.db.add(interaction)
        self.db.flush()

        return {
            "event_processed": True,
            "is_duplicate": False,
            "state_changed": bool(diff_summary),
            "diff": diff_summary,
            "event_id": event_id
        }
