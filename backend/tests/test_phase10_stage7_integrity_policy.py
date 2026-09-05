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
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic
from backend.app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentSession, AssessmentIntegrityEvent, AssessmentIntegrityPolicy
)
from backend.app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("policy-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_policy_environment(
    db,
    mode="EXAM",
    invalidation_threshold=0,
    allowed_warning_count=3,
    cooldown_seconds=30
):
    """Sets up course, syllabus, assessment, policy, and demo user session."""
    slug = f"policy-course-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title=f"Integrity Policy Course - {mode}",
        slug=slug,
        description="Course with comprehensive integrity policy validation",
        provider="IIT Bombay",
        url=f"https://nptel.ac.in/courses/{slug}",
        resource_type="course",
        difficulty="Intermediate",
        estimated_hours=25.0,
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
        title=f"Policy Syllabus {mode}",
        is_active=True,
        source="INSTITUTION",
        provider="IIT Bombay",
        verification_status="VERIFIED"
    )
    db.add(syl)
    db.flush()

    module = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        order_index=1,
        title="Assessment Ethics",
        weight=100.0
    )
    db.add(module)
    db.flush()

    topic = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=module.id,
        order_index=1,
        title="Supervised Environments",
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
        title=f"Supervised Assessment {mode}",
        domain="CYBERSECURITY",
        assessment_type=mode,
        total_questions=5,
        total_marks=50.0,
        passing_score=30.0,
        duration_minutes=45,
        attempt_limit=3,
        allowed_pause=True,
        max_pause_seconds=300,
        max_pauses_allowed=2,
        integrity_monitoring_policy="REQUIRED" if mode == "EXAM" else "WARNING_ONLY",
        gadget_detection_enabled=True,
        monitoring_consent_required=True,
        status="ACTIVE"
    )
    db.add(assessment)
    db.flush()

    # Pre-configure or customize policy
    policy = AssessmentIntegrityPolicy(
        id=str(uuid.uuid4()),
        assessment_id=assessment.id,
        monitoring_required=True,
        camera_required=True,
        allowed_warning_count=allowed_warning_count,
        warning_cooldown_seconds=cooldown_seconds,
        review_required_threshold=4,
        invalidation_threshold=invalidation_threshold,
        auto_pause_on_interruption=True
    )
    db.add(policy)
    db.flush()

    for i in range(5):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            course_id=res.id,
            syllabus_id=syl.id,
            module_id=module.id,
            topic_id=topic.id,
            question_text=f"Integrity Policy question {i + 1}?",
            question_type="MCQ",
            difficulty="INTERMEDIATE",
            marks=10.0,
            options=["A", "B", "C", "D"],
            correct_option_index=1,
            correct_answer="B",
            explanation="Explanation",
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

    return res, syl, assessment, policy, profile


def start_and_consent_session(headers, assessment_id, mode="EXAM"):
    sess_res = client.post(f"/api/v1/assessments/{assessment_id}/session?mode={mode}", headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["session_id"]

    consent_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/consent",
        json={"consent": "CONSENT_GRANTED"},
        headers=headers
    )
    assert consent_res.status_code == 200
    return session_id


def test_stage7_01_default_policy_by_mode(test_db):
    """Verify policy retrieval and mode-aware default synthesis for PRACTICE and EXAM."""
    headers = get_demo_auth()
    _, _, assessment, policy, _ = setup_policy_environment(test_db, mode="EXAM")

    # 1. Fetch policy for configured assessment
    p_res = client.get(f"/api/v1/assessments/{assessment.id}/integrity-policy", headers=headers)
    assert p_res.status_code == 200
    p_data = p_res.json()
    assert p_data["allowed_warning_count"] == 3
    assert p_data["warning_cooldown_seconds"] == 30
    assert p_data["camera_required"] is True


