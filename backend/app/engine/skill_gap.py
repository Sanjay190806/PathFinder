from typing import Dict, List, Set, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.skill import Skill
from backend.app.models.goal import Goal
from backend.app.models.profile import LearnerProfile

class SkillGapItem:
    def __init__(
        self,
        skill_id: str,
        skill_slug: str,
        skill_name: str,
        category: str,
        current_confidence: float,
        target_confidence: float,
        gap: float,
        priority: float,
        goal_relevance: float
    ):
        self.skill_id = skill_id
        self.skill_slug = skill_slug
        self.skill_name = skill_name
        self.category = category
        self.current_confidence = round(current_confidence, 4)
        self.target_confidence = round(target_confidence, 4)
        self.gap = round(gap, 4)
        self.priority = round(priority, 4)
        self.goal_relevance = round(goal_relevance, 4)

class SkillGapReport:
    def __init__(
        self,
        items: List[SkillGapItem],
        mastered_skills: List[str],
        partially_known_skills: List[str],
        missing_skills: List[str],
        priority_skills: List[str],
        skill_confidence_map: Dict[str, float]
    ):
        self.items = items
        self.mastered_skills = mastered_skills  # confidence >= 0.80
        self.partially_known_skills = partially_known_skills  # 0.40 <= confidence < 0.80
        self.missing_skills = missing_skills  # confidence < 0.40 or not assessed
        self.priority_skills = priority_skills  # ordered by gap and goal priority
        self.skill_confidence_map = skill_confidence_map

class SkillGapEngine:
    def __init__(self, db: Session):
        self.db = db
        self._skills_cache = {s.slug: s for s in self.db.query(Skill).all()}

    def calculate(
        self,
        profile: LearnerProfile,
        goal: Goal,
        default_target_confidence: float = 0.85
    ) -> SkillGapReport:
        """
        Calculates deterministic skill gaps for a learner against a target career goal.
        gap = max(target_confidence - assessed_confidence, 0.0)
        Tie-breaking sort order:
        1. Higher gap (-gap)
        2. Higher goal relevance (-goal_relevance)
        3. Stable skill ID (skill_id)
        """
        current_conf_map: Dict[str, float] = dict(profile.skill_confidence_map or {})
        target_skills: List[str] = goal.target_skills or []
        
        # Also include any learner-specific skills tracked
        tracked_skills: Set[str] = set(target_skills).union(set(current_conf_map.keys()))

        items: List[SkillGapItem] = []
        mastered: List[str] = []
        partially_known: List[str] = []
        missing: List[str] = []

        for slug in tracked_skills:
            skill_obj = self._skills_cache.get(slug)
            if not skill_obj:
                continue

            current_conf = float(current_conf_map.get(slug, 0.0))
            is_goal_target = slug in target_skills
            target_conf = default_target_confidence if is_goal_target else 0.70
            gap = max(target_conf - current_conf, 0.0)
            goal_relevance = 1.0 if is_goal_target else 0.50
            priority = gap * goal_relevance

            item = SkillGapItem(
                skill_id=skill_obj.id,
                skill_slug=slug,
                skill_name=skill_obj.name,
                category=skill_obj.category,
                current_confidence=current_conf,
                target_confidence=target_conf,
                gap=gap,
                priority=priority,
                goal_relevance=goal_relevance
            )
            items.append(item)

            if current_conf >= 0.80:
                mastered.append(slug)
            elif current_conf >= 0.40:
                partially_known.append(slug)
            else:
                missing.append(slug)

        # Deterministic sort: higher gap, higher goal relevance, stable ID
        items.sort(key=lambda x: (-x.gap, -x.goal_relevance, x.skill_id))
        priority_slugs = [item.skill_slug for item in items if item.gap > 0.05]

        return SkillGapReport(
            items=items,
            mastered_skills=mastered,
            partially_known_skills=partially_known,
            missing_skills=missing,
            priority_skills=priority_slugs,
            skill_confidence_map=current_conf_map
        )

# Backward-compatible function wrapper
def analyze_skill_gap(profile: LearnerProfile, goal: Goal, db: Session) -> SkillGapReport:
    engine = SkillGapEngine(db)
    return engine.calculate(profile, goal)
