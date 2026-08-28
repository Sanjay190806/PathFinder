from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.progress import Progress
from backend.app.ai.gemini_provider import GeminiProvider
from backend.app.ai.provider import AssistantContext, AssistantResponsePayload

ai_provider = GeminiProvider()

def chat_with_assistant(
    profile: LearnerProfile,
    goal: Goal,
    query: str,
    db: Session,
    current_resource_id: Optional[str] = None
) -> AssistantResponsePayload:
    active_path = db.query(LearningPath).filter(
        LearningPath.profile_id == profile.id,
        LearningPath.goal_id == goal.id,
        LearningPath.is_active == True
    ).first()

    current_items = []
    active_phase = "Phase 1: Strengthen Foundations"
    
    if active_path:
        active_version = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == active_path.id,
            LearningPathVersion.is_active == True
        ).first()
        if active_version and active_version.items:
            current_items = [it.resource.title for it in active_version.items if not it.is_completed][:5]
            if active_version.items:
                active_phase = f"Phase {active_version.items[0].phase_number}: {active_version.items[0].phase_name}"

    completed_records = db.query(Progress).filter(
        Progress.profile_id == profile.id,
        Progress.status == "completed"
    ).all()
    completed_titles = [p.resource.title for p in completed_records if p.resource]

    known_skills = [s for s, conf in (profile.skill_confidence_map or {}).items() if conf >= 0.50]
    gaps = [s for s in (goal.target_skills or []) if (profile.skill_confidence_map or {}).get(s, 0.0) < 0.50]

    context = AssistantContext(
        learner_name=profile.user.full_name if profile.user else "Learner",
        target_role=goal.target_role,
        education_level=profile.education_level,
        weekly_hours=profile.weekly_hours,
        skills_known=known_skills,
        skill_gaps=gaps,
        active_phase=active_phase,
        current_roadmap_items=current_items,
        completed_items=completed_titles,
        user_query=query,
        current_resource_id=current_resource_id
    )

    return ai_provider.generate_assistant_response(context)
