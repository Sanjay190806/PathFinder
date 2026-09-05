from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class PracticeResourceItem(BaseModel):
    title: str
    url: str
    type: str                  # ARTICLE, VIDEO, PRACTICE_PROBLEM, DOCUMENTATION
    is_free: bool = True
    platform: str              # LeetCode, GeeksforGeeks, NeetCode, Striver, MIT OCW, YouTube

    model_config = ConfigDict(from_attributes=True)


class DSAConceptSchema(BaseModel):
    id: str
    subtopic_id: Optional[str] = None
    slug: str
    name: str
    description: Optional[str] = None
    difficulty: str            # EASY, MEDIUM, HARD
    learning_objectives: List[str] = []
    common_patterns: List[str] = []
    common_mistakes: List[str] = []
    practice_resources: List[PracticeResourceItem] = []

    model_config = ConfigDict(from_attributes=True)


class DSASubtopicSchema(BaseModel):
    id: str
    topic_id: Optional[str] = None
    slug: str
    name: str
    description: Optional[str] = None
    order: int = 0
    concepts: List[DSAConceptSchema] = []

    model_config = ConfigDict(from_attributes=True)


class DSATopicSummary(BaseModel):
    id: str
    domain_id: str
    skill_id: Optional[str] = None
    slug: str
    name: str
    description: Optional[str] = None
    order: int = 0
    typical_importance: str = "HIGH"
    prerequisite_topic_slugs: List[str] = []
    concepts_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class DSATopicDetail(DSATopicSummary):
    domain_name: Optional[str] = None
    subtopics: List[DSASubtopicSchema] = []

    model_config = ConfigDict(from_attributes=True)


class DSADomainSchema(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    order: int = 0
    topics: List[DSATopicSummary] = []

    model_config = ConfigDict(from_attributes=True)
