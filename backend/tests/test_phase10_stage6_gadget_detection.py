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
    Assessment, AssessmentQuestion, AssessmentSession, AssessmentIntegrityEvent
)

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("gadget-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_gadget_environment(
    db,
    domain="AI_ML",
    policy="WARNING_ONLY",
    gadget_enabled=True,
    duration_minutes=45
):
    """Sets up course, syllabus, assessment with gadget detection, and demo user session."""
    slug = f"gadget-course-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title=f"Gadget Monitored Course - {domain}",
        slug=slug,
        description="Course with hardware/gadget detection",
        provider="IIT Delhi",
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
        title=f"{domain} Syllabus",
        is_active=True,
        source="INSTITUTION",
        provider="IIT Delhi",
        verification_status="VERIFIED"
    )
    db.add(syl)
    db.flush()

    module = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        order_index=1,
        title="Hardware & Integrity Core",
        weight=100.0
    )
    db.add(module)
    db.flush()

    topic = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=module.id,
        order_index=1,
        title="Proctored Systems",
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
        title=f"{domain} Supervised Assessment",
        domain=domain,
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
        gadget_detection_enabled=gadget_enabled,
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
            question_text=f"Sample Question {i + 1} for {domain}?",
            question_type="MCQ",
            difficulty="INTERMEDIATE",
            marks=10.0,
            options=["Alpha", "Beta", "Gamma", "Delta"],
            correct_option_index=0,
            correct_answer="Alpha",
            explanation="Alpha is correct.",
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


def start_and_consent_session(headers, assessment_id):
    """Helper to start an exam session and grant monitoring consent."""
    sess_res = client.post(f"/api/v1/assessments/{assessment_id}/session?mode=EXAM", headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["session_id"]

    consent_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/consent",
        json={"consent": "CONSENT_GRANTED"},
        headers=headers
    )
    assert consent_res.status_code == 200
    return session_id


def test_stage6_01_gadget_event_creation(test_db):
    """Verify ingestion of various gadget detection events: phone, tablet, headphones, second screen."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Ingest POSSIBLE_PHONE
    res1 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.88,
            "duration": 3.0,
            "source": "BROWSER_VISION",
            "metadata_minimized": {"device_label": "mobile_device"}
        },
        headers=headers
    )
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["event_type"] == "POSSIBLE_PHONE"
    assert d1["confidence"] == 0.88
    assert d1["severity"] == "HIGH"
    assert d1["source"] == "BROWSER_VISION"

    # 2. Ingest POSSIBLE_HEADPHONES
    res2 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_HEADPHONES",
            "confidence": 0.72,
            "duration": 4.0,
            "metadata_minimized": {"device_label": "over_ear_headset"}
        },
        headers=headers
    )
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["event_type"] == "POSSIBLE_HEADPHONES"
    assert d2["severity"] == "MEDIUM"

    # 3. Ingest POSSIBLE_TABLET
    res3 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_TABLET",
            "confidence": 0.65,
            "duration": 2.0
        },
        headers=headers
    )
    assert res3.status_code == 200
    assert res3.json()["event_type"] == "POSSIBLE_TABLET"

    # 4. Ingest POSSIBLE_SECOND_SCREEN
    res4 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_SECOND_SCREEN",
            "confidence": 0.91,
            "duration": 6.0
        },
        headers=headers
    )
    assert res4.status_code == 200
    assert res4.json()["event_type"] == "POSSIBLE_SECOND_SCREEN"


def test_stage6_02_device_confidence_handling(test_db):
    """Verify authoritatively normalized severity across confidence tiers and null confidence."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Low confidence (< 0.5) -> INFO
    res_low = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.35,
            "duration": 2.0
        },
        headers=headers
    )
    assert res_low.status_code == 200
    assert res_low.json()["severity"] == "INFO"

    # 2. Medium confidence (0.5 <= conf < 0.8) with short duration -> MEDIUM
    res_med = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_TABLET",
            "confidence": 0.65,
            "duration": 2.0
        },
        headers=headers
    )
    assert res_med.status_code == 200
    assert res_med.json()["severity"] == "MEDIUM"

    # 3. High confidence (>= 0.8) with duration >= 2.0 -> HIGH
    res_high = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_SMART_DEVICE",
            "confidence": 0.95,
            "duration": 2.5
        },
        headers=headers
    )
    assert res_high.status_code == 200
    assert res_high.json()["severity"] == "HIGH"

    # 4. Null confidence -> defaults to 0.70 internally without crashing
    res_null = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_OTHER_GADGET",
            "confidence": None,
            "duration": 1.5
        },
        headers=headers
    )
    assert res_null.status_code == 200
    assert res_null.json()["severity"] in {"MEDIUM", "LOW", "INFO"}


