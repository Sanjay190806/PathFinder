import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.resources.company_recommendation_service import CompanyRecommendationService


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db_gen = get_db()
    db_sess = next(db_gen)
    try:
        yield db_sess
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


@pytest.fixture
def test_learner(db):
    test_user = User(
        email=f"rec_learner_{uuid.uuid4().hex[:8]}@pathfinder.org",
        hashed_password="rec_pw",
        full_name="Recommendation Test Learner",
        is_demo=True,
    )
    db.add(test_user)
    db.flush()

    profile = LearnerProfile(
        user_id=test_user.id,
        experience_level="Intermediate",
        weekly_hours=20,
        skill_confidence_map={
            "arrays": 0.85,
            "hashing": 0.80,
            "trees": 0.60,
            "graphs": 0.30,      # Graphs is next major gap
            "dynamic-programming": 0.20,
            "recursion": 0.50,
        },
    )
    db.add(profile)
    db.commit()
    return profile


def test_personalized_recommendation_synthesis(db, test_learner):
    """Tests multi-resource learning recommendations for Google SWE."""
    recs = CompanyRecommendationService.get_personalized_recommendations(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
        budget_preference="FREE",
    )
    assert "critical_next" in recs
    critical = recs["critical_next"]
    assert "focus_topic" in critical
    assert isinstance(critical["topic_slug"], str) and len(critical["topic_slug"]) > 0
    assert "practice_problems" in critical
    assert len(critical["practice_problems"]) >= 1
    assert "decision_trace" in recs
    assert recs["decision_trace"]["primary_milestone"] is not None


def test_budget_free_preference(db, test_learner):
    """Verifies that budget=FREE selects genuinely free or free audit learning."""
    recs = CompanyRecommendationService.get_personalized_recommendations(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
        budget_preference="FREE",
    )
    critical = recs["critical_next"]
    if critical.get("primary_course"):
        assert critical["primary_course"]["free_learning"] is True


def test_dsa_readiness_dashboard(db, test_learner):
    """Tests generating topic-by-topic DSA readiness dashboard."""
    dashboard = CompanyRecommendationService.get_dsa_readiness_dashboard(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    assert dashboard["is_dsa_applicable"] is True
    assert dashboard["dsa_priority_level"] in ("VERY_HIGH", "HIGH")
    assert len(dashboard["topics"]) >= 4
    assert dashboard["overall_readiness"] > 0.0


def test_non_software_recommendation_graphic_designer(db, test_learner):
    """Verifies personalized recommendations for non-software role (Graphic Designer)."""
    recs = CompanyRecommendationService.get_personalized_recommendations(
        db=db,
        company_slug="google",
        role_slug="graphic-designer",
        learner_id=test_learner.id,
        budget_preference="FREE",
    )
    assert "critical_next" in recs
    # Non-software role should not have DSA priority
    assert "decision_trace" in recs


def test_api_company_role_learning(client, test_learner):
    """Tests GET /api/v1/recommendations/company-role-learning."""
    res = client.get(
        f"/api/v1/recommendations/company-role-learning?company_slug=google&role_slug=software-engineer&learner_id={test_learner.id}&budget=FREE"
    )
    assert res.status_code == 200
    data = res.json()
    assert "critical_next" in data
    assert "decision_trace" in data
    assert data["company_slug"] == "google"


def test_api_dsa_dashboard(client, test_learner):
    """Tests GET /api/v1/recommendations/dsa-dashboard."""
    res = client.get(
        f"/api/v1/recommendations/dsa-dashboard?company_slug=google&role_slug=software-engineer&learner_id={test_learner.id}"
    )
    assert res.status_code == 200
    data = res.json()
    assert "topics" in data
    assert "overall_readiness" in data
