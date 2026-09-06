from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.models.resource import LearningResource
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.resource import ResourceOut, ResourceDetailOut, ResourceDiscoveryOut, ResourceVerificationResponse
from backend.app.resources.resource_discovery_engine import ResourceDiscoveryEngine
from backend.app.resources.resource_verifier import ResourceVerifier
from backend.app.resources.course_intelligence_service import CourseIntelligenceService
from backend.app.resources.youtube_practice_service import YouTubePracticeService
from backend.app.core.resource_catalog_extended import EXTENDED_RESOURCES_REGISTRY


router = APIRouter(prefix="/resources", tags=["Learning Resources"])

@router.get("", response_model=List[ResourceOut])
def list_resources(db: Session = Depends(get_db)):
    resources = db.query(LearningResource).all()
    out = []
    for r in resources:
        skills = [rs.skill.name for rs in r.resource_skills]
        out.append(ResourceOut(
            id=r.id,
            title=r.title,
            slug=r.slug,
            description=r.description,
            provider=r.provider,
            url=r.url,
            resource_type=r.resource_type,
            difficulty=r.difficulty,
            estimated_hours=r.estimated_hours,
            quality_score=r.quality_score,
            career_relevance=r.career_relevance or [],
            format=r.format,
            skills=skills
        ))
    return out

@router.get("/discover", response_model=List[ResourceDiscoveryOut])
def discover_resources(
    career: Optional[str] = Query(None, description="Target career role slug"),
    skill: Optional[str] = Query(None, description="Target skill slug"),
    language: Optional[str] = Query(None, description="Preferred language"),
    price: Optional[str] = Query(None, description="Price filter: ALL, FREE, GENUINELY_FREE, PAID"),
    difficulty: Optional[str] = Query(None, description="Difficulty level"),
    resource_type: Optional[str] = Query(None, description="Resource type"),
    provider: Optional[str] = Query(None, description="Provider filter (e.g. igot_karmayogi, nptel, microsoft_learn)"),
    source_tier: Optional[int] = Query(None, description="Source tier filter (1: Gov/Institutional, 2: Tech Provider, 3: EdTech, 4: Video)"),
    competency: Optional[str] = Query(None, description="Competency or topic search term"),
    free_only: bool = Query(False, description="Filter for free learning content only"),
    db: Session = Depends(get_db)
):
    engine = ResourceDiscoveryEngine(db)
    return engine.discover_resources(
        career_slug=career,
        skill_slug=skill,
        language=language,
        price_filter=price,
        difficulty=difficulty,
        resource_type=resource_type,
        provider=provider,
        source_tier=source_tier,
        competency=competency,
        free_only=free_only
    )

@router.get("/providers")
def get_learning_providers():
    """Returns all supported learning providers, their tier hierarchy, and official domains."""
    from backend.app.providers.registry import provider_registry
    return {
        "providers": provider_registry.list_providers(),
        "source_tiers": {
            1: "Tier 1: Government & Institutional (iGOT Karmayogi, NPTEL, SWAYAM)",
            2: "Tier 2: Official Technology Providers (Microsoft Learn, Google, AWS, Cisco, IBM)",
            3: "Tier 3: Established EdTech Platforms (Coursera, edX, Udemy)",
            4: "Tier 4: Verified Video Learning (Curated YouTube Series)"
        }
    }

@router.get("/diagnostics")
def get_resource_diagnostics(db: Session = Depends(get_db)):
    """Provides authoritative data quality diagnostics for multi-source learning resources."""
    engine = ResourceDiscoveryEngine(db)
    all_res = engine.get_all_catalog_resources()

    tier_counts = {1: 0, 2: 0, 3: 0, 4: 0}
    status_counts = {"VERIFIED": 0, "STALE": 0, "EXPIRED": 0, "UNVERIFIED": 0}
    provider_counts: Dict[str, int] = {}
    igot_metrics = {
        "total_courses": 0,
        "verified_courses": 0,
        "official_domains": ["igotkarmayogi.gov.in", "portal.igotkarmayogi.gov.in"],
        "mapped_competencies": 0,
        "status": "HEALTHY"
    }

    from backend.app.resources.taxonomy_mapper import IGOT_COMPETENCY_TO_CANONICAL_SKILLS
    igot_metrics["mapped_competencies"] = len(IGOT_COMPETENCY_TO_CANONICAL_SKILLS)

    for r in all_res:
        t = r.get("source_tier", 3)
        tier_counts[t] = tier_counts.get(t, 0) + 1

        v = r.get("verification_status", "UNVERIFIED")
        status_counts[v] = status_counts.get(v, 0) + 1

        p = r.get("provider", "Unknown")
        provider_counts[p] = provider_counts.get(p, 0) + 1

        pid = (r.get("provider_id") or "").lower()
        if pid == "igot_karmayogi" or "igot" in p.lower():
            igot_metrics["total_courses"] += 1
            if v == "VERIFIED":
                igot_metrics["verified_courses"] += 1

    return {
        "total_learning_resources": len(all_res),
        "source_tiers": tier_counts,
        "verification_breakdown": status_counts,
        "providers_distribution": provider_counts,
        "igot_karmayogi": igot_metrics,
        "diagnostics_timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/recommendations", response_model=List[ResourceDiscoveryOut])
