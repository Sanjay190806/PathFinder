from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ============================================================================
# Question Schemas
# ============================================================================

class QuestionOption(BaseModel):
    index: int
    text: str


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str = "MCQ"  # MCQ, MULTIPLE_SELECT, TRUE_FALSE, CODE_OUTPUT, SHORT_ANSWER, CODING, SCENARIO, PRACTICAL
    difficulty: str = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    marks: float = 2.0

    course_id: Optional[str] = None
    syllabus_id: Optional[str] = None
    syllabus_version: Optional[int] = None
    module_id: Optional[str] = None
    topic_id: Optional[str] = None
    objective_id: Optional[str] = None
    skill_ids: List[str] = []

    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

    test_cases: Optional[List[Dict[str, Any]]] = None
    rubric: Optional[Dict[str, Any]] = None
    code_template: Optional[str] = None
    code_language: Optional[str] = None

    source: str = "CURATED"
    source_url: Optional[str] = None
    verification_status: str = "VERIFIED"
    generation_method: str = "MANUAL"


class QuestionOut(BaseModel):
    id: str
    assessment_id: Optional[str] = None
    question_text: str
    question_type: str
    difficulty: str
    marks: float

    course_id: Optional[str] = None
    syllabus_id: Optional[str] = None
    syllabus_version: Optional[int] = None
    module_id: Optional[str] = None
    topic_id: Optional[str] = None
    objective_id: Optional[str] = None
    skill_ids: List[str] = []

    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

    test_cases: Optional[List[Dict[str, Any]]] = None
    rubric: Optional[Dict[str, Any]] = None
    code_template: Optional[str] = None
    code_language: Optional[str] = None

    source: str
    source_url: Optional[str] = None
    verification_status: str
    generation_method: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class QuestionLearnerOut(BaseModel):
    """Secure projection for learners: redacts correct answers and explanations!"""
    id: str
    question_text: str
    question_type: str
    difficulty: str
    marks: float
    options: Optional[List[str]] = None
    code_template: Optional[str] = None
    code_language: Optional[str] = None
    topic_id: Optional[str] = None
    module_id: Optional[str] = None
    objective_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Blueprint Schemas
# ============================================================================

class BlueprintSectionRule(BaseModel):
    module_id: str
    module_title: str
    module_weight: float
    target_questions: int
    target_marks: float
    topic_rules: List[Dict[str, Any]] = []


class AssessmentBlueprintCreate(BaseModel):
    course_id: str
    syllabus_id: Optional[str] = None
    syllabus_version: Optional[int] = None
    title: str
    description: Optional[str] = None

    total_questions: int = 30
    total_marks: float = 100.0
    duration_minutes: int = 60
    passing_score: float = 60.0

    difficulty_distribution: Dict[str, float] = Field(
        default_factory=lambda: {"BEGINNER": 0.3, "INTERMEDIATE": 0.5, "ADVANCED": 0.2}
    )
    question_type_distribution: Dict[str, float] = Field(
        default_factory=lambda: {"MCQ": 0.7, "CODING": 0.15, "SCENARIO": 0.15}
    )
    allowed_types: List[str] = Field(
        default_factory=lambda: ["MCQ", "MULTIPLE_SELECT", "CODING", "SCENARIO", "PRACTICAL"]
    )


class AssessmentBlueprintOut(BaseModel):
    id: str
    course_id: str
    syllabus_id: str
    syllabus_version: int
    title: str
    description: Optional[str] = None

    total_questions: int
    total_marks: float
    duration_minutes: int
    passing_score: float

    difficulty_distribution: Dict[str, float]
    question_type_distribution: Dict[str, float]
    section_rules: List[Dict[str, Any]]
    allowed_types: List[str]
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Coverage Schemas
# ============================================================================

class SyllabusCoverageReport(BaseModel):
    syllabus_id: str
    syllabus_version: int
    total_syllabus_modules: int
    total_syllabus_topics: int
    covered_modules: List[str]
    uncovered_modules: List[str]
    covered_topics: List[str]
    uncovered_topics: List[str]
    coverage_percentage: float
    module_representation: Dict[str, Dict[str, Any]]
    difficulty_distribution: Dict[str, int]
    question_type_distribution: Dict[str, int]
    is_valid_assessment: bool
    coverage_warnings: List[str] = []


