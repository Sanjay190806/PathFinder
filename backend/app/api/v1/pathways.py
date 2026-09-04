"""
Career Eligibility & Pathway Intelligence API (Phase 9 Stage 3)
Exposes structured requirements, multi-route pathways, personalized gap evaluations,
and next-step actions for registered career roles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.core.pathway_catalog import (
    get_career_requirements,
    get_all_registered_career_requirements,
    CareerRequirements,
    CareerPathway
)
from backend.app.career_discovery.pathway_engine import (
    PathwayEngine,
    CareerPathwayEvaluation,
    NextLearningStep
)

router = APIRouter(prefix="/careers", tags=["Career Pathways & Eligibility"])

@router.get("/{career_slug}/requirements", response_model=CareerRequirements)
def get_requirements(career_slug: str):
    """
    Returns authoritative entry prerequisites, mandatory skills,
    and available pathways for a career role.
    """
    reqs = get_career_requirements(career_slug)
    if not reqs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in requirements catalog."
        )
    return reqs

@router.get("/{career_slug}/pathways", response_model=List[CareerPathway])
def get_pathways(career_slug: str):
    """Returns all multi-route pathways available for a career role."""
    reqs = get_career_requirements(career_slug)
    if not reqs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in requirements catalog."
        )
    return reqs.pathways

@router.get("/{career_slug}/fit", response_model=CareerPathwayEvaluation)
def get_learner_pathway_fit(
    career_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Personalized pathway evaluation: checks learner's academic eligibility,
    resolves the active pathway, identifies satisfied vs missing skills,
    and derives the next actionable learning step.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    engine = PathwayEngine(db=db)
    evaluation = engine.evaluate_pathway(profile, career_slug)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in requirements catalog."
        )
    return evaluation

@router.get("/{career_slug}/gaps")
def get_career_skill_gaps(
    career_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates detailed skill gaps against target career requirements
    leveraging the existing Phase 7 SkillGapEngine.
    """
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    reqs = get_career_requirements(career_slug)
    if not reqs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in requirements catalog."
        )

    engine = PathwayEngine(db=db)
    virtual_goal = Goal(
        profile_id=profile.id,
        target_role=reqs.career_role,
        target_skills=reqs.mandatory_skills + reqs.recommended_skills,
        is_primary=True
    )
    report = engine.gap_engine.calculate(profile, virtual_goal)

    return {
        "career_slug": career_slug,
        "career_role": reqs.career_role,
        "mandatory_skills": reqs.mandatory_skills,
        "recommended_skills": reqs.recommended_skills,
        "mastered_skills": report.mastered_skills,
        "partially_known_skills": report.partially_known_skills,
        "missing_skills": report.missing_skills,
        "priority_skills": report.priority_skills,
        "items": [
            {
                "skill_slug": it.skill_slug,
                "skill_name": it.skill_name,
                "current_confidence": it.current_confidence,
                "target_confidence": it.target_confidence,
                "gap": it.gap,
                "is_mandatory": it.skill_slug in reqs.mandatory_skills
            }
            for it in report.items
        ]
    }

@router.get("/{career_slug}/next-step", response_model=NextLearningStep)
def get_career_next_step(
    career_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the single highest priority next learning step to progress toward this career."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    engine = PathwayEngine(db=db)
    evaluation = engine.evaluate_pathway(profile, career_slug)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in requirements catalog."
        )
    if not evaluation.next_step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No immediate next step identified."
        )
    return evaluation.next_step
