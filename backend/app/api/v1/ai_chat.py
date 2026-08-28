from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.progress import Progress
from backend.app.schemas.ai import ChatRequest, ChatResponse, ActionSuggestion, GroundedSourceOut, CoachContextOut
from backend.app.ai.coach import AICoach

router = APIRouter(prefix="/ai", tags=["AI Coach & Grounded Assistant"])

@router.get("/context", response_model=CoachContextOut)
def get_coach_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
    target_role = primary_goal.target_role if primary_goal else "Career Path"

    conf_map = dict(profile.skill_confidence_map or {})
    strengths = [s for s, c in conf_map.items() if c >= 0.65]
    skill_gaps = [s for s, c in conf_map.items() if c < 0.40]

    active_phase = "Phase 1: Foundations"
    next_step_title = None
    next_step_id = None

    path = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
    if path:
        active_version = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == path.id,
            LearningPathVersion.is_active == True
        ).first()
        if active_version and active_version.items:
            sorted_items = sorted(active_version.items, key=lambda it: it.sequence_order)
            incomplete = next((it for it in sorted_items if not it.is_completed), None)
            if incomplete:
                active_phase = f"Phase {incomplete.phase_number}: {incomplete.phase_name}"
                next_step_title = incomplete.resource.title if incomplete.resource else None
                next_step_id = incomplete.resource_id
            elif sorted_items:
                active_phase = f"Phase {sorted_items[-1].phase_number}: {sorted_items[-1].phase_name}"

    completed_count = db.query(Progress).filter(Progress.profile_id == profile.id, Progress.status == "completed").count()

    return CoachContextOut(
        target_role=target_role,
        active_phase=active_phase,
        weekly_hours=profile.weekly_hours or 10,
        skills_count=len(conf_map),
        skill_gaps=skill_gaps[:4],
        strengths=strengths[:4],
        completed_count=completed_count,
        next_step_title=next_step_title,
        next_step_id=next_step_id
    )

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
    if not primary_goal:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No primary learning goal set for learner")

    coach = AICoach(db)
    res = coach.chat(
        profile=profile,
        goal=primary_goal,
        query=payload.message
    )

    action_suggestions = []
    if res.suggested_actions:
        for a in res.suggested_actions:
            action_suggestions.append(ActionSuggestion(
                action_type=a.action_type,
                label=f"{a.action_type.replace('_', ' ').title()}: {a.resource_title or a.reason or ''}",
                resource_id=a.resource_id,
                reason=a.reason,
                payload=a.payload or {}
            ))

    sources_out = [
        GroundedSourceOut(type=s.type, id=s.id, title=s.title)
        for s in res.sources
    ]

    grounding_refs = [s.title for s in res.sources]

    return ChatResponse(
        reply=res.message,
        message=res.message,
        provider=res.provider,
        confidence=res.confidence,
        grounded=res.grounded,
        sources=sources_out,
        suggested_actions=action_suggestions,
        suggested_focus=[s for s in (primary_goal.target_skills or [])[:3]],
        grounding_references=grounding_refs,
        is_fallback=res.is_fallback,
        correlation_id=res.correlation_id,
        latency_ms=res.latency_ms
    )
