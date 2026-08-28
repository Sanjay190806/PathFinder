from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.adaptive.adaptive_engine import AdaptiveEngine

router = APIRouter(prefix="/interactions", tags=["Interactions & Behavioral Signals"])

class InteractionCreate(BaseModel):
    event_type: str = Field(..., description="view, save, like, dislike, skip, abandon")
    resource_id: Optional[str] = None
    skill_slug: Optional[str] = None
    event_id: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

@router.post("")
def record_interaction(
    payload: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    event_id = payload.event_id or str(uuid.uuid4())
    engine = AdaptiveEngine(db)
    
    # Map friendly UI event names to canonical event types
    event_map = {
        "like": "resource_liked",
        "dislike": "resource_disliked",
        "skip": "resource_skipped",
        "save": "resource_saved",
        "abandon": "resource_abandoned",
        "view": "course_started"
    }
    canonical_type = event_map.get(payload.event_type, payload.event_type)

    result = engine.process_event(
        event_id=event_id,
        profile_id=profile.id,
        event_type=canonical_type,
        resource_id=payload.resource_id,
        skill_slug=payload.skill_slug,
        payload=payload.meta_data
    )
    return result
