from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.practical_competency import PracticalEvidenceRecord
from backend.app.schemas.practical import (
    PracticalEvidenceCreate,
    PracticalEvidenceOut,
    PracticalCompetencyOut
)
from backend.app.practical.competency_engine import PracticalCompetencyEngine

router = APIRouter(prefix="/practical", tags=["Phase 8 Practical Competency"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("/competencies", response_model=List[PracticalCompetencyOut])
def get_all_practical_competencies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PracticalCompetencyEngine(db)
    return engine.get_all_competencies(profile_id=profile.id)

@router.get("/competencies/{skill_slug}", response_model=PracticalCompetencyOut)
def get_single_practical_competency(
    skill_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PracticalCompetencyEngine(db)
    return engine.get_competency(profile_id=profile.id, skill_slug=skill_slug)

@router.post("/evidence", response_model=PracticalEvidenceOut)
def record_practical_evidence(
    payload: PracticalEvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PracticalCompetencyEngine(db)
    record = engine.record_evidence(profile_id=profile.id, evidence_in=payload)
    return PracticalEvidenceOut(
        id=record.id,
        profile_id=record.profile_id,
        skill_slug=record.skill_slug,
        evidence_type=record.evidence_type,
        source_id=record.source_id,
        score=record.score,
        confidence=record.confidence,
        evaluator=record.evaluator,
        metadata_payload=record.metadata_payload or {},
        timestamp=record.timestamp
    )

@router.get("/evidence", response_model=List[PracticalEvidenceOut])
def get_all_practical_evidence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    records = db.query(PracticalEvidenceRecord).filter(PracticalEvidenceRecord.profile_id == profile.id).all()
    return [
        PracticalEvidenceOut(
            id=r.id,
            profile_id=r.profile_id,
            skill_slug=r.skill_slug,
            evidence_type=r.evidence_type,
            source_id=r.source_id,
            score=r.score,
            confidence=r.confidence,
            evaluator=r.evaluator,
            metadata_payload=r.metadata_payload or {},
            timestamp=r.timestamp
        )
        for r in records
    ]
