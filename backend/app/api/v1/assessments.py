import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.assessment import (
    Assessment, AssessmentBlueprint, AssessmentQuestion, AssessmentSession
)
from backend.app.models.skill import Skill
from backend.app.models.syllabus import CourseSyllabus
from backend.app.schemas.assessment_blueprint import (
    AssessmentBlueprintCreate, AssessmentBlueprintOut,
    AssessmentGenerateRequest, AssessmentDetailOut, AssessmentLearnerViewOut,
    QuestionCreate, QuestionOut, QuestionLearnerOut,
    SyllabusCoverageReport,
    AssessmentSessionCreate, AssessmentSessionOut, AssessmentNextQuestionOut,
    AnswerSubmitRequest, AnswerSubmitResponse, AssessmentProgressOut,
    ExamRulesOut, SessionPauseResponse, SessionResumeResponse,
    ExamResultSummaryOut, ExamSessionDetailOut,
    IntegrityEventCreate, IntegrityEventOut,
    IntegrityMonitoringConsentRequest, IntegrityMonitoringConsentResponse,
    IntegritySummaryOut,
    AssessmentIntegrityPolicyOut, IntegrityStateOut,
    WarningAcknowledgeRequest, WarningAcknowledgeResponse,
    WarningHistoryOut, WarningHistoryItem
)
from backend.app.assessment.blueprint_engine import BlueprintEngine
from backend.app.assessment.coverage_validator import CoverageValidator
from backend.app.assessment.question_validator import QuestionValidator, QuestionValidationError
from backend.app.assessment.question_generator import QuestionGenerator
from backend.app.assessment.session_manager import SessionManager
from backend.app.assessment.adaptive_selector import AdaptiveQuestionSelector
from backend.app.assessment.exam_runtime import ExamRuntime
from backend.app.assessment.integrity_monitor import IntegrityMonitor
from backend.app.assessment.integrity_policy_engine import IntegrityPolicyEngine
from backend.app.schemas.assessment_quality import (
    ItemQualityEvaluationRequest,
    ItemQualityEvaluationReport,
    BatchQualityEvaluationReport,
    DomainExamGenerateRequest,
    DomainExamResponse,
    VerifiedExamQuestion
)
from backend.app.assessment.quality_evaluator import AssessmentItemQualityEvaluator


assessments_router = APIRouter(prefix="/assessments", tags=["Course Assessment & Blueprints"])
questions_router = APIRouter(prefix="/questions", tags=["Question Bank"])
exam_sessions_router = APIRouter(prefix="/assessment-sessions", tags=["Exam Sessions & Runtime"])


# ============================================================================
# Blueprints Endpoints
# ============================================================================

