from typing import Dict

RECOMMENDATION_ALGO_VERSION = "v1.2.0"

RECOMMENDATION_WEIGHTS: Dict[str, float] = {
    "goal_relevance": 0.30,
    "skill_gap": 0.25,
    "prerequisite": 0.15,
    "difficulty": 0.10,
    "preference": 0.08,
    "time": 0.05,
    "engagement": 0.04,
    "diversity": 0.03
}

assert abs(sum(RECOMMENDATION_WEIGHTS.values()) - 1.0) < 1e-6, "Scoring weights must sum to exactly 1.0"
