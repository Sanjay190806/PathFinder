import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill
from backend.app.schemas.intelligence import SkillDecayOut, MasteryDecaySummaryOut
from backend.app.intelligence.mastery_engine import SkillMasteryEngine

PHASE7_DECAY_MODEL_VERSION = "phase7.decay.v1"
DEFAULT_SKILL_HALF_LIFE_DAYS = 30.0

DECAY_THRESHOLDS = [
    (0.75, "Fresh"),
    (0.50, "Aging"),
    (0.25, "Review Recommended"),
    (0.00, "Decay Risk")
]

def freshness_to_state(freshness: float) -> str:
    for threshold, state in DECAY_THRESHOLDS:
        if freshness >= threshold:
            return state
    return "Decay Risk"

class SkillDecayEngine:
    def __init__(self, db: Session):
        self.db = db
        self.mastery_engine = SkillMasteryEngine(db)

    def calculate_skill_decay(
        self,
        profile_id: str,
        skill_slug: str,
        half_life_days: float = DEFAULT_SKILL_HALF_LIFE_DAYS
    ) -> SkillDecayOut:
        mastery_data = self.mastery_engine.calculate_skill_mastery(profile_id, skill_slug)
        now = datetime.now(timezone.utc)

        if mastery_data.last_demonstrated:
            last_ts = mastery_data.last_demonstrated
            if last_ts.tzinfo is None:
                last_ts = last_ts.replace(tzinfo=timezone.utc)
            delta = now - last_ts
            days_since = max(0.0, delta.total_seconds() / 86400.0)
        else:
            days_since = 45.0  # Baseline default for unpracticed skills

        # Deterministic Half-Life Freshness Model: freshness = 2^(-days / half_life)
        freshness_score = round(math.pow(2.0, -days_since / max(1.0, half_life_days)), 4)
        freshness_score = max(0.0, min(1.0, freshness_score))
        decay_state = freshness_to_state(freshness_score)

        explanation = (
            f"Skill '{skill_slug}' is {decay_state} (freshness score {int(freshness_score * 100)}%). "
            f"Last verified practice was {int(days_since)} days ago. "
            f"Demonstrated mastery remains preserved at {int(mastery_data.mastery_score * 100)}%."
        )

        return SkillDecayOut(
            skill_slug=skill_slug,
            demonstrated_mastery_score=mastery_data.mastery_score,
            freshness_score=freshness_score,
            decay_state=decay_state,
            days_since_last_demonstration=round(days_since, 1),
            half_life_days=half_life_days,
            explanation=explanation,
            model_version=PHASE7_DECAY_MODEL_VERSION
        )

    def get_mastery_and_decay_summary(self, profile_id: str) -> MasteryDecaySummaryOut:
        mastery_list = self.mastery_engine.calculate_all_mastery(profile_id)
        decay_list = [self.calculate_skill_decay(profile_id, m.skill_slug) for m in mastery_list]

        avg_mastery = round(sum(m.mastery_score for m in mastery_list) / max(1, len(mastery_list)), 4) if mastery_list else 0.0

        fresh_count = sum(1 for d in decay_list if d.decay_state == "Fresh")
        aging_count = sum(1 for d in decay_list if d.decay_state == "Aging")
        review_count = sum(1 for d in decay_list if d.decay_state == "Review Recommended")
        decay_risk_count = sum(1 for d in decay_list if d.decay_state == "Decay Risk")

        return MasteryDecaySummaryOut(
            profile_id=profile_id,
            mastery=mastery_list,
            decay=decay_list,
            overall_mastery_score=avg_mastery,
            fresh_count=fresh_count,
            aging_count=aging_count,
            review_recommended_count=review_count,
            decay_risk_count=decay_risk_count
        )