# ============================================================================
# Assessment Generation & Views
# ============================================================================

class AssessmentGenerateRequest(BaseModel):
    blueprint_id: str
    title: Optional[str] = None
    assessment_type: str = "STANDARD"  # STANDARD, ADAPTIVE, DIAGNOSTIC, PRACTICE, MOCK, FINAL
    randomize: bool = True
    random_seed: Optional[int] = None


class AssessmentDetailOut(BaseModel):
    id: str
    title: str
    domain: str
    course_id: Optional[str] = None
    syllabus_id: Optional[str] = None
    syllabus_version: Optional[int] = None
    blueprint_id: Optional[str] = None
    description: Optional[str] = None
    assessment_type: str
    duration_minutes: int
    total_questions: int
    total_marks: float
    passing_score: float
    status: str
    questions: List[QuestionOut] = []
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentLearnerViewOut(BaseModel):
    """Redacted view for learners prior to submission"""
    id: str
    title: str
    domain: str
    course_id: Optional[str] = None
    description: Optional[str] = None
    assessment_type: str
    duration_minutes: int
    total_questions: int
    total_marks: float
    passing_score: float
    questions: List[QuestionLearnerOut] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Adaptive Session & Answering Schemas (Stage 3)
# ============================================================================

class AssessmentSessionCreate(BaseModel):
    mode: str = "ADAPTIVE"  # STANDARD, ADAPTIVE, DIAGNOSTIC, PRACTICE


class AdaptationHistoryItem(BaseModel):
    question_number: int
    event: str
    from_difficulty: str
    to_difficulty: str
    reason: str
    trace_id: Optional[str] = None
    timestamp: str


class AssessmentSessionOut(BaseModel):
    id: str
    session_id: Optional[str] = None
    assessment_id: str
    profile_id: str
    attempt_number: Optional[int] = 1
    mode: str
    status: str
    current_question_index: int
    current_difficulty: str
    total_questions: int
    answered_count: int
    time_remaining_seconds: int
    started_at: datetime
    expires_at: datetime
    adaptation_events: List[AdaptationHistoryItem] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentNextQuestionOut(BaseModel):
    session_id: str
    question_number: int
    total_questions: int
    time_remaining_seconds: int
    current_difficulty: str
    mode: str
    question: QuestionLearnerOut
    adaptation_note: Optional[str] = None


class AnswerSubmitRequest(BaseModel):
    question_id: str
    selected_option_index: Optional[int] = None
    submitted_answer: Optional[str] = None
    code_submission: Optional[str] = None
    time_spent_seconds: int = 0


class AnswerSubmitResponse(BaseModel):
    session_id: str
    question_id: str
    is_correct: Optional[bool] = None  # Shown in practice mode, None in timed final
    score: Optional[float] = None
    max_marks: float
    explanation: Optional[str] = None  # Only in PRACTICE mode!
    next_question_available: bool
    current_difficulty: str
    adaptation_message: Optional[str] = None
    time_remaining_seconds: int
    already_submitted: bool = False


class AssessmentProgressOut(BaseModel):
    session_id: str
    status: str
    total_questions: int
    answered_count: int
    current_score: Optional[float] = None
    total_max_marks: float
    passing_score: float
    passed: Optional[bool] = None
    tested_skills: Dict[str, Any] = {}
    tested_topics: Dict[str, Any] = {}
    adaptation_history: List[Dict[str, Any]] = []
    time_remaining_seconds: int


# ============================================================================
# Stage 4: Secure Exam Runtime & Session State Schemas
# ============================================================================

class ExamRulesOut(BaseModel):
    assessment_id: str
    title: str
    domain: str
    assessment_type: str
    duration_minutes: int
    total_questions: int
    total_marks: float
    passing_score: float
    attempt_limit: int
    allowed_pause: bool
    max_pause_seconds: int
    max_pauses_allowed: int
    navigation_policy: str
    submission_policy: str
    integrity_monitoring_policy: Optional[str] = "WARNING_ONLY"
    gadget_detection_enabled: Optional[bool] = True
    monitoring_consent_required: Optional[bool] = True

    model_config = ConfigDict(from_attributes=True)


