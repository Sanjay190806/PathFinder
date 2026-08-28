from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.career_prep import (
    ResumeAuditRequest,
    ResumeAuditOut,
    MockInterviewRequest,
    MockInterviewSessionOut
)
from backend.app.career_prep.career_prep_engine import CareerPrepEngine

router = APIRouter(prefix="/career-prep", tags=["Phase 8 Resume & Interview Intelligence"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.post("/resume/audit", response_model=ResumeAuditOut)
def audit_learner_resume(
    payload: ResumeAuditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = CareerPrepEngine(db)
    return engine.audit_resume(profile_id=profile.id, req=payload)

@router.post("/interview/start", response_model=MockInterviewSessionOut)
def start_interview_session(
    payload: MockInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = CareerPrepEngine(db)
    return engine.start_mock_interview(profile_id=profile.id, req=payload)
