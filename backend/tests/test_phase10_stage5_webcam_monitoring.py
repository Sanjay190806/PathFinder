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
    AssessmentBlueprint, Assessment, AssessmentQuestion, AssessmentSession, AssessmentIntegrityEvent
)
from backend.app.assessment.integrity_monitor import IntegrityMonitor
from backend.app.schemas.assessment_blueprint import IntegrityEventCreate, IntegrityMonitoringConsentRequest

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("webcam-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_webcam_environment(
    db,
    policy="WARNING_ONLY",
    duration_minutes=30
):
    """Sets up course, syllabus, assessment with integrity monitoring policy, and demo user session."""
    slug = f"webcam-course-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title="Webcam Integrity Monitored Course",
        slug=slug,
        description="Course with webcam integrity supervision",
        provider="IIT Madras",
        url=f"https://nptel.ac.in/courses/{slug}",
        resource_type="course",
        difficulty="Intermediate",
        estimated_hours=20.0,
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
        title="Webcam Integrity Syllabus",
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
        title="Ethics and Exam Security",
        weight=100.0
    )
    db.add(module)
    db.flush()

    topic = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=module.id,
        order_index=1,
        title="Secure Computing",
        difficulty="Intermediate",
        weight=100.0
    )
    db.add(topic)
    db.flush()

    assessment = Assessment(
        id=str(uuid.uuid4()),
        course_id=res.id,
        syllabus_id=syl.id,
        syllabus_version=1,
        title="Certified Secure Exam",
        domain="CYBERSECURITY",
        assessment_type="EXAM",
        total_questions=5,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=duration_minutes,
        attempt_limit=3,
        allowed_pause=True,
        max_pause_seconds=300,
        max_pauses_allowed=2,
        integrity_monitoring_policy=policy,
        gadget_detection_enabled=True,
        monitoring_consent_required=True,
        status="ACTIVE"
    )
    db.add(assessment)
    db.flush()

    for i in range(5):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            course_id=res.id,
            syllabus_id=syl.id,
            module_id=module.id,
            topic_id=topic.id,
            question_text=f"Integrity question {i + 1}?",
            question_type="MCQ",
            difficulty="INTERMEDIATE",
            marks=10.0,
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_option_index=1,
            correct_answer="Option B",
            explanation="Option B is correct.",
            verification_status="VERIFIED"
        )
        db.add(q)

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
        profile = LearnerProfile(id=str(uuid.uuid4()), user_id=user.id)
        db.add(profile)
        db.commit()

    return res, syl, assessment, profile


def test_stage5_01_consent_lifecycle(test_db):
    """Test explicit consent lifecycle: required -> granted, with timestamps and audit events."""
    headers = get_demo_auth()
    _, _, assessment, profile = setup_webcam_environment(test_db, policy="WARNING_ONLY")

    # 1. Start exam session
    sess_res = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["session_id"]

    # 2. Grant consent via API
    consent_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/consent",
        json={"consent": "CONSENT_GRANTED"},
        headers=headers
    )
    assert consent_res.status_code == 200
    data = consent_res.json()
    assert data["monitoring_consent"] == "CONSENT_GRANTED"
    assert data["monitoring_status"] == "ACTIVE"

    # 3. Verify session in DB
    sess = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    assert sess.monitoring_consent == "CONSENT_GRANTED"
    assert sess.monitoring_started_at is not None
    assert any("MONITORING_CONSENT_GRANTED" in ev.get("event", "") for ev in sess.audit_events or [])


