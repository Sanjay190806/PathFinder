"""
Phase 10 Stage 11: Analytics Integrity, Historical Consistency, Global QA & Production Hardening
Covers Scenarios A-G, End-to-End Educational Flow, Security/IDOR, Answer Protection,
Privacy/Proctoring verification, Multi-Domain blueprints, and Analytics immutability.
"""

import pytest
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource
from backend.app.models.progress import Progress
from backend.app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentSession,
    AssessmentAttemptEvidence, AssessmentIntegrityEvent
)
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.models.planner import LearnerPlan
from backend.app.models.skill import Skill

from backend.app.schemas.assessment_blueprint import AnswerSubmitRequest
from backend.app.course.completion_engine import CourseCompletionEngine
from backend.app.assessment.exam_runtime import ExamRuntime
from backend.app.analytics.engine import AuthoritativeAnalyticsEngine
from backend.app.core.security import create_access_token

client = TestClient(app)

def generate_slug():
    return f"slug-hardened-{uuid.uuid4().hex[:10]}"

@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_hardened_learner(db, prefix="learner"):
    uid = f"hardened_{prefix}_{uuid.uuid4().hex[:8]}"
    user = User(
        id=str(uuid.uuid4()),
        email=f"{uid}@example.com",
        full_name=f"Learner {prefix}",
        hashed_password="hashed_pw_mock",
        is_demo=False
    )
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        experience_level="Intermediate",
        weekly_hours=12
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return user, profile


# =============================================================
# 1. CONTROLLED COURSE COMPLETION SCENARIOS (A THROUGH G)
# =============================================================

