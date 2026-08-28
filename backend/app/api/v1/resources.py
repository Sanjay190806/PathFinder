from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.resource import LearningResource
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.resource import ResourceOut, ResourceDetailOut

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
