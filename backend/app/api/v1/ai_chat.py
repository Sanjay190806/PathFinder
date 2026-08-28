from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.ai import ChatRequest, ChatResponse, ActionSuggestion
from backend.app.ai.assistant import chat_with_assistant

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    primary_goal = next((g for g in profile.goals if g.is_primary), None)
    if not primary_goal:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No primary goal found")

    res = chat_with_assistant(
        profile=profile,
        goal=primary_goal,
        query=payload.message,
        db=db,
        current_resource_id=payload.current_resource_id
    )

    action_suggestions = []
    if res.suggested_actions:
        for a in res.suggested_actions:
            action_suggestions.append(ActionSuggestion(
                action_type=a.get("action_type", ""),
                label=a.get("label", ""),
                payload=a.get("payload", {})
            ))

    return ChatResponse(
        reply=res.reply,
        suggested_focus=res.suggested_focus,
        suggested_actions=action_suggestions,
        grounding_references=res.grounding_references,
        is_fallback=res.is_fallback
    )