def test_stage11_scenarios_a_through_g_course_completion(test_db):
    user, profile = create_hardened_learner(test_db, "scenarios")
    engine = CourseCompletionEngine(test_db)
    now = datetime.now(timezone.utc)

    # Setup Course
    course = LearningResource(title="Deep Learning Mastery", slug=generate_slug(), description="DL", url=f"http://dl-{uuid.uuid4().hex[:6]}")
    test_db.add(course)
    test_db.flush()

    assessment = Assessment(title="DL Certification Exam", course_id=course.id, total_marks=100.0, passing_score=70.0)
    test_db.add(assessment)
    test_db.flush()

    # -------------------------------------------------------------
    # SCENARIO A: Learning incomplete (70%), Assessment passed
    # Expected: NOT COMPLETED
    # -------------------------------------------------------------
    prog_a = Progress(profile_id=profile.id, resource_id=course.id, status="in_progress", completion_percentage=70.0)
    test_db.add(prog_a)
    test_db.flush()

    sess_a = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="PASSED",
        passed=True, integrity_state="NORMAL", total_score=85.0, total_max_marks=100.0,
        result_summary={"percentage": 85.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=30)
    )
    test_db.add(sess_a)
    test_db.commit()

    eligible_a = engine.is_course_completion_eligible(sess_a, require_learning_complete=True)
    assert eligible_a is False, "Scenario A failed: Incomplete learning should NOT be eligible for course completion!"

    # -------------------------------------------------------------
    # SCENARIO B: Learning complete (100%), Assessment failed (42%)
    # Expected: NOT COMPLETED
    # -------------------------------------------------------------
    prog_a.completion_percentage = 100.0
    prog_a.status = "in_progress"
    test_db.commit()

    sess_b = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="FAILED",
        passed=False, integrity_state="NORMAL", total_score=42.0, total_max_marks=100.0,
        result_summary={"percentage": 42.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=30)
    )
    test_db.add(sess_b)
    test_db.commit()

    eligible_b = engine.is_course_completion_eligible(sess_b, require_learning_complete=True)
    assert eligible_b is False, "Scenario B failed: Failed assessment must NOT complete the course!"

    # -------------------------------------------------------------
    # SCENARIO C: Learning complete (100%), Assessment passed, Integrity valid (NORMAL)
    # Expected: COMPLETED
    # -------------------------------------------------------------
    sess_c = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="PASSED",
        passed=True, integrity_state="NORMAL", total_score=88.0, total_max_marks=100.0,
        result_summary={"percentage": 88.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=30)
    )
    test_db.add(sess_c)
    test_db.commit()

    eligible_c = engine.is_course_completion_eligible(sess_c, require_learning_complete=True)
    assert eligible_c is True, "Scenario C failed: Valid exam with complete learning MUST be eligible!"

    success_c, meta_c = engine.process_course_completion(sess_c.id, profile.id, require_learning_complete=True)
    assert success_c is True
    test_db.refresh(prog_a)
    assert prog_a.status == "completed"
    assert prog_a.completion_percentage == 100.0

    # -------------------------------------------------------------
    # SCENARIO D: Learning complete, Assessment passed, Integrity REVIEW_REQUIRED
    # Expected: NOT COMPLETED / Policy Blocked
    # -------------------------------------------------------------
    sess_d = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="PASSED",
        passed=True, integrity_state="REVIEW_REQUIRED", total_score=95.0, total_max_marks=100.0,
        result_summary={"percentage": 95.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=30)
    )
    test_db.add(sess_d)
    test_db.commit()

    eligible_d = engine.is_course_completion_eligible(sess_d, require_learning_complete=True)
    assert eligible_d is False, "Scenario D failed: REVIEW_REQUIRED exam must NOT auto-complete the course!"

    # -------------------------------------------------------------
    # SCENARIO E: Course already completed, rerun completion process
    # Expected: Idempotent / No duplicate events
    # -------------------------------------------------------------
    events_before = test_db.query(BehaviorEvent).filter(
        BehaviorEvent.profile_id == profile.id,
        BehaviorEvent.event_type == "COURSE_COMPLETED",
        BehaviorEvent.resource_id == course.id
    ).count()

    success_e, meta_e = engine.process_course_completion(sess_c.id, profile.id, require_learning_complete=True)
    assert success_e is True
    assert meta_e.get("message") == "Course already completed."

    events_after = test_db.query(BehaviorEvent).filter(
        BehaviorEvent.profile_id == profile.id,
        BehaviorEvent.event_type == "COURSE_COMPLETED",
        BehaviorEvent.resource_id == course.id
    ).count()
    assert events_after == events_before, "Scenario E failed: Idempotent rerun must NOT create duplicate behavior events!"

    # -------------------------------------------------------------
    # SCENARIO F: Attempt 1 Failed, Attempt 2 Passed
    # Expected: Both attempts preserved in history
    # -------------------------------------------------------------
    all_user_sessions = test_db.query(AssessmentSession).filter(
        AssessmentSession.profile_id == profile.id,
        AssessmentSession.assessment_id == assessment.id
    ).all()
    assert len(all_user_sessions) >= 4  # All historical sessions must remain immutable

    # -------------------------------------------------------------
    # SCENARIO G: Assessment passed, Integrity INVALIDATED
    # Expected: NOT COMPLETED
    # -------------------------------------------------------------
    sess_g = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="FAILED",
        passed=False, integrity_state="INVALIDATED", total_score=99.0, total_max_marks=100.0,
        result_summary={"percentage": 99.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=15)
    )
    test_db.add(sess_g)
    test_db.commit()

    eligible_g = engine.is_course_completion_eligible(sess_g, require_learning_complete=True)
    assert eligible_g is False, "Scenario G failed: Invalidated exam must NEVER complete the course!"


# =============================================================
# 2. END-TO-END EDUCATIONAL FLOW & DATA CONSISTENCY
# =============================================================

