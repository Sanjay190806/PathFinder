from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.core.security import create_access_token
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.learning_path import LearningPath, LearningPathVersion, RoadmapChange
from backend.app.schemas.auth import Token, UserOut
from backend.app.engine.adaptive import generate_or_adapt_roadmap
from backend.app.seed.seed_data import seed_database

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

@router.post("/login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    demo_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    if not demo_user:
        seed_database(db)
        demo_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()

    if not demo_user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Demo user could not be seeded")

    token = create_access_token(demo_user.id)
    return Token(access_token=token, user=UserOut.model_validate(demo_user))

@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    demo_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    if demo_user:
        db.delete(demo_user)
        db.commit()
    
    seed_database(db)
    return {"message": "Demo persona (Alex Mercer) successfully reset to initial baseline state (Version 1)."}
