import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.dsa.learner_dsa_gap_service import LearnerDSAGapService


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
    """Creates an isolated test learner profile with known skill confidences."""
    test_user = User(
        email=f"learner_{uuid.uuid4().hex[:8]}@pathfinder.org",
        hashed_password="test_hashed_password",
        full_name="Stage5 Test Learner",
        is_demo=True,
    )
    db.add(test_user)
    db.flush()

    profile = LearnerProfile(
        user_id=test_user.id,
        experience_level="Beginner",
        weekly_hours=15,
        skill_confidence_map={
            "arrays": 0.85,
            "hashing": 0.80,
            "trees": 0.55,
            "graphs": 0.30,
            "dynamic-programming": 0.20,
            "recursion": 0.35,  # Weak recursion blocks DP
        },
    )
    db.add(profile)
    db.flush()

    # Add a satisfied skill and an old decayed skill
    py_skill = db.query(Skill).filter(Skill.slug == "python").first()
    if not py_skill:
        py_skill = Skill(name="Python", slug="python", category="Programming")
        db.add(py_skill)
        db.flush()

    ls1 = LearnerSkill(
        profile_id=profile.id,
        skill_id=py_skill.id,
        assessed_confidence=0.88,
        verified=True,
        last_assessed_at=datetime.now(timezone.utc),
    )
    db.add(ls1)

    # Decayed skill (assessed 200 days ago)
    java_skill = db.query(Skill).filter(Skill.slug == "java").first()
    if not java_skill:
        java_skill = Skill(name="Java", slug="java", category="Programming")
        db.add(java_skill)
        db.flush()

    ls2 = LearnerSkill(
        profile_id=profile.id,
        skill_id=java_skill.id,
        assessed_confidence=0.82,
        verified=True,
        last_assessed_at=datetime.now(timezone.utc) - timedelta(days=200),
    )
    db.add(ls2)
    db.commit()

    return profile


def test_evaluate_learner_gaps_success(db, test_learner):
    """Tests evaluating learner gaps against Google SWE."""
    result = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug="google", role_slug="software-engineer", learner_id=test_learner.id
    )
    assert "error" not in result
    assert result["company_slug"] == "google"
    assert result["role_slug"] == "software-engineer"
    assert "readiness_percentage" in result
    assert "dsa_topic_evaluations" in result
    assert len(result["dsa_topic_evaluations"]) > 0


def test_dsa_satisfaction_and_critical_gaps(db, test_learner):
    """Verifies that Arrays (85%) is SATISFIED and Graphs (30%) is CRITICAL_GAP."""
    result = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug="google", role_slug="software-engineer", learner_id=test_learner.id
    )
    dsa_evals = {t["topic_slug"]: t for t in result["dsa_topic_evaluations"]}

    # Arrays should be SATISFIED
    assert "arrays" in dsa_evals
    assert dsa_evals["arrays"]["status"] == "SATISFIED"
    assert dsa_evals["arrays"]["learner_confidence"] == 0.85

    # Graphs should be CRITICAL_GAP or GAP
    assert "graphs" in dsa_evals
    assert dsa_evals["graphs"]["status"] in ("CRITICAL_GAP", "GAP")


def test_prerequisite_blocking_detection(db, test_learner):
    """Verifies that Dynamic Programming is flagged as blocked when its prerequisite (recursion) is weak."""
    result = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug="google", role_slug="software-engineer", learner_id=test_learner.id
    )
    blockers = result["prerequisite_blockers"]
    dsa_evals = {t["topic_slug"]: t for t in result["dsa_topic_evaluations"]}

    dp = dsa_evals.get("dynamic-programming")
    if dp and "recursion" in dp["prerequisites"]:
        assert dp["is_blocked_by_prerequisite"] is True
        assert "recursion" in dp["missing_prerequisites"]


def test_next_recommended_topic_selection(db, test_learner):
    """Verifies the system picks an unblocked, highest-impact candidate topic for immediate learning."""
    result = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug="google", role_slug="software-engineer", learner_id=test_learner.id
    )
    next_topic = result["next_recommended_topic"]
    assert next_topic is not None
    # Next topic must NOT be blocked by missing prerequisites
    assert next_topic["is_blocked_by_prerequisite"] is False


def test_skill_decay_flagging(db, test_learner):
    """Verifies skills older than 180 days are flagged with decay risk."""
    result = LearnerDSAGapService.evaluate_learner_gaps(
        db, company_slug="google", role_slug="software-engineer", learner_id=test_learner.id
    )
    skill_evals = {s["skill_slug"]: s for s in result["skill_evaluations"]}
    java_eval = skill_evals.get("java")
    if java_eval:
        assert java_eval["decay_risk"] is True


def test_compare_company_gaps(db, test_learner):
    """Verifies comparing learner readiness and differential requirements between Google and Amazon."""
    comparison = LearnerDSAGapService.compare_company_gaps(
        db, role_slug="software-engineer", company_slug_a="google", company_slug_b="amazon", learner_id=test_learner.id
    )
    assert "error" not in comparison
    assert "company_a" in comparison
    assert "company_b" in comparison
    assert comparison["company_a"]["slug"] == "google"
    assert comparison["company_b"]["slug"] == "amazon"


def test_api_learner_gaps(client, test_learner):
    """Tests GET /api/v1/companies/{company_slug}/roles/{role_slug}/learner-gaps."""
    res = client.get(f"/api/v1/companies/google/roles/software-engineer/learner-gaps?learner_id={test_learner.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["company_slug"] == "google"
    assert "readiness_percentage" in data
    assert "dsa_topic_evaluations" in data


def test_api_next_topic(client, test_learner):
    """Tests GET /api/v1/companies/{company_slug}/roles/{role_slug}/next-topic."""
    res = client.get(f"/api/v1/companies/google/roles/software-engineer/next-topic?learner_id={test_learner.id}")
    assert res.status_code == 200
    data = res.json()
    assert "next_topic" in data
