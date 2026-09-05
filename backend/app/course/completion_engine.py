import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.assessment import AssessmentSession, Assessment
from backend.app.models.progress import Progress
from backend.app.models.profile import LearnerProfile
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.engine.explainer import UniversalDecisionTrace, DecisionEvidence, DecisionFactor

class CourseCompletionEngine:
    """
    Phase 10 Stage 9: Authoritative, transactional course-completion engine.
    Ensures that course completion is based on a valid successful attempt,
    verifying both academic passing and integrity states.
    """

    def __init__(self, db: Session):
        self.db = db

    def is_course_completion_eligible(self, session: AssessmentSession, require_learning_complete: bool = False) -> bool:
        """
        Evaluates if the session meets all criteria for course completion.
        Requires:
        1. Linked to a course.
        2. Session is submitted/passed.
        3. Academically passed.
        4. Integrity state is not INVALIDATED or REVIEW_REQUIRED.
        5. Learning complete (if require_learning_complete is True).
        """
        if not session.assessment or not session.assessment.course_id:
            return False

        if session.status not in ["SUBMITTED", "PASSED"]:
            return False

        if not session.passed:
            return False

        # Phase 10 Stage 7 Integrity Rules
        if session.integrity_state in ["INVALIDATED", "REVIEW_REQUIRED"]:
            return False

        # Check course learning progress requirement
        if require_learning_complete:
            progress = self.db.query(Progress).filter(
                Progress.profile_id == session.profile_id,
                Progress.resource_id == session.assessment.course_id
            ).first()
            if not progress or progress.completion_percentage < 100.0:
                return False

        return True

    def process_course_completion(self, session_id: str, profile_id: str, require_learning_complete: bool = False) -> Tuple[bool, Dict[str, Any]]:
        """
        Transactionally marks the course as completed if eligible.
        Idempotent operation.
        Returns (is_completed, metadata)
        """
        session = self.db.query(AssessmentSession).filter(
            AssessmentSession.id == session_id,
            AssessmentSession.profile_id == profile_id
        ).first()

        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        course_id = session.assessment.course_id
        if not course_id:
            return False, {"message": "No course associated with this assessment."}

        is_eligible = self.is_course_completion_eligible(session, require_learning_complete=require_learning_complete)
        if not is_eligible:
            return False, {"message": "Session not eligible for course completion."}

        # Check existing progress
        progress = self.db.query(Progress).filter(
            Progress.profile_id == profile_id,
            Progress.resource_id == course_id
        ).first()

        if not progress:
            progress = Progress(
                id=str(uuid.uuid4()),
                profile_id=profile_id,
                resource_id=course_id,
                status="completed",
                completion_percentage=100.0,
                last_accessed_at=datetime.now(timezone.utc)
            )
            self.db.add(progress)
        else:
            if progress.status == "completed":
                return True, {"message": "Course already completed."}
            
            progress.status = "completed"
            progress.completion_percentage = 100.0
            progress.last_accessed_at = datetime.now(timezone.utc)

        # Create Behavior Event (Learning Evidence)
        event = BehaviorEvent(
            id=str(uuid.uuid4()),
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            profile_id=profile_id,
            event_type="COURSE_COMPLETED",
            resource_id=course_id,
            session_id=session_id,
            payload={"score": session.total_score, "percentage": session.result_summary.get("percentage") if session.result_summary else 0.0},
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(event)

        # Generate UniversalDecisionTrace
        trace = UniversalDecisionTrace(
            decision_type="course_completion",
            profile_id=profile_id,
            target_role="Learner",  # Generic
            resource_id=course_id,
            decision="Course Completed",
            rationale=f"Learner passed the final assessment (Score: {session.total_score}, Integrity: {session.integrity_state})",
            factors=[
                DecisionFactor(
                    name="Academic Score",
                    weight=0.7,
                    raw_score=session.total_score,
                    contribution=0.7,
                    reason="Passed the final assessment"
                ),
                DecisionFactor(
                    name="Integrity Verification",
                    weight=0.3,
                    raw_score=1.0,
                    contribution=0.3,
                    reason=f"Integrity state is {session.integrity_state}"
                )
            ],
            evidence=[
                DecisionEvidence(
                    evidence_type="assessment_session",
                    description=f"Session {session_id} completed successfully."
                )
            ]
        )

        self.db.commit()

        return True, {
            "message": "Course successfully completed.",
            "trace": trace.model_dump()
        }
