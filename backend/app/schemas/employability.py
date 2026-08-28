from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class EmployabilityScoreOut(BaseModel):
    profile_id: str
    target_role: str
    employability_score: float  # [0.0, 100.0]
    readiness_level: str  # Foundation Required, Early Development, Developing, Interview Preparation, Job-Ready Track, Strongly Demonstrated
    career_readiness_score: float  # Phase 7
    practical_readiness_score: float  # Phase 8
    portfolio_quality_score: float  # Phase 8
    market_alignment_score: float
    evidence_freshness_score: float
    confidence: float
    evidence_count: int
    weights: Dict[str, float] = {}
    high_impact_actions: List[Dict[str, Any]] = []
    explanation: str
    calculated_at: datetime
