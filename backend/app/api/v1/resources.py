from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.resource import LearningResource
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.resource import ResourceOut, ResourceDetailOut, ResourceDiscoveryOut, ResourceVerificationResponse
from backend.app.resources.resource_discovery_engine import ResourceDiscoveryEngine
from backend.app.resources.resource_verifier import ResourceVerifier
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
    provider: Optional[str] = Query(None, description="Provider filter"),
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
        provider=provider
    )

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

