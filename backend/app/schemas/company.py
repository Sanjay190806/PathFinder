from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CompanyRoleSummary(BaseModel):
    id: str
    role_slug: str
    canonical_role_name: str
    display_name: str
    career_id: Optional[str] = None
    career_slug: Optional[str] = None
    employment_type: str = "FULL_TIME"
    experience_level: str = "ENTRY_LEVEL"
    location_scope: str = "National"
    remote_type: str = "HYBRID"
    dsa_relevance: str = "UNKNOWN"
    verification_status: str = "VERIFIED"

    model_config = ConfigDict(from_attributes=True)


class CompanySummary(BaseModel):
    id: str
    slug: str
    canonical_name: str
    display_name: str
    industry: str
    company_type: str
    headquarters_country: str = "India"
    headquarters_region: Optional[str] = None
    operating_countries: List[str] = []
    operating_regions: List[str] = []
    is_verified: bool = True
    verification_status: str = "VERIFIED"
    roles_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CompanyDetail(CompanySummary):
    aliases: List[str] = []
    website: Optional[str] = None
    careers_url: Optional[str] = None
    description: Optional[str] = None
    source: str = "PathFinder Corporate Registry"
    source_url: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    version: int = 1
    roles: List[CompanyRoleSummary] = []

    model_config = ConfigDict(from_attributes=True)


class CompanySearchResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    items: List[CompanySummary]


class RoleSkillRequirementItem(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    skill_slug: str
    requirement_type: str        # REQUIRED, PREFERRED, VALUABLE, OPTIONAL
    importance: str              # HIGH, MEDIUM, LOW
    minimum_level: str           # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT
    source: str
    verification_status: str

    model_config = ConfigDict(from_attributes=True)


class RoleDSARequirementItem(BaseModel):
    id: str
    dsa_topic_slug: str
    dsa_topic_name: Optional[str] = None
    importance: str
    difficulty_target: str       # EASY, MEDIUM, HARD
    requirement_type: str
    source: str

    model_config = ConfigDict(from_attributes=True)


class RoleTechnologyItem(BaseModel):
    id: str
    category: str
    technology_name: str
    is_mandatory: bool
    importance: str
    requirement_type: str

    model_config = ConfigDict(from_attributes=True)


class RoleInterviewTopicItem(BaseModel):
    id: str
    topic_name: str
    topic_category: str
    weight: float
    focus_areas: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class CompanyRoleDetail(CompanyRoleSummary):
    company_name: str
    company_slug: str
    aliases: List[str] = []
    description: Optional[str] = None
    cs_fundamentals_relevance: Dict[str, str] = {}
    source: str
    source_url: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    version: int = 1
    skill_requirements: List[RoleSkillRequirementItem] = []
    dsa_requirements: List[RoleDSARequirementItem] = []
    tech_requirements: List[RoleTechnologyItem] = []
    interview_topics: List[RoleInterviewTopicItem] = []

    model_config = ConfigDict(from_attributes=True)
