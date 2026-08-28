from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ArtifactCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    artifact_type: str = Field(default="source_repository")
    url_or_path: str = Field(..., min_length=3, max_length=500)
    skills: List[str] = []
    verification_level: str = Field(default="Self-Reported")
    is_featured: bool = False

class ArtifactOut(BaseModel):
    id: str
    title: str
    artifact_type: str
    url_or_path: str
    skills: List[str] = []
    verification_level: str
    is_featured: bool
    created_at: datetime

class PortfolioOut(BaseModel):
    id: str
    profile_id: str
    target_role: str
    quality_score: float
    verification_status: str
    quality_dimensions: Dict[str, float] = {}
    artifacts: List[ArtifactOut] = []
    gaps: List[str] = []
    explanation: str
