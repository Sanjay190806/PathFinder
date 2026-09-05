import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentSession, AssessmentAttemptEvidence
)
from backend.app.models.profile import LearnerProfile
from backend.app.adaptive.adaptive_engine import AdaptiveEngine
from backend.app.assessment.adaptive_selector import AdaptiveQuestionSelector, DIFFICULTY_ORDER
from backend.app.schemas.assessment_blueprint import (
    AnswerSubmitRequest, AnswerSubmitResponse, AssessmentSessionOut, AssessmentProgressOut
)


class SessionManager:
    """
    Authoritative state and scoring manager for learner assessment sessions.
    Enforces time limits, real-time grading, adaptation logging, and answer protection.
    """

    def __init__(self, db: Session):
        self.db = db
        self.selector = AdaptiveQuestionSelector(db)
        self.adaptive_engine = AdaptiveEngine(db)

    def start_session(
        self,
        assessment_id: str,
        profile_id: str,
        mode: str = "ADAPTIVE"
    ) -> AssessmentSession:
        """Starts an assessment session with authoritative server-side timer."""
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

        # Check existing in-progress session
        existing = self.db.query(AssessmentSession).filter(
            AssessmentSession.assessment_id == assessment_id,
            AssessmentSession.profile_id == profile_id,
            AssessmentSession.status == "IN_PROGRESS"
        ).first()

        now = datetime.now(timezone.utc)
        if existing:
            # Check if expired
            if existing.expires_at.replace(tzinfo=timezone.utc) < now:
                existing.status = "EXPIRED"
                self.db.commit()
            else:
                return existing

        duration = assessment.duration_minutes or 60
        expires_at = now + timedelta(minutes=duration)

        session = AssessmentSession(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            profile_id=profile_id,
            mode=mode,
            status="IN_PROGRESS",
            current_question_index=0,
            current_difficulty="INTERMEDIATE",
            consecutive_correct=0,
            consecutive_incorrect=0,
            total_score=0.0,
            total_max_marks=0.0,
            started_at=now,
            expires_at=expires_at,
            selected_question_ids=[],
            answers={},
            adaptation_history=[],
            tested_skills={},
            tested_topics={},
            tested_objectives={}
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_time_remaining(self, session: AssessmentSession) -> int:
        """Calculates server-authoritative remaining time in seconds."""
        now = datetime.now(timezone.utc)
        exp = session.expires_at.replace(tzinfo=timezone.utc) if session.expires_at.tzinfo is None else session.expires_at
        rem = int((exp - now).total_seconds())
        return max(0, rem)

    def submit_answer(
        self,
        session_id: str,
        profile_id: str,
        payload: AnswerSubmitRequest
    ) -> AnswerSubmitResponse:
        """
        Grades an answer authoritatively on the backend, updates adaptive session state,
        persists immutable attempt evidence, and logs adaptation trace.
        """
        session = self.db.query(AssessmentSession).filter(
            AssessmentSession.id == session_id,
            AssessmentSession.profile_id == profile_id
        ).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")

        if session.status != "IN_PROGRESS":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Session is already {session.status}")

        # Authoritative timer validation
        time_rem = self.get_time_remaining(session)
        if time_rem <= 0:
            session.status = "EXPIRED"
            self.db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment time limit has expired")

        q = self.db.query(AssessmentQuestion).filter(AssessmentQuestion.id == payload.question_id).first()
        if not q:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        # 1. Authoritative Backend Evaluation
        is_correct = False
        max_marks = q.marks or 2.0
        earned_score = 0.0

        if q.question_type == "MCQ":
            if payload.selected_option_index is not None and q.correct_option_index is not None:
                is_correct = (payload.selected_option_index == q.correct_option_index)
            elif payload.submitted_answer and q.correct_answer:
                is_correct = (str(payload.submitted_answer).strip().lower() == str(q.correct_answer).strip().lower())
        elif q.question_type == "TRUE_FALSE":
            is_correct = (str(payload.submitted_answer).strip().lower() == str(q.correct_answer).strip().lower())
        elif q.question_type in {"CODING", "SCENARIO", "PRACTICAL", "SHORT_ANSWER", "MULTIPLE_SELECT"}:
            if payload.submitted_answer and q.correct_answer:
                is_correct = (str(payload.submitted_answer).strip() == str(q.correct_answer).strip())
            else:
                is_correct = True  # Formative credit for submitted work

        if is_correct:
            earned_score = max_marks

        # 2. Update Performance & Streak Tracking
        old_diff = session.current_difficulty or "INTERMEDIATE"
        diff_idx = DIFFICULTY_ORDER.index(old_diff) if old_diff in DIFFICULTY_ORDER else 1
        adaptation_msg = None

        if is_correct:
            session.consecutive_correct += 1
            session.consecutive_incorrect = 0
            if session.consecutive_correct >= 2 and diff_idx < len(DIFFICULTY_ORDER) - 1:
                new_diff = DIFFICULTY_ORDER[diff_idx + 1]
                session.current_difficulty = new_diff
                session.consecutive_correct = 0
                adaptation_msg = f"Performance streak: difficulty increased from {old_diff} to {new_diff}."
        else:
            session.consecutive_incorrect += 1
            session.consecutive_correct = 0
            if session.consecutive_incorrect >= 2 and diff_idx > 0:
                new_diff = DIFFICULTY_ORDER[diff_idx - 1]
                session.current_difficulty = new_diff
                session.consecutive_incorrect = 0
                adaptation_msg = f"Adjusted pacing: difficulty decreased from {old_diff} to {new_diff}."

        session.total_score += earned_score
        session.total_max_marks += max_marks
        session.current_question_index += 1

        # 3. Update Selected Question IDs, Tested Topics & Skills Map
        presented = list(session.selected_question_ids or [])
        if q.id not in presented:
            presented.append(q.id)
            session.selected_question_ids = presented

        answers_dict = dict(session.answers or {})
        answers_dict[q.id] = {
            "selected_option_index": payload.selected_option_index,
            "submitted_answer": payload.submitted_answer,
            "is_correct": is_correct,
            "score": earned_score,
            "max_marks": max_marks,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        session.answers = answers_dict

        if q.topic_id:
            topics_dict = dict(session.tested_topics or {})
            t_data = topics_dict.setdefault(q.topic_id, {"tested": 0, "correct": 0})
            t_data["tested"] += 1
            if is_correct:
                t_data["correct"] += 1
            session.tested_topics = topics_dict

        # 4. Log Adaptation History if difficulty changed
        if adaptation_msg:
            hist = list(session.adaptation_history or [])
            hist.append({
                "question_number": session.current_question_index,
                "event": "DIFFICULTY_CHANGE",
                "from_difficulty": old_diff,
                "to_difficulty": session.current_difficulty,
                "reason": adaptation_msg,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            session.adaptation_history = hist

        # 5. Persist Immutable Historical Attempt Evidence
        evidence = AssessmentAttemptEvidence(
            id=str(uuid.uuid4()),
            session_id=session.id,
            profile_id=profile_id,
            assessment_id=session.assessment_id,
            question_id=q.id,
            module_id=q.module_id,
            topic_id=q.topic_id,
            objective_id=q.objective_id,
            skill_slug=q.skill.slug if q.skill else None,
            difficulty=q.difficulty or old_diff,
            is_correct=is_correct,
            score=earned_score,
            max_marks=max_marks,
            time_spent_seconds=payload.time_spent_seconds,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(evidence)

        # 6. Check Completion
        assessment = session.assessment
        presented_count = len(session.selected_question_ids or [])
        if presented_count >= assessment.total_questions:
            session.status = "COMPLETED"
            session.submitted_at = datetime.now(timezone.utc)
            session.passed = (session.total_score >= assessment.passing_score)

        self.db.commit()

        # 7. Answer Protection: Redact explanation and is_correct in non-practice mode
        show_feedback = (session.mode == "PRACTICE")

        return AnswerSubmitResponse(
            session_id=session.id,
            question_id=q.id,
            is_correct=is_correct if show_feedback else None,
            score=earned_score if show_feedback else None,
            max_marks=max_marks,
            explanation=q.explanation if show_feedback else None,
            next_question_available=(session.status == "IN_PROGRESS"),
            current_difficulty=session.current_difficulty,
            adaptation_message=adaptation_msg,
            time_remaining_seconds=self.get_time_remaining(session)
        )
