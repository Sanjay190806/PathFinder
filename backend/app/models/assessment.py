import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class AssessmentBlueprint(Base):
    __tablename__ = "assessment_blueprints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    course_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    syllabus_id = Column(String(36), ForeignKey("course_syllabuses.id", ondelete="CASCADE"), nullable=False, index=True)
    syllabus_version = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    total_questions = Column(Integer, default=30)
    total_marks = Column(Float, default=100.0)
    duration_minutes = Column(Integer, default=60)
    passing_score = Column(Float, default=60.0)

    # {"BEGINNER": 0.3, "INTERMEDIATE": 0.5, "ADVANCED": 0.2}
    difficulty_distribution = Column(JSON, default=dict)
    # {"MCQ": 0.7, "CODING": 0.15, "SCENARIO": 0.15}
    question_type_distribution = Column(JSON, default=dict)
    # Section rules derived from syllabus module and topic weights
    section_rules = Column(JSON, default=list)
    # Allowed question types for this blueprint
    allowed_types = Column(JSON, default=list)

    status = Column(String(50), default="ACTIVE")  # ACTIVE, DRAFT, DEPRECATED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    course = relationship("LearningResource")
    syllabus = relationship("CourseSyllabus")
    assessments = relationship("Assessment", back_populates="blueprint")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(200), nullable=False)
    domain = Column(String(100), nullable=False, default="General")
    target_skill_ids = Column(JSON, default=list)

    # Phase 10 Stage 2 Extensions
    course_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="SET NULL"), nullable=True, index=True)
    syllabus_id = Column(String(36), ForeignKey("course_syllabuses.id", ondelete="SET NULL"), nullable=True, index=True)
    syllabus_version = Column(Integer, nullable=True)
    blueprint_id = Column(String(36), ForeignKey("assessment_blueprints.id", ondelete="SET NULL"), nullable=True, index=True)
    description = Column(Text, nullable=True)

    assessment_type = Column(String(50), default="STANDARD")  # STANDARD, ADAPTIVE, DIAGNOSTIC, PRACTICE, MOCK, FINAL
    duration_minutes = Column(Integer, default=60)
    total_questions = Column(Integer, default=30)
    total_marks = Column(Float, default=100.0)
    passing_score = Column(Float, default=60.0)
    attempt_limit = Column(Integer, default=3)  # 0 for unlimited
    allowed_pause = Column(Boolean, default=True)
    max_pause_seconds = Column(Integer, default=600)  # 10 minutes max total pause
    max_pauses_allowed = Column(Integer, default=2)
    navigation_policy = Column(String(50), default="FREE_NAVIGATION")  # FREE_NAVIGATION, SEQUENTIAL_ONLY, LOCK_AFTER_SUBMISSION
    submission_policy = Column(String(50), default="AUTO_SUBMIT_ON_EXPIRE")
    integrity_monitoring_policy = Column(String(50), default="WARNING_ONLY")  # REQUIRED, OPTIONAL, WARNING_ONLY
    gadget_detection_enabled = Column(Boolean, default=True)
    monitoring_consent_required = Column(Boolean, default=True)
    status = Column(String(50), default="DRAFT")  # DRAFT, VALIDATED, PUBLISHED, ARCHIVED
    random_seed = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    course = relationship("LearningResource")
    syllabus = relationship("CourseSyllabus")
    blueprint = relationship("AssessmentBlueprint", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    sessions = relationship("AssessmentSession", back_populates="assessment", cascade="all, delete-orphan")
    integrity_policy = relationship("AssessmentIntegrityPolicy", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=True, index=True)

    # Core content
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # ["Option A", "Option B", ...] for MCQ / Multiple Select
    correct_option_index = Column(Integer, nullable=True)  # For single MCQ
    correct_answer = Column(Text, nullable=True)  # JSON or text for all question types
    explanation = Column(Text, nullable=True)
    difficulty_weight = Column(Float, default=0.5)

    # Phase 10 Stage 2 Grounding & Traceability
    course_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="SET NULL"), nullable=True, index=True)
    syllabus_id = Column(String(36), ForeignKey("course_syllabuses.id", ondelete="SET NULL"), nullable=True, index=True)
    syllabus_version = Column(Integer, nullable=True)
    module_id = Column(String(36), ForeignKey("syllabus_modules.id", ondelete="SET NULL"), nullable=True, index=True)
    topic_id = Column(String(36), ForeignKey("syllabus_topics.id", ondelete="SET NULL"), nullable=True, index=True)
    objective_id = Column(String(36), ForeignKey("learning_objectives.id", ondelete="SET NULL"), nullable=True, index=True)
    skill_ids = Column(JSON, default=list)

    # Question Type & Difficulty
    question_type = Column(String(50), default="MCQ")  # MCQ, MULTIPLE_SELECT, TRUE_FALSE, CODE_OUTPUT, SHORT_ANSWER, CODING, SCENARIO, PRACTICAL
    difficulty = Column(String(50), default="INTERMEDIATE")  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    marks = Column(Float, default=2.0)

    # Rich metadata for Coding / Practical / Scenario
    test_cases = Column(JSON, nullable=True)  # [{"input": "...", "expected": "...", "hidden": false}]
    rubric = Column(JSON, nullable=True)  # Evaluation criteria
    code_template = Column(Text, nullable=True)
    code_language = Column(String(50), nullable=True)

    # Provenance & Verification
    source = Column(String(100), default="CURATED")  # CURATED, NPTEL, INSTRUCTOR, AI_GENERATED
    source_url = Column(String(500), nullable=True)
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, AI_ASSISTED, PENDING, REJECTED
    generation_method = Column(String(50), default="MANUAL")  # MANUAL, TEMPLATE, AI_GENERATED, IMPORTED, HYBRID

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="questions")
    skill = relationship("Skill", back_populates="assessment_questions")
    module = relationship("SyllabusModule")
    topic = relationship("SyllabusTopic")
    objective = relationship("LearningObjective")
    responses = relationship("AssessmentResponse", back_populates="question", cascade="all, delete-orphan")


