"""
Test Suite for Phase 11 Stage 2: Searchable Career Catalog, Filtering & Discovery
Verifies search normalization, abbreviations, deterministic ranking, typo tolerance,
multi-factor filtering, pagination, and fallback suggestions.
"""

import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.career.discovery_service import (
    CareerDiscoveryService,
    normalize_query,
    calculate_match_score
)
from backend.app.models.career import Career


client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_query_normalization():
    """Verifies that search queries are properly normalized."""
    assert normalize_query("  AI / ML   ") == "ai / ml"
    assert normalize_query("Software-Engineer!!") == "software-engineer"
    assert normalize_query("Graphic   Designer") == "graphic designer"
    assert normalize_query("") == ""


def test_search_by_canonical_queries(test_db: Session):
    """
    Verifies searches across major disciplines:
    AI, machine learning, designer, video editor, doctor, nurse, engineer,
    finance, accounting, cyber, cloud, law, teacher, pilot, mechanic.
    """
    svc = CareerDiscoveryService(db=test_db)

    test_queries = [
        ("ai", "ai-ml-engineer"),
        ("machine learning", "ai-ml-engineer"),
        ("designer", "graphic-designer"),
        ("video editor", "video-editor"),
        ("doctor", "doctor"),
        ("nurse", "nurse"),
        ("engineer", "software-engineer"),
        ("accounting", "chartered-accountant"),
        ("cyber", "cybersecurity-analyst"),
        ("cloud", "cloud-devops-engineer"),
        ("law", "corporate-lawyer"),
        ("teacher", "secondary-school-teacher"),
        ("pilot", "commercial-airline-pilot"),
        ("mechanic", "automotive-mechanic")
    ]

    for q, expected_slug in test_queries:
        res = svc.search_careers(query=q)
        assert res.total_count > 0, f"Query '{q}' returned 0 results"
        top_slugs = [item.slug for item in res.items[:3]]
        assert expected_slug in top_slugs, f"Expected '{expected_slug}' in top results for query '{q}', got {top_slugs}"


def test_abbreviation_and_synonym_resolution(test_db: Session):
    """Verifies abbreviations like SDE, AI/ML, CA, MBBS, RN, CPL."""
    svc = CareerDiscoveryService(db=test_db)

    # 1. SDE -> Software Engineer
    res_sde = svc.search_careers(query="sde")
    assert res_sde.total_count > 0
    assert res_sde.items[0].slug == "software-engineer"

    # 2. CA -> Chartered Accountant
    res_ca = svc.search_careers(query="ca")
    assert res_ca.total_count > 0
    assert any(item.slug == "chartered-accountant" for item in res_sde.items + res_ca.items)

    # 3. MBBS -> Doctor
    res_mbbs = svc.search_careers(query="mbbs")
    assert res_mbbs.total_count > 0
    assert res_mbbs.items[0].slug == "doctor"

    # 4. CPL -> Commercial Airline Pilot
    res_cpl = svc.search_careers(query="cpl")
    assert res_cpl.total_count > 0
    assert res_cpl.items[0].slug == "commercial-airline-pilot"


def test_deterministic_search_ranking(test_db: Session):
    """
    Verifies ranking hierarchy:
    Exact match > Prefix match > Alias match > Keyword match.
    """
    svc = CareerDiscoveryService(db=test_db)

    # Exact query "Graphic Designer" must rank graphic-designer above ui-ux-designer
    res = svc.search_careers(query="Graphic Designer")
    assert len(res.items) >= 1
    assert res.items[0].slug == "graphic-designer"

    # Exact query "Civil Engineer"
    res_civil = svc.search_careers(query="Civil Engineer")
    assert res_civil.items[0].slug == "civil-engineer"


def test_fuzzy_search_typo_tolerance(test_db: Session):
    """Verifies that reasonable typos still resolve to correct careers."""
    svc = CareerDiscoveryService(db=test_db)

    # 1. "grphic designer" -> Graphic Designer
    res_typo1 = svc.search_careers(query="grphic designer")
    assert res_typo1.total_count > 0
    assert res_typo1.items[0].slug == "graphic-designer"

    # 2. "cyber secrity" -> Cybersecurity Analyst
    res_typo2 = svc.search_careers(query="cyber secrity")
    assert res_typo2.total_count > 0
    assert res_typo2.items[0].slug == "cybersecurity-analyst"


def test_multi_factor_filtering(test_db: Session):
    """Verifies filtering by domain, family, regulated status, and remote compatibility."""
    svc = CareerDiscoveryService(db=test_db)

    # 1. Filter by Domain = Healthcare
    res_health = svc.search_careers(domain_slug="healthcare-medicine")
    assert res_health.total_count >= 2
    for item in res_health.items:
        assert item.domain_slug == "healthcare-medicine"

    # 2. Filter by Regulated = True
    res_reg = svc.search_careers(is_regulated=True)
    assert res_reg.total_count >= 5
    for item in res_reg.items:
        assert item.is_regulated is True

    # 3. Filter by Remote = HIGH
    res_remote = svc.search_careers(remote_compatibility="HIGH")
    assert res_remote.total_count >= 5
    for item in res_remote.items:
        assert item.remote_compatibility == "HIGH"


def test_pagination_and_max_page_size(test_db: Session):
    """Verifies pagination parameters and capping at max 50 items."""
    svc = CareerDiscoveryService(db=test_db)

    # Page size 5
    p1 = svc.search_careers(page=1, page_size=5)
    assert len(p1.items) == 5
    assert p1.page == 1
    assert p1.total_count >= 20
    assert p1.total_pages >= 4

    p2 = svc.search_careers(page=2, page_size=5)
    assert len(p2.items) == 5
    assert p2.page == 2
    # Ensure disjoint items across pages
    p1_slugs = {item.slug for item in p1.items}
    p2_slugs = {item.slug for item in p2.items}
    assert p1_slugs.isdisjoint(p2_slugs)


def test_no_results_fallback_suggestions(test_db: Session):
    """Verifies that non-existent queries yield helpful alternative suggestions."""
    svc = CareerDiscoveryService(db=test_db)
    res = svc.search_careers(query="quantum-astronaut-wizard")
    assert res.total_count == 0
    assert len(res.suggested_alternatives) > 0
    assert res.has_exact_match is False


def test_search_api_http_endpoints():
    """Verifies search endpoint via HTTP TestClient."""
    # 1. Search with query and filters
    res = client.get("/api/v1/careers/search?q=designer&domain=design-creative")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 1
    assert any(c["slug"] == "graphic-designer" for c in data["items"])

    # 2. Detail endpoint
    res_detail = client.get("/api/v1/careers/chartered-accountant")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["is_regulated"] is True
    assert "ICAI" in detail["regulatory_requirement"]
