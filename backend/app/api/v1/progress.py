from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.progress import Progress
from backend.app.models.resource import LearningResource
from backend.app.models.learning_path import LearningPath, LearningPathVersion, LearningPathItem
from backend.app.schemas.progress import ProgressUpdate, ProgressOut
from backend.app.adaptive.adaptive_engine import AdaptiveEngine

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("", response_model=ProgressOut)
def update_progress(
    payload: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    res = db.query(LearningResource).filter(LearningResource.id == payload.resource_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    event_type = "course_completed" if payload.status == "completed" else "course_started"
    event_id = str(uuid.uuid4())

    engine = AdaptiveEngine(db)
    engine.process_event(
        event_id=event_id,
        profile_id=profile.id,
        event_type=event_type,
        resource_id=res.id,
        payload={
            "status": payload.status,
            "time_spent_minutes": payload.time_spent_minutes,
            "completion_percentage": payload.completion_percentage
        }
    )

    # Synchronize LearningPathItem completion state in active version
    path = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
    if path:
        active_ver = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == path.id,
            LearningPathVersion.is_active == True
        ).first()
        if active_ver:
            for it in active_ver.items:
                if it.resource_id == res.id:
                    it.is_completed = (payload.status == "completed")
            db.commit()

    prog = db.query(Progress).filter(
        Progress.profile_id == profile.id,
        Progress.resource_id == res.id
    ).first()

    return ProgressOut(
        id=prog.id if prog else str(uuid.uuid4()),
        profile_id=profile.id,
        resource_id=res.id,
        status=payload.status,
        time_spent_minutes=prog.time_spent_minutes if prog else (payload.time_spent_minutes or 0),
        completion_percentage=prog.completion_percentage if prog else (payload.completion_percentage or 0.0)
    )
