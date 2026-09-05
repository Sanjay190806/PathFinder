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
    Assessment, AssessmentSession, AssessmentAttemptEvidence, AssessmentIntegrityEvent
)
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.analytics.engine import AuthoritativeAnalyticsEngine
from backend.app.analytics.metric_definitions import get_all_metric_definitions, get_metric_definition
from backend.app.core.security import create_access_token

client = TestClient(app)

def generate_slug():
    return f"slug-{uuid.uuid4().hex[:10]}"

@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_test_learner(db, user_suffix=""):
    uid = f"user_{uuid.uuid4().hex[:8]}_{user_suffix}"
    user = User(
        id=str(uuid.uuid4()),
        email=f"{uid}@example.com",
        full_name=f"Learner {user_suffix}",
        hashed_password="mock_password_hash",
        is_demo=False
    )
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        experience_level="Intermediate",
        weekly_hours=10
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return user, profile


# -------------------------------------------------------------
# 1. Course Counts & Completion Rate Test
# -------------------------------------------------------------
def test_stage10_01_course_counts_and_completion_rate(test_db):
    user, profile = create_test_learner(test_db, "courses")
    engine = AuthoritativeAnalyticsEngine(test_db)

    # Initially empty state
    overview = engine.get_learning_overview(profile.id)
    assert overview.courses_started == 0
    assert overview.courses_completed == 0
    assert overview.course_completion_rate is None  # Must be None, not 0.0!

    # Create 3 courses: 2 completed, 1 in progress
    c1 = LearningResource(title="Course 1", slug=generate_slug(), description="C1", url="http://c1")
    c2 = LearningResource(title="Course 2", slug=generate_slug(), description="C2", url="http://c2")
    c3 = LearningResource(title="Course 3", slug=generate_slug(), description="C3", url="http://c3")
    test_db.add_all([c1, c2, c3])
    test_db.flush()

    p1 = Progress(profile_id=profile.id, resource_id=c1.id, status="completed", completion_percentage=100.0, time_spent_minutes=120)
    p2 = Progress(profile_id=profile.id, resource_id=c2.id, status="completed", completion_percentage=100.0, time_spent_minutes=180)
    p3 = Progress(profile_id=profile.id, resource_id=c3.id, status="in_progress", completion_percentage=50.0, time_spent_minutes=60)
    test_db.add_all([p1, p2, p3])
    test_db.commit()

    overview = engine.get_learning_overview(profile.id)
    assert overview.courses_started == 3
    assert overview.courses_completed == 2
    assert overview.courses_in_progress == 1
    # Completion rate: (2 / 3) * 100 = 66.7%
    assert overview.course_completion_rate == 66.7
    # Learning hours: (120 + 180 + 60) / 60 = 6.0 hours
    assert overview.learning_hours == 6.0


# -------------------------------------------------------------
# 2. Assessment Pass Rate & Academic vs. Integrity Separation
# -------------------------------------------------------------
def test_stage10_02_assessment_pass_rate_and_integrity_separation(test_db):
    user, profile = create_test_learner(test_db, "assessments")
    engine = AuthoritativeAnalyticsEngine(test_db)

    # Create an assessment
    assessment = Assessment(title="Exam A", duration_minutes=30, total_marks=100.0, passing_score=60.0)
    test_db.add(assessment)
    test_db.flush()

    now = datetime.now(timezone.utc)
    # Session 1: Valid Passed (Score 80%)
    s1 = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="PASSED",
        passed=True,
        integrity_state="NORMAL",
        total_score=80.0,
        total_max_marks=100.0,
        result_summary={"percentage": 80.0, "time_spent_seconds": 1200},
        started_at=now,
        expires_at=now + timedelta(hours=1),
        submitted_at=now + timedelta(minutes=20)
    )
    # Session 2: Valid Failed (Score 40%)
    s2 = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="FAILED",
        passed=False,
        integrity_state="NORMAL",
        total_score=40.0,
        total_max_marks=100.0,
        result_summary={"percentage": 40.0, "time_spent_seconds": 1500},
        started_at=now,
        expires_at=now + timedelta(hours=1),
        submitted_at=now + timedelta(minutes=25)
    )
    # Session 3: Invalidated Attempt (Score 90%, but INVALIDATED due to cheating policy)
    s3 = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="FAILED",
        passed=False,
        integrity_state="INVALIDATED",
        total_score=90.0,
        total_max_marks=100.0,
        result_summary={"percentage": 90.0, "time_spent_seconds": 600},
        started_at=now,
        expires_at=now + timedelta(hours=1),
        submitted_at=now + timedelta(minutes=10)
    )
    test_db.add_all([s1, s2, s3])
    test_db.commit()

    analytics = engine.get_assessment_analytics(profile.id)
    assert analytics.total_attempts == 3
    assert analytics.valid_attempts == 2
    assert analytics.invalidated_attempts == 1
    assert analytics.passed_attempts == 1
    assert analytics.failed_attempts == 1

    # Pass rate must be calculated on VALID attempts only: (1 / 2) * 100 = 50.0%
    assert analytics.pass_rate == 50.0
    # Average score must exclude invalidated attempt: mean(80.0, 40.0) = 60.0%
    assert analytics.average_score == 60.0
    assert analytics.highest_score == 80.0
    assert analytics.lowest_score == 40.0


