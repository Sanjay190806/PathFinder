import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.roadmap.company_roadmap_service import CompanyRoadmapService


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
        email=f"roadmap_learner_{uuid.uuid4().hex[:8]}@pathfinder.org",
        hashed_password="test_pw",
        full_name="Roadmap Test Learner",
        is_demo=True,
    )
    db.add(test_user)
    db.flush()

    profile = LearnerProfile(
        user_id=test_user.id,
        experience_level="Beginner",
        weekly_hours=15,
        skill_confidence_map={
            "arrays": 0.85,     # Arrays satisfied
            "trees": 0.35,      # Trees weak
            "graphs": 0.20,     # Graphs weak
        },
    )
    db.add(profile)
    db.commit()
    return profile


def test_generate_company_roadmap(db, test_learner):
    """Tests generating a 7-stage company-aware roadmap for Google SWE."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    assert "roadmap_id" in roadmap
    assert roadmap["version"] == 1
    assert roadmap["total_stages"] == 7
    assert roadmap["total_items"] >= 7
    assert roadmap["total_estimated_hours"] > 30.0
    assert roadmap["dsa_priority"] in ("VERY_HIGH", "HIGH")
    assert "decision_trace" in roadmap


def test_prerequisite_ordering_and_locking(db, test_learner):
    """Verifies that downstream items with missing prerequisites are marked LOCKED, and satisfied items COMPLETED."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    items_by_slug = {i["topic_slug"]: i for i in roadmap["items"] if i.get("topic_slug")}

    # Arrays was satisfied in test_learner -> should be COMPLETED
    if "arrays" in items_by_slug:
        assert items_by_slug["arrays"]["status"] == "COMPLETED"

    # Graphs requires trees, which was weak (0.35) -> should be LOCKED
    if "graphs" in items_by_slug:
        assert items_by_slug["graphs"]["status"] == "LOCKED"


def test_difficulty_progression(db, test_learner):
    """Verifies roadmap items progress across EASY -> MEDIUM -> HARD."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    diffs = [i["difficulty"] for i in roadmap["items"]]
    assert "EASY" in diffs
    assert "MEDIUM" in diffs
    assert "HARD" in diffs


def test_switch_target_company(db, test_learner):
    """Verifies switching target company increments version and tracks change reason."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    r_id = roadmap["roadmap_id"]

    updated = CompanyRoadmapService.switch_target_company(
        db=db,
        roadmap_id=r_id,
        new_company_slug="zerodha",
        new_role_slug="software-engineer",
    )
    assert "error" not in updated
    assert updated["version"] == 2
    assert updated["company_slug"] == "zerodha"
    assert "Target employer switched from Google to Zerodha" in updated["change_reason"]


def test_planner_handoff_format(db, test_learner):
    """Verifies conversion of roadmap to Phase 9 Planner handoff format."""
    roadmap = CompanyRoadmapService.generate_company_roadmap(
        db=db,
        company_slug="google",
        role_slug="software-engineer",
        learner_id=test_learner.id,
    )
    r_id = roadmap["roadmap_id"]

    handoff = CompanyRoadmapService.get_planner_handoff(r_id)
    assert "error" not in handoff
    assert handoff["roadmap_id"] == r_id
    assert len(handoff["items"]) > 0
    first_item = handoff["items"][0]
    assert "planned_hours" in first_item
    assert "recommended_order" in first_item
    assert "difficulty" in first_item


def test_api_generate_and_get_roadmap(client, test_learner):
    """Tests GET /api/v1/company-roadmaps/generate and GET /api/v1/company-roadmaps/{roadmap_id}."""
    res = client.get(
        f"/api/v1/company-roadmaps/generate?company_slug=google&role_slug=software-engineer&learner_id={test_learner.id}"
    )
    assert res.status_code == 200
    data = res.json()
    r_id = data["roadmap_id"]

    # Retrieve by ID
    res2 = client.get(f"/api/v1/company-roadmaps/{r_id}")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["roadmap_id"] == r_id


def test_api_switch_company(client, test_learner):
    """Tests POST /api/v1/company-roadmaps/{roadmap_id}/switch-company."""
    res = client.get(
        f"/api/v1/company-roadmaps/generate?company_slug=google&role_slug=software-engineer&learner_id={test_learner.id}"
    )
    r_id = res.json()["roadmap_id"]

    switch_res = client.post(
        f"/api/v1/company-roadmaps/{r_id}/switch-company",
        json={"new_company_slug": "nvidia", "new_role_slug": "vlsi-hardware-engineer"},
    )
    assert switch_res.status_code == 200
    data = switch_res.json()
    assert data["version"] == 2
    assert data["company_slug"] == "nvidia"


def test_api_planner_handoff(client, test_learner):
    """Tests GET /api/v1/company-roadmaps/{roadmap_id}/planner-handoff."""
    res = client.get(
        f"/api/v1/company-roadmaps/generate?company_slug=google&role_slug=software-engineer&learner_id={test_learner.id}"
    )
    r_id = res.json()["roadmap_id"]

    handoff_res = client.get(f"/api/v1/company-roadmaps/{r_id}/planner-handoff")
    assert handoff_res.status_code == 200
    data = handoff_res.json()
    assert "items" in data
    assert len(data["items"]) > 0