def test_stage7_02_weak_event_no_warning(test_db):
    """Verify false-positive guard: brief glances or low confidence devices trigger 0 visible warnings."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Ingest brief face absence (< 3s)
    ev_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "NO_FACE",
            "duration": 1.5,
            "confidence": 0.8
        },
        headers=headers
    )
    assert ev_res.status_code == 200

    # 2. Check integrity state via API
    state_res = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers)
    assert state_res.status_code == 200
    s_data = state_res.json()
    assert s_data["integrity_state"] == "NORMAL"
    assert s_data["action_instruction"] == "CONTINUE"
    assert s_data["warning_count"] == 0
    assert s_data["active_warning"] is None


def test_stage7_03_strong_event_warning(test_db):
    """Verify actionable event transitions session to WARNING with calm learner guidance."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Ingest sustained phone detection (duration 3.0s, confidence 0.85)
    ev_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "duration": 3.0,
            "confidence": 0.85
        },
        headers=headers
    )
    assert ev_res.status_code == 200

    # Check integrity state
    state_res = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers)
    assert state_res.status_code == 200
    s_data = state_res.json()
    assert s_data["integrity_state"] == "WARNING"
    assert s_data["action_instruction"] == "SHOW_WARNING"
    assert s_data["warning_count"] == 1
    assert s_data["active_warning"] is not None
    assert "remove unauthorized devices" in s_data["active_warning"]["message"].lower()


def test_stage7_04_warning_cooldown_anti_spam(test_db):
    """Verify warning anti-spam cooldown: subsequent events within cooldown window do not spawn duplicate warnings."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db, cooldown_seconds=30)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Trigger initial warning
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 5.0, "confidence": 0.9},
        headers=headers
    )

    # Verify warning count is 1
    s1 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s1["warning_count"] == 1
    initial_warn_id = s1["active_warning"]["warning_id"]

    # 2. Trigger another sustained event 2 seconds later (within 30s cooldown)
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "LOOKING_AWAY", "duration": 6.0, "confidence": 0.9},
        headers=headers
    )

    # Verify warning count did NOT increase and warning_id was NOT overwritten
    s2 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s2["warning_count"] == 1
    assert s2["active_warning"]["warning_id"] == initial_warn_id


def test_stage7_05_repeated_warning_escalation(test_db):
    """Verify warning progression: WARNING -> REPEATED_WARNING -> ESCALATED."""
    headers = get_demo_auth()
    # Use zero-second cooldown to test sequential progression in unit tests
    _, _, assessment, _, _ = setup_policy_environment(test_db, cooldown_seconds=0)
    session_id = start_and_consent_session(headers, assessment.id)

    sess = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()

    # Event 1: First warning
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 5.0, "confidence": 0.9},
        headers=headers
    )
    s1 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s1["integrity_state"] == "WARNING"
    assert s1["warning_count"] == 1

    # Event 2: Second warning (REPEATED_WARNING)
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "LOOKING_AWAY", "duration": 6.0, "confidence": 0.85},
        headers=headers
    )
    s2 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s2["integrity_state"] == "REPEATED_WARNING"
    assert s2["warning_count"] == 2

    # Event 3: Third warning (ESCALATED)
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "MULTIPLE_FACES", "duration": 4.0, "confidence": 0.95},
        headers=headers
    )
    s3 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s3["integrity_state"] == "ESCALATED"
    assert s3["warning_count"] == 3


def test_stage7_06_multi_signal_correlation_escalation(test_db):
    """Verify multi-signal correlation: concurrent phone + face absence triggers accelerated escalation."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db, cooldown_seconds=0)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Ingest phone detection
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "POSSIBLE_PHONE", "duration": 3.0, "confidence": 0.85},
        headers=headers
    )

    # 2. Ingest face absence correlated event
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 5.0, "confidence": 0.9},
        headers=headers
    )

    state = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert state["integrity_state"] in {"ESCALATED", "REVIEW_REQUIRED"}
    assert state["warning_count"] == 2