def test_stage6_03_device_debouncing_and_aggregation(test_db):
    """Verify rapid gadget telemetry events aggregate into single row with accumulated duration."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Initial count of events
    initial_count = test_db.query(AssessmentIntegrityEvent).filter(
        AssessmentIntegrityEvent.session_id == session_id
    ).count()
    assert initial_count == 0

    # Rapid burst 1
    r1 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.75,
            "duration": 2.0
        },
        headers=headers
    )
    assert r1.status_code == 200

    # Rapid burst 2 within 5.0 seconds
    r2 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.85,
            "duration": 3.0
        },
        headers=headers
    )
    assert r2.status_code == 200

    # Rapid burst 3 within 5.0 seconds
    r3 = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.90,
            "duration": 2.5
        },
        headers=headers
    )
    assert r3.status_code == 200

    # Verify only 1 database row exists for this burst, with accumulated duration
    events = test_db.query(AssessmentIntegrityEvent).filter(
        AssessmentIntegrityEvent.session_id == session_id,
        AssessmentIntegrityEvent.event_type == "POSSIBLE_PHONE"
    ).all()
    assert len(events) == 1
    assert events[0].duration >= 7.5  # 2.0 + 3.0 + 2.5
    assert events[0].confidence == 0.90  # latest confidence adopted


def test_stage6_04_post_session_device_rejection(test_db):
    """Verify gadget events are rejected when assessment session is finalized or completed."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # Finalize the session
    sub_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/submit",
        json={"auto_submit": False, "reason": "LEARNER_COMPLETED"},
        headers=headers
    )
    assert sub_res.status_code == 200

    # Attempt to emit gadget event after finalization
    post_res = client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.95,
            "duration": 5.0
        },
        headers=headers
    )
    assert post_res.status_code == 400
    assert "finalized" in post_res.json()["detail"].lower()


def test_stage6_05_idor_protection(test_db):
    """Verify IDOR protection: a user cannot inject gadget events into another user's session."""
    headers1 = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id1 = start_and_consent_session(headers1, assessment.id)

    # Create second learner user and login
    unique_suffix = uuid.uuid4().hex[:6]
    user2 = User(
        id=str(uuid.uuid4()),
        email=f"bob_{unique_suffix}@pathfinder.demo",
        full_name="Bob Hacker",
        hashed_password="mockpassword",
        is_demo=True
    )
    test_db.add(user2)
    test_db.flush()
    prof2 = LearnerProfile(id=str(uuid.uuid4()), user_id=user2.id)
    test_db.add(prof2)
    test_db.commit()

    from backend.app.core.security import create_access_token
    token2 = create_access_token(subject=user2.id)
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 2 attempts to emit event on User 1's session
    attack_res = client.post(
        f"/api/v1/assessment-sessions/{session_id1}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.99,
            "duration": 10.0
        },
        headers=headers2
    )
    assert attack_res.status_code == 403
    assert "denied" in attack_res.json()["detail"].lower()