class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=True)
    submitted_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, default=0.0)
    confidence_delta = Column(Float, default=0.0)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="assessment_responses")
    question = relationship("AssessmentQuestion", back_populates="responses")


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    mode = Column(String(50), default="STANDARD")  # STANDARD, ADAPTIVE, DIAGNOSTIC, PRACTICE
    status = Column(String(50), default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, EXPIRED, ABANDONED

    current_question_index = Column(Integer, default=0)
    current_difficulty = Column(String(50), default="INTERMEDIATE")
    consecutive_correct = Column(Integer, default=0)
    consecutive_incorrect = Column(Integer, default=0)

    total_score = Column(Float, default=0.0)
    total_max_marks = Column(Float, default=0.0)
    passed = Column(Boolean, nullable=True)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    submitted_at = Column(DateTime, nullable=True)

    # State tracking
    selected_question_ids = Column(JSON, default=list)  # Ordered list of question IDs presented
    answers = Column(JSON, default=dict)  # question_id -> {answer, is_correct, score, max_marks, timestamp}
    adaptation_history = Column(JSON, default=list)  # [{event, from_diff, to_diff, reason, trace_id, timestamp}]
    tested_skills = Column(JSON, default=dict)  # skill_slug -> {tested: int, correct: int}
    tested_topics = Column(JSON, default=dict)  # topic_id -> {tested: int, correct: int}
    tested_objectives = Column(JSON, default=dict)  # objective_id -> {tested: int, correct: int}

    # Stage 4 Runtime & Attempt Fields
    attempt_number = Column(Integer, default=1)
    session_version = Column(Integer, default=1)
    last_activity_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Pause & Timing State
    paused_at = Column(DateTime, nullable=True)
    total_paused_seconds = Column(Integer, default=0)
    max_pause_seconds = Column(Integer, default=600)
    pause_count = Column(Integer, default=0)
    max_pauses_allowed = Column(Integer, default=2)

    # Navigation & Audit State
    navigation_policy = Column(String(50), default="FREE_NAVIGATION")  # FREE_NAVIGATION, SEQUENTIAL_ONLY, LOCK_AFTER_SUBMISSION
    audit_events = Column(JSON, default=list)  # [{event, timestamp, metadata}]
    result_summary = Column(JSON, nullable=True)  # {raw_score, max_score, percentage, passed, modules, topics, objectives, skills}

    # Stage 5 & 6 Integrity Monitoring Fields
    monitoring_consent = Column(String(50), default="MONITORING_CONSENT_REQUIRED")  # MONITORING_CONSENT_REQUIRED, CONSENT_GRANTED, CONSENT_DENIED, MONITORING_ACTIVE, MONITORING_STOPPED
    monitoring_started_at = Column(DateTime, nullable=True)
    monitoring_ended_at = Column(DateTime, nullable=True)

    # Stage 7 Warning, Escalation & Policy Fields
    integrity_state = Column(String(50), default="NORMAL")  # NORMAL, WARNING, REPEATED_WARNING, ESCALATED, REVIEW_REQUIRED, INVALIDATED
    action_instruction = Column(String(50), default="CONTINUE")  # CONTINUE, SHOW_WARNING, PAUSE_REQUIRED, REQUEST_INTERVENTION, MARK_REVIEW_REQUIRED, INVALIDATE
    warning_count = Column(Integer, default=0)
    last_warning_issued_at = Column(DateTime, nullable=True)
    active_warning = Column(JSON, nullable=True)  # {warning_id, event_type, message, severity, timestamp, acknowledged}
    warning_history = Column(JSON, default=list)  # [{warning_id, event_type, message, severity, timestamp, acknowledged_at}]
    review_status = Column(String(50), default="NOT_APPLICABLE")  # NOT_APPLICABLE, PENDING_REVIEW, UNDER_REVIEW, CLEARED, INVALIDATED

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="sessions")
    profile = relationship("LearnerProfile")
    evidence_records = relationship("AssessmentAttemptEvidence", back_populates="session", cascade="all, delete-orphan")
    integrity_events = relationship("AssessmentIntegrityEvent", back_populates="session", cascade="all, delete-orphan")