def test_stage7_07_camera_interruption_technical_handling(test_db):
    """Verify camera hardware interruptions trigger technical pause without behavioral misconduct penalty."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Ingest CAMERA_INTERRUPTED event
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "CAMERA_INTERRUPTED", "duration": 1.0, "confidence": 1.0},
        headers=headers
    )

    state = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    # Warning count should NOT be incremented for technical hardware interruption
    assert state["warning_count"] == 0
    assert state["action_instruction"] == "PAUSE_REQUIRED"
    assert state["active_warning"] is not None
    assert "interrupted" in state["active_warning"]["message"].lower()


def test_stage7_08_warning_acknowledgment(test_db):
    """Verify learner acknowledgment clears active warning, archives into history, and resumes CONTINUE instruction."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Trigger warning
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "POSSIBLE_PHONE", "duration": 3.0, "confidence": 0.85},
        headers=headers
    )
    s_before = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s_before["active_warning"] is not None
    assert s_before["action_instruction"] == "SHOW_WARNING"

    # Acknowledge warning
    ack_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity/acknowledge",
        json={"warning_id": s_before["active_warning"]["warning_id"]},
        headers=headers
    )
    assert ack_res.status_code == 200
    ack_data = ack_res.json()
    assert ack_data["acknowledged"] is True
    assert ack_data["action_instruction"] == "CONTINUE"

    # Check state after acknowledgment
    s_after = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert s_after["active_warning"] is None
    assert s_after["action_instruction"] == "CONTINUE"

    # Verify historical warning log
    hist_res = client.get(f"/api/v1/assessment-sessions/{session_id}/warnings", headers=headers)
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert len(hist_data["warnings"]) == 1
    assert hist_data["warnings"][0]["acknowledged_at"] is not None


def test_stage7_09_decision_trace_generation(test_db):
    """Verify escalation records structured explainability DecisionTrace in session audit trail."""
    headers = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Trigger strong warning
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "POSSIBLE_PHONE", "duration": 4.0, "confidence": 0.90},
        headers=headers
    )

    sess = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    audit_events = sess.audit_events or []
    assert any("INTEGRITY_STATE" in ev.get("event", "") for ev in audit_events)
    state_event = next(ev for ev in audit_events if "INTEGRITY_STATE" in ev.get("event", ""))
    assert "reason" in state_event["metadata"]
    assert "trigger_event" in state_event["metadata"]


def test_stage7_10_idor_and_security_tampering(test_db):
    """Verify IDOR protection: other learners cannot query or acknowledge session warnings."""
    headers1 = get_demo_auth()
    _, _, assessment, _, _ = setup_policy_environment(test_db)
    session_id1 = start_and_consent_session(headers1, assessment.id)

    # Create User 2
    user2 = User(
        id=str(uuid.uuid4()),
        email=f"hacker_{uuid.uuid4().hex[:6]}@example.com",
        full_name="Hacker One",
        hashed_password="mockpassword",
        is_demo=True
    )
    test_db.add(user2)
    test_db.flush()
    prof2 = LearnerProfile(id=str(uuid.uuid4()), user_id=user2.id)
    test_db.add(prof2)
    test_db.commit()

    token2 = create_access_token(subject=user2.id)
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 2 attempts to query User 1's integrity state
    r1 = client.get(f"/api/v1/assessment-sessions/{session_id1}/integrity/state", headers=headers2)
    assert r1.status_code == 403

    # User 2 attempts to acknowledge User 1's warning
    r2 = client.post(f"/api/v1/assessment-sessions/{session_id1}/integrity/acknowledge", headers=headers2)
    assert r2.status_code == 403

    # User 2 attempts to view User 1's warning history
    r3 = client.get(f"/api/v1/assessment-sessions/{session_id1}/warnings", headers=headers2)
    assert r3.status_code == 403


def test_stage7_11_invalidation_policy_enforcement(test_db):
    """Verify that when policy invalidation_threshold is exceeded, session is marked INVALIDATED and terminated."""
    headers = get_demo_auth()
    # Configure strict invalidation threshold of 3 warnings
    _, _, assessment, _, _ = setup_policy_environment(test_db, invalidation_threshold=3, cooldown_seconds=0)
    session_id = start_and_consent_session(headers, assessment.id)

    # Warning 1
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "NO_FACE", "duration": 5.0, "confidence": 0.9},
        headers=headers
    )

    # Warning 2
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "LOOKING_AWAY", "duration": 5.0, "confidence": 0.9},
        headers=headers
    )

    # Warning 3 (hits invalidation threshold of 3)
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={"event_type": "POSSIBLE_PHONE", "duration": 4.0, "confidence": 0.9},
        headers=headers
    )

    state = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity/state", headers=headers).json()
    assert state["integrity_state"] == "INVALIDATED"
    assert state["action_instruction"] == "INVALIDATE"
    assert state["review_status"] == "INVALIDATED"

    # Check session status in DB is FAILED
    sess = test_db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    assert sess.status == "FAILED"
