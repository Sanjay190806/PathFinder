import pytest
import uuid

def generate_slug():
    return f"course-{uuid.uuid4()}"

from datetime import datetime, timezone
from backend.app.assessment.exam_runtime import ExamRuntime
from backend.app.models.assessment import Assessment, AssessmentSession, AssessmentQuestion
from backend.app.course.completion_engine import CourseCompletionEngine
from backend.app.database import SessionLocal

@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_evaluation_separates_academic_and_integrity_result(test_db):
    from backend.app.models.profile import LearnerProfile
    from backend.app.models.resource import LearningResource

    # Create Resource (Course)
    course = LearningResource(title="Test Course", slug=generate_slug(), description="Test Course", url="http://test")
    test_db.add(course)
    test_db.flush()

    # Create Profile
    profile = LearnerProfile(user_id=f"test_user_eval_{uuid.uuid4().hex[:8]}")
    test_db.add(profile)
    test_db.flush()

    # Create Assessment
    assessment = Assessment(
        title="Final Exam",
        course_id=course.id,
        duration_minutes=60,
        total_questions=1,
        total_marks=10.0,
        passing_score=50.0
    )
    test_db.add(assessment)
    test_db.flush()

    # Create Question
    q = AssessmentQuestion(
        assessment_id=assessment.id,
        question_text="Q1",
        question_type="MCQ",
        correct_option_index=0,
        marks=10.0
    )
    test_db.add(q)
    test_db.flush()

    # Create Session with Review Required
    session = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="IN_PROGRESS",
        expires_at=datetime.now(timezone.utc),
        integrity_state="REVIEW_REQUIRED",  # Failed integrity
        answers={
            q.id: {
                "selected_option_index": 0,
                "is_correct": True,
                "score": 10.0,
                "max_marks": 10.0
            }
        }
    )
    test_db.add(session)
    test_db.commit()

    runtime = ExamRuntime(test_db)
    result = runtime.finalize_exam(session.id, profile.id)

    # Academically passing (100%) but overall failed due to integrity
    assert result.percentage == 100.0
    assert result.integrity_state == "REVIEW_REQUIRED"
    assert result.passed is False
    assert result.course_completion_eligible is False
    assert result.course_completed is False

def test_decision_trace_generation(test_db):
    from backend.app.models.profile import LearnerProfile
    from backend.app.models.resource import LearningResource

    course = LearningResource(title="Test Course", slug=generate_slug(), description="Test Course", url="http://test")
    test_db.add(course)
    test_db.flush()

    profile = LearnerProfile(user_id=f"test_user_trace_{uuid.uuid4().hex[:8]}")
    test_db.add(profile)
    test_db.flush()
    assessment = Assessment(
        title="Trace Test Exam",
        course_id=course.id,
        duration_minutes=60,
        passing_score=50.0
    )
    test_db.add(assessment)
    test_db.commit()

    session = AssessmentSession(
        assessment_id=assessment.id,
        profile_id=profile.id,
        status="IN_PROGRESS",
        expires_at=datetime.now(timezone.utc),
        integrity_state="NORMAL"
    )
    test_db.add(session)
    test_db.commit()

    runtime = ExamRuntime(test_db)
    runtime.finalize_exam(session.id, profile.id)

    # Fetch updated session
    test_db.refresh(session)
    assert "decision_trace" in session.result_summary
    trace = session.result_summary["decision_trace"]
    assert trace["decision_type"] == "assessment_evaluation"
    assert trace["target_role"] == "Learner"
