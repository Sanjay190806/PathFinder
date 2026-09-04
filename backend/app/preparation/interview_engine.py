from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session

from backend.app.models.career_action import MockInterviewSession
from backend.app.models.profile import LearnerProfile
from backend.app.models.user import User
from backend.app.models.opportunity import Opportunity
from backend.app.preparation.question_engine import QuestionEngine


class InterviewEngine:
    """
    Manages mock interview sessions, turn-by-turn answer evaluation,
    and performance coaching across 6 evaluation criteria.
    """

    def __init__(self, db: Session):
        self.db = db
        self.question_engine = QuestionEngine(db)

    def create_session(
        self,
        learner_id: str,
        session_type: str = "MIXED",
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        target_difficulty: Optional[str] = "AUTO",
    ) -> Dict[str, Any]:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.user_id == learner_id).first()
        profile_id = profile.id if profile else learner_id
        target_role = career_id or (profile.goals[0].target_role if profile and profile.goals else "Software Engineer")

        # Determine questions
        cat_map = {
            "TECHNICAL": "TECHNICAL",
            "BEHAVIORAL": "BEHAVIORAL",
            "OPPORTUNITY_SPECIFIC": "INDIA_MARKET",
            "MIXED": "TECHNICAL",
        }
        category = cat_map.get(session_type.upper(), "TECHNICAL")
        
        q_data = self.question_engine.generate_questions(
            learner_id=learner_id,
            category=category,
            difficulty=target_difficulty if target_difficulty != "AUTO" else None,
            career_id=career_id,
            opportunity_id=opportunity_id,
            count=3,
        )

        session_id = str(uuid.uuid4())
        session_payload = {
            "questions": q_data["questions"],
            "current_question_index": 0,
            "turn_evaluations": [],
            "metadata": {
                "session_type": session_type,
                "target_difficulty": q_data["recommended_difficulty"],
                "focus_areas": q_data["focus_areas"],
            }
        }

        mock_session = MockInterviewSession(
            id=session_id,
            profile_id=profile_id,
            target_role=target_role,
            interview_type=session_type,
            opportunity_id=opportunity_id,
            status="IN_PROGRESS",
            question_transcript=session_payload,
            overall_score=0.0,
            feedback=f"Mock interview started for {target_role}. Question 1 is ready.",
        )
        self.db.add(mock_session)
        self.db.commit()
        self.db.refresh(mock_session)

        return self._format_session(mock_session)

    def submit_turn(
        self,
        session_id: str,
        question_id: str,
        response_text: str,
        requester_profile_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        mock_session = self.db.query(MockInterviewSession).filter(MockInterviewSession.id == session_id).first()
        if not mock_session:
            raise ValueError(f"Interview session {session_id} not found")

        if requester_profile_id and mock_session.profile_id != requester_profile_id:
            raise PermissionError(f"Access denied: interview session {session_id} belongs to another user.")

        transcript = mock_session.question_transcript or {}
        questions = transcript.get("questions", [])
        turn_evaluations = transcript.get("turn_evaluations", [])

        # Find target question
        target_q = next((q for q in questions if q.get("id") == question_id), None)
        if not target_q:
            # Fallback to current index
            curr_idx = transcript.get("current_question_index", 0)
            if 0 <= curr_idx < len(questions):
                target_q = questions[curr_idx]
            else:
                target_q = {"id": question_id, "prompt": "General interview question", "rubric": {}}

        # Evaluate response across 6 criteria
        eval_result = self._evaluate_response(target_q, response_text)

        turn_entry = {
            "turn_id": f"turn-{uuid.uuid4().hex[:8]}",
            "question_id": question_id,
            "question_prompt": target_q.get("prompt"),
            "response_text": response_text,
            "evaluation": eval_result,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        turn_evaluations.append(turn_entry)

        # Update index and status
        next_idx = len(turn_evaluations)
        transcript["turn_evaluations"] = turn_evaluations
        transcript["current_question_index"] = next_idx

        # Overall session score
        scores = [t["evaluation"]["overall_turn_score"] for t in turn_evaluations]
        avg_score = round(sum(scores) / max(1, len(scores)), 1)
        mock_session.overall_score = avg_score

        if next_idx >= len(questions):
            mock_session.status = "COMPLETED"
            mock_session.completed_at = datetime.now(timezone.utc)
            mock_session.feedback = (
                f"Interview completed with overall performance score of {avg_score}/100. "
                f"Demonstrated solid strengths in structured communication and technical context."
            )
        else:
            mock_session.feedback = f"Completed question {next_idx} of {len(questions)}. Next question ready."

        mock_session.question_transcript = transcript
        self.db.commit()
        self.db.refresh(mock_session)

        return {
            "session_id": mock_session.id,
            "turn_evaluation": eval_result,
            "session_status": mock_session.status,
            "current_question_index": next_idx,
            "total_questions": len(questions),
            "session_overall_score": avg_score,
        }

    def get_session(self, session_id: str, requester_profile_id: Optional[str] = None) -> Dict[str, Any]:
        mock_session = self.db.query(MockInterviewSession).filter(MockInterviewSession.id == session_id).first()
        if not mock_session:
            raise ValueError(f"Session {session_id} not found")
        if requester_profile_id and mock_session.profile_id != requester_profile_id:
            raise PermissionError(f"Access denied: interview session {session_id} belongs to another user.")
        return self._format_session(mock_session)

    def _evaluate_response(self, question: Dict[str, Any], text: str) -> Dict[str, Any]:
        cleaned = text.lower()
        words = text.split()
        word_count = len(words)

        rubric = question.get("rubric", {})
        keywords = [k.lower() for k in rubric.get("keywords", [])]

        # 1. Technical Accuracy (0-100)
        matched_kw = [k for k in keywords if k in cleaned]
        if keywords:
            kw_ratio = len(matched_kw) / len(keywords)
            tech_acc = min(100.0, max(30.0, kw_ratio * 75.0 + (30.0 if word_count > 30 else 10.0)))
        else:
            tech_acc = 75.0 if word_count > 40 else 50.0

        # 2. Depth and Clarity (0-100)
        if word_count >= 80:
            depth = 90.0
        elif word_count >= 40:
            depth = 75.0
        elif word_count >= 20:
            depth = 55.0
        else:
            depth = 35.0

        # 3. Structure Framework (0-100) - check for STAR or Tradeoff terms
        structure_terms = ["first", "second", "tradeoff", "because", "result", "situation", "task", "action", "outcome", "latency", "scale"]
        found_struct = sum(1 for st in structure_terms if st in cleaned)
        struct_score = min(100.0, 45.0 + found_struct * 12.0)

        # 4. Confidence & Professional Language (0-100)
        fillers = ["um", "uh", "maybe", "i think", "sort of", "kind of"]
        filler_penalty = sum(5.0 for f in fillers if f in cleaned)
        action_verbs = ["implemented", "optimized", "engineered", "designed", "resolved", "benchmarked", "deployed"]
        action_bonus = sum(6.0 for a in action_verbs if a in cleaned)
        confidence = max(30.0, min(100.0, 70.0 + action_bonus - filler_penalty))

        # 5. India Market / Scale Relevance (0-100)
        scale_terms = ["scale", "throughput", "concurrency", "distributed", "cost", "cloud", "production", "security", "latency"]
        found_scale = sum(1 for s in scale_terms if s in cleaned)
        india_market = min(100.0, 50.0 + found_scale * 12.0)

        # 6. Overall turn score
        overall = (
            (tech_acc * 0.30) +
            (depth * 0.20) +
            (struct_score * 0.20) +
            (confidence * 0.15) +
            (india_market * 0.15)
        )
        overall = round(max(0.0, min(100.0, overall)), 1)

        strengths = []
        if tech_acc >= 75.0:
            strengths.append(f"Strong technical precision addressing key concepts ({', '.join(matched_kw[:2]) if matched_kw else 'core domain'}).")
        if struct_score >= 70.0:
            strengths.append("Clear structural presentation with systematic logical progression.")
        if depth >= 75.0:
            strengths.append("Comprehensive depth providing contextual background rather than terse assertions.")
        if not strengths:
            strengths.append("Direct answer addressing the core question.")

        improvements = []
        missing_kw = [k for k in keywords if k not in matched_kw]
        if missing_kw:
            improvements.append(f"Incorporate specific technical terms: {', '.join(missing_kw[:3])}.")
        if word_count < 45:
            improvements.append("Expand on architectural tradeoffs and concrete failure modes.")
        if filler_penalty > 10.0:
            improvements.append("Reduce qualifying filler phrases ('maybe', 'sort of') to project greater technical authority.")
        if not improvements:
            improvements.append("To reach expert tier, detail telemetry metrics and proactive alerting configurations.")

        model_answer = (
            f"A high-scoring answer addresses {question.get('prompt')[:60]}... by framing the problem within "
            f"operational constraints, evaluating tradeoffs ({', '.join(keywords[:3]) if keywords else 'latency vs memory'}), "
            f"and citing verifiable metrics from past project implementations."
        )

        return {
            "turn_id": f"turn-{uuid.uuid4().hex[:8]}",
            "question_id": question.get("id", ""),
            "technical_accuracy": round(tech_acc, 1),
            "depth_clarity": round(depth, 1),
            "structure_framework": round(struct_score, 1),
            "confidence_language": round(confidence, 1),
            "india_market_relevance": round(india_market, 1),
            "overall_turn_score": overall,
            "feedback": f"Scored {overall}/100. " + " ".join(strengths[:1] + improvements[:1]),
            "strengths": strengths,
            "improvement_tips": improvements,
            "model_answer": model_answer,
        }

    def _format_session(self, session: MockInterviewSession) -> Dict[str, Any]:
        transcript = session.question_transcript or {}
        return {
            "session_id": session.id,
            "session_type": session.interview_type,
            "status": session.status or "IN_PROGRESS",
            "career_id": session.target_role,
            "opportunity_id": session.opportunity_id,
            "questions": transcript.get("questions", []),
            "current_question_index": transcript.get("current_question_index", 0),
            "turn_evaluations": transcript.get("turn_evaluations", []),
            "overall_feedback": {
                "overall_score": session.overall_score,
                "summary": session.feedback,
            },
            "created_at": session.completed_at.isoformat() if session.completed_at else None,
        }
