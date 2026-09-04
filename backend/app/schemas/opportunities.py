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
    country: Optional[str] = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    min_education_stage: Optional[str] = "Undergraduate"
    eligible_streams: List[str] = []
    application_url: Optional[str] = None
    source: Optional[str] = "JanSahay Verified Portal"
    provider: Optional[str] = "Direct Employer"
    verification_status: Optional[str] = "VERIFIED"
    freshness: Optional[str] = "FRESH"

class OpportunityMatchOut(BaseModel):
    opportunity: OpportunityOut
    match_score: float  # [0.0, 100.0]
    match_level: str  # Strong Fit, Competitive Fit, Developing Fit, Early Prerequisite
    factor_breakdown: Dict[str, float] = {}
    missing_skills: List[str] = []
    match_reasons: List[str] = []
    blockers: List[str] = []

class OpportunityApplyRequest(BaseModel):
    cover_note: Optional[str] = None
    portfolio_url: Optional[str] = None

class OpportunityApplyResponse(BaseModel):
    application_id: str
    opportunity_id: str
    status: str
    message: str
    handoff_url: Optional[str] = None
