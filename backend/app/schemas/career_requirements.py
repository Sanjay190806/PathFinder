from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==========================================
# STAGE 4: REQUIREMENTS & PATHWAYS SCHEMAS
# ==========================================

class CareerRequirementItem(BaseModel):
    id: str
    career_id: str
    requirement_type: str  # HARD_REQUIREMENT, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE_REQUIRED
    category: str  # EDUCATION, SUBJECT, DEGREE, CERTIFICATION, LICENSE, SKILL, EXPERIENCE, PORTFOLIO, PROJECT, REGULATORY
    requirement_name: str
    description: Optional[str] = None
    education_level: Optional[str] = None
    skill_id: Optional[str] = None
    minimum_level: str = "WORKING"
    mandatory: bool = False
    source: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: str = "VERIFIED"
    country_code: str = "GLOBAL"
    region_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LearnerRequirementEvaluationItem(BaseModel):
    requirement_id: str
    requirement_name: str
    category: str
    requirement_type: str
    mandatory: bool
    status: str  # SATISFIED, PARTIALLY_SATISFIED, MISSING, UNKNOWN, NOT_APPLICABLE
    learner_evidence: Optional[str] = None
    gap_notes: Optional[str] = None


class PathwayStepResponse(BaseModel):
    step_number: int
    title: str
    description: Optional[str] = None
    step_type: str  # academic_prerequisite, foundational_skill, core_competency, capstone_evidence, industry_entry, licensure_exam
    skills_to_acquire: List[str] = Field(default_factory=list)
    estimated_weeks: int = 4
    prerequisites: List[str] = Field(default_factory=list)
    status: str = "NOT_STARTED"  # COMPLETED, IN_PROGRESS, NOT_STARTED


class CareerPathwayResponse(BaseModel):
    pathway_id: str
    pathway_type: str  # DIRECT, DEGREE, DIPLOMA, ITI, VOCATIONAL, POSTGRADUATE, CERTIFICATION_SUPPORTED, BRIDGE, CAREER_TRANSITION, ADJACENT_SKILL, ALTERNATIVE_ACADEMIC
    title: str
    description: Optional[str] = None
    applicable_backgrounds: List[str] = Field(default_factory=list)
    duration_estimate: str = "6-12 months"
    difficulty_level: str = "Moderate"
    is_primary: bool = True
    steps: List[PathwayStepResponse] = Field(default_factory=list)
    milestones: List[PathwayStepResponse] = Field(default_factory=list)
    learner_eligibility_status: str = "UNKNOWN"  # ELIGIBLE, BRIDGE_REQUIRED, INELIGIBLE, UNKNOWN


class CareerEligibilityResponse(BaseModel):
    career_slug: str
    career_title: str
    is_regulated: bool = False
    regulatory_body: Optional[str] = None
    statutory_exam: Optional[str] = None
    overall_eligibility: str  # ELIGIBLE, BRIDGE_REQUIRED, INELIGIBLE, INSUFFICIENT_DATA
    satisfaction_score: Optional[float] = None
    satisfied_count: int = 0
    missing_count: int = 0
    unknown_count: int = 0
    total_requirements: int = 0
    mandatory_skills: List[str] = Field(default_factory=list)
    requirements: List[LearnerRequirementEvaluationItem] = Field(default_factory=list)
    pathways: List[CareerPathwayResponse] = Field(default_factory=list)
    bridge_requirements: List[str] = Field(default_factory=list)
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


# ==========================================
# STAGE 5: CAREER COMPARISON SCHEMAS
# ==========================================

class CareerComparisonItem(BaseModel):
    career_id: str
    title: str
    slug: str
    domain: str
    family: str
    work_environment: Optional[str] = None
    remote_compatibility: str = "MEDIUM"
    salary_entry: Optional[int] = None
    salary_senior: Optional[int] = None
    min_education: Optional[str] = None
    regulatory_body: Optional[str] = None
    statutory_exam: Optional[str] = None
    key_skills: List[str] = Field(default_factory=list)
    growth_rate: Optional[str] = None
    entry_barrier: str = "Moderate"


class SkillOverlapAnalysis(BaseModel):
    shared_skills: List[str] = Field(default_factory=list)
    unique_skills_by_career: Dict[str, List[str]] = Field(default_factory=dict)
    transferable_skills: Dict[str, List[str]] = Field(default_factory=dict)


class CareerComparisonResponse(BaseModel):
    careers: List[CareerComparisonItem] = Field(default_factory=list)
    skill_overlap: SkillOverlapAnalysis
    education_comparison: Dict[str, Any] = Field(default_factory=dict)
    difficulty_ranking: List[Dict[str, Any]] = Field(default_factory=list)
    transition_feasibility: Dict[str, Any] = Field(default_factory=dict)
    comparison_summary: str = ""
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


