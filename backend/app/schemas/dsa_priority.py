from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class DSATopicPriorityItem(BaseModel):
    topic_slug: str
    topic_name: str
    priority_level: str  # VERY_HIGH, HIGH, MEDIUM, LOW, OPTIONAL, NOT_APPLICABLE
    importance: str      # HIGH, MEDIUM, LOW
    minimum_difficulty: str      # EASY, MEDIUM, HARD
    recommended_difficulty: str  # EASY, MEDIUM, HARD
    interview_difficulty: str    # EASY, MEDIUM, HARD
    is_core: bool = False
    prerequisites: List[str] = []


class DSAPriorityProfileResponse(BaseModel):
    role_id: Optional[str] = None
    role_slug: Optional[str] = None
    role_name: Optional[str] = None
    company_slug: Optional[str] = None
    company_name: Optional[str] = None
    career_slug: Optional[str] = None
    canonical_role_name: str

    priority_level: str          # VERY_HIGH, HIGH, MEDIUM, LOW, MINIMAL, NOT_APPLICABLE, UNKNOWN
    expected_level: str          # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT
    minimum_difficulty: str      # EASY, MEDIUM, HARD
    recommended_difficulty: str  # EASY, MEDIUM, HARD
    interview_difficulty: str    # EASY, MEDIUM, HARD

    source_level: str            # COMPANY_ROLE, ROLE, CAREER, INDUSTRY
    confidence: float
    source: str
    verification_status: str

    decision_trace: Dict[str, Any]
    core_topics: List[DSATopicPriorityItem] = []
    secondary_topics: List[DSATopicPriorityItem] = []
    optional_topics: List[DSATopicPriorityItem] = []
    all_topics: List[DSATopicPriorityItem] = []
