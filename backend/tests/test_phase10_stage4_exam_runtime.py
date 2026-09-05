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
from backend.app.assessment.exam_runtime import ExamRuntime
from backend.app.schemas.assessment_blueprint import AnswerSubmitRequest

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("exam-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_exam_environment(
    db,
    domain="AI_ML",
    attempt_limit=3,
    allowed_pause=True,
    max_pauses=2,
    max_pause_seconds=300,
    navigation_policy="FREE_NAVIGATION",
    duration_minutes=30
):
    """Sets up course, syllabus, modules, topics, questions, blueprint, and assessment."""
    slug = f"exam-course-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title=f"Secure Exam Course in {domain}",
        slug=slug,
        description="Comprehensive course for secure assessment runtime",
        provider="IIT Madras",
        url=f"https://nptel.ac.in/courses/{slug}",
        resource_type="course",
        difficulty="Intermediate",
        estimated_hours=30.0,
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

    syl = CourseSyllabus(
        id=str(uuid.uuid4()),
        course_id=res.id,
        version=1,
        title=f"{domain} Master Syllabus",
        is_active=True,
        source="INSTITUTION",
        provider="IIT Madras",
        verification_status="VERIFIED"
    )
    db.add(syl)
    db.flush()

    module = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        order_index=1,
        title=f"Foundations of {domain}",
        weight=100.0
    )
    db.add(module)
    db.flush()

    topic = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=module.id,
        order_index=1,
        title=f"Core Algorithms in {domain}",
        difficulty="Intermediate",
        weight=100.0
    )
    db.add(topic)
    db.flush()

    obj = LearningObjective(
        id=str(uuid.uuid4()),
        topic_id=topic.id,
        objective=f"Analyze and design algorithms in {domain}",
        objective_type="APPLY",
        importance="HIGH"
    )
    db.add(obj)
    db.flush()

    bp = AssessmentBlueprint(
        id=str(uuid.uuid4()),
        course_id=res.id,
        syllabus_id=syl.id,
        syllabus_version=1,
        title=f"{domain} Blueprint",
        total_questions=5,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=duration_minutes,
        difficulty_distribution={"BEGINNER": 0.4, "INTERMEDIATE": 0.6},
        question_type_distribution={"MCQ": 1.0},
        allowed_types=["MCQ"],
        status="ACTIVE"
    )
    db.add(bp)
    db.flush()

    assessment = Assessment(
        id=str(uuid.uuid4()),
        course_id=res.id,
        syllabus_id=syl.id,
        syllabus_version=1,
        blueprint_id=bp.id,
        title=f"{domain} Secure Exam Certification",
        domain=domain,
        assessment_type="EXAM",
        total_questions=5,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=duration_minutes,
        attempt_limit=attempt_limit,
        allowed_pause=allowed_pause,
        max_pause_seconds=max_pause_seconds,
        max_pauses_allowed=max_pauses,
        navigation_policy=navigation_policy,
        submission_policy="AUTO_SUBMIT_ON_EXPIRE",
        status="ACTIVE"
    )
    db.add(assessment)
    db.flush()

    questions = []
    for i in range(5):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            course_id=res.id,
            syllabus_id=syl.id,
            module_id=module.id,
            topic_id=topic.id,
            objective_id=obj.id,
            question_text=f"Question {i + 1}: What is the core theorem in {domain}?",
            question_type="MCQ",
            difficulty="INTERMEDIATE" if i >= 2 else "BEGINNER",
            difficulty_weight=1.0,
            marks=10.0,
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_option_index=1,
            correct_answer="Option B",
            explanation="Option B is the authoritative theorem answer.",
            verification_status="VERIFIED"
        )
        db.add(q)
        questions.append(q)

    db.commit()

    profile = db.query(LearnerProfile).join(User).filter(User.email == "alex@pathfinder.demo").first()
    if not profile:
        user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email="alex@pathfinder.demo",
                full_name="Alex Mercer",
                hashed_password="mockpassword",
                is_demo=True
            )
            db.add(user)
            db.flush()
        profile = LearnerProfile(
            id=str(uuid.uuid4()),
            user_id=user.id
        )
        db.add(profile)
        db.commit()

    return res, syl, module, topic, obj, assessment, questions, profile


