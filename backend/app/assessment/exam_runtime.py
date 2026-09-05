import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentSession, AssessmentAttemptEvidence
)
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.assessment.adaptive_selector import AdaptiveQuestionSelector, DIFFICULTY_ORDER
from backend.app.schemas.assessment_blueprint import (
    AnswerSubmitRequest, AnswerSubmitResponse, AssessmentNextQuestionOut,
    QuestionLearnerOut, ExamRulesOut, SessionPauseResponse, SessionResumeResponse,
    ExamResultSummaryOut, ExamSessionDetailOut
)
from backend.app.course.completion_engine import CourseCompletionEngine
from backend.app.engine.explainer import UniversalDecisionTrace, DecisionEvidence, DecisionFactor


class ExamRuntime:
    """
    Production-grade backend-authoritative exam session and assessment runtime engine.
    Enforces attempt limits, tamper-proof timers, idempotent submissions,
    pause/resume policies, navigation rules, and complete answer secrecy.
    """

    def __init__(self, db: Session):
        self.db = db
        self.selector = AdaptiveQuestionSelector(db)

    def get_exam_rules(self, assessment_id: str) -> ExamRulesOut:
        """Returns authoritative exam rules and configuration before starting."""
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

        return ExamRulesOut(
            assessment_id=assessment.id,
            title=assessment.title,
            domain=assessment.domain,
            assessment_type=assessment.assessment_type or "STANDARD",
            duration_minutes=assessment.duration_minutes or 60,
            total_questions=assessment.total_questions or 30,
            total_marks=assessment.total_marks or 100.0,
            passing_score=assessment.passing_score or 60.0,
            attempt_limit=assessment.attempt_limit if assessment.attempt_limit is not None else 3,
            allowed_pause=bool(getattr(assessment, "allowed_pause", True)),
            max_pause_seconds=int(getattr(assessment, "max_pause_seconds", 600) or 600),
            max_pauses_allowed=int(getattr(assessment, "max_pauses_allowed", 2) or 2),
            navigation_policy=str(getattr(assessment, "navigation_policy", "FREE_NAVIGATION") or "FREE_NAVIGATION"),
            submission_policy=str(getattr(assessment, "submission_policy", "AUTO_SUBMIT_ON_EXPIRE") or "AUTO_SUBMIT_ON_EXPIRE"),
            integrity_monitoring_policy=str(getattr(assessment, "integrity_monitoring_policy", "WARNING_ONLY") or "WARNING_ONLY"),
            gadget_detection_enabled=bool(getattr(assessment, "gadget_detection_enabled", True)),
            monitoring_consent_required=bool(getattr(assessment, "monitoring_consent_required", True))
        )

    def get_or_create_session(
        self,
        assessment_id: str,
        profile_id: str,
        mode: Optional[str] = None
    ) -> AssessmentSession:
        """
        Starts a new exam session or recovers an existing in-progress/paused session.
        Enforces transaction-safe attempt limits and backend timer calculation.
        """
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

        now = datetime.now(timezone.utc)

        # 1. Check for existing active session (Recovery)
        existing = self.db.query(AssessmentSession).filter(
            AssessmentSession.assessment_id == assessment_id,
            AssessmentSession.profile_id == profile_id,
            AssessmentSession.status.in_(["IN_PROGRESS", "PAUSED", "READY", "RESUMING"])
        ).first()

        if existing:
            # Check if active timer expired while learner was away
            if existing.status == "IN_PROGRESS":
                rem = self.get_time_remaining(existing)
                if rem <= 0:
                    self.finalize_exam(existing.id, profile_id, auto_expire=True)
                else:
                    self.log_audit_event(existing, "SESSION_RECONNECTED", {"time_remaining": rem})
                    return existing
            elif existing.status == "PAUSED":
                self.log_audit_event(existing, "SESSION_RECONNECTED_WHILE_PAUSED", {})
                return existing

        # 2. Check Attempt Limits
        past_attempts_count = self.db.query(AssessmentSession).filter(
            AssessmentSession.assessment_id == assessment_id,
            AssessmentSession.profile_id == profile_id
        ).count()

        attempt_limit = assessment.attempt_limit if assessment.attempt_limit is not None else 3
        if attempt_limit > 0 and past_attempts_count >= attempt_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Maximum attempt limit ({attempt_limit}) reached for this assessment."
            )

        # 3. Initialize Authoritative Session
        attempt_number = past_attempts_count + 1
        duration_mins = assessment.duration_minutes or 60
        expires_at = now + timedelta(minutes=duration_mins)

        session_mode = mode or assessment.assessment_type or "STANDARD"
        nav_policy = str(getattr(assessment, "navigation_policy", "FREE_NAVIGATION") or "FREE_NAVIGATION")
        max_pause_sec = int(getattr(assessment, "max_pause_seconds", 600) or 600)
        max_pauses = int(getattr(assessment, "max_pauses_allowed", 2) or 2)

        session = AssessmentSession(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            profile_id=profile_id,
            mode=session_mode,
            status="IN_PROGRESS",
            attempt_number=attempt_number,
            session_version=1,
            current_question_index=0,
            current_difficulty="INTERMEDIATE",
            consecutive_correct=0,
            consecutive_incorrect=0,
            total_score=0.0,
            total_max_marks=0.0,
            started_at=now,
            expires_at=expires_at,
            last_activity_at=now,
            paused_at=None,
            total_paused_seconds=0,
            max_pause_seconds=max_pause_sec,
            pause_count=0,
            max_pauses_allowed=max_pauses,
            navigation_policy=nav_policy,
            selected_question_ids=[],
            answers={},
            adaptation_history=[],
            tested_skills={},
            tested_topics={},
            tested_objectives={},
            audit_events=[],
            result_summary=None
        )

        self.db.add(session)
        self.log_audit_event(session, "SESSION_CREATED", {"attempt_number": attempt_number})
        self.log_audit_event(session, "SESSION_STARTED", {"duration_minutes": duration_mins, "mode": session_mode})
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_time_remaining(self, session: AssessmentSession) -> int:
        """Calculates server-authoritative remaining time in seconds."""
        now = datetime.now(timezone.utc)
        exp = session.expires_at.replace(tzinfo=timezone.utc) if session.expires_at.tzinfo is None else session.expires_at

        if session.status == "PAUSED" and session.paused_at:
            p_time = session.paused_at.replace(tzinfo=timezone.utc) if session.paused_at.tzinfo is None else session.paused_at
            rem = int((exp - p_time).total_seconds())
            return max(0, rem)

        rem = int((exp - now).total_seconds())
        return max(0, rem)

    def pause_session(self, session_id: str, profile_id: str) -> SessionPauseResponse:
        """Pauses the active assessment timer if allowed by assessment policy."""
        session = self._get_authorized_session(session_id, profile_id)

        if session.status != "IN_PROGRESS":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pause session in status '{session.status}'"
            )

        assessment = session.assessment
        allowed_pause = getattr(assessment, "allowed_pause", True)
        if not allowed_pause or session.max_pauses_allowed <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pause is not permitted for this assessment."
            )

        if session.pause_count >= session.max_pauses_allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum allowed pauses ({session.max_pauses_allowed}) already reached."
            )

        if session.total_paused_seconds >= session.max_pause_seconds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total allowed pause time has been exhausted."
            )

        now = datetime.now(timezone.utc)
        session.status = "PAUSED"
        session.paused_at = now
        session.pause_count += 1
        session.last_activity_at = now

        self.log_audit_event(session, "PAUSE_STARTED", {
            "pause_number": session.pause_count,
            "paused_at": now.isoformat()
        })
        self.db.commit()

        max_p = session.max_pauses_allowed or 2
        pauses_rem = max(0, max_p - session.pause_count)

        return SessionPauseResponse(
            session_id=session.id,
            status=session.status,
            is_paused=True,
            paused_at=now,
            pause_count=session.pause_count,
            max_pauses_allowed=max_p,
            pauses_remaining=pauses_rem,
            total_paused_seconds=session.total_paused_seconds or 0,
            max_pause_seconds=session.max_pause_seconds or 600,
            message="Assessment paused. The timer is halted until you resume."
        )

    def resume_session(self, session_id: str, profile_id: str) -> SessionResumeResponse:
        """Resumes a paused assessment session and authoritative timer."""
        session = self._get_authorized_session(session_id, profile_id)

        if session.status != "PAUSED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is not paused (status is '{session.status}')"
            )

        now = datetime.now(timezone.utc)
        paused_at = session.paused_at.replace(tzinfo=timezone.utc) if session.paused_at.tzinfo is None else session.paused_at
        actual_paused_seconds = int((now - paused_at).total_seconds())

        # Cap paused time to maximum allowed pause seconds
        remaining_allowed_pause = max(0, (session.max_pause_seconds or 600) - (session.total_paused_seconds or 0))
        effective_pause_seconds = min(actual_paused_seconds, remaining_allowed_pause)

        # Extend expires_at by the allowed paused duration
        session.total_paused_seconds = (session.total_paused_seconds or 0) + effective_pause_seconds
        session.expires_at = session.expires_at + timedelta(seconds=effective_pause_seconds)
        session.status = "IN_PROGRESS"
        session.paused_at = None
        session.last_activity_at = now

        self.log_audit_event(session, "PAUSE_ENDED", {
            "effective_pause_seconds": effective_pause_seconds,
            "actual_paused_seconds": actual_paused_seconds
        })
        self.log_audit_event(session, "SESSION_RESUMED", {
            "resumed_at": now.isoformat(),
            "new_expires_at": session.expires_at.isoformat()
        })
        self.db.commit()

        return SessionResumeResponse(
            session_id=session.id,
            status=session.status,
            is_paused=False,
            resumed_at=now,
            time_remaining_seconds=self.get_time_remaining(session),
            total_paused_seconds=session.total_paused_seconds,
            message="Assessment resumed. The timer has restarted."
        )

    def get_current_or_next_question(
        self,
        session_id: str,
        profile_id: str,
        target_question_id: Optional[str] = None
    ) -> AssessmentNextQuestionOut:
        """
        Authoritative question retrieval with navigation policy enforcement
        and strict answer key redaction.
        """
        session = self._get_authorized_session(session_id, profile_id)

        if session.status in ["SUBMITTED", "PASSED", "FAILED", "COMPLETED", "EXPIRED", "ABANDONED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is already {session.status}."
            )

        # Authoritative timer check
        time_rem = self.get_time_remaining(session)
        if time_rem <= 0 and session.status != "PAUSED":
            self.finalize_exam(session.id, profile_id, auto_expire=True)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment time limit has expired.")

        candidate = None
        nav_policy = session.navigation_policy or "FREE_NAVIGATION"

        # If learner requests a specific question in FREE_NAVIGATION mode
        if target_question_id and nav_policy == "FREE_NAVIGATION":
            candidate = self.db.query(AssessmentQuestion).filter(
                AssessmentQuestion.id == target_question_id,
                (AssessmentQuestion.assessment_id == session.assessment_id) |
                (AssessmentQuestion.course_id == session.assessment.course_id)
            ).first()

        if not candidate:
            # Pick next question via adaptive or standard selector
            candidate, reason, trace = self.selector.select_next_question(session)

        if not candidate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No more questions available for this assessment.")

        # Register presented question
        presented = list(session.selected_question_ids or [])
        if candidate.id not in presented:
            presented.append(candidate.id)
            session.selected_question_ids = presented
            self.db.commit()

        self.log_audit_event(session, "QUESTION_VIEWED", {
            "question_id": candidate.id,
            "difficulty": candidate.difficulty
        })

        return AssessmentNextQuestionOut(
            session_id=session.id,
            question_number=len(presented),
            total_questions=session.assessment.total_questions,
            time_remaining_seconds=time_rem,
            current_difficulty=session.current_difficulty,
            mode=session.mode,
            question=QuestionLearnerOut.model_validate(candidate),
            adaptation_note="Question calibrated based on performance" if session.mode == "ADAPTIVE" else None
        )

    def submit_answer_idempotent(
        self,
        session_id: str,
        profile_id: str,
        payload: AnswerSubmitRequest
    ) -> AnswerSubmitResponse:
        """
        Evaluates learner response server-side with idempotency protection.
        Prevents duplicate scoring on retries and honors navigation locking policies.
        """
        session = self._get_authorized_session(session_id, profile_id)

        if session.status == "PAUSED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exam is currently paused. Please resume before submitting an answer."
            )

        if session.status != "IN_PROGRESS":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit answer to a session with status '{session.status}'."
            )

        # Authoritative timer check
        time_rem = self.get_time_remaining(session)
        if time_rem <= 0:
            self.finalize_exam(session.id, profile_id, auto_expire=True)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment time limit has expired.")

        q = self.db.query(AssessmentQuestion).filter(AssessmentQuestion.id == payload.question_id).first()
        if not q:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        # 1. Idempotency & Navigation Check
        answers = dict(session.answers or {})
        prev_submission = answers.get(q.id)

        nav_policy = session.navigation_policy or "FREE_NAVIGATION"
        if prev_submission and nav_policy == "LOCK_AFTER_SUBMISSION":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation policy locks question after initial submission."
            )

        # If identical submission already evaluated, return idempotent response
        if prev_submission:
            if (prev_submission.get("selected_option_index") == payload.selected_option_index and
                prev_submission.get("submitted_answer") == payload.submitted_answer):
                return AnswerSubmitResponse(
                    session_id=session.id,
                    question_id=q.id,
                    is_correct=prev_submission.get("is_correct") if session.mode == "PRACTICE" else None,
                    score=prev_submission.get("score") if session.mode == "PRACTICE" else None,
                    max_marks=prev_submission.get("max_marks", q.marks or 2.0),
                    explanation=q.explanation if session.mode == "PRACTICE" else None,
                    next_question_available=True,
                    current_difficulty=session.current_difficulty,
                    adaptation_message="Idempotent: Answer already recorded.",
                    time_remaining_seconds=time_rem,
                    already_submitted=True
                )

        # 2. Authoritative Grading
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
                is_correct = True

        if is_correct:
            earned_score = max_marks

        # 3. Calculate Score Delta for amended answers
        prev_score = prev_submission.get("score", 0.0) if prev_submission else 0.0
        score_delta = earned_score - prev_score

        # 4. Streak & Difficulty Adaptation
        old_diff = session.current_difficulty or "INTERMEDIATE"
        diff_idx = DIFFICULTY_ORDER.index(old_diff) if old_diff in DIFFICULTY_ORDER else 1
        adaptation_msg = None

        if not prev_submission:
            # Update streaks only for new questions
            if is_correct:
                session.consecutive_correct += 1
                session.consecutive_incorrect = 0
                if session.consecutive_correct >= 2 and diff_idx < len(DIFFICULTY_ORDER) - 1:
                    new_diff = DIFFICULTY_ORDER[diff_idx + 1]
                    session.current_difficulty = new_diff
                    session.consecutive_correct = 0
                    adaptation_msg = f"Performance streak: difficulty stepped up to {new_diff}."
            else:
                session.consecutive_incorrect += 1
                session.consecutive_correct = 0
                if session.consecutive_incorrect >= 2 and diff_idx > 0:
                    new_diff = DIFFICULTY_ORDER[diff_idx - 1]
                    session.current_difficulty = new_diff
                    session.consecutive_incorrect = 0
                    adaptation_msg = f"Targeted support: difficulty adjusted to {new_diff}."

            session.current_question_index += 1
            session.total_max_marks += max_marks

        session.total_score += score_delta
        session.last_activity_at = datetime.now(timezone.utc)

        # 5. Persist Answer & Evidence
        now = datetime.now(timezone.utc)
        answers[q.id] = {
            "selected_option_index": payload.selected_option_index,
            "submitted_answer": payload.submitted_answer,
            "code_submission": payload.code_submission,
            "is_correct": is_correct,
            "score": earned_score,
            "max_marks": max_marks,
            "time_spent_seconds": payload.time_spent_seconds,
            "timestamp": now.isoformat()
        }
        session.answers = answers

        presented = list(session.selected_question_ids or [])
        if q.id not in presented:
            presented.append(q.id)
            session.selected_question_ids = presented

        # Record or update immutable attempt evidence
        evidence = self.db.query(AssessmentAttemptEvidence).filter(
            AssessmentAttemptEvidence.session_id == session.id,
            AssessmentAttemptEvidence.question_id == q.id
        ).first()

        if not evidence:
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
                created_at=now
            )
            self.db.add(evidence)
        else:
            evidence.is_correct = is_correct
            evidence.score = earned_score
            evidence.time_spent_seconds += payload.time_spent_seconds

        self.log_audit_event(session, "ANSWER_SUBMITTED", {
            "question_id": q.id,
            "is_amended": bool(prev_submission),
            "time_spent_seconds": payload.time_spent_seconds
        })

        if adaptation_msg:
            hist = list(session.adaptation_history or [])
            hist.append({
                "question_number": session.current_question_index,
                "event": "DIFFICULTY_CHANGE",
                "from_difficulty": old_diff,
                "to_difficulty": session.current_difficulty,
                "reason": adaptation_msg,
                "timestamp": now.isoformat()
            })
            session.adaptation_history = hist

        self.db.commit()

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
            time_remaining_seconds=self.get_time_remaining(session),
            already_submitted=bool(prev_submission)
        )

    def finalize_exam(
        self,
        session_id: str,
        profile_id: str,
        auto_expire: bool = False
    ) -> ExamResultSummaryOut:
        """
        Authoritatively finalizes the exam session, evaluates final scores,
        computes module/topic/objective breakdowns, and locks session state.
        """
        session = self._get_authorized_session(session_id, profile_id)

        now = datetime.now(timezone.utc)
        assessment = session.assessment

        # Set final status
        if auto_expire:
            session.status = "EXPIRED"
        else:
            session.status = "SUBMITTED"

        session.submitted_at = now
        session.last_activity_at = now

        # Compute granular syllabus breakdowns
        answers = dict(session.answers or {})
        module_stats: Dict[str, Dict[str, Any]] = {}
        topic_stats: Dict[str, Dict[str, Any]] = {}
        objective_stats: Dict[str, Dict[str, Any]] = {}
        skill_evidence: List[Dict[str, Any]] = []

        total_earned = 0.0
        total_possible = 0.0

        for q_id, a_data in answers.items():
            q = self.db.query(AssessmentQuestion).filter(AssessmentQuestion.id == q_id).first()
            if not q:
                continue

            q_score = float(a_data.get("score", 0.0))
            q_max = float(a_data.get("max_marks", q.marks or 2.0))
            is_corr = bool(a_data.get("is_correct", False))

            total_earned += q_score
            total_possible += q_max

            # Module Breakdown
            if q.module_id:
                mod_title = q.module.title if hasattr(q, "module") and q.module else "Module"
                m = module_stats.setdefault(q.module_id, {
                    "module_id": q.module_id,
                    "title": mod_title,
                    "module_title": mod_title,
                    "earned": 0.0,
                    "max": 0.0,
                    "questions": 0
                })
                m["earned"] += q_score
                m["max"] += q_max
                m["questions"] += 1

            # Topic Breakdown
            if q.topic_id:
                top_title = q.topic.title if hasattr(q, "topic") and q.topic else "Topic"
                t = topic_stats.setdefault(q.topic_id, {
                    "topic_id": q.topic_id,
                    "title": top_title,
                    "topic_title": top_title,
                    "earned": 0.0,
                    "max": 0.0,
                    "questions": 0
                })
                t["earned"] += q_score
                t["max"] += q_max
                t["questions"] += 1

            # Objective Breakdown
            if q.objective_id:
                obj = objective_stats.setdefault(q.objective_id, {
                    "objective_id": q.objective_id,
                    "earned": 0.0,
                    "max": 0.0,
                    "is_mastered": is_corr
                })
                obj["earned"] += q_score
                obj["max"] += q_max

            # Skill evidence
            if q.skill:
                skill_evidence.append({
                    "skill_slug": q.skill.slug,
                    "skill_name": q.skill.name,
                    "is_correct": is_corr,
                    "difficulty": q.difficulty
                })

        # Calculate percentages
        percentage = (total_earned / total_possible * 100.0) if total_possible > 0 else 0.0
        passing_score = assessment.passing_score or 60.0
        passed_academic = (percentage >= passing_score)

        session.total_score = total_earned
        session.total_max_marks = total_possible if total_possible > 0 else assessment.total_marks
        
        # Check integrity state to determine actual pass/fail
        integrity_state = session.integrity_state or "NORMAL"
        passed = passed_academic and integrity_state not in ["INVALIDATED", "REVIEW_REQUIRED"]
        
        session.passed = passed
        if auto_expire:
            session.status = "EXPIRED"
            self.log_audit_event(session, "EXAM_AUTO_EXPIRED", {"expired_at": now.isoformat()})
        else:
            session.status = "PASSED" if passed else "FAILED"

        session.monitoring_consent = "MONITORING_STOPPED"
        session.monitoring_ended_at = now

        for m in module_stats.values():
            m["percentage"] = round((m["earned"] / m["max"] * 100.0), 1) if m["max"] > 0 else 0.0

        for t in topic_stats.values():
            t["percentage"] = round((t["earned"] / t["max"] * 100.0), 1) if t["max"] > 0 else 0.0

        for o in objective_stats.values():
            o["percentage"] = round((o["earned"] / o["max"] * 100.0), 1) if o["max"] > 0 else 0.0

        started_at = session.started_at.replace(tzinfo=timezone.utc) if session.started_at.tzinfo is None else session.started_at
        time_spent_seconds = int((now - started_at).total_seconds())

        # Attempt Course Completion
        course_completion_eligible = False
        course_completed = False
        if assessment.course_id:
            comp_engine = CourseCompletionEngine(self.db)
            if comp_engine.is_course_completion_eligible(session):
                course_completion_eligible = True
                completed, _ = comp_engine.process_course_completion(session.id, profile_id)
                course_completed = completed

        # Generate UniversalDecisionTrace
        trace = UniversalDecisionTrace(
            decision_type="assessment_evaluation",
            profile_id=profile_id,
            target_role="Learner",
            resource_id=assessment.id,
            final_score=percentage,
            decision="PASSED" if passed else "FAILED",
            rationale=f"Academic Score: {percentage}%. Integrity: {integrity_state}.",
            factors=[
                DecisionFactor(
                    name="Academic Performance",
                    weight=0.8,
                    raw_score=percentage,
                    contribution=0.8,
                    reason=f"Earned {total_earned} out of {total_possible} marks."
                ),
                DecisionFactor(
                    name="Integrity Status",
                    weight=0.2,
                    raw_score=1.0 if integrity_state not in ["INVALIDATED", "REVIEW_REQUIRED"] else 0.0,
                    contribution=0.2,
                    reason=f"Integrity state is {integrity_state}."
                )
            ],
            evidence=[
                DecisionEvidence(
                    evidence_type="exam_submission",
                    description=f"Submitted assessment {assessment.id} with status {session.status}."
                )
            ]
        )

        result_summary = {
            "session_id": session.id,
            "assessment_id": assessment.id,
            "title": assessment.title,
            "domain": assessment.domain,
            "mode": session.mode,
            "status": session.status,
            "attempt_number": session.attempt_number,
            "raw_score": round(total_earned, 2),
            "max_score": round(total_possible, 2),
            "percentage": round(percentage, 1),
            "passed": passed,
            "passing_score": passing_score,
            "started_at": started_at.isoformat(),
            "submitted_at": now.isoformat(),
            "time_spent_seconds": time_spent_seconds,
            "module_breakdown": module_stats,
            "topic_breakdown": topic_stats,
            "objective_breakdown": objective_stats,
            "skill_evidence": skill_evidence,
            "integrity_state": integrity_state,
            "course_completion_eligible": course_completion_eligible,
            "course_completed": course_completed,
            "feedback_summary": f"Assessment completed with {round(percentage, 1)}% score ({'PASSED' if passed else 'NOT PASSED'}). Integrity: {integrity_state}.",
            "decision_trace": trace.model_dump()
        }
        session.result_summary = result_summary

        self.log_audit_event(session, "SUBMISSION_COMPLETED", {
            "score": total_earned,
            "percentage": percentage,
            "passed": passed,
            "auto_expire": auto_expire,
            "integrity_state": integrity_state,
            "course_completed": course_completed
        })
        self.db.commit()

        return ExamResultSummaryOut(
            session_id=session.id,
            assessment_id=assessment.id,
            title=assessment.title,
            domain=assessment.domain,
            mode=session.mode,
            status=session.status,
            attempt_number=session.attempt_number,
            raw_score=round(total_earned, 2),
            total_score=round(total_earned, 2),
            max_score=round(total_possible, 2),
            total_max_marks=round(total_possible, 2),
            percentage=round(percentage, 1),
            passed=passed,
            passing_score=passing_score,
            started_at=started_at,
            submitted_at=now,
            time_spent_seconds=time_spent_seconds,
            module_breakdown=module_stats,
            module_scores=module_stats,
            topic_breakdown=topic_stats,
            topic_scores=topic_stats,
            objective_breakdown=objective_stats,
            objective_scores=objective_stats,
            skill_evidence=skill_evidence,
            integrity_state=integrity_state,
            course_completion_eligible=course_completion_eligible,
            course_completed=course_completed,
            feedback_summary=result_summary["feedback_summary"]
        )

    def get_exam_result(self, session_id: str, profile_id: str) -> ExamResultSummaryOut:
        """Retrieves authoritative exam results for a completed session."""
        session = self._get_authorized_session(session_id, profile_id)

        if session.status in ["IN_PROGRESS", "PAUSED", "READY"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment is still active. Finalize before viewing results."
            )

        if not session.result_summary:
            return self.finalize_exam(session.id, profile_id)

        res = session.result_summary
        raw_sc = res.get("raw_score", 0.0)
        max_sc = res.get("max_score", session.total_max_marks)
        mod_sc = res.get("module_breakdown", {})
        top_sc = res.get("topic_breakdown", {})
        obj_sc = res.get("objective_breakdown", {})
        return ExamResultSummaryOut(
            session_id=session.id,
            assessment_id=session.assessment_id,
            title=res.get("title", session.assessment.title),
            domain=res.get("domain", session.assessment.domain),
            mode=session.mode,
            status=session.status,
            attempt_number=session.attempt_number or 1,
            raw_score=raw_sc,
            total_score=raw_sc,
            max_score=max_sc,
            total_max_marks=max_sc,
            percentage=res.get("percentage", 0.0),
            passed=bool(res.get("passed", False)),
            passing_score=res.get("passing_score", session.assessment.passing_score),
            started_at=session.started_at,
            submitted_at=session.submitted_at,
            time_spent_seconds=res.get("time_spent_seconds", 0),
            module_breakdown=mod_sc,
            module_scores=mod_sc,
            topic_breakdown=top_sc,
            topic_scores=top_sc,
            objective_breakdown=obj_sc,
            objective_scores=obj_sc,
            skill_evidence=res.get("skill_evidence", []),
            integrity_state=res.get("integrity_state", session.integrity_state or "NORMAL"),
            course_completion_eligible=res.get("course_completion_eligible", False),
            course_completed=res.get("course_completed", False),
            feedback_summary=res.get("feedback_summary", "")
        )

    def get_session_detail(self, session_id: str, profile_id: str) -> ExamSessionDetailOut:
        """Retrieves comprehensive session detail with IDOR protection."""
        session = self._get_authorized_session(session_id, profile_id)
        time_rem = self.get_time_remaining(session)

        # If expired during check, finalize
        if time_rem <= 0 and session.status == "IN_PROGRESS":
            self.finalize_exam(session.id, profile_id, auto_expire=True)
            self.db.refresh(session)

        answers = session.answers or {}
        return ExamSessionDetailOut(
            id=session.id,
            assessment_id=session.assessment_id,
            profile_id=session.profile_id,
            mode=session.mode,
            status=session.status,
            attempt_number=session.attempt_number or 1,
            session_version=session.session_version or 1,
            current_question_index=session.current_question_index or 0,
            current_difficulty=session.current_difficulty,
            total_questions=session.assessment.total_questions,
            answered_count=len(answers),
            time_remaining_seconds=time_rem,
            is_paused=(session.status == "PAUSED"),
            pause_count=session.pause_count or 0,
            max_pauses_allowed=session.max_pauses_allowed or 2,
            total_paused_seconds=session.total_paused_seconds or 0,
            max_pause_seconds=session.max_pause_seconds or 600,
            navigation_policy=session.navigation_policy or "FREE_NAVIGATION",
            started_at=session.started_at,
            expires_at=session.expires_at,
            last_activity_at=session.last_activity_at,
            selected_question_ids=session.selected_question_ids or [],
            answered_question_ids=list(answers.keys()),
            audit_events=session.audit_events or [],
            adaptation_history=session.adaptation_history or [],
            monitoring_consent=session.monitoring_consent or "MONITORING_CONSENT_REQUIRED",
            monitoring_started_at=session.monitoring_started_at,
            monitoring_ended_at=session.monitoring_ended_at,
            integrity_events_count=len(session.integrity_events or [])
        )

    def log_audit_event(self, session: AssessmentSession, event_type: str, metadata: Dict[str, Any]):
        """Appends structured audit event to session history."""
        events = list(session.audit_events or [])
        events.append({
            "event": event_type,
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata
        })
        session.audit_events = events

    def _get_authorized_session(self, session_id: str, profile_id: str) -> AssessmentSession:
        """Retrieves session with strict IDOR prevention."""
        session = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
        if session.profile_id != profile_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to assessment session denied (IDOR protection)")
        return session