def test_stage5_02_policy_enforcement(test_db):
    """Test policy enforcement: REQUIRED policy rejects consent denial, while WARNING_ONLY permits it."""
    headers = get_demo_auth()

    # 1. Test REQUIRED policy
    _, _, assessment_req, _ = setup_webcam_environment(test_db, policy="REQUIRED")
    r1 = client.post(f"/api/v1/assessments/{assessment_req.id}/session?mode=EXAM", headers=headers)
    s1_id = r1.json()["session_id"]

    # Denying consent on REQUIRED policy raises 400 Bad Request
    c1 = client.post(
        f"/api/v1/assessment-sessions/{s1_id}/consent",
        json={"consent": "CONSENT_DENIED"},
        headers=headers
    )
    assert c1.status_code == 400
    assert "required" in c1.json()["detail"].lower()

    # 2. Test WARNING_ONLY policy permits denial
    _, _, assessment_warn, _ = setup_webcam_environment(test_db, policy="WARNING_ONLY")
    r2 = client.post(f"/api/v1/assessments/{assessment_warn.id}/session?mode=EXAM", headers=headers)
    s2_id = r2.json()["session_id"]

    c2 = client.post(
        f"/api/v1/assessment-sessions/{s2_id}/consent",
        json={"consent": "CONSENT_DENIED"},
        headers=headers
    )
    assert c2.status_code == 200
    assert c2.json()["monitoring_consent"] == "CONSENT_DENIED"
    assert c2.json()["monitoring_status"] == "DENIED"


def test_stage5_03_event_validation_and_ownership(test_db):
    """Test IDOR protection: cannot submit integrity events for another learner's session."""
    headers = get_demo_auth()
    _, _, assessment, profile = setup_webcam_environment(test_db)

    # User 1 starts session
    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # User 2 tries to emit integrity event for User 1's session
    other_user = User(
        id=str(uuid.uuid4()),
        email=f"other-{uuid.uuid4().hex[:6]}@example.com",
        full_name="Other User",
        hashed_password="mockpassword"
    )
    test_db.add(other_user)
    test_db.flush()
    other_profile = LearnerProfile(id=str(uuid.uuid4()), user_id=other_user.id)
    test_db.add(other_profile)
    test_db.commit()

    monitor = IntegrityMonitor(test_db)
    payload = IntegrityEventCreate(
        event_type="NO_FACE",
        duration=5.0,
        source="BROWSER_CAMERA"
    )
    with pytest.raises(Exception) as exc_info:
        monitor.record_event(sess_id, other_profile.id, payload)
    assert "403" in str(exc_info.value) or "denied" in str(exc_info.value).lower()


def test_stage5_04_session_state_and_timestamp_bounds(test_db):
    """Test that events cannot be submitted to finalized sessions or with future timestamps."""
    headers = get_demo_auth()
    _, _, assessment, profile = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # 1. Future timestamp is rejected
    future_time = datetime.now(timezone.utc) + timedelta(minutes=10)
    future_payload = {
        "event_type": "NO_FACE",
        "timestamp": future_time.isoformat(),
        "duration": 5.0
    }
    rf = client.post(f"/api/v1/assessment-sessions/{sess_id}/integrity-events", json=future_payload, headers=headers)
    assert rf.status_code == 400
    assert "future" in rf.json()["detail"].lower()

    # 2. Finalize session
    client.post(f"/api/v1/assessment-sessions/{sess_id}/submit", headers=headers)

    # 3. Emitting event after completion is rejected
    valid_payload = {
        "event_type": "NO_FACE",
        "duration": 5.0
    }
    r_post = client.post(f"/api/v1/assessment-sessions/{sess_id}/integrity-events", json=valid_payload, headers=headers)
    assert r_post.status_code == 400
    assert "finalized" in r_post.json()["detail"].lower()