class SessionPauseResponse(BaseModel):
    session_id: str
    status: str
    is_paused: bool
    paused_at: datetime
    pause_count: int
    max_pauses_allowed: int
    pauses_remaining: Optional[int] = None
    total_paused_seconds: int
    max_pause_seconds: int
    message: str


class SessionResumeResponse(BaseModel):
    session_id: str
    status: str
    is_paused: bool
    resumed_at: datetime
    time_remaining_seconds: int
    total_paused_seconds: int
    message: str


class AuditEventRecord(BaseModel):
    event: str
    timestamp: str
    metadata: Dict[str, Any] = {}


class ExamResultSummaryOut(BaseModel):
    session_id: str
    assessment_id: str
    title: str
    domain: str
    mode: str
    status: str
    attempt_number: int
    raw_score: float
    total_score: Optional[float] = None
    max_score: float
    total_max_marks: Optional[float] = None
    percentage: float
    passed: bool
    passing_score: float
    started_at: datetime
    submitted_at: Optional[datetime] = None
    time_spent_seconds: int
    module_breakdown: Dict[str, Any] = {}
    module_scores: Optional[Dict[str, Any]] = None
    topic_breakdown: Dict[str, Any] = {}
    topic_scores: Optional[Dict[str, Any]] = None
    objective_breakdown: Dict[str, Any] = {}
    objective_scores: Optional[Dict[str, Any]] = None
    skill_evidence: List[Dict[str, Any]] = []
    integrity_state: str = "NORMAL"
    course_completion_eligible: bool = False
    course_completed: bool = False
    feedback_summary: str = ""


class ExamSessionDetailOut(BaseModel):
    id: str
    assessment_id: str
    profile_id: str
    mode: str
    status: str
    attempt_number: int
    session_version: int
    current_question_index: int
    current_difficulty: str
    total_questions: int
    answered_count: int
    time_remaining_seconds: int
    is_paused: bool
    pause_count: int
    max_pauses_allowed: int
    total_paused_seconds: int
    max_pause_seconds: int
    navigation_policy: str
    started_at: datetime
    expires_at: datetime
    last_activity_at: Optional[datetime] = None
    selected_question_ids: List[str] = []
    answered_question_ids: List[str] = []
    audit_events: List[Dict[str, Any]] = []
    adaptation_history: List[Dict[str, Any]] = []
    monitoring_consent: Optional[str] = "MONITORING_CONSENT_REQUIRED"
    monitoring_started_at: Optional[datetime] = None
    monitoring_ended_at: Optional[datetime] = None
    integrity_events_count: Optional[int] = 0
    integrity_state: Optional[str] = "NORMAL"
    action_instruction: Optional[str] = "CONTINUE"
    warning_count: Optional[int] = 0
    last_warning_issued_at: Optional[datetime] = None
    active_warning: Optional[Dict[str, Any]] = None
    review_status: Optional[str] = "NOT_APPLICABLE"


# ============================================================================
# Stage 5 & 6: Integrity Monitoring & Gadget Detection Schemas
# ============================================================================

class IntegrityEventCreate(BaseModel):
    """
    Structured integrity and presence telemetry payload from client.
    Strict privacy: no raw frames or screenshots accepted.
    """
    event_type: str = Field(..., description="NO_FACE, MULTIPLE_FACES, LOOKING_AWAY, FACE_OUT_OF_FRAME, POSSIBLE_PHONE, etc.")
    timestamp: Optional[datetime] = None
    duration: float = Field(default=0.0, ge=0.0, description="Duration in seconds")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Model confidence 0.0 to 1.0")
    severity: Optional[str] = Field(default=None, description="INFO, LOW, MEDIUM, HIGH (server-validated)")
    source: str = Field(default="BROWSER_CAMERA", description="BROWSER_CAMERA, BROWSER_VISION, LOCAL_INFERENCE, SYSTEM")
    metadata_minimized: Dict[str, Any] = Field(default_factory=dict)


