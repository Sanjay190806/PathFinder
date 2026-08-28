from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.applications import ApplicationCreate, ApplicationUpdate, ApplicationOut
from backend.app.applications.application_engine import ApplicationEngine

router = APIRouter(prefix="/applications", tags=["Phase 8 Applications & Career Action Execution"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=List[ApplicationOut])
def list_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ApplicationEngine(db)
    return engine.list_applications(profile_id=profile.id)

@router.post("", response_model=ApplicationOut)
def create_or_save_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ApplicationEngine(db)
    try:
        return engine.save_or_apply(profile_id=profile.id, app_in=payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.patch("/{app_id}", response_model=ApplicationOut)
def update_my_application(
    app_id: str,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ApplicationEngine(db)
    try:
        return engine.update_application(profile_id=profile.id, app_id=app_id, app_up=payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
