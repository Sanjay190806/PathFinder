from typing import Dict, List, Optional, Tuple, Set
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.engine.recommendation_engine import RecommendationEngine
from backend.app.adaptive.roadmap_adapter import RoadmapAdapter
from backend.app.engine.fingerprint import StateFingerprinter

def generate_or_adapt_roadmap(
    profile: LearnerProfile,
    goal: Goal,
    trigger: str,
    change_reason: str,
    db: Session,
    idempotency_key: Optional[str] = None
) -> Tuple[LearningPath, LearningPathVersion, bool]:
    """
    Backward-compatible adapter that generates recommendations and adapts the roadmap.
    """
    engine = RecommendationEngine(db)
    rec_result = engine.generate(profile_id=profile.id, goal_id=goal.id, top_k=10, persist=True)
    
    fingerprint = StateFingerprinter.generate_fingerprint(profile, goal)
    adapter = RoadmapAdapter(db)
    
    changed, version, _ = adapter.adapt_roadmap(
        profile=profile,
        goal=goal,
        new_recommendations=rec_result.get("recommendations", []),
        new_phases=rec_result.get("phases", []),
        trigger=trigger,
        reason=change_reason,
        fingerprint=fingerprint,
        idempotency_key=idempotency_key
    )
    
    path = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
    db.commit()
    return path, version, changed
