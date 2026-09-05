import pytest
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.skill import Skill
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.models.assessment import (
    AssessmentBlueprint, Assessment, AssessmentQuestion, AssessmentSession, AssessmentAttemptEvidence
)
from backend.app.assessment.adaptive_selector import AdaptiveQuestionSelector, DIFFICULTY_ORDER
from backend.app.assessment.session_manager import SessionManager
from backend.app.schemas.assessment_blueprint import AnswerSubmitRequest

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("adapt-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_assessment_environment(db, num_topics=3):
    """Sets up a comprehensive course, syllabus, modules, topics, questions across difficulties."""
    slug = f"adapt-course-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title="Adaptive AI and Cloud Systems",
        slug=slug,
        description="Comprehensive course on adaptive systems",
        provider="IIT Madras",
        url=f"https://nptel.ac.in/courses/{slug}",
        resource_type="course",
        difficulty="Intermediate",
        estimated_hours=40.0,
        quality_score=0.95,
        language="English",
        price_type="GENUINELY_FREE",
        verification_status="VERIFIED"
    )
    db.add(res)
    db.flush()

    sk = db.query(Skill).first()
    if sk:
        db.add(ResourceSkill(
            id=str(uuid.uuid4()),
            resource_id=res.id,
            skill_id=sk.id,
            relevance_weight=1.0,
            coverage_level="comprehensive",
            is_primary=True
        ))
        db.flush()

    # Create Syllabus
    syl = CourseSyllabus(
        id=str(uuid.uuid4()),
        course_id=res.id,
        version=1,
        title="Adaptive AI and Cloud Systems Syllabus",
        is_active=True,
        source="INSTITUTION",
        provider="IIT Madras",
        verification_status="VERIFIED"
    )
    db.add(syl)
    db.flush()

    # Create Module
    module = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        order_index=1,
        title="Foundations of Machine Intelligence",
        weight=50.0
    )
    db.add(module)
    db.flush()

    topics = []
    for i in range(num_topics):
        topic = SyllabusTopic(
            id=str(uuid.uuid4()),
            module_id=module.id,
            order_index=i + 1,
            title=f"Core Intelligence Topic {i + 1}",
            difficulty="Intermediate",
            weight=33.3
        )
        db.add(topic)
        db.flush()

        obj = LearningObjective(
            id=str(uuid.uuid4()),
            topic_id=topic.id,
            objective=f"Understand and implement concepts in Topic {i + 1}",
            objective_type="ANALYZE",
            importance="HIGH"
        )
        db.add(obj)
        topics.append(topic)
    db.flush()

    # Create Blueprint
    bp = AssessmentBlueprint(
        id=str(uuid.uuid4()),
        course_id=res.id,
        syllabus_id=syl.id,
        syllabus_version=1,
        title="Adaptive Blueprint",
        total_questions=10,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=60,
        difficulty_distribution={"BEGINNER": 0.3, "INTERMEDIATE": 0.5, "ADVANCED": 0.2},
        question_type_distribution={"MCQ": 0.7, "CODING": 0.3},
        allowed_types=["MCQ", "CODING"],
        status="ACTIVE"
    )
    db.add(bp)
    db.flush()

    # Create Assessment
    assessment = Assessment(
        id=str(uuid.uuid4()),
        course_id=res.id,
        syllabus_id=syl.id,
        syllabus_version=1,
        blueprint_id=bp.id,
        title="Adaptive AI Certification Exam",
        assessment_type="ADAPTIVE",
        total_questions=10,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=60,
        status="ACTIVE"
    )
    db.add(assessment)
    db.flush()

    # Populate questions across difficulties and topics
    questions = []
    diffs = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
    for topic in topics:
        for diff in diffs:
            for q_idx in range(2):
                q = AssessmentQuestion(
                    id=str(uuid.uuid4()),
                    assessment_id=assessment.id,
                    course_id=res.id,
                    syllabus_id=syl.id,
                    module_id=module.id,
                    topic_id=topic.id,
                    question_text=f"Question on {topic.title} at {diff} level (#{q_idx + 1})",
                    question_type="MCQ",
                    difficulty=diff,
                    difficulty_weight=1.0,
                    marks=5.0,
                    options=["Choice A", "Choice B", "Choice C", "Choice D"],
                    correct_option_index=1,
                    correct_answer="Choice B",
                    explanation="Choice B is mathematically sound.",
                    verification_status="VERIFIED"
                )
                db.add(q)
                questions.append(q)
    db.commit()

    # Get learner profile
    profile = db.query(LearnerProfile).first()
    if not profile:
        user = db.query(User).first()
        profile = LearnerProfile(
            id=str(uuid.uuid4()),
            user_id=user.id if user else str(uuid.uuid4())
        )
        db.add(profile)
        db.commit()

    return res, syl, assessment, topics, questions, profile


