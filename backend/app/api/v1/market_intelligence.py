from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.intelligence.live_market_provider import LiveCareerMarketProvider
from backend.app.ai.freshness_classifier import FreshnessClassifier
from backend.app.core.career_catalog import CAREER_ROLES_CATALOG

router = APIRouter(prefix="/market-intelligence", tags=["Phase 9 Market Intelligence"])
live_provider = LiveCareerMarketProvider()

class MarketSearchRequest(BaseModel):
    query: str
    career_slug: Optional[str] = None
    region: Optional[str] = None

@router.get("")
def get_all_market_signals(
    career_slug: Optional[str] = Query(None, description="Slug of the career role"),
    skill: Optional[str] = Query(None, description="Slug of the skill"),
    region: Optional[str] = Query(None, description="Regional market context (e.g., Bengaluru, Chennai, National)"),
    category: Optional[str] = Query(None, description="Signal category filter"),
    query: Optional[str] = Query(None, description="Search query string")
):
    """
    Public market intelligence query endpoint.
    Enriches career pathway and discovery with verified, fresh Indian market signals.
    """
    role_name = None
    if career_slug and career_slug in CAREER_ROLES_CATALOG:
        role_name = CAREER_ROLES_CATALOG[career_slug].role

    # Classify freshness if query provided
    freshness = "STATIC"
    confidence = 1.0
    rationale = "Catalog signals"
    if query:
        freshness, confidence, rationale = FreshnessClassifier.classify(query)

    signals = live_provider.search_market_signals(
        query=query,
        role=role_name or career_slug,
        skill_slug=skill,
        region=region,
        category=category
    )

    return {
        "total_signals": len(signals),
        "career_filter": career_slug,
        "skill_filter": skill,
        "region_filter": region,
        "freshness_classification": freshness,
        "freshness_confidence": confidence,
        "freshness_rationale": rationale,
        "signals": [s.to_dict() for s in signals]
    }

@router.get("/{career_slug}")
def get_career_market_intelligence(
    career_slug: str,
    region: Optional[str] = Query(None, description="Region filter (e.g. Bengaluru, National)")
):
    """
    Returns market demand signals specific to a career role.
    """
    if career_slug not in CAREER_ROLES_CATALOG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{career_slug}' not found in catalog."
        )

    role_title = CAREER_ROLES_CATALOG[career_slug].role
    signals = live_provider.search_market_signals(role=role_title, region=region)

    return {
        "career_slug": career_slug,
        "role_title": role_title,
        "region": region or "All India",
        "total_signals": len(signals),
        "signals": [s.to_dict() for s in signals]
    }

@router.get("/{career_slug}/skills")
def get_career_skill_market_intelligence(
    career_slug: str,
    region: Optional[str] = Query(None, description="Region filter")
):
    """
    Returns breakdown of in-demand, emerging, and foundational skills for the career role.
    """
    if career_slug not in CAREER_ROLES_CATALOG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{career_slug}' not found in catalog."
        )

    role_title = CAREER_ROLES_CATALOG[career_slug].role
    signals = live_provider.search_market_signals(role=role_title, region=region)

    emerging = [s.to_dict() for s in signals if s.category == "emerging_skill"]
    in_demand = [s.to_dict() for s in signals if s.category in ("technology_demand", "increasing_demand")]

    return {
        "career_slug": career_slug,
        "role_title": role_title,
        "region": region or "All India",
        "emerging_skills": emerging,
        "in_demand_skills": in_demand,
        "total_signals": len(signals)
    }

@router.post("/search")
def search_market_intelligence(
    body: MarketSearchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Authenticated search endpoint for learner-specific market discovery.
    """
    role_name = None
    if body.career_slug and body.career_slug in CAREER_ROLES_CATALOG:
        role_name = CAREER_ROLES_CATALOG[body.career_slug].role

    freshness, confidence, rationale = FreshnessClassifier.classify(body.query)
    signals = live_provider.search_market_signals(
        query=body.query,
        role=role_name or body.career_slug,
        region=body.region
    )

    return {
        "query": body.query,
        "freshness": freshness,
        "confidence": confidence,
        "rationale": rationale,
        "signals": [s.to_dict() for s in signals]
    }