def test_stage6_06_multi_signal_correlation(test_db):
    """Verify multi-signal correlation: flag is True only when gadget co-occurs with face absence/deviation."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Initially, no events -> multi_signal is False
    s0 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers)
    assert s0.status_code == 200
    assert s0.json()["multi_signal_warning_candidate"] is False

    # 2. Only phone detected (no face deviation yet) -> multi_signal still False
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.85,
            "duration": 4.0
        },
        headers=headers
    )
    s1 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers)
    assert s1.status_code == 200
    assert s1.json()["total_device_events"] == 1
    assert s1.json()["multi_signal_warning_candidate"] is False

    # 3. Add face absence event (NO_FACE) -> multi_signal correlation triggers True
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "NO_FACE",
            "confidence": 0.92,
            "duration": 6.0
        },
        headers=headers
    )
    s2 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers)
    assert s2.status_code == 200
    assert s2.json()["face_absence_events"] == 1
    assert s2.json()["total_device_events"] == 1
    assert s2.json()["multi_signal_warning_candidate"] is True


def test_stage6_07_device_summary_categorization(test_db):
    """Verify summary endpoint aggregates counts accurately across gadget categories."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    gadgets = [
        ("POSSIBLE_PHONE", 0.85),
        ("POSSIBLE_TABLET", 0.70),
        ("POSSIBLE_HEADPHONES", 0.60),
        ("POSSIBLE_OTHER_GADGET", 0.75),
        ("POSSIBLE_SECOND_SCREEN", 0.95),
    ]

    for g_type, conf in gadgets:
        r = client.post(
            f"/api/v1/assessment-sessions/{session_id}/integrity-events",
            json={
                "event_type": g_type,
                "confidence": conf,
                "duration": 2.0
            },
            headers=headers
        )
        assert r.status_code == 200

    summary_res = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers)
    assert summary_res.status_code == 200
    data = summary_res.json()

    assert data["phone_events"] == 1
    assert data["tablet_events"] == 1
    assert data["headphones_events"] == 1
    assert data["other_gadget_events"] == 2  # OTHER_GADGET + SECOND_SCREEN count under other_gadgets
    assert data["total_device_events"] == 5
    assert data["high_confidence_events"] >= 2


def test_stage6_08_multi_domain_gadget_monitoring(test_db):
    """Verify gadget monitoring is domain-agnostic across AI/ML, VLSI, Cybersecurity, Mechanical, Vocational."""
    headers = get_demo_auth()
    domains = ["AI_ML", "VLSI_SEMICONDUCTOR", "CYBERSECURITY", "MECHANICAL_ENGINEERING", "VOCATIONAL_SKILLS"]

    for d in domains:
        _, _, assessment, _ = setup_gadget_environment(test_db, domain=d)
        session_id = start_and_consent_session(headers, assessment.id)

        ev_res = client.post(
            f"/api/v1/assessment-sessions/{session_id}/integrity-events",
            json={
                "event_type": "POSSIBLE_PHONE",
                "confidence": 0.82,
                "duration": 2.5
            },
            headers=headers
        )
        assert ev_res.status_code == 200
        assert ev_res.json()["severity"] == "HIGH"

        sum_res = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers)
        assert sum_res.status_code == 200
        assert sum_res.json()["phone_events"] == 1


def test_stage6_09_assistive_warning_candidate_thresholds(test_db):
    """Verify that severity thresholds accurately trigger warning candidate counts without punitive action."""
    headers = get_demo_auth()
    _, _, assessment, _ = setup_gadget_environment(test_db)
    session_id = start_and_consent_session(headers, assessment.id)

    # 1. Send low confidence short event -> severity INFO
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_PHONE",
            "confidence": 0.3,
            "duration": 1.0
        },
        headers=headers
    )
    s1 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers).json()
    assert s1["warning_candidates_count"] == 0

    # 2. Send high confidence event -> severity HIGH
    client.post(
        f"/api/v1/assessment-sessions/{session_id}/integrity-events",
        json={
            "event_type": "POSSIBLE_TABLET",
            "confidence": 0.90,
            "duration": 3.0
        },
        headers=headers
    )
    s2 = client.get(f"/api/v1/assessment-sessions/{session_id}/integrity", headers=headers).json()
    assert s2["warning_candidates_count"] == 1

    # Verify session remains in IN_PROGRESS state (assistive posture - no automatic termination)
    session_state = client.get(f"/api/v1/assessment-sessions/{session_id}", headers=headers).json()
    assert session_state["status"] in {"IN_PROGRESS", "ACTIVE"}