# -------------------------------------------------------------
# 3. Module & Topic Syllabus Accuracy Test
# -------------------------------------------------------------
def test_stage10_03_syllabus_module_and_topic_analytics(test_db):
    user, profile = create_test_learner(test_db, "syllabus")
    engine = AuthoritativeAnalyticsEngine(test_db)

    # Create Course & Syllabus Structure
    course = LearningResource(title="AI Engineering", slug=generate_slug(), description="AI", url="http://ai")
    test_db.add(course)
    test_db.flush()

    syllabus = CourseSyllabus(course_id=course.id, title="AI Syllabus")
    test_db.add(syllabus)
    test_db.flush()

    m1 = SyllabusModule(syllabus_id=syllabus.id, title="Foundations of ML", order_index=1)
    test_db.add(m1)
    test_db.flush()

    t1 = SyllabusTopic(module_id=m1.id, title="Linear Regression", order_index=1)
    test_db.add(t1)
    test_db.flush()

    obj1 = LearningObjective(topic_id=t1.id, objective="Fit least-squares model", difficulty="Intermediate")
    test_db.add(obj1)
    test_db.flush()

    assessment = Assessment(title="ML Assessment", course_id=course.id)
    test_db.add(assessment)
    test_db.flush()

    sess = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="PASSED",
        passed=True,
        integrity_state="NORMAL",
        expires_at=datetime.now(timezone.utc)
    )
    test_db.add(sess)
    test_db.flush()

    # Evidence: 2 correct questions (2.0/2.0 each), 1 incorrect question (0.0/2.0)
    ev1 = AssessmentAttemptEvidence(
        session_id=sess.id,
        profile_id=profile.id,
        assessment_id=assessment.id,
        question_id=str(uuid.uuid4()),
        module_id=m1.id,
        topic_id=t1.id,
        objective_id=obj1.id,
        difficulty="INTERMEDIATE",
        is_correct=True,
        score=2.0,
        max_marks=2.0
    )
    ev2 = AssessmentAttemptEvidence(
        session_id=sess.id,
        profile_id=profile.id,
        assessment_id=assessment.id,
        question_id=str(uuid.uuid4()),
        module_id=m1.id,
        topic_id=t1.id,
        objective_id=obj1.id,
        difficulty="INTERMEDIATE",
        is_correct=True,
        score=2.0,
        max_marks=2.0
    )
    ev3 = AssessmentAttemptEvidence(
        session_id=sess.id,
        profile_id=profile.id,
        assessment_id=assessment.id,
        question_id=str(uuid.uuid4()),
        module_id=m1.id,
        topic_id=t1.id,
        objective_id=obj1.id,
        difficulty="INTERMEDIATE",
        is_correct=False,
        score=0.0,
        max_marks=2.0
    )
    test_db.add_all([ev1, ev2, ev3])
    test_db.commit()

    res = engine.get_syllabus_analytics(profile.id)
    assert res.has_data is True
    assert len(res.modules) == 1
    assert res.modules[0].module_title == "Foundations of ML"
    assert res.modules[0].questions_attempted == 3
    assert res.modules[0].questions_correct == 2
    # Percentage: (4.0 / 6.0) * 100 = 66.7%
    assert res.modules[0].percentage == 66.7
    assert res.modules[0].mastery_signal == "PROFICIENT"

    # Topic accuracy
    assert len(res.topics) == 1
    assert res.topics[0].topic_title == "Linear Regression"
    assert res.topics[0].percentage == 66.7

    # Learning objective accuracy
    assert len(res.learning_objectives) == 1
    assert res.learning_objectives[0].objective_title == "Fit least-squares model"
    assert res.learning_objectives[0].evidence_count == 3