def test_stage4_01_exam_rules_and_session_creation(test_db):
    """Test retrieving authoritative exam rules and starting a secure session."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, questions, profile = setup_exam_environment(test_db)

    # 1. Get Exam Rules via API
    res_rules = client.get(f"/api/v1/assessments/{assessment.id}/rules", headers=headers)
    assert res_rules.status_code == 200, res_rules.text
    rules = res_rules.json()
    assert rules["assessment_id"] == assessment.id
    assert rules["duration_minutes"] == 30
    assert rules["total_questions"] == 5
    assert rules["attempt_limit"] == 3
    assert rules["allowed_pause"] is True
    assert rules["navigation_policy"] == "FREE_NAVIGATION"

    # 2. Start Secure Exam Session via API
    res_session = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res_session.status_code == 200, res_session.text
    sess_data = res_session.json()
    session_id = sess_data["session_id"]
    assert session_id is not None
    assert sess_data["status"] == "IN_PROGRESS"
    assert sess_data["attempt_number"] == 1
    assert sess_data["time_remaining_seconds"] > 0
    assert sess_data["time_remaining_seconds"] <= 30 * 60

    # 3. Verify session in DB
    session = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    assert session is not None
    assert session.started_at is not None
    assert session.expires_at is not None
    assert session.session_version == 1
    audit = session.audit_events or []
    assert any(ev.get("event_type") == "SESSION_CREATED" for ev in audit)


def test_stage4_02_attempt_limit_enforcement(test_db):
    """Test strict transaction-safe attempt limit enforcement (e.g. limit=2)."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, _, profile = setup_exam_environment(test_db, attempt_limit=2)

    # Attempt 1
    res1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res1.status_code == 200
    sess1_id = res1.json()["session_id"]
    client.post(f"/api/v1/assessment-sessions/{sess1_id}/submit", headers=headers)

    # Attempt 2
    res2 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res2.status_code == 200
    sess2_id = res2.json()["session_id"]
    assert sess2_id != sess1_id
    client.post(f"/api/v1/assessment-sessions/{sess2_id}/submit", headers=headers)

    # Attempt 3 - must be rejected with 403 Forbidden
    res3 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res3.status_code == 403
    assert "Maximum attempt limit (2) reached" in res3.json()["detail"]


def test_stage4_03_server_authoritative_timer_and_auto_expire(test_db):
    """Test that server authoritatively enforces timers and auto-expires sessions."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, questions, profile = setup_exam_environment(test_db, duration_minutes=1)

    res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res.status_code == 200
    session_id = res.json()["session_id"]

    runtime = ExamRuntime(test_db)
    session = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    rem = runtime.get_time_remaining(session)
    assert rem > 0 and rem <= 60

    # Artificially expire the session on the server
    session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=15)
    test_db.commit()

    # Submitting an answer after expiration should fail
    sub_payload = {
        "question_id": questions[0].id,
        "selected_option_index": 1,
        "response_time_seconds": 10
    }
    res_answer = client.post(f"/api/v1/assessment-sessions/{session_id}/answers", json=sub_payload, headers=headers)
    assert res_answer.status_code == 400
    assert "expired" in res_answer.json()["detail"].lower()

    # Finalize with auto_expire
    runtime.finalize_exam(session_id, profile.id, auto_expire=True)
    test_db.refresh(session)
    assert session.status == "EXPIRED"
    assert any(ev.get("event_type") == "EXAM_AUTO_EXPIRED" for ev in session.audit_events or [])


def test_stage4_04_idempotent_answer_submission(test_db):
    """Test idempotent answer submission preventing duplicate scoring or double-clicks."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, questions, profile = setup_exam_environment(test_db)

    res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    session_id = res.json()["session_id"]

    sub_payload = {
        "question_id": questions[0].id,
        "selected_option_index": 1,
        "response_time_seconds": 15
    }

    # 1. First submission
    res1 = client.post(f"/api/v1/assessment-sessions/{session_id}/answers", json=sub_payload, headers=headers)
    assert res1.status_code == 200
    ans1 = res1.json()
    assert ans1["already_submitted"] is False
    # Verify security: answer correctness is redacted from client in EXAM mode
    assert ans1["is_correct"] is None

    # 2. Second submission with exact same request
    res2 = client.post(f"/api/v1/assessment-sessions/{session_id}/answers", json=sub_payload, headers=headers)
    assert res2.status_code == 200
    ans2 = res2.json()
    assert ans2["already_submitted"] is True

    # 3. Verify total score did NOT double
    sess = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    assert sess.total_score == 10.0

    # 4. Verify only one evidence record exists for this question
    evidences = test_db.query(AssessmentAttemptEvidence).filter(
        AssessmentAttemptEvidence.session_id == session_id,
        AssessmentAttemptEvidence.question_id == questions[0].id
    ).all()
    assert len(evidences) == 1