def test_stage3_01_session_modes_and_timer_initialization(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    session_mgr = SessionManager(test_db)

    # 1. Start session in ADAPTIVE mode
    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")
    assert session.id is not None
    assert session.status == "IN_PROGRESS"
    assert session.mode == "ADAPTIVE"
    assert session.current_difficulty == "INTERMEDIATE"
    assert session.consecutive_correct == 0
    assert session.consecutive_incorrect == 0

    # 2. Authoritative Timer checks
    time_rem = session_mgr.get_time_remaining(session)
    assert 3500 <= time_rem <= 3600  # 60 minutes = 3600 seconds

    # 3. Repeat start returns same active session
    dup_session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")
    assert dup_session.id == session.id


def test_stage3_02_difficulty_step_up_policy(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    session_mgr = SessionManager(test_db)
    selector = AdaptiveQuestionSelector(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")
    assert session.current_difficulty == "INTERMEDIATE"

    # Select initial question
    q1, reason1, trace1 = selector.select_next_question(session)
    assert q1 is not None
    assert q1.difficulty == "INTERMEDIATE"

    # Submit correct answer 1
    resp1 = session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
        question_id=q1.id,
        user_answer="Choice B",
        selected_option_index=1,
        time_spent_seconds=45
    ))
    test_db.refresh(session)
    assert session.answers[q1.id]["is_correct"] is True
    assert session.current_difficulty == "INTERMEDIATE"  # 1 correct does not step up yet

    # Select question 2
    q2, reason2, trace2 = selector.select_next_question(session)
    assert q2 is not None

    # Submit correct answer 2 (2 consecutive correct!)
    resp2 = session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
        question_id=q2.id,
        user_answer="Choice B",
        selected_option_index=1,
        time_spent_seconds=30
    ))
    test_db.refresh(session)
    assert session.answers[q2.id]["is_correct"] is True
    assert session.current_difficulty == "ADVANCED"  # Stepped up!
    assert resp2.adaptation_message is not None

    # Next question should be ADVANCED
    q3, reason3, trace3 = selector.select_next_question(session)
    assert q3 is not None
    assert q3.difficulty == "ADVANCED"
    assert trace3 is not None
    assert "consecutive_performance" in [f.name for f in trace3.factors]


def test_stage3_03_difficulty_step_down_policy(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    session_mgr = SessionManager(test_db)
    selector = AdaptiveQuestionSelector(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")
    assert session.current_difficulty == "INTERMEDIATE"

    # Select initial question
    q1, _, _ = selector.select_next_question(session)

    # Submit WRONG answer 1
    resp1 = session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
        question_id=q1.id,
        user_answer="Wrong Choice",
        selected_option_index=0,
        time_spent_seconds=20
    ))
    test_db.refresh(session)
    assert session.answers[q1.id]["is_correct"] is False
    assert session.current_difficulty == "INTERMEDIATE"

    # Select question 2
    q2, _, _ = selector.select_next_question(session)

    # Submit WRONG answer 2 (2 consecutive incorrect!)
    resp2 = session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
        question_id=q2.id,
        user_answer="Wrong Choice",
        selected_option_index=0,
        time_spent_seconds=25
    ))
    test_db.refresh(session)
    assert session.answers[q2.id]["is_correct"] is False
    assert session.current_difficulty == "BEGINNER"  # Stepped down!
    assert resp2.adaptation_message is not None

    # Next question should be BEGINNER
    q3, reason3, trace3 = selector.select_next_question(session)
    assert q3 is not None
    assert q3.difficulty == "BEGINNER"


