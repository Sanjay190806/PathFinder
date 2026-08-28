from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class PracticalEvidenceCreate(BaseModel):
    skill_slug: str = Field(..., min_length=1, max_length=64)
    evidence_type: str = Field(..., description="project, practical_assessment, debugging_exercise, scenario, simulation, validated_milestone, portfolio_artifact")
    source_id: str = Field(..., max_length=100)
    score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    evaluator: str = Field(default="system_rubric", max_length=50)
    metadata_payload: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PracticalEvidenceOut(BaseModel):
    id: str
    profile_id: str
    skill_slug: str
    evidence_type: str
    source_id: str
    score: float
    confidence: float
    evaluator: str
    metadata_payload: Dict[str, Any] = {}
    timestamp: datetime

class PracticalCompetencyOut(BaseModel):
    id: str
    profile_id: str
    career_role: str
    skill_slug: str
    competency_type: str
    level: str  # Unknown, Beginner, Developing, Competent, Strong, Mastery
    score: float
    confidence: float
    evidence_count: int
    dimensions: Dict[str, float] = {}
    last_demonstrated_at: Optional[datetime] = None
    explanation: str