# -------------------------------------------------------------
# 4. Streak Calculation Only with Qualifying Activity
# -------------------------------------------------------------
def test_stage10_04_learning_consistency_qualifying_streak(test_db):
    user, profile = create_test_learner(test_db, "streak")
    engine = AuthoritativeAnalyticsEngine(test_db)

    now = datetime.now(timezone.utc)
    today = now.date()
    yesterday = today - timedelta(days=1)
    two_days_ago = today - timedelta(days=2)

    # 1. Non-qualifying events (e.g. AI chat / page visit) shouldn't advance learning streak
    e_junk = BehaviorEvent(
        event_id=f"evt_{uuid.uuid4().hex[:12]}",
        profile_id=profile.id,
        event_type="AI_CHAT_MESSAGE",
        timestamp=now - timedelta(days=5)
    )
    test_db.add(e_junk)
    test_db.commit()

    streak_res = engine.get_learning_consistency(profile.id)
    assert streak_res.current_streak == 0

    # 2. Add qualifying activity on yesterday and today
    e_today = BehaviorEvent(
        event_id=f"evt_{uuid.uuid4().hex[:12]}",
        profile_id=profile.id,
        event_type="RESOURCE_COMPLETED",
        timestamp=now
    )
    e_yesterday = BehaviorEvent(
        event_id=f"evt_{uuid.uuid4().hex[:12]}",
        profile_id=profile.id,
        event_type="COURSE_STARTED",
        timestamp=now - timedelta(days=1)
    )
    test_db.add_all([e_today, e_yesterday])
    test_db.commit()

    streak_res = engine.get_learning_consistency(profile.id)
    assert streak_res.current_streak == 2
    assert streak_res.longest_streak >= 2


# -------------------------------------------------------------
# 5. Metric Definitions Endpoint
# -------------------------------------------------------------
def test_stage10_05_metric_definitions_registry():
    defs = get_all_metric_definitions()
    assert len(defs) >= 10

    comp_def = get_metric_definition("course_completion_rate")
    assert comp_def is not None
    assert comp_def.metric_key == "course_completion_rate"
    assert "courses_completed" in comp_def.formula

    pass_def = get_metric_definition("assessment_pass_rate")
    assert pass_def is not None
    assert "non-invalidated" in pass_def.description


# -------------------------------------------------------------
# 6. IDOR and Private Learner Authorization Test
# -------------------------------------------------------------
def test_stage10_06_security_and_idor_protection(test_db):
    user_a, profile_a = create_test_learner(test_db, "userA")
    user_b, profile_b = create_test_learner(test_db, "userB")

    # Add course to User A only
    c = LearningResource(title="Private Course A", slug=generate_slug(), description="C", url="http://a")
    test_db.add(c)
    test_db.flush()
    p_a = Progress(profile_id=profile_a.id, resource_id=c.id, status="completed", completion_percentage=100.0, time_spent_minutes=90)
    test_db.add(p_a)
    test_db.commit()

    token_a = create_access_token(subject=user_a.id)
    token_b = create_access_token(subject=user_b.id)

    # User A requests overview -> 1 completed
    resp_a = client.get("/api/v1/analytics/overview", headers={"Authorization": f"Bearer {token_a}"})
    assert resp_a.status_code == 200
    assert resp_a.json()["courses_completed"] == 1

    # User B requests overview -> 0 completed (No data leaked)
    resp_b = client.get("/api/v1/analytics/overview", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b.status_code == 200
    assert resp_b.json()["courses_completed"] == 0
    assert resp_b.json()["profile_id"] == profile_b.id
