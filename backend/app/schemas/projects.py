from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ProjectTemplateOut(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    career_roles: List[str] = []
    difficulty: str
    project_level: str
    estimated_hours: float
    skills: List[str] = []
    prerequisites: List[str] = []
    deliverables: List[str] = []
    tools: List[str] = []
    portfolio_value: float

class MilestoneOut(BaseModel):
    id: str
    milestone_number: int
    title: str
    description: str
    status: str
    submission_artifact: str = ""
    completed_at: Optional[datetime] = None

class LearnerProjectOut(BaseModel):
    id: str
    profile_id: str
    project_template_id: str
    title: str
    status: str
    current_milestone_index: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: float
    evaluation_feedback: str
    milestones: List[MilestoneOut] = []
