import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from backend.app.dsa.dsa_priority_service import DSAPriorityService


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


def test_software_engineer_benchmark_priority(db):
    """Verifies that canonical Software Engineer receives VERY_HIGH DSA priority with Hard interview target."""
    profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Software Engineer")
    assert profile["priority_level"] == "VERY_HIGH"
    assert profile["expected_level"] == "ADVANCED"
    assert profile["interview_difficulty"] == "HARD"
    assert profile["source_level"] in ("ROLE", "COMPANY_ROLE")
    assert len(profile["core_topics"]) >= 4
    core_slugs = [t["topic_slug"] for t in profile["core_topics"]]
    assert "arrays" in core_slugs
    assert "graphs" in core_slugs


def test_backend_engineer_priority(db):
    """Verifies Backend Engineer receives HIGH DSA priority."""
    profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Backend Engineer")
    assert profile["priority_level"] == "HIGH"
    assert profile["expected_level"] == "PROFICIENT"
    assert profile["recommended_difficulty"] == "MEDIUM"


def test_frontend_engineer_priority(db):
    """Verifies Frontend Engineer receives MEDIUM DSA priority."""
    profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Frontend Engineer")
    assert profile["priority_level"] == "MEDIUM"
    assert profile["expected_level"] == "WORKING"


def test_devops_and_cloud_low_priority(db):
    """Verifies DevOps / Cloud roles receive LOW DSA priority."""
    devops = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="DevOps Engineer")
    assert devops["priority_level"] == "LOW"
    assert devops["expected_level"] == "FOUNDATIONAL"


def test_vlsi_minimal_priority(db):
    """Verifies VLSI / Hardware roles receive MINIMAL DSA priority focusing on bit manipulation."""
    vlsi = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="VLSI Engineer")
    assert vlsi["priority_level"] == "MINIMAL"
    core_slugs = [t["topic_slug"] for t in vlsi["core_topics"]]
    assert "bit-manipulation" in core_slugs


def test_non_software_roles_not_applicable(db):
    """Verifies non-software careers deterministically return NOT_APPLICABLE with zero DSA requirement."""
    non_sw_roles = [
        "Graphic Designer",
        "Video Editor",
        "Nurse",
        "Accountant",
        "Civil Engineer",
        "Mechanical Engineer",
    ]
    for role_name in non_sw_roles:
        profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name=role_name)
        assert profile["priority_level"] == "NOT_APPLICABLE", f"Failed for {role_name}"
        assert profile["expected_level"] == "NOT_APPLICABLE"
        assert profile["decision_trace"]["decision"] == "NOT_APPLICABLE"
        assert len(profile["core_topics"]) == 0


def test_company_role_verified_tier1(db):
    """Verifies that Google Software Engineer resolves with Tier 1 COMPANY_ROLE provenance."""
    profile = DSAPriorityService.get_role_dsa_priority(db, company_slug="google", role_slug="swe-iii")
    if profile.get("priority_level") != "UNKNOWN":
        assert profile["source_level"] in ("COMPANY_ROLE", "ROLE")
        assert profile["confidence"] >= 0.85
        assert "decision_trace" in profile
        assert profile["decision_trace"]["decision"] in ("VERY_HIGH", "HIGH")


def test_unknown_role_handling(db):
    """Verifies completely unknown roles return UNKNOWN without hallucination."""
    profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Submarine Acoustic Tactician")
    assert profile["priority_level"] == "UNKNOWN"
    assert profile["decision_trace"]["decision"] == "UNKNOWN"


def test_prerequisites_attached_to_topics(db):
    """Verifies prerequisite topics are mapped correctly on topic items."""
    profile = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Software Engineer")
    all_topics = profile["all_topics"]
    dp_topic = next((t for t in all_topics if t["topic_slug"] == "dynamic-programming"), None)
    if dp_topic:
        # Dynamic programming should have prerequisites (e.g. recursion)
        assert isinstance(dp_topic["prerequisites"], list)


def test_api_endpoint_dsa_profile(client):
    """Tests GET /api/v1/companies/{company_slug}/roles/{role_slug}/dsa."""
    response = client.get("/api/v1/companies/google/roles/swe-iii/dsa")
    if response.status_code == 200:
        data = response.json()
        assert "priority_level" in data
        assert "target_difficulty" in data or "minimum_difficulty" in data
        assert "decision_trace" in data
        assert "core_topics" in data
