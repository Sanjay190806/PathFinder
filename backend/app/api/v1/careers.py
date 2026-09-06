"""
Canonical Career Discovery & Taxonomy API (Phase 11 Stages 1-3)
Provides high-performance endpoints for domains, families, careers, search,
filtering, specializations, skills, education requirements, transitions, and comparisons.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user, get_optional_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.career import CareerDomain, CareerFamily, Career
from backend.app.schemas.career import (
    CareerDomainOut,
    CareerFamilyOut,
    CareerSummaryOut,
    CareerDetailOut,
    CareerSearchResponse,
    CareerSpecializationOut,
    CareerSkillRequirementOut,
    CareerEducationRequirementOut,
    EducationFitResponse,
    CareerTransitionResponse,
    CareerComparisonResponse
)
from backend.app.schemas.career_requirements import (
    CareerEligibilityResponse,
    CareerPathwayResponse,
    CareerComparisonResponse as Stage5CareerComparisonResponse,
    AlternativeCareersResponse,
    CareerFitResponse,
    CareerFitExplanationResponse,
    RecommendedCareerFitItem,
    PersonalizedAlternativesResponse,
    ClusteredCareerRecommendationsResponse,
    MarketSignalItem,
    SalarySnapshot,
    RegionalDemandItem,
    TopMarketSkillItem,
    CareerMarketSnapshot,
    CareerMarketSkillsResponse,
    CareerMarketSalaryResponse,
    CareerMarketRegionsResponse,
    RankedCareerItem,
    RankedPriorityResponse,
    CareerSelectionRequest,
    CareerSelectionResponse
)
from backend.app.schemas.career_multilingual import (
    LanguageMetaItem,
    SupportedLanguagesResponse,
    CareerTranslationResponse,
    CareerAIExplanationResponse,
    UserLanguagePreferenceRequest,
    UserLanguagePreferenceResponse
)
from backend.app.career.discovery_service import CareerDiscoveryService
from backend.app.career.education_graph_engine import EducationGraphEngine
from backend.app.career.transition_engine import CareerTransitionEngine
from backend.app.career.requirement_engine import CareerRequirementEngine
from backend.app.career.comparison_service import CareerComparisonService
from backend.app.career.personalization_engine import CareerPersonalizationEngine
from backend.app.career.market_intelligence_service import CareerMarketIntelligenceService
from backend.app.career.ranking_engine import CareerPriorityRankingEngine
from backend.app.career.multilingual_service import MultilingualCareerService
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

router = APIRouter(prefix="/careers", tags=["Canonical Career Taxonomy & Discovery"])

# SEC-001: Dedicated limiter for public career endpoints that hit the database.
# The global 200/min default is supplemented with stricter per-endpoint limits
# to prevent DB overload from targeted crawling or abuse.
_career_limiter = Limiter(key_func=get_remote_address)


def resolve_authorized_profile_id(
    supplied_profile_id: Optional[str],
    current_user: Optional[User],
    db: Optional[Session] = None,
) -> Optional[str]:
    """
    SEC-005: Enforces object-level authorization for personalized endpoints.
    - An unauthenticated caller CANNOT supply another user's profile_id to inspect private fits.
    - An authenticated caller CANNOT supply another user's profile_id (rejected with 403).
    - Demo profiles (interactive demo mode / test suite) are permitted.
    - Returns authorized profile ID or None if anonymous without profile.
    """
    if supplied_profile_id:
        # Check if the target profile is a demo profile
        is_target_demo = False
        if db:
            from backend.app.models.profile import LearnerProfile
            profile = db.query(LearnerProfile).filter(LearnerProfile.id == supplied_profile_id).first()
            if profile and profile.user and getattr(profile.user, "is_demo", False):
                is_target_demo = True

        if is_target_demo:
            return supplied_profile_id

        if not current_user or not current_user.profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to evaluate personalized profile data."
            )
        if current_user.profile.id != supplied_profile_id and not getattr(current_user, "is_demo", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot access another learner's personalized evaluation."
            )
        return supplied_profile_id

    if current_user and current_user.profile:
        return current_user.profile.id

    return None


_resolve_authorized_profile_id = resolve_authorized_profile_id


# ---------------------------------------------------------------------------
# Stage 1: Domains, Families & Catalog
# ---------------------------------------------------------------------------

@router.get("/domains", response_model=List[CareerDomainOut])
@_career_limiter.limit("30/minute")
def list_career_domains(request: Request, db: Session = Depends(get_db)):
    """Returns all active career domains with child family and career counts."""
    domains = db.query(CareerDomain).filter(CareerDomain.is_active == True).order_by(CareerDomain.order.asc()).all()
    results = []
    for d in domains:
        results.append(CareerDomainOut(
            id=d.id,
            slug=d.slug,
            name=d.name,
            description=d.description,
            order=d.order,
            icon=d.icon,
            is_active=d.is_active,
            family_count=len(d.families or []),
            career_count=len(d.careers or [])
        ))
    return results


@router.get("/families", response_model=List[CareerFamilyOut])
@_career_limiter.limit("30/minute")
def list_career_families(
    request: Request,
    domain: Optional[str] = Query(None, description="Optional domain slug filter"),
    db: Session = Depends(get_db)
):
    """Returns active career families optionally filtered by domain slug."""
    q = db.query(CareerFamily).filter(CareerFamily.is_active == True)
    if domain:
        q = q.join(CareerFamily.domain).filter(CareerDomain.slug == domain)
    families = q.order_by(CareerFamily.order.asc()).all()
    results = []
    for f in families:
        results.append(CareerFamilyOut(
            id=f.id,
            domain_id=f.domain_id,
            domain_slug=f.domain.slug if f.domain else None,
            slug=f.slug,
            name=f.name,
            description=f.description,
            order=f.order,
            is_active=f.is_active,
            career_count=len(f.careers or [])
        ))
    return results


@router.get("/catalog", response_model=List[CareerSummaryOut])
@_career_limiter.limit("30/minute")
def get_career_catalog(
    request: Request,
    domain: Optional[str] = Query(None, description="Filter by domain slug"),
    family: Optional[str] = Query(None, description="Filter by family slug"),
    db: Session = Depends(get_db)
):
    """
    Returns high-level summaries of all active canonical careers.
    Designed for fast catalog loads, onboarding dropdowns, and destination pickers.
    """
    svc = CareerDiscoveryService(db=db)
    res = svc.search_careers(domain_slug=domain, family_slug=family, page=1, page_size=50)
    return res.items


# ---------------------------------------------------------------------------
# Stage 10: Multilingual Discovery & Language Endpoints (Static Routes)
# ---------------------------------------------------------------------------

@router.get("/languages", response_model=SupportedLanguagesResponse)
def get_supported_languages(db: Session = Depends(get_db)):
    """
    Phase 11 Stage 10: Canonical catalog of all 12 supported Indian & global languages
    (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Urdu).
    """
    svc = MultilingualCareerService(db=db)
    return svc.get_supported_languages()


@router.post("/languages/preference", response_model=UserLanguagePreferenceResponse)
def set_learner_language_preference(
    payload: UserLanguagePreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 10: Sets learner's preferred and fallback language preferences
    with persistence across all career discovery, explorer, and coach experiences.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    svc = MultilingualCareerService(db=db)
    return svc.update_learner_language_preference(
        profile=profile,
        preferred_language=payload.preferred_language,
        fallback_language=payload.fallback_language
    )


# ---------------------------------------------------------------------------
# Stage 2: Search, Filtering & Detail
# ---------------------------------------------------------------------------

@router.get("/search", response_model=CareerSearchResponse)
def search_careers(
    q: Optional[str] = Query(None, description="Free text query (e.g. 'ai', 'video editor', 'doctor', 'sde')"),
    domain: Optional[str] = Query(None, description="Domain slug filter"),
    family: Optional[str] = Query(None, description="Family slug filter"),
    education_level: Optional[str] = Query(None, description="Education level filter"),
    is_regulated: Optional[bool] = Query(None, description="Filter by statutory regulation"),
    is_emerging: Optional[bool] = Query(None, description="Filter emerging careers"),
    remote: Optional[str] = Query(None, description="Filter by remote compatibility (HIGH, MEDIUM, LOW)"),
    country: Optional[str] = Query("GLOBAL", description="Country scope filter"),
    language: Optional[str] = Query(None, description="Preferred language code for multilingual query matching"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page (max 50)"),
    db: Session = Depends(get_db)
):
    """
    Performs normalized, deterministic ranked search across careers, aliases, keywords,
    domains, families, and native-script translations with typo tolerance and multi-attribute filtering.
    """
    svc = CareerDiscoveryService(db=db)
    return svc.search_careers(
        query=q,
        domain_slug=domain,
        family_slug=family,
        education_level=education_level,
        is_regulated=is_regulated,
        is_emerging=is_emerging,
        remote_compatibility=remote,
        country=country,
        language=language,
        page=page,
        page_size=page_size
    )


# ---------------------------------------------------------------------------
# Stage 3: Education-to-Career Intelligence & Comparison
# ---------------------------------------------------------------------------

@router.post("/compare", response_model=CareerComparisonResponse)
def compare_careers(
    career_slugs: List[str] = Body(..., description="List of 2 to 4 career slugs to compare"),
    db: Session = Depends(get_db)
):
    """Compares 2 to 4 careers side-by-side on education barriers, skills, tools, and work styles."""
    if len(career_slugs) < 2 or len(career_slugs) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career comparison requires between 2 and 4 career slugs."
        )
    engine = CareerTransitionEngine(db=db)
    return engine.compare_careers(career_slugs)


@router.post("/compare-matrix", response_model=Stage5CareerComparisonResponse)
def compare_careers_matrix(
    career_slugs: List[str] = Body(..., description="List of 2 or 3 career slugs to compare"),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 5: In-depth side-by-side comparison of 2 or 3 careers.
    Computes shared skills, unique skills, pair-wise transferable skills,
    and transition feasibility matrices.
    """
    if len(career_slugs) < 2 or len(career_slugs) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deep career comparison matrix requires exactly 2 or 3 career slugs."
        )
    svc = CareerComparisonService(db=db)
    try:
        return svc.compare_careers(career_slugs)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/fit", response_model=ClusteredCareerRecommendationsResponse)
