from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.opportunities import OpportunityOut, OpportunityMatchOut
from backend.app.opportunities.opportunity_engine import OpportunityEngine

router = APIRouter(prefix="/opportunities", tags=["Phase 8 Opportunity Intelligence & Matching"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=List[OpportunityOut])
def list_opportunities(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = OpportunityEngine(db)
    return engine.list_opportunities(role=role)

@router.get("/matches", response_model=List[OpportunityMatchOut])
def get_matched_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = OpportunityEngine(db)
    return engine.match_opportunities(profile_id=profile.id)
