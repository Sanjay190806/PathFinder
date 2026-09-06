from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ItemQualityMetric(BaseModel):
    name: str
    score: float = Field(..., ge=0.0, le=100.0)
    weight: float = Field(..., ge=0.0, le=1.0)
    status: str  # "PASS", "WARN", "FAIL"
    details: str
    recommendations: List[str] = []


class DistractorDetail(BaseModel):
    index: int
    text: str
    char_length: int
    word_count: int
    relative_length_ratio: float
    jaccard_similarity_to_key: float
    plausibility_rating: str  # "HIGH", "MODERATE", "LOW", "TRIVIAL"
    flags: List[str] = []


class ItemQualityEvaluationRequest(BaseModel):
    question_text: str = Field(..., min_length=5)
    options: List[str] = Field(..., min_items=2)
    correct_option_index: int = Field(..., ge=0)
    question_type: str = "MCQ"
    difficulty: str = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    targeted_bloom_level: Optional[str] = None  # REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
    skill_name: Optional[str] = None
    domain: Optional[str] = None
    explanation: Optional[str] = None


class ItemQualityEvaluationReport(BaseModel):
    question_id: Optional[str] = None
    instrumental_quality_score: float = Field(..., ge=0.0, le=100.0)
    certification_level: str  # "EXCELLENT", "ACCEPTABLE", "NEEDS_REVISION", "REJECTED"
    is_approved_for_exam: bool

    # Component Scores (0 to 100)
    key_uniqueness_score: float
    distractor_quality_score: float
    bloom_alignment_score: float
    construct_validity_score: float
    readability_score: float

    # Cognitive & Linguistic Profile
    detected_bloom_level: str
    targeted_bloom_level: str
    flesch_reading_ease: float
    reading_grade_level: str

    # Deep Diagnostics
    distractor_analysis: List[DistractorDetail]
    metrics: Dict[str, ItemQualityMetric]
    flaws_detected: List[str]
    improvement_recommendations: List[str]
    validated_at: str


class BatchQualityEvaluationReport(BaseModel):
    total_items_evaluated: int
    approved_count: int
    needs_revision_count: int
    rejected_count: int
    average_iqs: float
    reports: List[ItemQualityEvaluationReport]


class DomainExamCandidateItem(BaseModel):
    id: Optional[str] = None
    question_text: str
    options: List[str]
    correct_option_index: int = 0
    marks: float = 3.0
    difficulty: str = "medium"
    skill_name: Optional[str] = None
    explanation: Optional[str] = None


class VerifiedExamQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option_index: Optional[int] = None
    marks: float
    difficulty: str
    skill_name: str
    explanation: Optional[str] = None
    instrumental_quality_score: float
    certification_level: str
    detected_bloom_level: str
    is_approved_for_exam: bool


class DomainExamGenerateRequest(BaseModel):
    domain: str
    target_role: Optional[str] = None
    total_questions: int = 30
    total_marks: float = 100.0
    min_quality_score: float = 75.0
    candidate_questions: Optional[List[DomainExamCandidateItem]] = None


class DomainExamResponse(BaseModel):
    exam_id: str
    domain: str
    target_role: Optional[str] = None
    total_questions: int
    total_marks: float
    average_iqs: float
    certification_level: str
    passing_score: float
    approved_questions_count: int
    rejected_questions_count: int
    questions: List[VerifiedExamQuestion]
    generated_at: str

