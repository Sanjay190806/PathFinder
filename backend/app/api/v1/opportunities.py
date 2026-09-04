from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.opportunity import Opportunity
from backend.app.schemas.opportunities import (
    OpportunityOut, OpportunityMatchOut, OpportunityApplyRequest, OpportunityApplyResponse
)
from backend.app.schemas.applications import ApplicationCreate
from backend.app.opportunities.opportunity_engine import OpportunityEngine
from backend.app.applications.application_engine import ApplicationEngine

router = APIRouter(prefix="/opportunities", tags=["Phase 9 Opportunity Intelligence & Matching"])

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

@router.get("/discover", response_model=List[OpportunityOut])
def discover_opportunities(
    career: Optional[str] = None,
    skill: Optional[str] = None,
    location: Optional[str] = None,
    city: Optional[str] = None,
    work_mode: Optional[str] = None,
    opportunity_type: Optional[str] = None,
    education_level: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100, description="Page limit between 1 and 100"),
    offset: int = Query(0, ge=0, description="Page offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter verified opportunities across India cities, roles, work modes, and education stages.
    """
    engine = OpportunityEngine(db)
    return engine.discover_opportunities(
        career=career,
        skill=skill,
        location=location,
        city=city,
        work_mode=work_mode,
        opportunity_type=opportunity_type,
        education_level=education_level,
        limit=limit,
        offset=offset
    )

@router.get("/matches", response_model=List[OpportunityMatchOut])
def get_matched_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = OpportunityEngine(db)
    return engine.match_opportunities(profile_id=profile.id)

@router.get("/recommended", response_model=List[OpportunityMatchOut])
def get_recommended_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Personalized opportunity matching grounded in authenticated learner profile, skills, education, and readiness.
    """
    profile = _get_or_create_profile(current_user, db)
    engine = OpportunityEngine(db)
    return engine.match_opportunities(profile_id=profile.id)

@router.post("/{opportunity_id}/apply", response_model=OpportunityApplyResponse)
def apply_or_handoff_opportunity(
    opportunity_id: str,
    payload: Optional[OpportunityApplyRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handoff to Phase 8 application engine for user-confirmed application tracking.
    """
    profile = _get_or_create_profile(current_user, db)
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opportunity {opportunity_id} not found")

    app_engine = ApplicationEngine(db)
    note_str = payload.cover_note if payload and payload.cover_note else "Application initiated via PathFinder Opportunity Explorer"
    app_record = app_engine.save_or_apply(
        profile_id=profile.id,
        app_in=ApplicationCreate(
            opportunity_id=opp.id,
            status="applied",
            notes=note_str
        )
    )

    return OpportunityApplyResponse(
        application_id=app_record.id,
        opportunity_id=opp.id,
        status="applied",
        message="Application successfully registered in your career tracker.",
        handoff_url=opp.application_url or f"https://jansahay.gov.in/opportunities/{opp.slug}"
    )