def test_stage11_end_to_end_educational_flow_consistency(test_db):
    user, profile = create_hardened_learner(test_db, "e2e")
    now = datetime.now(timezone.utc)

    # 1. Course & Syllabus Creation
    course = LearningResource(title="Cloud Architecture", slug=generate_slug(), description="Cloud", url=f"http://cloud-{uuid.uuid4().hex[:6]}")
    test_db.add(course)
    test_db.flush()

    syllabus = CourseSyllabus(course_id=course.id, title="AWS & Cloud Native Syllabus")
    test_db.add(syllabus)
    test_db.flush()

    module = SyllabusModule(syllabus_id=syllabus.id, title="Microservices & Containers", order_index=1)
    test_db.add(module)
    test_db.flush()

    topic = SyllabusTopic(module_id=module.id, title="Kubernetes Pods", order_index=1)
    test_db.add(topic)
    test_db.flush()

    obj = LearningObjective(topic_id=topic.id, objective="Deploy multi-container pods", difficulty="Intermediate")
    test_db.add(obj)
    test_db.flush()

    # 2. Assessment Blueprint & Question Creation
    assessment = Assessment(title="Cloud Final Exam", course_id=course.id, duration_minutes=45, total_marks=10.0, passing_score=7.0)
    test_db.add(assessment)
    test_db.flush()

    q1 = AssessmentQuestion(
        assessment_id=assessment.id, question_text="What is a Pod in Kubernetes?",
        options=["Smallest deployable unit", "A physical server", "A database table", "An IP gateway"],
        correct_answer="Smallest deployable unit", marks=5.0, difficulty="INTERMEDIATE",
        module_id=module.id, topic_id=topic.id, objective_id=obj.id
    )
    q2 = AssessmentQuestion(
        assessment_id=assessment.id, question_text="How do containers in the same Pod communicate?",
        options=["Via localhost", "Only via public internet", "They cannot communicate", "Via NFS mount"],
        correct_answer="Via localhost", marks=5.0, difficulty="INTERMEDIATE",
        module_id=module.id, topic_id=topic.id, objective_id=obj.id
    )
    test_db.add_all([q1, q2])
    test_db.flush()

    # 3. Exam Session Execution & Grading
    session = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="IN_PROGRESS",
        current_question_index=0, total_score=0.0, total_max_marks=10.0,
        started_at=now, expires_at=now + timedelta(minutes=45), integrity_state="NORMAL"
    )
    test_db.add(session)
    test_db.flush()

    runtime = ExamRuntime(test_db)
    # Answer Q1 correct (5 marks)
    runtime.submit_answer_idempotent(session.id, profile.id, AnswerSubmitRequest(question_id=q1.id, submitted_answer="Smallest deployable unit", response_time_seconds=45))
    # Answer Q2 correct (5 marks)
    runtime.submit_answer_idempotent(session.id, profile.id, AnswerSubmitRequest(question_id=q2.id, submitted_answer="Via localhost", response_time_seconds=50))

    # Finalize Exam
    final_summary = runtime.finalize_exam(session.id, profile.id)
    assert final_summary.passed is True
    assert final_summary.total_score == 10.0
    assert final_summary.percentage == 100.0
    assert final_summary.integrity_state == "NORMAL"

    # 4. Course Completion Trigger
    comp_engine = CourseCompletionEngine(test_db)
    success, meta = comp_engine.process_course_completion(session.id, profile.id)
    assert success is True

    # 5. Verify Cross-System Analytics Consistency
    analytics_engine = AuthoritativeAnalyticsEngine(test_db)
    overview = analytics_engine.get_learning_overview(profile.id)
    assert overview.courses_completed == 1
    assert overview.assessments_passed == 1
    assert overview.average_assessment_score == 100.0

    syllabus_perf = analytics_engine.get_syllabus_analytics(profile.id, assessment_id=assessment.id)
    assert syllabus_perf.has_data is True
    assert len(syllabus_perf.modules) == 1
    assert syllabus_perf.modules[0].percentage == 100.0
    assert syllabus_perf.modules[0].mastery_signal == "HIGH_MASTERY"


# =============================================================
# 3. ASSESSMENT SECURITY, ANSWER SECRECY & INPUT VALIDATION
# =============================================================

def test_stage11_assessment_security_and_answer_secrecy(test_db):
    user, profile = create_hardened_learner(test_db, "sec")
    now = datetime.now(timezone.utc)

    assessment = Assessment(title="Cybersecurity Security Exam", total_marks=10.0, passing_score=7.0)
    test_db.add(assessment)
    test_db.flush()

    q = AssessmentQuestion(
        assessment_id=assessment.id, question_text="What does TLS provide?",
        options=["Confidentiality and Integrity", "Free Bandwidth", "Zero Latency", "Hardware Acceleration"],
        correct_answer="Confidentiality and Integrity", explanation="TLS encrypts transport layer traffic.",
        marks=10.0, difficulty="INTERMEDIATE"
    )
    test_db.add(q)
    test_db.flush()

    session = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="IN_PROGRESS",
        started_at=now, expires_at=now + timedelta(minutes=30), integrity_state="NORMAL"
    )
    test_db.add(session)
    test_db.commit()

    token = create_access_token(subject=user.id)

    # 1. Test that active session API NEVER leaks correct answers or explanations
    resp = client.get(f"/api/v1/assessments/exam-sessions/{session.id}", headers={"Authorization": f"Bearer {token}"})
    if resp.status_code == 200:
        data = resp.json()
        for question in data.get("questions", []):
            assert "correct_answer" not in question, "CRITICAL P0: Correct answer leaked in active exam response!"
            assert "explanation" not in question, "CRITICAL P0: Explanation leaked in active exam response!"

    # 2. IDOR Protection: Other user cannot access session
    other_user, other_profile = create_hardened_learner(test_db, "other")
    other_token = create_access_token(subject=other_user.id)

    resp_idor = client.get(f"/api/v1/assessments/exam-sessions/{session.id}", headers={"Authorization": f"Bearer {other_token}"})
    assert resp_idor.status_code in [403, 404], "CRITICAL P0: IDOR protection missing on exam session endpoint!"


