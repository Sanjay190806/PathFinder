from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.ai import ChatRequest, ChatResponse, ActionSuggestion, GroundedSourceOut
from backend.app.ai.coach import AICoach

router = APIRouter(prefix="/ai", tags=["AI Coach & Grounded Assistant"])

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
