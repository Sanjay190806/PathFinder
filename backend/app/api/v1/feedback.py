from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.resource import LearningResource
from backend.app.models.feedback import Feedback
from backend.app.schemas.feedback import FeedbackCreate, FeedbackOut
from backend.app.adaptive.adaptive_engine import AdaptiveEngine

router = APIRouter(prefix="/feedback", tags=["Feedback & Adaptive Updates"])

@router.post("", response_model=FeedbackOut)
def submit_feedback(
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    res = db.query(LearningResource).filter(LearningResource.id == payload.resource_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    event_id = payload.idempotency_key or str(uuid.uuid4())
    event_type = "difficulty_feedback" if payload.feedback_type in ("too_difficult", "too_easy") else "relevance_feedback"

    engine = AdaptiveEngine(db)
    result = engine.process_event(
        event_id=event_id,
        profile_id=profile.id,
        event_type=event_type,
        resource_id=res.id,
        payload={
            "feedback_type": payload.feedback_type,
            "rating": payload.rating,
            "comment": payload.comment
        }
    )

    fb = db.query(Feedback).filter(
        Feedback.profile_id == profile.id,
        Feedback.resource_id == res.id
    ).order_by(Feedback.created_at.desc()).first()

    return FeedbackOut(
        id=fb.id if fb else str(uuid.uuid4()),
        profile_id=profile.id,
        resource_id=res.id,
        feedback_type=payload.feedback_type,
        rating=payload.rating,
        comment=payload.comment,
        created_at=datetime.now(timezone.utc).isoformat()
    )
