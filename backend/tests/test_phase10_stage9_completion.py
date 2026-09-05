import pytest
import uuid

def generate_slug():
    return f"course-{uuid.uuid4()}"
from datetime import datetime, timezone
from backend.app.course.completion_engine import CourseCompletionEngine
from backend.app.models.assessment import Assessment, AssessmentSession
from backend.app.models.progress import Progress
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.database import SessionLocal

@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_course_completion_eligible(test_db):
    from backend.app.models.profile import LearnerProfile
    from backend.app.models.resource import LearningResource

    course = LearningResource(title="Test Course", slug=generate_slug(), description="Test Course", url="http://test")
    test_db.add(course)
    test_db.flush()

    profile = LearnerProfile(user_id=f"test_user_comp1_{uuid.uuid4().hex[:8]}")
    test_db.add(profile)
    test_db.flush()

    assessment = Assessment(
        title="Valid Exam",
        course_id=course.id,
    )
    test_db.add(assessment)
    test_db.commit()

    session = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="SUBMITTED",
        passed=True,
        integrity_state="NORMAL",
        expires_at=datetime.now(timezone.utc)
    )
    test_db.add(session)
    test_db.commit()

    engine = CourseCompletionEngine(test_db)
    assert engine.is_course_completion_eligible(session) is True

def test_course_completion_process_creates_event_and_progress(test_db):
    from backend.app.models.profile import LearnerProfile
    from backend.app.models.resource import LearningResource

    course = LearningResource(title="Test Course", slug=generate_slug(), description="Test Course", url="http://test")
    test_db.add(course)
    test_db.flush()

    profile = LearnerProfile(user_id=f"test_user_comp2_{uuid.uuid4().hex[:8]}")
    test_db.add(profile)
    test_db.flush()

    assessment = Assessment(
        title="Valid Exam 2",
        course_id=course.id,
    )
    test_db.add(assessment)
    test_db.commit()

    session = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="SUBMITTED",
        passed=True,
        integrity_state="NORMAL",
        total_score=100.0,
        result_summary={"percentage": 100.0},
        expires_at=datetime.now(timezone.utc)
    )
    test_db.add(session)
    test_db.commit()

    engine = CourseCompletionEngine(test_db)
    success, metadata = engine.process_course_completion(session.id, profile.id)

    assert success is True
    assert "trace" in metadata

    # Verify Progress created
    prog = test_db.query(Progress).filter(Progress.resource_id == course.id).first()
    assert prog is not None
    assert prog.status == "completed"
    assert prog.completion_percentage == 100.0

    # Verify Event created
    evt = test_db.query(BehaviorEvent).filter(
        BehaviorEvent.profile_id == profile.id,
        BehaviorEvent.event_type == "COURSE_COMPLETED"
    ).first()
    assert evt is not None
    assert evt.resource_id == course.id