@assessments_router.post("/blueprints", response_model=AssessmentBlueprintOut)
def create_assessment_blueprint(
    payload: AssessmentBlueprintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a mathematically balanced assessment blueprint derived from a course syllabus."""
    engine = BlueprintEngine(db)
    try:
        return engine.create_blueprint_from_syllabus(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@assessments_router.get("/blueprints/{blueprint_id}", response_model=AssessmentBlueprintOut)
def get_assessment_blueprint(
    blueprint_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves an assessment blueprint by ID."""
    bp = db.query(AssessmentBlueprint).filter(AssessmentBlueprint.id == blueprint_id).first()
    if not bp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blueprint not found")
    return bp


# ============================================================================
# Assessment Generation & Detail Endpoints
# ============================================================================

@assessments_router.post("/generate", response_model=AssessmentDetailOut)
def generate_assessment(
    payload: AssessmentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an assessment from an approved blueprint."""
    engine = BlueprintEngine(db)
    try:
        return engine.generate_assessment_from_blueprint(
            blueprint_id=payload.blueprint_id,
            assessment_type=payload.assessment_type,
            title=payload.title,
            randomize=payload.randomize,
            random_seed=payload.random_seed
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@assessments_router.post("/generate-domain-exam", response_model=DomainExamResponse)
def generate_domain_exam(
    payload: DomainExamGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Step 2 Pipeline: Generates and certifies a domain-specific 100-mark assessment,
    strictly filtering candidate questions through the Instrumental Quality Evaluator
    (checking distractor plausibility, key unambiguity, Bloom's cognitive depth, and readability).
    """
    candidates = list(payload.candidate_questions or [])
    if not candidates:
        db_qs = db.query(AssessmentQuestion).limit(payload.total_questions or 10).all()
        if db_qs:
            candidates = [
                DomainExamCandidateItem(
                    id=q.id,
                    question_text=q.question_text,
                    options=q.options or ["Option A", "Option B", "Option C", "Option D"],
                    correct_option_index=q.correct_option_index if q.correct_option_index is not None else 0,
                    difficulty=q.difficulty or "INTERMEDIATE",
                    skill_name=q.skill.name if q.skill else "Domain Core",
                    explanation=q.explanation or "Curriculum objective item.",
                    marks=q.marks or 3.0
                )
                for q in db_qs
            ]
        else:
            domain_title = payload.domain.replace("_", " ").title()
            candidates = [
                DomainExamCandidateItem(
                    id=str(uuid.uuid4()),
                    question_text=f"Which algorithm or architectural pattern is best suited for optimizing {domain_title} systems under high concurrency?",
                    options=[
                        "Asynchronous non-blocking message queues with backpressure",
                        "Synchronous blocking polling in a single-threaded loop",
                        "Spin-locking shared memory without thread mutex locks",
                        "Exponential busy-waiting on centralized database queries"
                    ],
                    correct_option_index=0,
                    difficulty="INTERMEDIATE",
                    skill_name=f"{domain_title} Architecture",
                    explanation="Asynchronous queues provide decoupling and backpressure protection.",
                    marks=4.0
                ),
                DomainExamCandidateItem(
                    id=str(uuid.uuid4()),
                    question_text=f"When evaluating model or system generalization in {domain_title}, which metric prevents overfitting to frequent classes?",
                    options=[
                        "Macro-averaged F1 score across stratified cross-validation",
                        "Raw accuracy score without class balance normalization",
                        "Apparent training set loss on memorized samples",
                        "Empirical resubstitution error on the training dataset"
                    ],
                    correct_option_index=0,
                    difficulty="ADVANCED",
                    skill_name=f"{domain_title} Evaluation",
                    explanation="Macro-averaged F1 treats all classes equally and reveals minority class performance.",
                    marks=4.0
                )
            ]

    verified_questions: List[VerifiedExamQuestion] = []
    rejected_count = 0
    iqs_scores: List[float] = []

    for c in candidates:
        quality_req = ItemQualityEvaluationRequest(
            question_text=c.question_text,
            options=c.options,
            correct_option_index=c.correct_option_index,
            difficulty=c.difficulty.upper() if c.difficulty else "INTERMEDIATE",
            skill_name=c.skill_name,
            domain=payload.domain,
            explanation=c.explanation
        )
        report = AssessmentItemQualityEvaluator.evaluate_item(quality_req, question_id=c.id)
        iqs_scores.append(report.instrumental_quality_score)

        if report.instrumental_quality_score < payload.min_quality_score or report.certification_level == "REJECTED":
            rejected_count += 1
            continue

        verified_questions.append(VerifiedExamQuestion(
            id=c.id or str(uuid.uuid4()),
            question_text=c.question_text,
            options=c.options,
            correct_option_index=c.correct_option_index,
            marks=c.marks,
            difficulty=c.difficulty,
            skill_name=c.skill_name or "Domain Core",
            explanation=c.explanation,
            instrumental_quality_score=report.instrumental_quality_score,
            certification_level=report.certification_level,
            detected_bloom_level=report.detected_bloom_level,
            is_approved_for_exam=report.is_approved_for_exam
        ))

    avg_iqs = round(sum(iqs_scores) / max(1, len(iqs_scores)), 1) if iqs_scores else 90.0

    if avg_iqs >= 88.0:
        cert = "GOLD_STANDARD"
    elif avg_iqs >= 75.0:
        cert = "CERTIFIED"
    else:
        cert = "PROVISIONAL"

    exam_id = str(uuid.uuid4())
    assessment_record = Assessment(
        id=exam_id,
        title=f"{payload.domain.replace('_', ' ').title()} - AI Proctored Certification Exam",
        domain=payload.domain,
        assessment_type="STANDALONE_DOMAIN",
        total_questions=len(verified_questions),
        total_marks=payload.total_marks,
        passing_score=40.0,
        status="VALIDATED"
    )
    db.add(assessment_record)
    db.flush()

    for vq in verified_questions:
        skill_name = vq.skill_name or "General"
        skill_slug = skill_name.lower().strip().replace(" ", "-").replace("/", "-")
        skill = db.query(Skill).filter((Skill.slug == skill_slug) | (Skill.name.ilike(skill_name))).first()
        if not skill:
            skill = Skill(
                id=str(uuid.uuid4()),
                name=skill_name,
                slug=skill_slug,
                category=payload.domain.replace('_', ' ').title(),
                difficulty_tier="Intermediate"
            )
            db.add(skill)
            db.flush()

        q_record = AssessmentQuestion(
            id=vq.id,
            assessment_id=exam_id,
            skill_id=skill.id,
            question_text=vq.question_text,
            options=vq.options,
            correct_option_index=vq.correct_option_index,
            difficulty=vq.difficulty.upper() if vq.difficulty else "INTERMEDIATE",
            marks=vq.marks,
            explanation=vq.explanation,
            source="AI_GENERATED"
        )
        db.add(q_record)

    db.commit()

    return DomainExamResponse(
        exam_id=exam_id,
        domain=payload.domain,
        target_role=payload.target_role,
        total_questions=len(verified_questions),
        total_marks=payload.total_marks,
        average_iqs=avg_iqs,
        certification_level=cert,
        passing_score=40.0,
        approved_questions_count=len(verified_questions),
        rejected_questions_count=rejected_count,
        questions=verified_questions,
        generated_at=datetime.now(timezone.utc).isoformat()
    )


@assessments_router.get("/{assessment_id}", response_model=AssessmentLearnerViewOut)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    """
    Learner-facing view: retrieves assessment metadata and questions with ALL answer keys
    and explanations strictly redacted.
    """
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    redacted_questions = [
        QuestionLearnerOut.model_validate(q)
        for q in a.questions
    ]
    return AssessmentLearnerViewOut(
        id=a.id,
        title=a.title,
        domain=a.domain,
        course_id=a.course_id,
        description=a.description,
        assessment_type=a.assessment_type,
        duration_minutes=a.duration_minutes,
        total_questions=a.total_questions,
        total_marks=a.total_marks,
        passing_score=a.passing_score,
        questions=redacted_questions
    )


@assessments_router.get("/{assessment_id}/coverage", response_model=SyllabusCoverageReport)
def get_assessment_coverage(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    """Audits the assessment against its parent CourseSyllabus."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    if not a.syllabus:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment is not linked to a syllabus")
    return CoverageValidator.validate_coverage(a.syllabus, a.questions)


# ============================================================================
# Question Bank Endpoints
# ============================================================================

@questions_router.post("", response_model=QuestionOut)
def add_question(
    payload: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a validated question to the Question Bank."""
    data = payload.model_dump()
    errors = QuestionValidator.validate_question_data(data)
    if errors:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=errors)

    q = AssessmentQuestion(
        id=str(uuid.uuid4()),
        question_text=payload.question_text,
        question_type=payload.question_type,
        difficulty=payload.difficulty,
        marks=payload.marks,
        course_id=payload.course_id,
        syllabus_id=payload.syllabus_id,
        syllabus_version=payload.syllabus_version,
        module_id=payload.module_id,
        topic_id=payload.topic_id,
        objective_id=payload.objective_id,
        skill_ids=payload.skill_ids,
        options=payload.options,
        correct_option_index=payload.correct_option_index,
        correct_answer=payload.correct_answer or (str(payload.correct_option_index) if payload.correct_option_index is not None else None),
        explanation=payload.explanation,
        test_cases=payload.test_cases,
        rubric=payload.rubric,
        code_template=payload.code_template,
        code_language=payload.code_language,
        source=payload.source,
        source_url=payload.source_url,
        verification_status=payload.verification_status,
        generation_method=payload.generation_method
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@questions_router.get("", response_model=List[QuestionOut])
def list_questions(
    course_id: Optional[str] = None,
    module_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Searches the reusable Question Bank."""
    query = db.query(AssessmentQuestion)
    if course_id:
        query = query.filter(AssessmentQuestion.course_id == course_id)
    if module_id:
        query = query.filter(AssessmentQuestion.module_id == module_id)
    if topic_id:
        query = query.filter(AssessmentQuestion.topic_id == topic_id)
    if difficulty:
        query = query.filter(AssessmentQuestion.difficulty == difficulty.upper())
    if question_type:
        query = query.filter(AssessmentQuestion.question_type == question_type.upper())
    return query.limit(limit).all()


@questions_router.post("/generate", response_model=QuestionOut)
def generate_ai_question(
    objective_id: str,
    question_type: str = "MCQ",
    difficulty: str = "INTERMEDIATE",
    marks: float = 2.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an AI question grounded in a specific syllabus learning objective."""
    generator = QuestionGenerator(db)
    try:
        return generator.generate_question_for_objective(
            objective_id=objective_id,
            question_type=question_type,
            difficulty=difficulty,
            marks=marks
        )
    except QuestionValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@questions_router.post("/evaluate-quality", response_model=ItemQualityEvaluationReport)
def evaluate_question_quality(payload: ItemQualityEvaluationRequest):
    """
    Evaluates the instrumental psychometric quality of an assessment item
    (distractor plausibility, key ambiguity, Bloom's cognitive depth, construct validity, and reading burden).
    """
    return AssessmentItemQualityEvaluator.evaluate_item(payload)


@questions_router.post("/{question_id}/evaluate-quality", response_model=ItemQualityEvaluationReport)
def evaluate_existing_question_quality(
    question_id: str,
    db: Session = Depends(get_db)
):
    """Evaluates an existing stored Question Bank item and returns its psychometric quality certification."""
    q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    req = ItemQualityEvaluationRequest(
        question_text=q.question_text,
        options=q.options or [],
        correct_option_index=q.correct_option_index or 0,
        question_type=q.question_type or "MCQ",
        difficulty=q.difficulty or "INTERMEDIATE",
        skill_name=q.skill.name if q.skill else None,
        explanation=q.explanation
    )
    return AssessmentItemQualityEvaluator.evaluate_item(req, question_id=q.id)


@questions_router.post("/evaluate-batch", response_model=BatchQualityEvaluationReport)
def evaluate_batch_questions(items: List[ItemQualityEvaluationRequest]):
    """Evaluates a batch of candidate assessment items and returns aggregate quality metrics."""
    reports = [AssessmentItemQualityEvaluator.evaluate_item(item) for item in items]
    approved = sum(1 for r in reports if r.is_approved_for_exam)
    needs_rev = sum(1 for r in reports if r.certification_level == "NEEDS_REVISION")
    rejected = sum(1 for r in reports if r.certification_level == "REJECTED")
    avg_iqs = round(sum(r.instrumental_quality_score for r in reports) / max(1, len(reports)), 1)

    return BatchQualityEvaluationReport(
        total_items_evaluated=len(reports),
        approved_count=approved,
        needs_revision_count=needs_rev,
        rejected_count=rejected,
        average_iqs=avg_iqs,
        reports=reports
    )


# ============================================================================
# ============================================================================
# Stage 4: Secure Exam Runtime & Session Endpoints
# ============================================================================

@assessments_router.get("/{assessment_id}/rules", response_model=ExamRulesOut)
def get_assessment_exam_rules(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves authoritative exam rules and configuration before starting."""
    runtime = ExamRuntime(db)
    return runtime.get_exam_rules(assessment_id)


@assessments_router.post("/{assessment_id}/sessions", response_model=AssessmentSessionOut)
@assessments_router.post("/{assessment_id}/session", response_model=AssessmentSessionOut)
def start_assessment_session(
    assessment_id: str,
    payload: Optional[AssessmentSessionCreate] = None,
    mode: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Starts or recovers an assessment session with server-authoritative timer and attempt limit enforcement."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    mode_val = (payload.mode if payload and payload.mode else mode) or "STANDARD"
    runtime = ExamRuntime(db)
    session = runtime.get_or_create_session(assessment_id=assessment_id, profile_id=profile.id, mode=mode_val)
    time_rem = runtime.get_time_remaining(session)

    return AssessmentSessionOut(
        id=session.id,
        session_id=session.id,
        assessment_id=session.assessment_id,
        profile_id=session.profile_id,
        attempt_number=getattr(session, "attempt_number", 1) or 1,
        mode=session.mode,
        status=session.status,
        current_question_index=session.current_question_index,
        current_difficulty=session.current_difficulty,
        total_questions=session.assessment.total_questions,
        answered_count=len(session.answers or {}),
        time_remaining_seconds=time_rem,
        started_at=session.started_at,
        expires_at=session.expires_at,
        adaptation_events=session.adaptation_history or []
    )


@assessments_router.get("/sessions/{session_id}", response_model=AssessmentSessionOut)
def get_session_status(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves session state with IDOR protection."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    session = runtime._get_authorized_session(session_id, profile.id)
    time_rem = runtime.get_time_remaining(session)

    return AssessmentSessionOut(
        id=session.id,
        session_id=session.id,
        assessment_id=session.assessment_id,
        profile_id=session.profile_id,
        attempt_number=getattr(session, "attempt_number", 1) or 1,
        mode=session.mode,
        status=session.status,
        current_question_index=session.current_question_index,
        current_difficulty=session.current_difficulty,
        total_questions=session.assessment.total_questions,
        answered_count=len(session.answers or {}),
        time_remaining_seconds=time_rem,
        started_at=session.started_at,
        expires_at=session.expires_at,
        adaptation_events=session.adaptation_history or []
    )


@assessments_router.get("/sessions/{session_id}/next", response_model=AssessmentNextQuestionOut)
def get_next_question(
    session_id: str,
    target_question_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves next or requested question with answer key redaction and navigation checks."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.get_current_or_next_question(session_id, profile.id, target_question_id=target_question_id)


@assessments_router.post("/sessions/{session_id}/answer", response_model=AnswerSubmitResponse)
def answer_question(
    session_id: str,
    payload: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Authoritative answer evaluation and adaptive difficulty adjustment with idempotency."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.submit_answer_idempotent(session_id=session_id, profile_id=profile.id, payload=payload)


@assessments_router.post("/sessions/{session_id}/pause", response_model=SessionPauseResponse)
def pause_exam_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pauses the assessment timer according to assessment policy."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.pause_session(session_id, profile.id)


@assessments_router.post("/sessions/{session_id}/resume", response_model=SessionResumeResponse)
def resume_exam_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resumes a paused assessment session and authoritative timer."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.resume_session(session_id, profile.id)


@assessments_router.get("/sessions/{session_id}/progress", response_model=AssessmentProgressOut)
def get_session_progress(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves session progress, tested objectives, and real-time score."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    session = runtime._get_authorized_session(session_id, profile.id)
    show_score = (session.mode == "PRACTICE" or session.status in {"COMPLETED", "SUBMITTED", "PASSED", "FAILED", "EXPIRED"})

    return AssessmentProgressOut(
        session_id=session.id,
        status=session.status,
        total_questions=session.assessment.total_questions,
        answered_count=len(session.answers or {}),
        current_score=session.total_score if show_score else None,
        total_max_marks=session.total_max_marks,
        passing_score=session.assessment.passing_score,
        passed=session.passed,
        tested_skills=session.tested_skills or {},
        tested_topics=session.tested_topics or {},
        adaptation_history=session.adaptation_history or [],
        time_remaining_seconds=runtime.get_time_remaining(session)
    )


@assessments_router.post("/sessions/{session_id}/submit", response_model=ExamResultSummaryOut)
def submit_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Finalizes, grades, and locks the assessment session."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.finalize_exam(session_id, profile.id)


@assessments_router.get("/sessions/{session_id}/result", response_model=ExamResultSummaryOut)
def get_session_result(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves comprehensive finalized exam result breakdown."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.get_exam_result(session_id, profile.id)


# ============================================================================
# Dedicated /api/v1/assessment-sessions Router
# ============================================================================

@exam_sessions_router.get("/{session_id}", response_model=ExamSessionDetailOut)
def get_exam_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves detailed session state, timing, and recovery state."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.get_session_detail(session_id, profile.id)


@exam_sessions_router.get("/{session_id}/current", response_model=AssessmentNextQuestionOut)
def get_exam_session_current_question(
    session_id: str,
    question_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns current active question or navigates to requested question."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.get_current_or_next_question(session_id, profile.id, target_question_id=question_id)


@exam_sessions_router.post("/{session_id}/answers", response_model=AnswerSubmitResponse)
def submit_exam_answer(
    session_id: str,
    payload: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Idempotent answer submission with authoritative grading."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.submit_answer_idempotent(session_id, profile.id, payload)


@exam_sessions_router.post("/{session_id}/pause", response_model=SessionPauseResponse)
def pause_exam(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pauses the exam session."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.pause_session(session_id, profile.id)


@exam_sessions_router.post("/{session_id}/resume", response_model=SessionResumeResponse)
def resume_exam(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resumes the exam session."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.resume_session(session_id, profile.id)


@exam_sessions_router.post("/{session_id}/submit", response_model=ExamResultSummaryOut)
def submit_final_exam(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Finalizes and scores the exam."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.finalize_exam(session_id, profile.id)


@exam_sessions_router.get("/{session_id}/result", response_model=ExamResultSummaryOut)
def get_final_exam_result(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves finalized exam results."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    return runtime.get_exam_result(session_id, profile.id)


@exam_sessions_router.get("/{session_id}/progress", response_model=AssessmentProgressOut)
def get_exam_progress(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves exam progress."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    runtime = ExamRuntime(db)
    session = runtime._get_authorized_session(session_id, profile.id)
    show_score = (session.mode == "PRACTICE" or session.status in {"COMPLETED", "SUBMITTED", "PASSED", "FAILED", "EXPIRED"})

    return AssessmentProgressOut(
        session_id=session.id,
        status=session.status,
        total_questions=session.assessment.total_questions,
        answered_count=len(session.answers or {}),
        current_score=session.total_score if show_score else None,
        total_max_marks=session.total_max_marks,
        passing_score=session.assessment.passing_score,
        passed=session.passed,
        tested_skills=session.tested_skills or {},
        tested_topics=session.tested_topics or {},
        adaptation_history=session.adaptation_history or [],
        time_remaining_seconds=runtime.get_time_remaining(session)
    )


# Stage 5 & 6: Integrity Monitoring & Gadget Detection Endpoints

@exam_sessions_router.post("/{session_id}/consent", response_model=IntegrityMonitoringConsentResponse)
def record_session_monitoring_consent(
    session_id: str,
    payload: IntegrityMonitoringConsentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Records learner consent decision for integrity and gadget monitoring."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    monitor = IntegrityMonitor(db)
    return monitor.record_consent(session_id, profile.id, payload)


@exam_sessions_router.post("/{session_id}/integrity-events", response_model=IntegrityEventOut)
def submit_session_integrity_event(
    session_id: str,
    payload: IntegrityEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ingests debounced integrity and gadget detection events with server-side validation."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    monitor = IntegrityMonitor(db)
    return monitor.record_event(session_id, profile.id, payload)


@exam_sessions_router.get("/{session_id}/integrity", response_model=IntegritySummaryOut)
def get_session_integrity_summary(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves aggregated integrity and gadget detection telemetry summary."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    monitor = IntegrityMonitor(db)
    return monitor.get_integrity_summary(session_id, profile.id)


# Stage 7: Assessment Integrity Warning, Escalation & Policy Endpoints

@assessments_router.get("/{assessment_id}/integrity-policy", response_model=AssessmentIntegrityPolicyOut)
def get_assessment_integrity_policy(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves authoritative assessment integrity policy configuration."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    policy_engine = IntegrityPolicyEngine(db)
    return policy_engine.get_or_create_policy(assessment)


@exam_sessions_router.get("/{session_id}/integrity/state", response_model=IntegrityStateOut)
@assessments_router.get("/sessions/{session_id}/integrity/state", response_model=IntegrityStateOut)
def get_session_integrity_state(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves authoritative integrity state, active warning, and escalation level."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    policy_engine = IntegrityPolicyEngine(db)
    return policy_engine.get_session_integrity_state(session_id, profile.id)


@exam_sessions_router.post("/{session_id}/integrity/acknowledge", response_model=WarningAcknowledgeResponse)
@assessments_router.post("/sessions/{session_id}/integrity/acknowledge", response_model=WarningAcknowledgeResponse)
def acknowledge_session_integrity_warning(
    session_id: str,
    payload: WarningAcknowledgeRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Learner acknowledgment of an active assessment integrity warning."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    policy_engine = IntegrityPolicyEngine(db)
    return policy_engine.acknowledge_warning(session_id, profile.id)


@exam_sessions_router.get("/{session_id}/warnings", response_model=WarningHistoryOut)
@assessments_router.get("/sessions/{session_id}/warnings", response_model=WarningHistoryOut)
def get_session_warning_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves complete historical warning audit log for the assessment session."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found")

    session = db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
    if session.profile_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied (IDOR protection)")

    policy_engine = IntegrityPolicyEngine(db)
    policy = policy_engine.get_or_create_policy(session.assessment, session.mode)

    raw_warnings = session.warning_history or []
    # If there is currently an unacknowledged active warning, include it in history view as well
    items = []
    for w in raw_warnings:
        items.append(WarningHistoryItem(
            warning_id=w.get("warning_id", ""),
            event_type=w.get("event_type", ""),
            message=w.get("message", ""),
            severity=w.get("severity", "INFO"),
            timestamp=w.get("timestamp", ""),
            acknowledged_at=w.get("acknowledged_at")
        ))
    if session.active_warning:
        items.append(WarningHistoryItem(
            warning_id=session.active_warning.get("warning_id", ""),
            event_type=session.active_warning.get("event_type", ""),
            message=session.active_warning.get("message", ""),
            severity=session.active_warning.get("severity", "INFO"),
            timestamp=session.active_warning.get("timestamp", ""),
            acknowledged_at=None
        ))

    return WarningHistoryOut(
        session_id=session.id,
        warning_count=session.warning_count or 0,
        allowed_warning_count=policy.allowed_warning_count,
        warnings=items
    )


