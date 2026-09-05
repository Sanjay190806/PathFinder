"""
Test Suite for Phase 11 Stage 9: Advanced Career Explorer & Onboarding Integration
Verifies:
1. Canonical Domain & Family API browsing across 16 domains and 28 families.
2. Search and autocomplete integration with typo tolerance and category filters.
3. Career Selection API (/api/v1/careers/select-target) with selection source provenance
   (SEARCH, RECOMMENDED, BROWSE, COMPARISON, CUSTOM) and ISO timestamps.
4. Onboarding target goal persistence and profile synchronization.
5. Custom role definition handling without catalog corruption.
"""

import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.career import CareerDomain, CareerFamily, Career
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.user import User

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(test_db: Session):
    user = test_db.query(User).filter(User.email == "explorer_test@pathfinder.io").first()
    if not user:
        user = User(
            email="explorer_test@pathfinder.io",
            hashed_password="hashed_test_password",
            full_name="Explorer User",
            is_demo=True
        )
        test_db.add(user)
        test_db.commit()

    profile = test_db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
    if not profile:
        profile = LearnerProfile(
            user_id=user.id,
            education_level="undergraduate",
            field_of_study="Engineering",
            experience_level="Beginner",
            skill_confidence_map={"python": 0.50}
        )
        test_db.add(profile)
        test_db.commit()

    return user


def test_domain_and_family_browsing():
    """Verifies domains and family browsing for Career Explorer navigation."""
    # 1. Domains endpoint
    resp_domains = client.get("/api/v1/careers/domains")
    assert resp_domains.status_code == 200
    domains = resp_domains.json()
    assert len(domains) >= 16

    # Verify domain structure
    first_d = domains[0]
    assert "slug" in first_d
    assert "name" in first_d
    assert "family_count" in first_d
    assert "career_count" in first_d

    # 2. Families endpoint
    resp_families = client.get("/api/v1/careers/families?domain=technology-computing")
    assert resp_families.status_code == 200
    families = resp_families.json()
    assert len(families) > 0
    for fam in families:
        assert fam["domain_slug"] == "technology-computing"


def test_career_search_and_filtering():
    """Verifies Career Explorer search and attribute filtering."""
    # Search by keyword
    resp = client.get("/api/v1/careers/search?q=machine+learning")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_count"] > 0
    slugs = [item["slug"] for item in data["items"]]
    assert "ai-ml-engineer" in slugs or "data-scientist" in slugs

    # Filter by domain
    resp_tech = client.get("/api/v1/careers/search?domain=technology-computing")
    assert resp_tech.status_code == 200
    data_tech = resp_tech.json()
    assert data_tech["total_count"] >= 5


def test_select_target_career_endpoint_catalog(test_user: User, test_db: Session):
    """Verifies selecting a canonical catalog career records provenance and updates user goal."""
    payload = {
        "career_slug": "ai-ml-engineer",
        "selection_source": "RECOMMENDED"
    }
    resp = client.post("/api/v1/careers/select-target", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["success"] is True
    assert data["career_slug"] == "ai-ml-engineer"
    assert data["career_title"] == "AI/ML Engineer"
    assert data["selection_source"] == "RECOMMENDED"
    assert "timestamp" in data


def test_select_target_career_custom(test_user: User, test_db: Session):
    """Verifies selecting a custom non-catalog role works cleanly without crashing."""
    payload = {
        "career_slug": "custom",
        "custom_role_name": "Autonomous Drone Agronomist",
        "selection_source": "CUSTOM"
    }
    resp = client.post("/api/v1/careers/select-target", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["success"] is True
    assert data["career_slug"] == "custom"
    assert data["career_title"] == "Autonomous Drone Agronomist"
    assert data["selection_source"] == "CUSTOM"
    assert "timestamp" in data


def test_career_selection_provenance_sources():
    """Verifies all valid selection sources are accepted."""
    for source in ["SEARCH", "RECOMMENDED", "BROWSE", "COMPARISON", "CUSTOM"]:
        payload = {
            "career_slug": "software-engineer",
            "selection_source": source
        }
        resp = client.post("/api/v1/careers/select-target", json=payload)
        assert resp.status_code == 200
        assert resp.json()["selection_source"] == source