def test_stage3_04_diagnostic_mode_topic_scanning(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db, num_topics=3)
    session_mgr = SessionManager(test_db)
    selector = AdaptiveQuestionSelector(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="DIAGNOSTIC")
    assert session.mode == "DIAGNOSTIC"

    # In DIAGNOSTIC mode, question selection scans untested topics
    presented_topics = []
    for step in range(len(topics)):
        q, reason, trace = selector.select_next_question(session)
        assert q is not None
        assert "Diagnostic scan prioritizing untested topic" in reason
        assert q.topic_id not in presented_topics
        presented_topics.append(q.topic_id)

        # Submit answer to record topic tested
        session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
            question_id=q.id,
            user_answer="Choice B",
            selected_option_index=1,
            time_spent_seconds=30
        ))
        test_db.refresh(session)

    assert len(presented_topics) == len(topics)


def test_stage3_05_prerequisite_fallback_and_fairness_cap(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    selector = AdaptiveQuestionSelector(test_db)
    session_mgr = SessionManager(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")

    # Simulate answering 3 questions on topic 0
    t0 = topics[0]
    session.tested_topics = {t0.id: {"tested": 3, "correct": 2, "incorrect": 1}}
    test_db.commit()

    # The selector topic cap should kick in (cap at 3) and select from available topics (not t0)
    target_topic, is_prereq, reason = selector._select_target_topic(session, assessment, profile)
    assert target_topic.id != t0.id


def test_stage3_06_authoritative_timer_expiration_enforcement(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    session_mgr = SessionManager(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")
    q = questions[0]

    # Force session expiry by manipulating expires_at
    session.expires_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    test_db.commit()

    # Time remaining must be 0
    assert session_mgr.get_time_remaining(session) == 0

    # Answer submission must be rejected
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
            question_id=q.id,
            user_answer="Choice B",
            selected_option_index=1,
            time_spent_seconds=10
        ))
    assert exc_info.value.status_code == 400
    assert "expired" in exc_info.value.detail.lower()


def test_stage3_07_idor_protection_and_answer_secrecy(test_db):
    auth_headers = get_demo_auth()
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)

    # 1. Start session via API
    start_res = client.post(
        f"/api/v1/assessments/{assessment.id}/sessions",
        json={"mode": "ADAPTIVE"},
        headers=auth_headers
    )
    assert start_res.status_code == 200
    session_id = start_res.json()["id"]

    # 2. Test Learner View Answer Redaction via API next question
    api_res = client.get(f"/api/v1/assessments/sessions/{session_id}/next", headers=auth_headers)
    assert api_res.status_code == 200
    data = api_res.json()
    if data.get("question"):
        q_data = data["question"]
        assert "correct_answer" not in q_data
        assert "correct_option_index" not in q_data
        assert "explanation" not in q_data
        assert "test_cases" not in q_data

    # 3. Test IDOR protection: Another user cannot submit to someone else's session
    session_mgr = SessionManager(test_db)
    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")

    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        session_mgr.submit_answer(session.id, "unauthorized-different-profile-id", AnswerSubmitRequest(
            question_id=questions[0].id,
            user_answer="Choice B",
            selected_option_index=1,
            time_spent_seconds=15
        ))
    assert exc_info.value.status_code == 404  # Not found for this profile


def test_stage3_08_immutable_attempt_evidence_and_progress_tracking(test_db):
    res, syl, assessment, topics, questions, profile = setup_assessment_environment(test_db)
    session_mgr = SessionManager(test_db)
    selector = AdaptiveQuestionSelector(test_db)

    session = session_mgr.start_session(assessment.id, profile.id, mode="ADAPTIVE")

    # Pick question and submit
    q, _, _ = selector.select_next_question(session)
    resp = session_mgr.submit_answer(session.id, profile.id, AnswerSubmitRequest(
        question_id=q.id,
        user_answer="Choice B",
        selected_option_index=1,
        time_spent_seconds=50
    ))

    # Verify attempt evidence persisted
    evidence = test_db.query(AssessmentAttemptEvidence).filter(
        AssessmentAttemptEvidence.session_id == session.id,
        AssessmentAttemptEvidence.question_id == q.id
    ).first()

    assert evidence is not None
    assert evidence.is_correct is True
    assert evidence.score == q.marks
    assert evidence.time_spent_seconds == 50
    assert evidence.difficulty == q.difficulty

    # Verify session scoring progress
    test_db.refresh(session)
    assert session.total_score == q.marks
    assert session.total_max_marks == q.marks
    assert len(session.selected_question_ids) == 1
