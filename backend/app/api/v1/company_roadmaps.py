from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.roadmap.company_roadmap_service import CompanyRoadmapService
from backend.app.schemas.company_roadmap import (
    CompanyRoadmapResponse,
    SwitchCompanyRequest,
    PlannerHandoffResponse,
)

router = APIRouter(prefix="/company-roadmaps", tags=["Company Learning Roadmaps"])


@router.get("/generate", response_model=CompanyRoadmapResponse)
def generate_company_roadmap(
    company_slug: str = Query(..., description="Target company slug e.g. google"),
    role_slug: str = Query(..., description="Target role slug e.g. software-engineer"),
    learner_id: str = Query(..., description="Learner profile ID"),
    db: Session = Depends(get_db),
):
    """Generates a personalized, dependency-ordered learning roadmap tailored to the target company and role."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug=company_slug,
        role_slug=role_slug,
        learner_id=learner_id,
    )
    return roadmap


@router.get("/{roadmap_id}", response_model=CompanyRoadmapResponse)
def get_company_roadmap(roadmap_id: str):
    """Retrieves an existing company-aware roadmap by ID."""
    roadmap = CompanyRoadmapService.get_roadmap_by_id(roadmap_id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company roadmap '{roadmap_id}' not found.",
        )
    return roadmap


@router.post("/{roadmap_id}/switch-company", response_model=CompanyRoadmapResponse)
def switch_target_company(
    roadmap_id: str,
    body: SwitchCompanyRequest,
    db: Session = Depends(get_db),
):
    """Switches the target employer, creating an incremented roadmap version that preserves completed progress."""
    updated = CompanyRoadmapService.switch_target_company(
        db=db,
        roadmap_id=roadmap_id,
        new_company_slug=body.new_company_slug,
        new_role_slug=body.new_role_slug,
    )
    if "error" in updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=updated["error"],
        )
    return updated


@router.get("/{roadmap_id}/planner-handoff", response_model=PlannerHandoffResponse)
def get_planner_handoff(roadmap_id: str):
    """Retrieves structured learning items ready for Phase 9 Daily/Weekly Planner scheduling."""
    handoff = CompanyRoadmapService.get_planner_handoff(roadmap_id)
    if "error" in handoff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=handoff["error"],
        )
    return handoff
