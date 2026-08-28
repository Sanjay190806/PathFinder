from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
from backend.app.schemas.skill import LearnerSkillOut
from backend.app.schemas.goal import GoalOut
from backend.app.engine.adaptive import generate_or_adapt_roadmap

router = APIRouter(prefix="/profile", tags=["Learner Profile"])

@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    skills_out = []
    for ls in profile.learner_skills:
        skills_out.append(LearnerSkillOut(
            skill_id=ls.skill.id,
            skill_name=ls.skill.name,
            skill_slug=ls.skill.slug,
            category=ls.skill.category,
            self_rating=ls.self_rating,
            assessed_confidence=ls.assessed_confidence,
            verified=ls.verified
        ))
    
    primary_goal = next((g for g in profile.goals if g.is_primary), None)
    
    return ProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        full_name=current_user.full_name,
        email=current_user.email,
        education_level=profile.education_level,
        field_of_study=profile.field_of_study,
        experience_level=profile.experience_level,
        weekly_hours=profile.weekly_hours,
        preferred_formats=profile.preferred_formats or [],
        learning_objective=profile.learning_objective,
        skill_confidence_map=profile.skill_confidence_map or {},
        velocity_score=profile.velocity_score,
        difficulty_tolerance=profile.difficulty_tolerance,
        skills=skills_out,
        primary_goal=GoalOut.model_validate(primary_goal) if primary_goal else None
    )

@router.post("/onboarding", response_model=ProfileOut)
def complete_onboarding(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    profile.education_level = payload.education_level
    profile.field_of_study = payload.field_of_study
    profile.experience_level = payload.experience_level
    profile.weekly_hours = payload.weekly_hours
    profile.preferred_formats = payload.preferred_formats
    profile.learning_objective = payload.learning_objective

    db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).delete()
    db.query(Goal).filter(Goal.profile_id == profile.id).delete()

    conf_map: Dict[str, float] = {}
    diff_val_map = {"Beginner": 0.25, "Intermediate": 0.60, "Advanced": 0.90}

    for sk in payload.skills:
        skill_obj = db.query(Skill).filter(Skill.id == sk.skill_id).first()
        if skill_obj:
            conf = diff_val_map.get(sk.self_rating, 0.30)
            conf_map[skill_obj.slug] = conf
            db.add(LearnerSkill(
                profile_id=profile.id,
                skill_id=skill_obj.id,
                self_rating=sk.self_rating,
                assessed_confidence=conf
            ))

    profile.skill_confidence_map = conf_map

    target_skills_by_role = {
        "AI/ML Engineer": ["python", "linear-algebra", "machine-learning", "deep-learning", "transformers", "langchain-agents", "vector-rag", "mlops"],
        "Data Scientist": ["python", "pandas", "sql", "eda", "machine-learning", "statistics", "pyspark"],
        "Full Stack Developer": ["typescript", "react-nextjs", "tailwind", "rest-apis", "graphql-websockets", "docker"],
        "Cloud / DevOps Engineer": ["linux", "git-cicd", "docker", "kubernetes", "aws"],
        "Cybersecurity Analyst": ["networking", "linux", "web-security", "cryptography", "pentesting"],
        "Software Engineer": ["python", "dsa", "rest-apis", "system-design", "docker"]
    }
    
    target_role = payload.target_role or "AI/ML Engineer"
    target_skills = target_skills_by_role.get(target_role, ["python", "machine-learning", "deep-learning"])

    goal = Goal(
        profile_id=profile.id,
        title=f"Become a {target_role}",
        target_role=target_role,
        target_skills=target_skills,
        is_primary=True,
        status="active"
    )
    db.add(goal)
    db.flush()

    generate_or_adapt_roadmap(
        profile=profile,
        goal=goal,
        trigger="initial_generation",
        change_reason=f"Initial roadmap created for {target_role}",
        db=db,
        idempotency_key=f"onboarding-{profile.id}"
    )

    db.commit()
    return get_profile(current_user, db)
