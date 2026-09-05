"""
Pydantic Schemas for Canonical Career Taxonomy (Phase 11 Stages 1-3)
Covers Domains, Families, Careers, Specializations, Skills,
Education Pathways, Search, Discovery, Transitions, and Comparisons.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# ---------------------------------------------------------------------------
# Domain & Family Schemas
# ---------------------------------------------------------------------------

class CareerDomainOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: Optional[str] = None
    order: int = 0
    icon: Optional[str] = None
    is_active: bool = True
    family_count: int = 0
    career_count: int = 0


class CareerFamilyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    domain_id: str
    domain_slug: Optional[str] = None
    slug: str
    name: str
    description: Optional[str] = None
    order: int = 0
    is_active: bool = True
    career_count: int = 0


# ---------------------------------------------------------------------------
# Sub-entities (Specializations, Requirements, Relationships)
# ---------------------------------------------------------------------------

class CareerSpecializationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: Optional[str] = None
    focus_areas: List[str] = Field(default_factory=list)
    order: int = 0


class CareerSkillRequirementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    importance: str           # MANDATORY, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE
    proficiency_level: str    # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT
    evidence_type: Optional[str] = None


class CareerEducationRequirementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    education_level: str
    preferred_streams: List[str] = Field(default_factory=list)
    subject_prerequisites: List[str] = Field(default_factory=list)
    requirement_type: str     # HARD, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE
    notes: Optional[str] = None


class CareerRegionalMetadataOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    country_code: str
    region_code: Optional[str] = None
    regulatory_body: Optional[str] = None
    statutory_exam: Optional[str] = None
    notes: Optional[str] = None


class CareerRelationshipOut(BaseModel):
    target_career_slug: str
    target_career_name: str
    relationship_type: str    # RELATED, SUBSPECIALIZATION, ALTERNATIVE, ADJACENT, TRANSITION, PREDECESSOR, SUCCESSOR
    notes: Optional[str] = None
    transferable_skills: List[str] = Field(default_factory=list)
    bridge_skills: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Career Summary & Detail Schemas
# ---------------------------------------------------------------------------

class CareerSummaryOut(BaseModel):
    """Compact representation for search results, lists, and onboarding cards."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    canonical_name: str
    display_name: str
    short_description: str
    domain_slug: Optional[str] = None
    domain_name: Optional[str] = None
    family_slug: Optional[str] = None
    family_name: Optional[str] = None
    specialization: Optional[str] = None
    is_emerging: bool = False
    is_regulated: bool = False
    remote_compatibility: Optional[str] = "MEDIUM"
    key_skills: List[str] = Field(default_factory=list)
    status: str = "ACTIVE"
    version: int = 1


class CareerDetailOut(BaseModel):
    """Comprehensive specification for full career detail page & exploration."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    canonical_name: str
    display_name: str
    short_description: str
    long_description: Optional[str] = None
    domain_id: Optional[str] = None
    domain_slug: Optional[str] = None
    domain_name: Optional[str] = None
    family_id: Optional[str] = None
    family_slug: Optional[str] = None
    family_name: Optional[str] = None
    specialization: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    status: str = "ACTIVE"
    is_emerging: bool = False
    emergence_source: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    is_regulated: bool = False
    regulation_country: Optional[str] = None
    regulatory_requirement: Optional[str] = None
    qualification_requirement: Optional[str] = None
    country_scope: str = "GLOBAL"
    global_relevance: float = 1.0
    work_environment: Optional[str] = None
    remote_compatibility: Optional[str] = "MEDIUM"
    typical_tasks: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    portfolio_expectations: Optional[str] = None
    experience_levels: List[str] = Field(default_factory=list)
    employment_types: List[str] = Field(default_factory=list)
    industry_types: List[str] = Field(default_factory=list)
    version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    specializations: List[CareerSpecializationOut] = Field(default_factory=list)
    skill_requirements: List[CareerSkillRequirementOut] = Field(default_factory=list)
    education_requirements: List[CareerEducationRequirementOut] = Field(default_factory=list)
    regional_metadata: List[CareerRegionalMetadataOut] = Field(default_factory=list)
    relationships: List[CareerRelationshipOut] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Search, Filtering & Discovery Schemas (Stage 2)
# ---------------------------------------------------------------------------

class CareerSearchFilters(BaseModel):
    domain: Optional[str] = None
    family: Optional[str] = None
    specialization: Optional[str] = None
    education_level: Optional[str] = None
    is_regulated: Optional[bool] = None
    is_emerging: Optional[bool] = None
    remote_compatibility: Optional[str] = None
    country: Optional[str] = None


class CareerSearchResponse(BaseModel):
    query: Optional[str] = None
    total_count: int
    page: int
    page_size: int
    total_pages: int
    items: List[CareerSummaryOut]
    suggested_alternatives: List[CareerSummaryOut] = Field(default_factory=list)
    has_exact_match: bool = True


# ---------------------------------------------------------------------------
# Education-to-Career & Transition Intelligence Schemas (Stage 3)
# ---------------------------------------------------------------------------

class EducationFitResponse(BaseModel):
    career_slug: str
    career_name: str
    education_fit: str          # DIRECT_FIT, STRONG_FIT, BRIDGE_REQUIRED, REGULATED_PREREQUISITE_MISSING, ALTERNATIVE_RECOMMENDED
    education_reason: str
    is_regulated_blocked: bool = False
    regulatory_notice: Optional[str] = None
    matched_background: Dict[str, Any] = Field(default_factory=dict)
    mandatory_skills_met: bool = False
    missing_mandatory_skills: List[str] = Field(default_factory=list)
    recommended_bridge_skills: List[str] = Field(default_factory=list)
    suggested_pathways: List[str] = Field(default_factory=list)
    decision_trace: List[Dict[str, Any]] = Field(default_factory=list)


class CareerTransitionResponse(BaseModel):
    source_career_slug: str
    source_career_name: str
    target_career_slug: str
    target_career_name: str
    feasibility: str             # HIGH, MODERATE, CHALLENGING
    transferable_skills: List[str] = Field(default_factory=list)
    bridge_skills: List[str] = Field(default_factory=list)
    estimated_ramp_weeks: int = 8
    recommended_portfolio_projects: List[str] = Field(default_factory=list)
    transition_notes: Optional[str] = None


class CareerComparisonItem(BaseModel):
    career_slug: str
    career_name: str
    domain: str
    family: str
    education_entry_barrier: str     # LOW, MODERATE, HIGH, REGULATED
    mandatory_skills: List[str]
    tools: List[str]
    remote_compatibility: str
    portfolio_importance: str        # CRITICAL, RECOMMENDED, OPTIONAL
    work_environment: str


class CareerComparisonResponse(BaseModel):
    careers: List[CareerComparisonItem]
    common_skills: List[str]
    unique_skills: Dict[str, List[str]]
    comparison_summary: str