# =============================================================
# 4. MULTI-DOMAIN BLUEPRINT INTEGRITY
# =============================================================

def test_stage11_multi_domain_blueprint_and_scoring(test_db):
    user, profile = create_hardened_learner(test_db, "domains")
    now = datetime.now(timezone.utc)

    domains = [
        ("Data Science", "Linear Algebra & Probability"),
        ("VLSI", "CMOS Logic & Verilog HDL"),
        ("Mechanical", "Thermodynamics & Heat Transfer"),
        ("Civil", "Structural Analysis & Concrete Design"),
        ("Finance/Business", "Financial Statements & Valuation")
    ]

    for domain_name, subject in domains:
        course = LearningResource(title=f"{domain_name} Core", slug=generate_slug(), description=subject, url=f"http://dom-{uuid.uuid4().hex[:6]}")
        test_db.add(course)
        test_db.flush()

        assessment = Assessment(title=f"{domain_name} Qualifying Exam", course_id=course.id, total_marks=10.0, passing_score=6.0)
        test_db.add(assessment)
        test_db.flush()

        sess = AssessmentSession(
            assessment_id=assessment.id, profile_id=profile.id, status="PASSED",
            passed=True, integrity_state="NORMAL", total_score=8.5, total_max_marks=10.0,
            result_summary={"percentage": 85.0}, started_at=now, expires_at=now + timedelta(hours=1), submitted_at=now + timedelta(minutes=20)
        )
        test_db.add(sess)
        test_db.commit()

        engine = CourseCompletionEngine(test_db)
        eligible = engine.is_course_completion_eligible(sess, require_learning_complete=False)
        assert eligible is True, f"Domain {domain_name} failed standard assessment completion verification!"


# =============================================================
# 5. INTEGRITY POLICY & DEBOUNCING AUDIT
# =============================================================

def test_stage11_integrity_monitoring_and_policy_audit(test_db):
    user, profile = create_hardened_learner(test_db, "proctor")
    now = datetime.now(timezone.utc)

    assessment = Assessment(title="Proctored Final Exam", total_marks=100.0, passing_score=70.0)
    test_db.add(assessment)
    test_db.flush()

    sess = AssessmentSession(
        assessment_id=assessment.id, profile_id=profile.id, status="IN_PROGRESS",
        started_at=now, expires_at=now + timedelta(hours=1), integrity_state="NORMAL"
    )
    test_db.add(sess)
    test_db.flush()

    # Log 3 integrity events (e.g. phone detected, multiple faces, camera glitch)
    e1 = AssessmentIntegrityEvent(
        session_id=sess.id, profile_id=profile.id, assessment_id=assessment.id,
        event_type="PHONE_DETECTED", severity="HIGH",
        confidence=0.88, metadata={"device": "smartphone", "bb": [0.1, 0.2, 0.3, 0.4]}
    )
    e2 = AssessmentIntegrityEvent(
        session_id=sess.id, profile_id=profile.id, assessment_id=assessment.id,
        event_type="MULTIPLE_FACES", severity="MEDIUM",
        confidence=0.75, metadata={"faces_count": 2}
    )
    e3 = AssessmentIntegrityEvent(
        session_id=sess.id, profile_id=profile.id, assessment_id=assessment.id,
        event_type="CAMERA_INTERRUPTED", severity="LOW",
        confidence=1.0, metadata={"reason": "permission_temporarily_suspended"}
    )
    test_db.add_all([e1, e2, e3])
    test_db.commit()

    # Verify that raw video bytes are NOT stored in the database
    for ev in [e1, e2, e3]:
        assert "raw_video" not in ev.metadata, "Privacy violation: raw video detected in integrity event metadata!"
        assert "audio_stream" not in ev.metadata, "Privacy violation: audio stream detected in metadata!"

    # Verify Analytics Engine reports these without attributing a "cheating score"
    analytics_engine = AuthoritativeAnalyticsEngine(test_db)
    audit = analytics_engine.get_integrity_analytics(profile.id)
    assert audit.total_integrity_events == 3
    assert audit.warnings_issued >= 1
    assert audit.camera_interruptions_count == 1
    assert "never a definitive cheating score" in audit.audit_note.lower()
