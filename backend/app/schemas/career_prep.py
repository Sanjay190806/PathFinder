from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ResumeAuditRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, max_length=10000)
    target_role: Optional[str] = None

class ResumeAuditOut(BaseModel):
    id: str
    target_role: str
    ats_score: float  # [0.0, 100.0]
    keyword_coverage: Dict[str, float] = {}
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    bullet_improvements: List[str] = []
    created_at: datetime

class MockInterviewRequest(BaseModel):
    interview_type: str = Field(default="Technical Core")  # Technical Core, System Design, Scenario Defense
    target_role: Optional[str] = None

class MockInterviewAnswerSubmit(BaseModel):
    session_id: str
    question_index: int
    answer: str

class MockInterviewSessionOut(BaseModel):
    id: str
    target_role: str
    interview_type: str
    questions: List[Dict[str, Any]] = []
    overall_score: float
    feedback: str
    completed_at: datetime
