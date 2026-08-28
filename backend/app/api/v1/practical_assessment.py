from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.practical_assessment import (
    PracticalAssessmentOut,
    PracticalAssessmentAttemptOut,
    AssessmentAttemptSubmit
)
from backend.app.assessment.practical_assessment_engine import PracticalAssessmentEngine

router = APIRouter(prefix="/practical-assessments", tags=["Phase 8 Practical Assessments"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=List[PracticalAssessmentOut])
def list_assessments(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = PracticalAssessmentEngine(db)
    return engine.list_assessments(role=role)

@router.post("/{assessment_id}/submit", response_model=PracticalAssessmentAttemptOut)
def submit_practical_assessment(
    assessment_id: str,
    payload: AssessmentAttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PracticalAssessmentEngine(db)
    try:
        return engine.evaluate_submission(
            profile_id=profile.id,
            assessment_id=assessment_id,
            submission=payload
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/attempts", response_model=List[PracticalAssessmentAttemptOut])
def list_assessment_attempts(
    assessment_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PracticalAssessmentEngine(db)
    return engine.get_attempts(profile_id=profile.id, assessment_id=assessment_id)
