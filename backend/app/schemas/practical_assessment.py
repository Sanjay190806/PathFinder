from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class PracticalAssessmentOut(BaseModel):
    id: str
    slug: str
    title: str
    assessment_type: str
    career_roles: List[str] = []
    skills: List[str] = []
    difficulty: str
    instructions: str
    constraints: List[str] = []
    passing_threshold: float

class AssessmentAttemptSubmit(BaseModel):
    submission_payload: Dict[str, Any]

class PracticalAssessmentAttemptOut(BaseModel):
    id: str
    profile_id: str
    assessment_id: str
    title: str
    score: float
    passed: bool
    rubric_breakdown: Dict[str, float] = {}
    evaluator_feedback: str
    completed_at: datetime
