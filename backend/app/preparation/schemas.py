from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PreparationReadinessResponse(BaseModel):
    learner_id: str
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    overall_score: float
    readiness_level: str  # LOW, MODERATE, GOOD, APPLICATION_READY
    dimension_scores: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    critical_blockers: List[str]
    decision_trace: Dict[str, Any]


class PreparationGapItem(BaseModel):
    category: str  # SKILL, PROJECT, RESUME, PORTFOLIO, INTERVIEW, BEHAVIORAL
    title: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    impact: str
    remediation_action: str


class PreparationGapsResponse(BaseModel):
    learner_id: str
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    total_gaps: int
    gaps_by_category: Dict[str, List[PreparationGapItem]]
    critical_gaps: List[PreparationGapItem]


class AdaptiveQuestionRequest(BaseModel):
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    category: Optional[str] = "TECHNICAL"  # TECHNICAL, SYSTEM_DESIGN, BEHAVIORAL, SITUATIONAL, RESUME_DEEP_DIVE, INDIA_MARKET
    difficulty: Optional[str] = None  # AUTO, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    count: Optional[int] = 5


class QuestionItem(BaseModel):
    id: str
    category: str
    difficulty: str
    prompt: str
    context: Optional[str] = None
    target_skills: List[str] = Field(default_factory=list)
    rubric: Dict[str, Any] = Field(default_factory=dict)


class AdaptiveQuestionResponse(BaseModel):
    questions: List[QuestionItem]
    recommended_difficulty: str
    focus_areas: List[str]


class MockSessionCreateRequest(BaseModel):
    session_type: Optional[str] = "MIXED"  # TECHNICAL, BEHAVIORAL, OPPORTUNITY_SPECIFIC, MIXED
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    target_difficulty: Optional[str] = "AUTO"


class MockTurnSubmitRequest(BaseModel):
    question_id: str
    response_text: str


class MockTurnEvaluationResponse(BaseModel):
    turn_id: str
    question_id: str
    technical_accuracy: float
    depth_clarity: float
    structure_framework: float
    confidence_language: float
    india_market_relevance: float
    overall_turn_score: float
    feedback: str
    strengths: List[str]
    improvement_tips: List[str]
    model_answer: str


class MockSessionResponse(BaseModel):
    session_id: str
    session_type: str
    status: str  # IN_PROGRESS, COMPLETED
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    questions: List[Dict[str, Any]]
    current_question_index: int
    turn_evaluations: List[Dict[str, Any]]
    overall_feedback: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None


class ResumeAuditRequest(BaseModel):
    resume_text: str
    career_id: Optional[str] = None
    opportunity_id: Optional[str] = None


class ResumeAuditResponse(BaseModel):
    ats_score: float
    keyword_coverage: Dict[str, Any]
    action_verb_strength: float
    quantification_score: float
    experience_consistency: float
    red_flags: List[str]
    enhancement_suggestions: List[Dict[str, Any]]


class PortfolioAuditResponse(BaseModel):
    portfolio_score: float
    completeness_score: float
    project_depth_score: float
    readme_quality_score: float
    live_demo_score: float
    test_coverage_score: float
    missing_evidence: List[str]
    recommended_portfolio_upgrades: List[str]


class OpportunityPrepResponse(BaseModel):
    opportunity_id: str
    title: str
    company: str
    application_state: str  # DISCOVERY, PREPARING, READY_TO_APPLY, APPLIED, INTERVIEWING, REJECTED, OFFER
    requirement_evidence_matrix: List[Dict[str, Any]]
    company_prep_brief: Dict[str, Any]
    tailored_resume_tips: List[str]
    targeted_interview_questions: List[Dict[str, Any]]


class PreparationPlanResponse(BaseModel):
    plan_items: List[Dict[str, Any]]
    estimated_days_to_ready: int
    priority_focus: str