def test_stage4_05_pause_and_resume_policy(test_db):
    """Test configurable pause limits, duration limits, and authoritative timer extension."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, questions, profile = setup_exam_environment(
        test_db, allowed_pause=True, max_pauses=1, max_pause_seconds=120
    )

    res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    session_id = res.json()["session_id"]

    # 1. Pause Session
    pause_res = client.post(f"/api/v1/assessment-sessions/{session_id}/pause", headers=headers)
    assert pause_res.status_code == 200
    p_data = pause_res.json()
    assert p_data["status"] == "PAUSED"
    assert p_data["pause_count"] == 1
    assert p_data["pauses_remaining"] == 0

    # 2. Re-submitting answer while PAUSED must be rejected
    sub_payload = {
        "question_id": questions[0].id,
        "selected_option_index": 1,
        "response_time_seconds": 5
    }
    ans_res = client.post(f"/api/v1/assessment-sessions/{session_id}/answers", json=sub_payload, headers=headers)
    assert ans_res.status_code == 400
    assert "paused" in ans_res.json()["detail"].lower()

    # 3. Resume Session
    resume_res = client.post(f"/api/v1/assessment-sessions/{session_id}/resume", headers=headers)
    assert resume_res.status_code == 200
    r_data = resume_res.json()
    assert r_data["status"] == "IN_PROGRESS"
    assert r_data["time_remaining_seconds"] > 0

    # 4. Attempt second pause when max_pauses = 1 must fail with 400
    pause_res2 = client.post(f"/api/v1/assessment-sessions/{session_id}/pause", headers=headers)
    assert pause_res2.status_code == 400
    assert "maximum" in pause_res2.json()["detail"].lower() and "pauses" in pause_res2.json()["detail"].lower()


def test_stage4_06_navigation_policy_enforcement(test_db):
    """Test FREE_NAVIGATION allowing random access vs LOCK_AFTER_SUBMISSION locking."""
    headers = get_demo_auth()
    
    # 1. Test FREE_NAVIGATION
    _, _, _, _, _, assessment_free, questions_free, _ = setup_exam_environment(
        test_db, navigation_policy="FREE_NAVIGATION"
    )
    res_free = client.post(f"/api/v1/assessments/{assessment_free.id}/session?mode=EXAM", headers=headers)
    session_free_id = res_free.json()["session_id"]

    # Learner jumps directly to Question 3
    q3_id = questions_free[2].id
    res_q3 = client.get(f"/api/v1/assessment-sessions/{session_free_id}/current?question_id={q3_id}", headers=headers)
    assert res_q3.status_code == 200
    assert res_q3.json()["question"]["id"] == q3_id

    # 2. Test LOCK_AFTER_SUBMISSION
    _, _, _, _, _, assessment_locked, questions_locked, _ = setup_exam_environment(
        test_db, navigation_policy="LOCK_AFTER_SUBMISSION"
    )
    res_lock = client.post(f"/api/v1/assessments/{assessment_locked.id}/session?mode=EXAM", headers=headers)
    session_lock_id = res_lock.json()["session_id"]

    # Submit first question
    sub1 = {
        "question_id": questions_locked[0].id,
        "selected_option_index": 1,
        "response_time_seconds": 10
    }
    r_sub1 = client.post(f"/api/v1/assessment-sessions/{session_lock_id}/answers", json=sub1, headers=headers)
    assert r_sub1.status_code == 200

    # Trying to re-submit with different answer when LOCK_AFTER_SUBMISSION is active
    sub2 = {
        "question_id": questions_locked[0].id,
        "selected_option_index": 2,
        "response_time_seconds": 10
    }
    r_sub2 = client.post(f"/api/v1/assessment-sessions/{session_lock_id}/answers", json=sub2, headers=headers)
    assert r_sub2.status_code == 400
    assert "lock" in r_sub2.json()["detail"].lower()


def test_stage4_07_session_recovery_and_idor_protection(test_db):
    """Test reconnecting to existing session without burning an attempt, and IDOR protection."""
    headers = get_demo_auth()
    _, _, _, _, _, assessment, _, profile = setup_exam_environment(test_db)

    # 1. Start Session
    res1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res1.status_code == 200
    sess_id = res1.json()["session_id"]

    # 2. Learner refreshes browser / reconnects and calls start again
    res_reconnect = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert res_reconnect.status_code == 200
    reconnected_sess = res_reconnect.json()
    assert reconnected_sess["session_id"] == sess_id
    assert reconnected_sess["attempt_number"] == 1

    # 3. IDOR Protection: Direct engine check: accessing unauthorized session raises 403 Forbidden
    other_user = User(
        id=str(uuid.uuid4()),
        email=f"intruder-{uuid.uuid4().hex[:6]}@example.com",
        full_name="Intruder User",
        hashed_password="mockpassword"
    )
    test_db.add(other_user)
    test_db.flush()
    other_profile = LearnerProfile(id=str(uuid.uuid4()), user_id=other_user.id)
    test_db.add(other_profile)
    test_db.commit()

    runtime = ExamRuntime(test_db)
    with pytest.raises(Exception) as exc_info:
        runtime.get_session_detail(sess_id, other_profile.id)
    assert "403" in str(exc_info.value) or "Forbidden" in str(exc_info.value) or "unauthorized" in str(exc_info.value).lower()


def test_stage4_08_final_submission_and_syllabus_breakdown(test_db):
    """Test final exam scoring with syllabus module, topic, and learning objective breakdowns."""
    headers = get_demo_auth()
    _, _, module, topic, obj, assessment, questions, profile = setup_exam_environment(test_db)

    res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    session_id = res.json()["session_id"]

    # Submit 3 correct answers and 2 incorrect answers
    for idx, q in enumerate(questions):
        choice = 1 if idx < 3 else 0
        client.post(
            f"/api/v1/assessment-sessions/{session_id}/answers",
            json={"question_id": q.id, "selected_option_index": choice, "response_time_seconds": 12},
            headers=headers
        )

    # Finalize Exam
    res_final = client.post(f"/api/v1/assessment-sessions/{session_id}/submit", headers=headers)
    assert res_final.status_code == 200
    result = res_final.json()
    assert result["session_id"] == session_id
    assert result["total_score"] == 30.0
    assert result["total_max_marks"] == 50.0
    assert result["percentage"] == 60.0
    assert result["passed"] is True
    assert result["status"] == "PASSED"

    # Verify syllabus breakdowns
    assert module.id in result["module_scores"]
    assert result["module_scores"][module.id]["module_title"] == module.title
    assert result["module_scores"][module.id]["percentage"] == 60.0

    assert topic.id in result["topic_scores"]
    assert result["topic_scores"][topic.id]["topic_title"] == topic.title
    assert result["topic_scores"][topic.id]["percentage"] == 60.0

    if obj:
        assert obj.id in result["objective_scores"]
        assert result["objective_scores"][obj.id]["percentage"] == 60.0


def test_stage4_09_multi_domain_exam_runtime(test_db):
    """Test exam runtime across diverse domains (Cybersecurity, VLSI, Data Science, Vocational)."""
    headers = get_demo_auth()
    domains = ["CYBERSECURITY", "VLSI_DESIGN", "DATA_SCIENCE", "VOCATIONAL_ELECTRICAL"]

    for dom in domains:
        _, _, _, _, _, assessment, questions, _ = setup_exam_environment(test_db, domain=dom)
        
        # Start session
        res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
        assert res.status_code == 200, f"Failed for domain {dom}: {res.text}"
        sess_id = res.json()["session_id"]

        # Fetch current question
        q_res = client.get(f"/api/v1/assessment-sessions/{sess_id}/current", headers=headers)
        assert q_res.status_code == 200
        q_data = q_res.json()["question"]
        assert "correct_answer" not in q_data or q_data.get("correct_answer") is None
        assert "explanation" not in q_data or q_data.get("explanation") is None

        # Answer question
        ans_res = client.post(
            f"/api/v1/assessment-sessions/{sess_id}/answers",
            json={"question_id": q_data["id"], "selected_option_index": 1, "response_time_seconds": 15},
            headers=headers
        )
        assert ans_res.status_code == 200

        # Submit
        sub_res = client.post(f"/api/v1/assessment-sessions/{sess_id}/submit", headers=headers)
        assert sub_res.status_code == 200
        assert sub_res.json()["status"] in ["PASSED", "FAILED"]