def get_personalized_resource_recommendations(
    career: Optional[str] = Query(None),
    price: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = ResourceDiscoveryEngine(db)
    return engine.discover_resources(
        career_slug=career,
        price_filter=price,
        learner_profile=current_user.profile
    )

@router.get("/courses")
def search_courses(
    q: Optional[str] = Query(None, description="Text search across title, description, and provider"),
    dsa_topic: Optional[str] = Query(None, description="Filter by DSA topic slug"),
    skill: Optional[str] = Query(None, description="Filter by skill slug"),
    career: Optional[str] = Query(None, description="Filter by career slug"),
    role: Optional[str] = Query(None, description="Filter by role slug"),
    price: Optional[str] = Query(None, description="Price filter"),
    language: Optional[str] = Query(None, description="Filter by language"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    free_only: bool = Query(False, description="Filter to free learning resources only"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Searches verified courses and learning resources with pricing classification and quality ranking."""
    service = CourseIntelligenceService(db)
    return service.search_courses(
        query=q,
        dsa_topic=dsa_topic,
        skill=skill,
        career_slug=career,
        role_slug=role,
        price_filter=price,
        language=language,
        difficulty=difficulty,
        free_only=free_only,
        limit=limit,
        skip=skip,
    )


@router.get("/pricing-categories")
def get_pricing_categories():
    """Returns canonical pricing classification types and definitions."""
    return CourseIntelligenceService.get_price_categories()


@router.get("/{resource_id}", response_model=ResourceDetailOut)
def get_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    skills = [rs.skill.name for rs in r.resource_skills]
    prereqs = []
    for rs in r.resource_skills:
        for p in rs.skill.prerequisites:
            prereqs.append(p.prerequisite_skill.name)

    learner_status = "not_started"
    time_spent = 0
    if current_user.profile:
        prog = db.query(Progress).filter(
            Progress.profile_id == current_user.profile.id,
            Progress.resource_id == resource_id
        ).first()
        if prog:
            learner_status = prog.status
            time_spent = prog.time_spent_minutes

    feedbacks = db.query(Feedback).filter(Feedback.resource_id == resource_id).all()
    fb_list = [{"rating": f.rating, "comment": f.comment, "type": f.feedback_type} for f in feedbacks]

    return ResourceDetailOut(
        id=r.id,
        title=r.title,
        slug=r.slug,
        description=r.description,
        provider=r.provider,
        url=r.url,
        resource_type=r.resource_type,
        difficulty=r.difficulty,
        estimated_hours=r.estimated_hours,
        quality_score=r.quality_score,
        career_relevance=r.career_relevance or [],
        format=r.format,
        skills=skills,
        prerequisites=list(set(prereqs)),
        learner_status=learner_status,
        time_spent_minutes=time_spent,
        feedback_history=fb_list
    )

@router.post("/{resource_id}/verify", response_model=ResourceVerificationResponse)
def verify_learning_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verifier = ResourceVerifier()
    
    # 1. Search in DB
    r = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if r:
        res_data = {
            "id": r.id,
            "title": r.title,
            "url": r.url,
            "price_type": r.price_type,
            "learning_cost": r.learning_cost,
            "certificate_cost": r.certificate_cost
        }
        verification = verifier.verify_resource(res_data)
        # Authoritative DB update
        r.verification_status = verification.verification_status
        r.last_verified_at = verification.verified_at
        r.price_type = verification.price_classification
        r.learning_cost = verification.learning_cost
        db.commit()
        return verification

    # 2. Search in extended registry
    ext_r = next((item for item in EXTENDED_RESOURCES_REGISTRY if item["id"] == resource_id), None)
    if ext_r:
        return verifier.verify_resource(ext_r)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Resource '{resource_id}' not found for verification."
    )


@router.get("/by-dsa/{topic_slug}")
def get_courses_by_dsa_topic(
    topic_slug: str,
    db: Session = Depends(get_db),
):
    """Retrieves verified learning resources covering a specific DSA topic."""
    service = CourseIntelligenceService(db)
    return service.get_courses_by_dsa_topic(topic_slug)


@router.get("/by-company-role/{company_slug}/{role_slug}")
def get_courses_by_company_role(
    company_slug: str,
    role_slug: str,
    db: Session = Depends(get_db),
):
    """Retrieves verified learning resources aligned with specific company role requirements."""
    service = CourseIntelligenceService(db)
    return service.get_courses_by_role(company_slug, role_slug)


@router.get("/youtube/by-topic/{topic_slug}")
def get_youtube_resources_by_topic(
    topic_slug: str,
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    language: Optional[str] = Query(None, description="Filter by language"),
    limit: int = Query(10, ge=1, le=50),
):
    """Retrieves verified YouTube educational playlists and video series covering a DSA topic."""
    return YouTubePracticeService.search_youtube_resources(
        topic_slug=topic_slug, difficulty=difficulty, language=language, limit=limit
    )


@router.get("/practice/by-topic/{topic_slug}")
def get_practice_problems_by_topic(
    topic_slug: str,
    difficulty: Optional[str] = Query(None, description="Filter by EASY, MEDIUM, or HARD"),
):
    """Retrieves structured Easy/Medium/Hard practice problem sets for a canonical DSA topic."""
    return YouTubePracticeService.get_practice_problems(
        topic_slug=topic_slug, difficulty=difficulty
    )



