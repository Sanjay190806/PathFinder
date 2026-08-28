from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.learning_path import LearningPath, LearningPathVersion, LearningPathItem
from backend.app.schemas.learning_path import (
    LearningPathOut,
    LearningPathVersionOut,
    LearningPathItemOut,
    ExplanationOut,
    RoadmapChangeOut
)
from backend.app.engine.adaptive import generate_or_adapt_roadmap

router = APIRouter(prefix="/learning-path", tags=["Learning Path"])

def format_version(version: LearningPathVersion) -> LearningPathVersionOut:
    items_out = []
    for it in version.items:
        r = it.resource
        skills = [rs.skill.name for rs in r.resource_skills]
        prereqs = []
        for rs in r.resource_skills:
            for p in rs.skill.prerequisites:
                prereqs.append(p.prerequisite_skill.name)

        expl_out = None
        if it.explanation:
            expl_out = ExplanationOut(
                goal_relevance_score=it.explanation.goal_relevance_score,
                skill_gap_score=it.explanation.skill_gap_score,
                prereq_score=it.explanation.prereq_score,
                difficulty_score=it.explanation.difficulty_score,
                pref_score=it.explanation.pref_score,
                time_score=it.explanation.time_score,
                engagement_score=it.explanation.engagement_score,
                diversity_score=it.explanation.diversity_score,
                composite_score=it.explanation.composite_score,
                structured_reasons=it.explanation.structured_reasons or [],
                human_readable_explanation=it.explanation.human_readable_explanation
            )

        items_out.append(LearningPathItemOut(
            id=it.id,
            version_id=it.version_id,
            resource_id=it.resource_id,
            resource_title=r.title,
            resource_description=r.description,
            resource_provider=r.provider,
            resource_url=r.url,
            resource_type=r.resource_type,
            difficulty=r.difficulty,
            estimated_hours=r.estimated_hours,
            format=r.format,
            skills=skills,
            prerequisites=list(set(prereqs)),
            phase_number=it.phase_number,
            phase_name=it.phase_name,
            sequence_order=it.sequence_order,
            is_completed=it.is_completed,
            is_skipped=it.is_skipped,
            is_locked=it.is_locked,
            explanation=expl_out
        ))

    changes_out = [
        RoadmapChangeOut(
            id=rc.id,
            previous_item_id=rc.previous_item_id,
            new_item_id=rc.new_item_id,
            change_type=rc.change_type,
            reason=rc.reason,
            trigger=rc.trigger,
            timestamp=rc.timestamp.isoformat()
        )
        for rc in version.roadmap_changes
    ]

    return LearningPathVersionOut(
        id=version.id,
        learning_path_id=version.learning_path_id,
        version_number=version.version_number,
        version_hash=version.version_hash,
        trigger=version.trigger,
        change_summary=version.change_summary,
        is_active=version.is_active,
        created_at=version.created_at.isoformat(),
        items=items_out,
        roadmap_changes=changes_out
    )

@router.get("", response_model=LearningPathOut)
def get_active_learning_path(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    path = db.query(LearningPath).filter(
        LearningPath.profile_id == profile.id,
        LearningPath.is_active == True
    ).first()

    if not path:
        primary_goal = next((g for g in profile.goals if g.is_primary), None)
        if not primary_goal:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active goal set")
        path, _, _ = generate_or_adapt_roadmap(profile, primary_goal, "initial_generation", "Initial roadmap", db)

    active_version = db.query(LearningPathVersion).filter(
        LearningPathVersion.learning_path_id == path.id,
        LearningPathVersion.is_active == True
    ).first()

    version_count = db.query(LearningPathVersion).filter(LearningPathVersion.learning_path_id == path.id).count()

    return LearningPathOut(
        id=path.id,
        profile_id=path.profile_id,
        goal_id=path.goal_id,
        goal_title=path.goal.title if path.goal else "Career Path",
        title=path.title,
        is_active=path.is_active,
        algorithm_version=path.algorithm_version,
        current_version=format_version(active_version) if active_version else None,
        all_versions_count=version_count
    )

@router.get("/versions", response_model=List[LearningPathVersionOut])
def get_all_roadmap_versions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        return []
    path = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
    if not path:
        return []
    versions = db.query(LearningPathVersion).filter(
        LearningPathVersion.learning_path_id == path.id
    ).order_by(LearningPathVersion.version_number.desc()).all()
    return [format_version(v) for v in versions]

@router.post("/regenerate", response_model=LearningPathOut)
def manually_regenerate_path(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    primary_goal = next((g for g in profile.goals if g.is_primary), None)
    if not primary_goal:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active goal")
    generate_or_adapt_roadmap(profile, primary_goal, "manual_recalculation", "User requested roadmap re-optimization", db)
    return get_active_learning_path(current_user, db)
