from typing import Optional, List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.company.company_service import CompanyService
from backend.app.company.role_requirement_service import RoleRequirementService
from backend.app.dsa.dsa_priority_service import DSAPriorityService
from backend.app.dsa.learner_dsa_gap_service import LearnerDSAGapService
from backend.app.schemas.company import (
    CompanySummary,
    CompanyDetail,
    CompanySearchResponse,
    CompanyRoleSummary,
    CompanyRoleDetail,
    RoleSkillRequirementItem,
    RoleDSARequirementItem,
    RoleTechnologyItem,
    RoleInterviewTopicItem,
)
from backend.app.schemas.dsa_priority import DSAPriorityProfileResponse

router = APIRouter(prefix="/companies", tags=["Companies & Roles"])


@router.get("", response_model=CompanySearchResponse)
def get_companies(
    search: Optional[str] = Query(None, description="Search by name, slug, or keywords"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    company_type: Optional[str] = Query(None, description="Filter by company type"),
    country: Optional[str] = Query(None, description="Filter by headquarters country"),
    is_verified: Optional[bool] = Query(None, description="Filter by verified status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    companies, total = CompanyService.list_companies(
        db=db,
        search=search,
        industry=industry,
        company_type=company_type,
        headquarters_country=country,
        is_verified=is_verified,
        skip=skip,
        limit=page_size,
    )

    items = []
    for c in companies:
        items.append(
            CompanySummary(
                id=c.id,
                slug=c.slug,
                canonical_name=c.canonical_name,
                display_name=c.display_name,
                industry=c.industry,
                company_type=c.company_type,
                headquarters_country=c.headquarters_country or "India",
                headquarters_region=c.headquarters_region,
                operating_countries=c.operating_countries or [],
                operating_regions=c.operating_regions or [],
                is_verified=c.is_verified,
                verification_status=c.verification_status or "VERIFIED",
                roles_count=len(c.roles) if c.roles else 0,
            )
        )

    return CompanySearchResponse(
        total_count=total,
        page=page,
        page_size=page_size,
        items=items,
    )


@router.get("/meta/industries", response_model=List[str])
def get_industries(db: Session = Depends(get_db)):
    """Returns a list of all distinct company industries."""
    return CompanyService.get_meta_industries(db)


@router.get("/resolve", response_model=CompanyDetail)
def resolve_company(
    query: str = Query(..., min_length=1, description="Company name, alias, or slug to resolve"),
    db: Session = Depends(get_db),
):
    """Resolves a company by alias or partial match (e.g. 'Alphabet' -> Google)."""
    company = CompanyService.resolve_company_by_alias(db, query)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No company matching '{query}' found.",
        )

    roles = [
        CompanyRoleSummary(
            id=r.id,
            role_slug=r.role_slug,
            canonical_role_name=r.canonical_role_name,
            display_name=r.display_name,
            career_id=r.career_id,
            career_slug=r.career.slug if r.career else None,
            employment_type=r.employment_type or "FULL_TIME",
            experience_level=r.experience_level or "ENTRY_LEVEL",
            location_scope=r.location_scope or "National",
            remote_type=r.remote_type or "HYBRID",
            dsa_relevance=r.dsa_relevance or "UNKNOWN",
            verification_status=r.verification_status or "VERIFIED",
        )
        for r in (company.roles or [])
    ]

    return CompanyDetail(
        id=company.id,
        slug=company.slug,
        canonical_name=company.canonical_name,
        display_name=company.display_name,
        industry=company.industry,
        company_type=company.company_type,
        headquarters_country=company.headquarters_country or "India",
        headquarters_region=company.headquarters_region,
        operating_countries=company.operating_countries or [],
        operating_regions=company.operating_regions or [],
        is_verified=company.is_verified,
        verification_status=company.verification_status or "VERIFIED",
        roles_count=len(roles),
        aliases=company.aliases or [],
        website=company.website,
        careers_url=company.careers_url,
        description=company.description,
        source=company.source or "PathFinder Corporate Registry",
        source_url=company.source_url,
        last_verified_at=company.last_verified_at,
        version=company.version or 1,
        roles=roles,
    )


@router.get("/by-career/{career_slug}")
def get_companies_by_career(
    career_slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieves all companies hiring for a given canonical career slug."""
    skip = (page - 1) * page_size
    items, total = CompanyService.get_companies_by_career(db, career_slug, skip=skip, limit=page_size)
    return {
        "career_slug": career_slug,
        "total_count": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }


@router.get("/{company_slug}", response_model=CompanyDetail)
def get_company_detail(company_slug: str, db: Session = Depends(get_db)):
    company = CompanyService.get_company_by_slug(db, company_slug)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with slug '{company_slug}' not found.",
        )

    roles = [
        CompanyRoleSummary(
            id=r.id,
            role_slug=r.role_slug,
            canonical_role_name=r.canonical_role_name,
            display_name=r.display_name,
            career_id=r.career_id,
            career_slug=r.career.slug if r.career else None,
            employment_type=r.employment_type or "FULL_TIME",
            experience_level=r.experience_level or "ENTRY_LEVEL",
            location_scope=r.location_scope or "National",
            remote_type=r.remote_type or "HYBRID",
            dsa_relevance=r.dsa_relevance or "UNKNOWN",
            verification_status=r.verification_status or "VERIFIED",
        )
        for r in (company.roles or [])
    ]

    return CompanyDetail(
        id=company.id,
        slug=company.slug,
        canonical_name=company.canonical_name,
        display_name=company.display_name,
        industry=company.industry,
        company_type=company.company_type,
        headquarters_country=company.headquarters_country or "India",
        headquarters_region=company.headquarters_region,
        operating_countries=company.operating_countries or [],
        operating_regions=company.operating_regions or [],
        is_verified=company.is_verified,
        verification_status=company.verification_status or "VERIFIED",
        roles_count=len(roles),
        aliases=company.aliases or [],
        website=company.website,
        careers_url=company.careers_url,
        description=company.description,
        source=company.source or "PathFinder Corporate Registry",
        source_url=company.source_url,
        last_verified_at=company.last_verified_at,
        version=company.version or 1,
        roles=roles,
    )


@router.get("/{company_slug}/roles", response_model=Dict[str, Any])
def get_company_roles(
    company_slug: str,
    experience_level: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    roles, total = CompanyService.list_company_roles(
        db=db,
        company_slug=company_slug,
        experience_level=experience_level,
        skip=skip,
        limit=page_size,
    )

    items = [
        CompanyRoleSummary(
            id=r.id,
            role_slug=r.role_slug,
            canonical_role_name=r.canonical_role_name,
            display_name=r.display_name,
            career_id=r.career_id,
            career_slug=r.career.slug if r.career else None,
            employment_type=r.employment_type or "FULL_TIME",
            experience_level=r.experience_level or "ENTRY_LEVEL",
            location_scope=r.location_scope or "National",
            remote_type=r.remote_type or "HYBRID",
            dsa_relevance=r.dsa_relevance or "UNKNOWN",
            verification_status=r.verification_status or "VERIFIED",
        )
        for r in roles
    ]

    return {
        "company_slug": company_slug,
        "total_count": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }


@router.get("/{company_slug}/roles/{role_slug}", response_model=CompanyRoleDetail)
def get_company_role_detail(
    company_slug: str,
    role_slug: str,
    db: Session = Depends(get_db),
):
    role = CompanyService.get_company_role(db, company_slug, role_slug)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_slug}' at '{company_slug}' not found.",
        )

    skills = [
        RoleSkillRequirementItem(
            id=sr.id,
            skill_id=sr.skill_id,
            skill_name=sr.skill.name if sr.skill else "Skill",
            skill_slug=sr.skill.slug if sr.skill else "",
            requirement_type=sr.requirement_type or "REQUIRED",
            importance=sr.importance or "HIGH",
            minimum_level=sr.minimum_level or "WORKING",
            source=sr.source or "Verified",
            verification_status=sr.verification_status or "VERIFIED",
        )
        for sr in (role.skill_requirements or [])
    ]
    dsa_reqs = [
        RoleDSARequirementItem(
            id=dr.id,
            dsa_topic_slug=dr.dsa_topic_slug,
            dsa_topic_name=dr.dsa_topic_name,
            importance=dr.importance or "HIGH",
            difficulty_target=dr.difficulty_target or "MEDIUM",
            requirement_type=dr.requirement_type or "REQUIRED",
            source=dr.source or "Verified Blueprint",
        )
        for dr in (role.dsa_requirements or [])
    ]
    tech_reqs = [
        RoleTechnologyItem(
            id=tr.id,
            category=tr.category,
            technology_name=tr.technology_name,
            is_mandatory=tr.is_mandatory or False,
            importance=tr.importance or "HIGH",
            requirement_type=tr.requirement_type or "PREFERRED",
        )
        for tr in (role.tech_requirements or [])
    ]
    int_topics = [
        RoleInterviewTopicItem(
            id=it.id,
            topic_name=it.topic_name,
            topic_category=it.topic_category or "TECHNICAL",
            weight=it.weight or 1.0,
            focus_areas=it.focus_areas or [],
        )
        for it in (role.interview_topics or [])
    ]

    return CompanyRoleDetail(
        id=role.id,
        role_slug=role.role_slug,
        canonical_role_name=role.canonical_role_name,
        display_name=role.display_name,
        company_name=role.company.display_name,
        company_slug=role.company.slug,
        career_id=role.career_id,
        career_slug=role.career.slug if role.career else None,
        employment_type=role.employment_type or "FULL_TIME",
        experience_level=role.experience_level or "ENTRY_LEVEL",
        location_scope=role.location_scope or "National",
        remote_type=role.remote_type or "HYBRID",
        dsa_relevance=role.dsa_relevance or "UNKNOWN",
        verification_status=role.verification_status or "VERIFIED",
        aliases=role.aliases or [],
        description=role.description,
        cs_fundamentals_relevance=role.cs_fundamentals_relevance or {},
        source=role.source or "Verified Employer Job Specification",
        source_url=role.source_url,
        last_verified_at=role.last_verified_at,
        version=role.version or 1,
        skill_requirements=skills,
        dsa_requirements=dsa_reqs,
        tech_requirements=tech_reqs,
        interview_topics=int_topics,
    )


@router.get("/{company_slug}/roles/{role_slug}/requirements-profile")
def get_role_requirements_profile(
    company_slug: str,
    role_slug: str,
    db: Session = Depends(get_db),
):
    """Retrieves grounded role requirement profile resolving 4-tier provenance hierarchy."""
    profile = RoleRequirementService.get_role_requirements_profile(db, company_slug, role_slug)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requirements profile for '{role_slug}' at '{company_slug}' not found.",
        )
    return profile


@router.get("/{company_slug}/roles/{role_slug}/learner-fit/{learner_id}")
def get_role_learner_fit(
    company_slug: str,
    role_slug: str,
    learner_id: str,
    db: Session = Depends(get_db),
):
    """Evaluates learner readiness, skill gaps, and interview prep targets against the role."""
    match_result = RoleRequirementService.match_learner_against_role(db, company_slug, role_slug, learner_id)
    if "error" in match_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=match_result["error"],
        )
    return match_result


@router.get("/{company_slug}/roles/{role_slug}/dsa", response_model=DSAPriorityProfileResponse)
@router.get("/{company_slug}/roles/{role_slug}/dsa-profile", response_model=DSAPriorityProfileResponse)
def get_company_role_dsa_profile(
    company_slug: str,
    role_slug: str,
    db: Session = Depends(get_db),
):
    """Resolves role-specific DSA priority profile, target difficulties, and prerequisites applying 4-tier provenance."""
    profile = DSAPriorityService.get_role_dsa_priority(db, company_slug=company_slug, role_slug=role_slug)
    if profile.get("priority_level") == "UNKNOWN" and not profile.get("role_name"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSA priority profile for '{role_slug}' at '{company_slug}' not found.",
        )
    return profile


@router.get("/roles/{role_id}/dsa-priority", response_model=DSAPriorityProfileResponse)
def get_role_id_dsa_priority(
    role_id: str,
    db: Session = Depends(get_db),
):
    """Resolves DSA priority profile by role ID."""
    profile = DSAPriorityService.get_role_dsa_priority(db, role_id=role_id)
    if profile.get("priority_level") == "UNKNOWN" and not profile.get("role_name"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role with ID '{role_id}' not found.",
        )
    return profile


@router.get("/{company_slug}/roles/{role_slug}/learner-gaps")
def get_role_learner_gaps(
    company_slug: str,
    role_slug: str,
    learner_id: str = Query(..., description="Learner profile ID"),
    db: Session = Depends(get_db),
):
    """Calculates granular skill and DSA topic gaps with prerequisite blocker detection for a learner."""
    gaps = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug=company_slug, role_slug=role_slug, learner_id=learner_id
    )
    if "error" in gaps:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=gaps["error"],
        )
    return gaps


@router.get("/{company_slug}/roles/{role_slug}/next-topic")
def get_role_next_recommended_topic(
    company_slug: str,
    role_slug: str,
    learner_id: str = Query(..., description="Learner profile ID"),
    db: Session = Depends(get_db),
):
    """Determines the prerequisite-safe next learning topic for the learner targeting this company role."""
    gaps = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug=company_slug, role_slug=role_slug, learner_id=learner_id
    )
    if "error" in gaps:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=gaps["error"],
        )
    return {
        "company_slug": company_slug,
        "role_slug": role_slug,
        "learner_id": learner_id,
        "next_topic": gaps.get("next_recommended_topic"),
        "prerequisite_blockers": gaps.get("prerequisite_blockers"),
    }


@router.get("/compare/company-gaps")
def compare_company_gaps(
    role_slug: str = Query(..., description="Role slug e.g. swe-iii"),
    company_a: str = Query(..., description="First company slug"),
    company_b: str = Query(..., description="Second company slug"),
    learner_id: str = Query(..., description="Learner profile ID"),
    db: Session = Depends(get_db),
):
    """Compares learner gaps and requirements between two target companies for the same role."""
    comparison = LearnerDSAGapService.compare_company_gaps(
        db, role_slug=role_slug, company_slug_a=company_a, company_slug_b=company_b, learner_id=learner_id
    )
    if "error" in comparison:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=comparison["error"],
        )
    return comparison