def get_career_fit_clusters(
    profile_id: Optional[str] = Query(None, description="Optional profile ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 6: Returns all canonical careers clustered into fit categories:
    strong_fit, good_fit, potential_fit, bridge_required, stretch_path, insufficient_data.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    if not p_id:
        all_careers = db.query(Career).filter(Career.is_active == True).all()
        insufficient = [
            RecommendedCareerFitItem(
                career_slug=c.slug,
                career_title=c.display_name,
                domain_name=c.domain.name if c.domain else "General",
                overall_fit_score=0.0,
                fit_category="INSUFFICIENT_DATA",
                confidence_level="LOW",
                top_strengths=[],
                key_gap="Learner profile not provided"
            )
            for c in all_careers
        ]
        return ClusteredCareerRecommendationsResponse(
            insufficient_data=insufficient,
            total_evaluated=len(all_careers)
        )

    engine = CareerPersonalizationEngine(db=db)
    return engine.get_clustered_career_recommendations(profile_id=p_id)


@router.get("/recommended-for-me", response_model=List[RecommendedCareerFitItem])
def get_recommended_careers_for_learner(
    profile_id: Optional[str] = Query(None, description="Optional profile ID for testing"),
    limit: int = Query(6, ge=1, le=20, description="Max recommendations"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 6: Personalized career recommendation ranking across
    8 fit dimensions (Education, Skill, Interest, Experience, Practical,
    Portfolio, Pathway, Preference).
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    if not p_id:
        # If no profile, return unranked base catalog items with INSUFFICIENT_DATA
        all_careers = db.query(Career).filter(Career.is_active == True).limit(limit).all()
        return [
            RecommendedCareerFitItem(
                career_slug=c.slug,
                career_title=c.display_name,
                domain_name=c.domain.name if c.domain else "General",
                overall_fit_score=0.0,
                fit_category="INSUFFICIENT_DATA",
                confidence_level="LOW",
                top_strengths=[],
                key_gap="Learner profile not provided"
            )
            for c in all_careers
        ]

    engine = CareerPersonalizationEngine(db=db)
    return engine.get_recommended_careers_for_learner(profile_id=p_id, limit=limit)


@router.get("/alternatives-for-me", response_model=PersonalizedAlternativesResponse)
def get_personalized_alternatives(
    target_career: str = Query(..., description="Target career slug to find alternatives for"),
    profile_id: Optional[str] = Query(None, description="Optional profile ID"),
    limit: int = Query(4, ge=1, le=10, description="Max alternatives to return"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 6: Discovers adjacent alternative careers that better match
    existing learner evidence when target career has major gaps.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    if not p_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication or learner profile required for personalized alternatives."
        )

    engine = CareerPersonalizationEngine(db=db)
    try:
        return engine.get_personalized_alternatives_for_learner(
            target_career_slug=target_career,
            profile_id=p_id,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# Stage 8: Personalized Priority Career Ranking & Onboarding Selection
# ---------------------------------------------------------------------------

@router.get("/ranked-priority", response_model=RankedPriorityResponse)
def get_ranked_priority_careers(
    mode: str = Query("EXPLORE", description="Goal mode: EXPLORE, TARGET_CAREER, CAREER_CHANGE, FIRST_CAREER, SKILL_BASED"),
    limit: int = Query(10, ge=1, le=30, description="Max careers to return"),
    max_per_domain: int = Query(2, ge=1, le=5, description="Diversity ceiling per domain"),
    profile_id: Optional[str] = Query(None, description="Optional profile ID for testing"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 8: Authoritative multi-signal career priority ranking.
    Combines 8-dimension learner fit (Stage 6), live market viability (Stage 7),
    and primary goal preservation with domain diversity constraints.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)
    u_id = current_user.id if current_user else None

    engine = CareerPriorityRankingEngine(db=db)
    return engine.rank_careers_for_learner(
        profile_id=p_id,
        user_id=u_id,
        mode=mode,
        limit=limit,
        max_per_domain=max_per_domain
    )


@router.post("/select-target", response_model=CareerSelectionResponse)
def select_target_career(
    payload: CareerSelectionRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 9: Records learner's target career selection during onboarding
    or exploration with timestamp and provenance source (SEARCH, RECOMMENDED, BROWSE, etc.).
    """
    slug = payload.career_slug.strip().lower()
    career = db.query(Career).filter(Career.slug == slug).first()
    display_title = career.display_name if career else (payload.custom_role_name or slug.replace("-", " ").title())
    now_iso = datetime.now(timezone.utc).isoformat()

    # If user is authenticated, update their profile / goal
    if current_user and current_user.profile:
        profile = current_user.profile
        profile.learning_objective = f"Target Career: {display_title}"
        
        # Update or create primary goal
        goal = db.query(Goal).filter(Goal.profile_id == profile.id, Goal.is_primary == True).first()
        if not goal:
            goal = Goal(
                profile_id=profile.id,
                title=f"Master {display_title}",
                target_role=display_title,
                target_skills=career.typical_tasks if career else [],
                is_primary=True,
                status="active"
            )
            db.add(goal)
        else:
            goal.target_role = display_title
            goal.title = f"Master {display_title}"
            if career and career.typical_tasks:
                goal.target_skills = career.typical_tasks
        
        db.commit()

    return CareerSelectionResponse(
        success=True,
        career_slug=slug,
        career_title=display_title,
        selection_source=payload.selection_source,
        timestamp=now_iso,
        message=f"Successfully selected '{display_title}' as target career destination."
    )


# ---------------------------------------------------------------------------
# Career Detail & Nested Specifications (Slug parameter routes)
# ---------------------------------------------------------------------------

@router.get("/{career_slug}", response_model=CareerDetailOut)
def get_career_detail(career_slug: str, db: Session = Depends(get_db)):
    """Returns complete authoritative specification for a single career."""
    svc = CareerDiscoveryService(db=db)
    career = svc.get_career_detail(career_slug)
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career with slug '{career_slug}' not found in canonical catalog."
        )
    return career


@router.get("/{career_slug}/skills", response_model=List[CareerSkillRequirementOut])
def get_career_skills(career_slug: str, db: Session = Depends(get_db)):
    """Returns mapped canonical skills with importance and proficiency levels."""
    svc = CareerDiscoveryService(db=db)
    career = svc.get_career_detail(career_slug)
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found."
        )
    return career.skill_requirements


@router.get("/{career_slug}/specializations", response_model=List[CareerSpecializationOut])
def get_career_specializations(career_slug: str, db: Session = Depends(get_db)):
    """Returns specializations underneath the specified career."""
    svc = CareerDiscoveryService(db=db)
    career = svc.get_career_detail(career_slug)
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found."
        )
    return career.specializations


@router.get("/{career_slug}/education-fit", response_model=EducationFitResponse)
def get_learner_education_fit(
    career_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Authenticated evaluation of the learner's academic background and skills
    against career entry prerequisites, producing a structured fit and DecisionTrace.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    engine = EducationGraphEngine(db=db)
    fit = engine.evaluate_education_fit(profile=profile, career_slug=career_slug)
    if not fit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found."
        )
    return fit


@router.get("/{career_slug}/transitions", response_model=CareerTransitionResponse)
def get_career_transition(
    career_slug: str,
    from_role: Optional[str] = Query(None, description="Source career slug to transition from"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculates transition feasibility, transferable skills, and bridge skills
    from a source career into this target career.
    """
    source_slug = from_role
    if not source_slug and current_user.profile and current_user.profile.current_role:
        source_slug = current_user.profile.current_role.lower().replace(" ", "-")

    if not source_slug:
        source_slug = "software-engineer"  # sensible default baseline

    engine = CareerTransitionEngine(db=db)
    res = engine.get_career_transition(source_slug=source_slug, target_slug=career_slug)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transition between '{source_slug}' and '{career_slug}' could not be resolved."
        )
    return res


# ---------------------------------------------------------------------------
# Stage 4: Requirements & Pathways Intelligence Endpoints
# ---------------------------------------------------------------------------

@router.get("/{career_slug}/requirements", response_model=CareerEligibilityResponse)
def get_career_requirements(
    career_slug: str,
    profile_id: Optional[str] = Query(None, description="Optional profile ID for learner evaluation"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 4: Returns complete career requirements with verified sources,
    statutory authorities, and optional learner satisfaction status.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    engine = CareerRequirementEngine(db=db)
    try:
        return engine.evaluate_career_eligibility(career_slug=career_slug, profile_id=p_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/pathways", response_model=List[CareerPathwayResponse])
def get_career_pathways(
    career_slug: str,
    profile_id: Optional[str] = Query(None, description="Optional profile ID for eligibility matching"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 4: Returns multi-pathway routes (Direct, Degree, ITI, Bridge, Transition)
    with ordered steps, estimated durations, and difficulty levels.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    engine = CareerRequirementEngine(db=db)
    try:
        eligibility = engine.evaluate_career_eligibility(career_slug=career_slug, profile_id=p_id)
        return eligibility.pathways
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/eligibility", response_model=CareerEligibilityResponse)
def evaluate_career_eligibility(
    career_slug: str,
    profile_id: Optional[str] = Query(None, description="Optional profile ID for evaluation"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 4: Evaluates whether a learner meets the career entry prerequisites,
    detects statutory blockers, and calculates bridge requirements.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    engine = CareerRequirementEngine(db=db)
    try:
        return engine.evaluate_career_eligibility(career_slug=career_slug, profile_id=p_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# Stage 5: Alternative Career Discovery Endpoints
# ---------------------------------------------------------------------------

@router.get("/{career_slug}/alternatives", response_model=AlternativeCareersResponse)
def get_career_alternatives(
    career_slug: str,
    limit: int = Query(5, ge=1, le=10, description="Max alternatives to return"),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 5: Discovers adjacent, alternative, predecessor, and bridge careers
    using explicit career knowledge relationships and algorithmic skill similarity.
    """
    svc = CareerComparisonService(db=db)
    try:
        return svc.get_alternative_careers(career_slug=career_slug, limit=limit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# Stage 6: Personalized Fit Engine Endpoints
# ---------------------------------------------------------------------------

@router.get("/{career_slug}/fit", response_model=CareerFitResponse)
def get_career_fit(
    career_slug: str,
    profile_id: Optional[str] = Query(None, description="Optional profile ID for testing"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 6: Evaluates personalized fit across 8 dimensions
    (education, skill, interest, experience, practical, portfolio, pathway, preference)
    with strict non-fabrication (missing fields = UNKNOWN).
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)

    engine = CareerPersonalizationEngine(db=db)
    try:
        return engine.calculate_career_fit(career_slug=career_slug, profile_id=p_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/fit/explanation", response_model=CareerFitExplanationResponse)
def get_career_fit_explanation(
    career_slug: str,
    profile_id: Optional[str] = Query(None, description="Optional profile ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 6: Returns transparent, explainable justification of career fit with DecisionTrace.
    """
    p_id = _resolve_authorized_profile_id(profile_id, current_user, db=db)
    if not p_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for personalized career fit explanation."
        )

    engine = CareerPersonalizationEngine(db=db)
    try:
        return engine.get_fit_explanation(career_slug=career_slug, profile_id=p_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# Stage 7: Live Career Market, Demand, Salary & Regional Intelligence
# ---------------------------------------------------------------------------

@router.get("/{career_slug}/market", response_model=CareerMarketSnapshot)
def get_career_market_snapshot(
    career_slug: str,
    force_refresh: bool = Query(False, description="Bypass cache and force recalculation"),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 7: Complete authoritative market snapshot for a career.
    Provides verified demand trajectory, salary ranges across experience tiers,
    in-demand skills, and regional hiring concentrations.
    """
    svc = CareerMarketIntelligenceService(db=db)
    try:
        return svc.get_career_market_snapshot(career_slug=career_slug, force_refresh=force_refresh)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/market/skills", response_model=CareerMarketSkillsResponse)
def get_career_market_skills(
    career_slug: str,
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 7: In-demand and emerging skills tracked for this career.
    """
    svc = CareerMarketIntelligenceService(db=db)
    try:
        return svc.get_career_market_skills(career_slug=career_slug)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/market/salary", response_model=CareerMarketSalaryResponse)
def get_career_market_salary(
    career_slug: str,
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 7: Verified salary benchmarks (Entry, Mid, Senior in INR).
    Strict non-fabrication: returns UNKNOWN if data is not available.
    """
    svc = CareerMarketIntelligenceService(db=db)
    try:
        return svc.get_career_market_salary(career_slug=career_slug)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/market/regions", response_model=CareerMarketRegionsResponse)
def get_career_market_regions(
    career_slug: str,
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 7: Regional hiring distribution across Indian metros.
    """
    svc = CareerMarketIntelligenceService(db=db)
    try:
        return svc.get_career_market_regions(career_slug=career_slug)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------------------------
# Stage 10: Localized Career Content & Grounded AI Explanations
# ---------------------------------------------------------------------------

@router.get("/{career_slug}/translations", response_model=CareerTranslationResponse)
def get_career_translation(
    career_slug: str,
    language: Optional[str] = Query(None, description="Requested language code or name (e.g. 'ta', 'hi', 'ur')"),
    fallback: Optional[str] = Query("en", description="Fallback language if requested translation is missing"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 10: Retrieves language overlay for canonical career record
    with safe fallback: preferred -> fallback -> English.
    """
    target_lang = language
    if not target_lang and current_user and current_user.profile and current_user.profile.preferred_language:
        target_lang = current_user.profile.preferred_language

    svc = MultilingualCareerService(db=db)
    try:
        return svc.get_career_translation(
            career_slug=career_slug,
            language=target_lang,
            fallback_language=fallback or "en"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{career_slug}/ai-explanation", response_model=CareerAIExplanationResponse)
def get_career_ai_explanation(
    career_slug: str,
    language: Optional[str] = Query(None, description="Target language code or name (e.g. 'hi', 'ta', 'te')"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Phase 11 Stage 10: Grounded multilingual career explanation.
    Preserves technical tokens in Latin script and grounds all claims in database facts.
    """
    target_lang = language
    p_id = None
    if current_user and current_user.profile:
        p_id = current_user.profile.id
        if not target_lang and current_user.profile.preferred_language:
            target_lang = current_user.profile.preferred_language

    svc = MultilingualCareerService(db=db)
    try:
        return svc.generate_ai_career_explanation(
            career_slug=career_slug,
            language=target_lang,
            profile_id=p_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))