class AlternativeCareerItem(BaseModel):
    career_id: str
    title: str
    slug: str
    domain: str
    relationship_type: str  # ADJACENT, UPSTREAM, DOWNSTREAM, SPECIALIZATION, ALTERNATIVE, BRIDGE
    transferable_skills: List[str] = Field(default_factory=list)
    bridge_skills: List[str] = Field(default_factory=list)
    similarity_score: float = 0.0
    rationale: str = ""


class AlternativeCareersResponse(BaseModel):
    source_career_slug: str
    source_career_title: str
    alternatives: List[AlternativeCareerItem] = Field(default_factory=list)
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


# ==========================================
# STAGE 6: PERSONALIZED FIT ENGINE SCHEMAS
# ==========================================

class FitDimensionScore(BaseModel):
    dimension_name: str
    score: Optional[float] = None  # None if insufficient data / UNKNOWN
    status: str  # STRONG, MODERATE, GAP, UNKNOWN, NOT_EVALUATED
    weight: float
    evidence: str
    gaps: List[str] = Field(default_factory=list)


class SkillEvidenceItem(BaseModel):
    strong_skills: List[str] = Field(default_factory=list)
    developing_skills: List[str] = Field(default_factory=list)
    gap_skills: List[str] = Field(default_factory=list)


class CareerFitResponse(BaseModel):
    career_slug: str
    career_title: str
    overall_fit_score: float  # 0.0 to 1.0
    fit_category: str  # STRONG_FIT, GOOD_FIT, POTENTIAL_FIT, BRIDGE_REQUIRED, STRETCH_PATH, INSUFFICIENT_DATA
    confidence_level: str  # HIGH, MEDIUM, LOW
    dimensions: Dict[str, FitDimensionScore] = Field(default_factory=dict)
    skill_evidence: SkillEvidenceItem = Field(default_factory=SkillEvidenceItem)
    strengths: List[str] = Field(default_factory=list)
    primary_gaps: List[str] = Field(default_factory=list)
    recommended_next_actions: List[str] = Field(default_factory=list)
    bridge_pathway_suggested: bool = False
    market_signal: Optional[Dict[str, Any]] = None
    decision_trace: Dict[str, Any] = Field(default_factory=dict)
    # Backward compatibility for Phase 9 pathway evaluation tests:
    eligibility_status: Optional[str] = "DIRECT_ELIGIBLE"
    active_pathway: Optional[Dict[str, Any]] = Field(default_factory=dict)
    next_step: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CareerFitExplanationResponse(BaseModel):
    career_slug: str
    career_title: str
    fit_category: str
    overall_fit_score: float
    why_fit: str
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    bridge_requirements: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


class RecommendedCareerFitItem(BaseModel):
    career_slug: str
    career_title: str
    domain_name: str
    overall_fit_score: float
    fit_category: str
    confidence_level: str
    top_strengths: List[str] = Field(default_factory=list)
    key_gap: Optional[str] = None


class PersonalizedAlternativeItem(BaseModel):
    career_slug: str
    career_title: str
    domain_name: str
    fit_category: str
    overall_fit_score: float
    why_alternative: str
    label: str = "Alternative based on current evidence"
    matching_strengths: List[str] = Field(default_factory=list)
    bridge_skills: List[str] = Field(default_factory=list)


class PersonalizedAlternativesResponse(BaseModel):
    target_career_slug: str
    target_career_title: str
    target_fit_category: str
    alternatives: List[PersonalizedAlternativeItem] = Field(default_factory=list)
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


class ClusteredCareerRecommendationsResponse(BaseModel):
    strong_fit: List[RecommendedCareerFitItem] = Field(default_factory=list)
    good_fit: List[RecommendedCareerFitItem] = Field(default_factory=list)
    potential_fit: List[RecommendedCareerFitItem] = Field(default_factory=list)
    bridge_required: List[RecommendedCareerFitItem] = Field(default_factory=list)
    stretch_path: List[RecommendedCareerFitItem] = Field(default_factory=list)
    insufficient_data: List[RecommendedCareerFitItem] = Field(default_factory=list)
    total_evaluated: int = 0


# ==========================================
# STAGE 7: MARKET INTELLIGENCE SCHEMAS
# ==========================================