def test_stage5_05_source_privilege_restriction(test_db):
    """Test that client cannot forge MANUAL_REVIEW integrity events."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    forged_payload = {
        "event_type": "NO_FACE",
        "source": "MANUAL_REVIEW",
        "duration": 5.0
    }
    r = client.post(f"/api/v1/assessment-sessions/{sess_id}/integrity-events", json=forged_payload, headers=headers)
    assert r.status_code == 403
    assert "manual_review" in r.json()["detail"].lower() or "forbidden" in r.json()["detail"].lower()


def test_stage5_06_server_side_severity_normalization(test_db):
    """Test authoritative server severity normalization for face events."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # 1. Brief glance down (< 3s) -> classified as INFO
    e1 = client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 1.5, "severity": "HIGH"},  # Client claims HIGH
        headers=headers
    )
    assert e1.status_code == 200
    assert e1.json()["severity"] == "INFO"  # Server authoritatively clamps to INFO

    # 2. Prolonged face absence (> 15s) -> classified as HIGH
    e2 = client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 20.0},
        headers=headers
    )
    assert e2.status_code == 200
    # Because of debouncing or fresh event, duration is prolonged -> HIGH
    assert e2.json()["severity"] in ["MEDIUM", "HIGH"]

    # 3. Multiple faces -> classified as MEDIUM or HIGH
    e3 = client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "MULTIPLE_FACES", "duration": 4.0},
        headers=headers
    )
    assert e3.status_code == 200
    assert e3.json()["severity"] in ["MEDIUM", "HIGH"]


def test_stage5_07_event_debouncing_and_aggregation(test_db):
    """Test that rapid bursts of identical events aggregate duration rather than spamming rows."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # Emit NO_FACE event 1
    r_ev1 = client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 2.0},
        headers=headers
    )
    assert r_ev1.status_code == 200
    ev1_id = r_ev1.json()["id"]

    # Emit NO_FACE event 2 immediately (within 5s cooldown)
    r_ev2 = client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 3.0},
        headers=headers
    )
    assert r_ev2.status_code == 200
    ev2_id = r_ev2.json()["id"]

    # Must reuse the same record ID and accumulate duration
    assert ev1_id == ev2_id
    assert r_ev2.json()["duration"] >= 5.0

    # Total rows in DB for this event_type must still be 1
    count = test_db.query(AssessmentIntegrityEvent).filter(
        AssessmentIntegrityEvent.session_id == sess_id,
        AssessmentIntegrityEvent.event_type == "NO_FACE"
    ).count()
    assert count == 1


def test_stage5_08_integrity_summary_aggregation(test_db):
    """Test retrieving session integrity summary with categorized event counts."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # Record face absence
    client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 5.0},
        headers=headers
    )
    # Record looking away
    client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "LOOKING_AWAY", "duration": 4.0},
        headers=headers
    )
    # Record multiple faces
    client.post(
        f"/api/v1/assessment-sessions/{sess_id}/integrity-events",
        json={"event_type": "MULTIPLE_FACES", "duration": 2.0},
        headers=headers
    )

    # Get Integrity Summary
    sum_res = client.get(f"/api/v1/assessment-sessions/{sess_id}/integrity", headers=headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()

    assert summary["session_id"] == sess_id
    assert summary["face_absence_events"] >= 1
    assert summary["looking_away_events"] >= 1
    assert summary["multiple_face_events"] >= 1
    assert summary["total_integrity_events"] == 3
    assert len(summary["recent_events"]) == 3


def test_stage5_09_exam_completion_monitoring_shutdown(test_db):
    """Test that submitting an assessment automatically terminates monitoring state."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_webcam_environment(test_db)

    r1 = client.post(f"/api/v1/assessments/{assessment.id}/session?mode=EXAM", headers=headers)
    sess_id = r1.json()["session_id"]

    # Start monitoring with consent
    client.post(
        f"/api/v1/assessment-sessions/{sess_id}/consent",
        json={"consent": "CONSENT_GRANTED"},
        headers=headers
    )

    sess_before = test_db.query(AssessmentSession).filter(AssessmentSession.id == sess_id).first()
    assert sess_before.monitoring_consent == "CONSENT_GRANTED"

    # Finalize exam
    client.post(f"/api/v1/assessment-sessions/{sess_id}/submit", headers=headers)

    test_db.refresh(sess_before)
    # Monitoring must be authoritatively stopped
    assert sess_before.monitoring_consent == "MONITORING_STOPPED"
    assert sess_before.monitoring_ended_at is not None