class IntegrityEventOut(BaseModel):
    id: str
    session_id: str
    profile_id: str
    learner_id: Optional[str] = None
    assessment_id: Optional[str] = None
    event_type: str
    timestamp: datetime
    duration: float
    confidence: Optional[float] = None
    severity: str
    source: str
    metadata_minimized: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IntegrityMonitoringConsentRequest(BaseModel):
    consent: str = Field(..., description="CONSENT_GRANTED, CONSENT_DENIED")


class IntegrityMonitoringConsentResponse(BaseModel):
    session_id: str
    monitoring_consent: str
    monitoring_status: str
    message: str


class IntegritySummaryOut(BaseModel):
    session_id: str
    monitoring_policy: str
    gadget_detection_enabled: bool = True
    monitoring_consent: str
    face_absence_events: int = 0
    multiple_face_events: int = 0
    looking_away_events: int = 0
    face_out_of_frame_events: int = 0
    camera_outage_events: int = 0
    total_device_events: int = 0
    phone_events: int = 0
    tablet_events: int = 0
    headphones_events: int = 0
    other_gadget_events: int = 0
    high_confidence_events: int = 0
    total_integrity_events: int = 0
    warning_candidates_count: int = 0
    multi_signal_warning_candidate: bool = False
    recent_events: List[IntegrityEventOut] = []


# ============================================================================
# Stage 7: Integrity Warning, Escalation & Policy Schemas
# ============================================================================

class AssessmentIntegrityPolicyBase(BaseModel):
    monitoring_required: bool = True
    camera_required: bool = True
    allowed_warning_count: int = 3
    warning_cooldown_seconds: int = 30
    event_thresholds: Dict[str, Any] = Field(default_factory=dict)
    escalation_rules: Dict[str, Any] = Field(default_factory=dict)
    review_required_threshold: int = 4
    invalidation_threshold: int = 0
    auto_pause_on_interruption: bool = True


class AssessmentIntegrityPolicyCreate(AssessmentIntegrityPolicyBase):
    pass


class AssessmentIntegrityPolicyUpdate(BaseModel):
    monitoring_required: Optional[bool] = None
    camera_required: Optional[bool] = None
    allowed_warning_count: Optional[int] = None
    warning_cooldown_seconds: Optional[int] = None
    event_thresholds: Optional[Dict[str, Any]] = None
    escalation_rules: Optional[Dict[str, Any]] = None
    review_required_threshold: Optional[int] = None
    invalidation_threshold: Optional[int] = None
    auto_pause_on_interruption: Optional[bool] = None


class AssessmentIntegrityPolicyOut(AssessmentIntegrityPolicyBase):
    id: str
    assessment_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IntegrityStateOut(BaseModel):
    session_id: str
    integrity_state: str  # NORMAL, WARNING, REPEATED_WARNING, ESCALATED, REVIEW_REQUIRED, INVALIDATED
    action_instruction: str  # CONTINUE, SHOW_WARNING, PAUSE_REQUIRED, REQUEST_INTERVENTION, MARK_REVIEW_REQUIRED, INVALIDATE
    warning_count: int
    allowed_warning_count: int
    last_warning_issued_at: Optional[datetime] = None
    active_warning: Optional[Dict[str, Any]] = None
    review_status: str  # NOT_APPLICABLE, PENDING_REVIEW, UNDER_REVIEW, CLEARED, INVALIDATED
    monitoring_consent: str
    decision_trace_id: Optional[str] = None


class WarningAcknowledgeRequest(BaseModel):
    warning_id: Optional[str] = None


class WarningAcknowledgeResponse(BaseModel):
    session_id: str
    acknowledged: bool
    action_instruction: str
    integrity_state: str
    message: str


class WarningHistoryItem(BaseModel):
    warning_id: str
    event_type: str
    message: str
    severity: str
    timestamp: str
    acknowledged_at: Optional[str] = None


class WarningHistoryOut(BaseModel):
    session_id: str
    warning_count: int
    allowed_warning_count: int
    warnings: List[WarningHistoryItem] = []


