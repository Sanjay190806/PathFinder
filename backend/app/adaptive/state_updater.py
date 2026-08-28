from typing import Dict, List, Any, Optional, Tuple
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource
from backend.app.adaptive.config import (
    DELTAS, MAX_CONF_DELTA, MAX_TOLERANCE_DELTA, MAX_ENGAGEMENT_DELTA
)

class AdaptiveStateUpdater:
    @staticmethod
    def clamp(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
        return max(min_val, min(max_val, round(value, 4)))

    @classmethod
    def apply_resource_completion(
        cls,
        profile: LearnerProfile,
        resource: LearningResource
    ) -> Dict[str, Any]:
        """
        Updates learner skills proportionally based on ResourceSkill relevance weights.
        Clamps all confidence values to [0.0, 1.0].
        """
        conf_map = dict(profile.skill_confidence_map or {})
        base_delta = DELTAS["course_completed"]
        changes = {}

        if hasattr(resource, 'resource_skills') and resource.resource_skills:
            for rs in resource.resource_skills:
                slug = rs.skill.slug
                weight = float(rs.relevance_weight if rs.relevance_weight is not None else 1.0)
                # Weighted delta proportional to relevance
                delta = min(MAX_CONF_DELTA, base_delta * weight)
                old_val = float(conf_map.get(slug, 0.0))
                new_val = cls.clamp(old_val + delta)
                conf_map[slug] = new_val
                changes[slug] = {"old": old_val, "new": new_val, "delta": round(new_val - old_val, 4)}
        else:
            # Fallback if no specific skill relations attached
            pass

        profile.skill_confidence_map = conf_map
        return {"skills_updated": changes, "event": "course_completed"}

    @classmethod
    def apply_quiz_result(
        cls,
        profile: LearnerProfile,
        skill_slug: str,
        score_ratio: float  # e.g. 0.80 for 8/10 or 1.0 for single correct, 0.0 for incorrect
    ) -> Dict[str, Any]:
        """
        Updates target skill confidence based on normalized quiz performance.
        score_ratio >= 0.50 increases confidence; < 0.50 decreases confidence.
        """
        conf_map = dict(profile.skill_confidence_map or {})
        old_val = float(conf_map.get(skill_slug, 0.0))

        # Centered performance: 1.0 -> +0.05, 0.0 -> -0.05
        raw_delta = (score_ratio - 0.50) * 2.0 * DELTAS["quiz_correct"]
        delta = max(-MAX_CONF_DELTA, min(MAX_CONF_DELTA, raw_delta))
        new_val = cls.clamp(old_val + delta)

        conf_map[skill_slug] = new_val
        profile.skill_confidence_map = conf_map

        return {
            "skills_updated": {
                skill_slug: {"old": old_val, "new": new_val, "delta": round(new_val - old_val, 4)}
            },
            "event": "quiz_performance",
            "score_ratio": score_ratio
        }

    @classmethod
    def apply_difficulty_feedback(
        cls,
        profile: LearnerProfile,
        resource: LearningResource,
        feedback_type: str  # "too_difficult" or "too_easy"
    ) -> Dict[str, Any]:
        """
        Adjusts learner difficulty tolerance and target skills.
        """
        old_tolerance = float(profile.difficulty_tolerance if profile.difficulty_tolerance is not None else 0.50)
        conf_map = dict(profile.skill_confidence_map or {})
        skill_changes = {}

        if feedback_type == "too_difficult":
            tol_delta = DELTAS["too_difficult_tolerance"]
            conf_delta = DELTAS["too_difficult_conf"]
        elif feedback_type == "too_easy":
            tol_delta = DELTAS["too_easy_tolerance"]
            conf_delta = DELTAS["too_easy_conf"]
        else:
            tol_delta = 0.0
            conf_delta = 0.0

        new_tolerance = cls.clamp(old_tolerance + tol_delta)
        profile.difficulty_tolerance = new_tolerance

        # Adjust skill confidence of taught skills
        if hasattr(resource, 'resource_skills') and resource.resource_skills:
            for rs in resource.resource_skills:
                slug = rs.skill.slug
                old_conf = float(conf_map.get(slug, 0.0))
                new_conf = cls.clamp(old_conf + conf_delta)
                conf_map[slug] = new_conf
                skill_changes[slug] = {"old": old_conf, "new": new_conf, "delta": round(new_conf - old_conf, 4)}

        profile.skill_confidence_map = conf_map

        return {
            "tolerance_change": {"old": old_tolerance, "new": new_tolerance, "delta": round(new_tolerance - old_tolerance, 4)},
            "skills_updated": skill_changes,
            "feedback_type": feedback_type
        }
