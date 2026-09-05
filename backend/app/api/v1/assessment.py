from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.assessment import Assessment, AssessmentQuestion, AssessmentResponse
from backend.app.schemas.assessment import (
    AssessmentOut, AssessmentQuestionOut, AssessmentSubmit, AssessmentResultOut
)
from backend.app.adaptive.adaptive_engine import AdaptiveEngine

router = APIRouter(prefix="/assessment", tags=["Skill Assessment"])

@router.get("", response_model=List[AssessmentOut])
def get_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).all()
    out = []
    for a in assessments:
        questions = [
            AssessmentQuestionOut(
                id=q.id,
                skill_id=q.skill_id,
                skill_name=q.skill.name if q.skill else "General",
                question_text=q.question_text,
                options=q.options or []
            )
            for q in a.questions
        ]
        out.append(AssessmentOut(
            id=a.id,
            title=a.title,
            domain=a.domain,
            questions=questions
        ))
    return out

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(
    payload: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    assessment = db.query(Assessment).filter(Assessment.id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    correct_count = 0
    updates = []
    engine = AdaptiveEngine(db)

    for ans in payload.answers:
        q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == ans.question_id).first()
        if not q:
            continue
        is_correct = (ans.selected_option_index == q.correct_option_index)
        if is_correct:
            correct_count += 1

        skill_slug = q.skill.slug if q.skill else "general"
        old_conf = float((profile.skill_confidence_map or {}).get(skill_slug, 0.0))
        event_id = str(uuid.uuid4())

        # Process quiz adaptation per skill question
        res = engine.process_event(
            event_id=event_id,
            profile_id=profile.id,
            event_type="quiz_answered",
            skill_slug=skill_slug,
            payload={"is_correct": is_correct, "score_ratio": 1.0 if is_correct else 0.0}
        )

        db.add(AssessmentResponse(
            profile_id=profile.id,
            question_id=q.id,
            selected_option_index=ans.selected_option_index,
            is_correct=is_correct,
            confidence_delta=0.05 if is_correct else -0.05
        ))

        new_conf = float((profile.skill_confidence_map or {}).get(skill_slug, old_conf))

        updates.append({
            "skill": q.skill.name if q.skill else skill_slug,
            "is_correct": is_correct,
            "old_confidence": old_conf,
            "new_confidence": new_conf
        })

    db.commit()
    total_q = len(payload.answers)
    score_pct = (correct_count / total_q * 100) if total_q > 0 else 0.0

    return AssessmentResultOut(
        assessment_id=assessment.id,
        total_questions=total_q,
        correct_count=correct_count,
        score_percentage=score_pct,
        skill_confidence_updates=updates,
        adaptation_triggered=True,
        summary_message=f"Assessment completed! Score: {correct_count}/{total_q} ({score_pct:.0f}%). Competencies updated."
    )