class MarketSignalItem(BaseModel):
    id: str
    signal_type: str
    signal_value: str
    numeric_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    currency: str = "INR"
    period: str = "ANNUAL"
    experience_level: str = "ALL"
    data_quality: str = "REPORTED"
    unit: str = "INDEX"
    country_code: str = "IN"
    region_code: str = "National"
    industry: Optional[str] = None
    source_tier: int = 1
    source_name: str
    source_url: Optional[str] = None
    provider: str
    confidence: float
    freshness: str = "FRESH"
    time_window: str = "2026-Q1"
    observed_at: str


class SalaryLevelItem(BaseModel):
    min_amount: Optional[float] = None
    median_amount: Optional[float] = None
    max_amount: Optional[float] = None
    formatted_display: str
    experience_years: str


class SalarySnapshot(BaseModel):
    career_slug: str
    currency: str = "INR"
    period: str = "ANNUAL"
    data_quality: str = "REPORTED"
    freshness: str = "FRESH"
    confidence: float = 0.90
    source_tier: int = 1
    source_name: str = "Official / Verified Industry Benchmark"
    entry_level: Optional[SalaryLevelItem] = None
    mid_level: Optional[SalaryLevelItem] = None
    senior_level: Optional[SalaryLevelItem] = None
    available: bool = True


class RegionalDemandItem(BaseModel):
    region_code: str
    city_name: str
    demand_score: float
    demand_level: str
    hiring_trend: str
    top_industries: List[str] = Field(default_factory=list)
    confidence: float = 0.90
    freshness: str = "FRESH"


class TopMarketSkillItem(BaseModel):
    skill_name: str
    skill_slug: str
    category: str = "Core Technology"
    demand_score: float
    growth_trend: str = "Growing"
    is_emerging: bool = False
    source: str = "Verified Market Index"
    freshness: str = "FRESH"


class CareerMarketSnapshot(BaseModel):
    career_slug: str
    career_title: str
    demand_trend: str
    overall_market_score: float
    active_job_index: Optional[float] = None
    hiring_sentiment: str = "STRONG"
    remote_flexibility: str = "MEDIUM"
    salary_snapshot: SalarySnapshot
    top_skills: List[TopMarketSkillItem] = Field(default_factory=list)
    regional_demand: List[RegionalDemandItem] = Field(default_factory=list)
    top_industries: List[str] = Field(default_factory=list)
    freshness: str = "FRESH"
    signals_count: int = 0
    decision_trace: Optional[Dict[str, Any]] = None


class CareerMarketSkillsResponse(BaseModel):
    career_slug: str
    career_title: str
    total_skills: int
    top_skills: List[TopMarketSkillItem] = Field(default_factory=list)
    freshness: str = "FRESH"


class CareerMarketSalaryResponse(BaseModel):
    career_slug: str
    career_title: str
    salary_snapshot: SalarySnapshot


class CareerMarketRegionsResponse(BaseModel):
    career_slug: str
    career_title: str
    total_regions: int
    regions: List[RegionalDemandItem] = Field(default_factory=list)
    freshness: str = "FRESH"


# ==========================================
# STAGE 8 & 9: PRIORITY RANKING & SELECTION
# ==========================================

class RankedCareerItem(BaseModel):
    career_slug: str
    career_title: str
    domain_name: str
    family_name: Optional[str] = None
    priority_score: float
    fit_score: float
    market_score: float
    fit_category: str
    cluster: str  # TOP_FIT, STRONG_OPTIONS, POTENTIAL_OPTIONS, BRIDGE_OPTIONS, STRETCH_OPTIONS
    is_primary_goal: bool = False
    match_reason: str
    top_strengths: List[str] = Field(default_factory=list)
    primary_gap: Optional[str] = None
    average_entry_salary: Optional[str] = None
    hiring_trend: str = "Stable"
    remote_compatibility: str = "MEDIUM"


class RankedPriorityResponse(BaseModel):
    learner_mode: str  # EXPLORE, TARGET_CAREER, CAREER_CHANGE, FIRST_CAREER, SKILL_BASED
    target_career: Optional[RankedCareerItem] = None
    ranked_careers: List[RankedCareerItem] = Field(default_factory=list)
    cluster_breakdown: Dict[str, int] = Field(default_factory=dict)
    diversity_applied: bool = True
    total_evaluated: int = 0
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


class CareerSelectionRequest(BaseModel):
    career_slug: str
    selection_source: str = "BROWSE"  # SEARCH, RECOMMENDED, BROWSE, COMPARISON, CUSTOM
    custom_role_name: Optional[str] = None


class CareerSelectionResponse(BaseModel):
    success: bool
    career_slug: str
    career_title: str
    selection_source: str
    timestamp: str
    message: str

