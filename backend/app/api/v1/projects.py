from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.projects import ProjectTemplateOut, LearnerProjectOut
from backend.app.projects.project_engine import ProjectEngine

router = APIRouter(prefix="/projects", tags=["Phase 8 Real-World Projects"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

class MilestoneSubmission(BaseModel):
    artifact: str

class ProjectSubmission(BaseModel):
    submission_url: str

@router.get("", response_model=List[ProjectTemplateOut])
def list_available_projects(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = ProjectEngine(db)
    return engine.get_projects_for_role(role=role)

@router.post("/{template_id}/start", response_model=LearnerProjectOut)
def start_project(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ProjectEngine(db)
    try:
        return engine.start_project(profile_id=profile.id, template_id=template_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{learner_project_id}/milestones/{milestone_id}", response_model=LearnerProjectOut)
def submit_milestone(
    learner_project_id: str,
    milestone_id: str,
    payload: MilestoneSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ProjectEngine(db)
    try:
        return engine.complete_milestone(
            profile_id=profile.id,
            learner_project_id=learner_project_id,
            milestone_id=milestone_id,
            artifact=payload.artifact
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{learner_project_id}/submit", response_model=LearnerProjectOut)
def submit_project(
    learner_project_id: str,
    payload: ProjectSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ProjectEngine(db)
    try:
        return engine.submit_project(
            profile_id=profile.id,
            learner_project_id=learner_project_id,
            submission_url=payload.submission_url
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
