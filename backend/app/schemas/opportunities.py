from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class OpportunityOut(BaseModel):
    id: str
    slug: str
    title: str
    company_name: str
    role_category: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_level: str
    location_type: str
    salary_range: str
    description: str
    opportunity_type: str

class OpportunityMatchOut(BaseModel):
    opportunity: OpportunityOut
    match_score: float  # [0.0, 100.0]
    match_level: str  # Strong Fit, Competitive Fit, Developing Fit, Early Prerequisite
    factor_breakdown: Dict[str, float] = {}
    missing_skills: List[str] = []
    match_reasons: List[str] = []
