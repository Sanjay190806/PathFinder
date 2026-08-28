from typing import Dict, Any

ADAPTIVE_ALGORITHM_VERSION = "v1.2.0"
STATE_UPDATE_VERSION = "v1.1.0"
ROADMAP_ADAPTATION_VERSION = "v1.2.0"

# Bounded update delta constants
DELTAS = {
    "course_completed": 0.10,
    "quiz_correct": 0.05,
    "quiz_incorrect": -0.05,
    "too_difficult_conf": -0.05,
    "too_difficult_tolerance": -0.05,
    "too_easy_conf": 0.03,
    "too_easy_tolerance": 0.05,
    "relevant": 0.05,
    "not_relevant": -0.10,
    "liked": 0.05,
    "disliked": -0.05,
    "skipped": -0.03,
    "abandoned": -0.05
}

# Safety limits per single event
MAX_CONF_DELTA = 0.15
MAX_TOLERANCE_DELTA = 0.10
MAX_ENGAGEMENT_DELTA = 0.10

# Thresholds
PREREQUISITE_THRESHOLD = 0.40
MEANINGFUL_CHANGE_CONF_THRESHOLD = 0.04
MEANINGFUL_CHANGE_TOLERANCE_THRESHOLD = 0.04