class AssessmentAttemptEvidence(Base):
    __tablename__ = "assessment_attempt_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    session_id = Column(String(36), ForeignKey("assessment_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True)

    module_id = Column(String(36), nullable=True)
    topic_id = Column(String(36), nullable=True)
    objective_id = Column(String(36), nullable=True)
    skill_slug = Column(String(100), nullable=True)

    difficulty = Column(String(50), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, default=0.0)
    max_marks = Column(Float, default=2.0)
    time_spent_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("AssessmentSession", back_populates="evidence_records")


class AssessmentIntegrityEvent(Base):
    """
    Structured integrity and presence telemetry record for Stage 5 (Webcam) and Stage 6 (Gadgets).
    Adheres strictly to privacy rules: no raw frames, screenshots, or continuous video.
    """
    __tablename__ = "assessment_integrity_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    session_id = Column(String(36), ForeignKey("assessment_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True, index=True)

    # Event types:
    # Face & Presence: NO_FACE, MULTIPLE_FACES, LOOKING_AWAY, FACE_OUT_OF_FRAME, CAMERA_OFF, PERMISSION_DENIED
    # Gadget & Devices: POSSIBLE_PHONE, POSSIBLE_TABLET, POSSIBLE_SECOND_SCREEN, POSSIBLE_SMART_DEVICE, POSSIBLE_HEADPHONES, POSSIBLE_OTHER_GADGET, POSSIBLE_UNKNOWN_DEVICE
    event_type = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    duration = Column(Float, default=0.0)  # Total accumulated duration in seconds
    confidence = Column(Float, nullable=True)  # Model confidence 0.0 to 1.0, or None if unavailable
    severity = Column(String(20), default="INFO")  # INFO, LOW, MEDIUM, HIGH
    source = Column(String(50), default="BROWSER_CAMERA")  # BROWSER_CAMERA, BROWSER_VISION, LOCAL_INFERENCE, SYSTEM, MANUAL_REVIEW
    metadata_minimized = Column(JSON, default=dict)  # Minimized telemetry (e.g. bounding rect aspect ratio, count)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("AssessmentSession", back_populates="integrity_events")
    profile = relationship("LearnerProfile")


class AssessmentIntegrityPolicy(Base):
    """
    Phase 10 Stage 7: Authoritative policy configuration for integrity warning thresholds,
    cooldown periods, escalation levels, and review/invalidation rules.
    """
    __tablename__ = "assessment_integrity_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    monitoring_required = Column(Boolean, default=True)
    camera_required = Column(Boolean, default=True)
    allowed_warning_count = Column(Integer, default=3)
    warning_cooldown_seconds = Column(Integer, default=30)

    # Per-event thresholds (durations in seconds, confidence minimums)
    event_thresholds = Column(JSON, default=dict)
    # Escalation rules mapping for PRACTICE vs EXAM/FINAL
    escalation_rules = Column(JSON, default=dict)

    review_required_threshold = Column(Integer, default=4)
    invalidation_threshold = Column(Integer, default=0)  # 0 means automated invalidation disabled; >0 triggers invalidation
    auto_pause_on_interruption = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="integrity_policy")


