"""
Test Suite for Phase 11 Stage 7: Live Career Market, Demand, Salary & Regional Intelligence
Verifies:
1. Market Signal retrieval with source tiers (Tier 1 Official/Gov, Tier 2 Verified Industry).
2. Freshness states (FRESH, RECENT, STALE, EXPIRED, UNKNOWN).
3. India-first salary intelligence (Entry, Mid, Senior in INR with LPA formatting).
4. Regional demand hotspots (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune).
5. In-demand and emerging skills mapped to canonical skills.
6. Strict non-fabrication: Missing market signals return UNKNOWN/not available without hallucination.
7. UniversalDecisionTrace explainability integration.
8. REST API endpoints for market snapshots, skills, salaries, and regions.
"""

import pytest
from starlette.testclient import TestClient
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.career import Career, CareerMarketSignal
from backend.app.career.market_intelligence_service import CareerMarketIntelligenceService

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_market_signals_seeded_and_tiered(test_db: Session):
    """Verifies that market signals are seeded with proper source tiers and provenance."""
    signals = test_db.query(CareerMarketSignal).filter(CareerMarketSignal.career_slug == "ai-ml-engineer").all()
    assert len(signals) >= 5, f"Expected at least 5 market signals for AI/ML Engineer, found {len(signals)}"

    # Check Tier 1 source exists (e.g. NASSCOM)
    tier_1_signals = [s for s in signals if s.source_tier == 1]
    assert len(tier_1_signals) > 0, "Expected at least one Tier 1 official/government source"

    # Verify signal types
    sig_types = {s.signal_type for s in signals}
    assert "DEMAND_TREND" in sig_types
    assert "SALARY_RANGE" in sig_types
    assert "SKILL_DEMAND" in sig_types or "EMERGING_SKILL" in sig_types


def test_market_service_freshness_computation(test_db: Session):
    """Verifies freshness calculation according to elapsed days."""
    svc = CareerMarketIntelligenceService(db=test_db)
    now = datetime.now(timezone.utc)

    # Within 7 days -> FRESH
    assert svc.compute_freshness(now - timedelta(days=2)) == "FRESH"
    # Within 30 days -> RECENT
    assert svc.compute_freshness(now - timedelta(days=15)) == "RECENT"
    # Within 60 days (ttl 90) -> STALE
    assert svc.compute_freshness(now - timedelta(days=45), ttl_days=90) == "STALE"
    # Over 90 days -> EXPIRED
    assert svc.compute_freshness(now - timedelta(days=100)) == "EXPIRED"
    # None -> UNKNOWN
    assert svc.compute_freshness(None) == "UNKNOWN"


def test_salary_intelligence_breakdown(test_db: Session):
    """Verifies India-first salary intelligence with entry, mid, and senior tiers."""
    svc = CareerMarketIntelligenceService(db=test_db)
    snap = svc.get_career_market_snapshot("ai-ml-engineer")

    assert snap.salary_snapshot.available is True
    assert snap.salary_snapshot.currency == "INR"
    assert snap.salary_snapshot.entry_level is not None
    assert snap.salary_snapshot.mid_level is not None
    assert snap.salary_snapshot.senior_level is not None

    # Entry salary should be in 8-12 LPA range
    assert snap.salary_snapshot.entry_level.min_amount == 800000.0
    assert "LPA" in snap.salary_snapshot.entry_level.formatted_display

    # Senior salary should be higher than entry
    assert snap.salary_snapshot.senior_level.max_amount > snap.salary_snapshot.entry_level.max_amount


def test_regional_demand_hubs(test_db: Session):
    """Verifies regional demand representation across key Indian technology hubs."""
    svc = CareerMarketIntelligenceService(db=test_db)
    snap = svc.get_career_market_snapshot("ai-ml-engineer")

    regions = {r.city_name for r in snap.regional_demand}
    assert "Bengaluru" in regions
    assert "Hyderabad" in regions

    # Verify demand scores bounded 0.0 - 1.0
    for r in snap.regional_demand:
        assert 0.0 <= r.demand_score <= 1.0
        assert r.demand_level in ("Very High", "High", "Moderate", "Emerging")


def test_market_skills_and_emerging_competencies(test_db: Session):
    """Verifies in-demand and emerging skills tracked with growth trends."""
    svc = CareerMarketIntelligenceService(db=test_db)
    skills_resp = svc.get_career_market_skills("ai-ml-engineer")

    assert skills_resp.total_skills > 0
    skill_slugs = {s.skill_slug for s in skills_resp.top_skills}
    assert "python" in skill_slugs or "transformers" in skill_slugs

    # Emerging skills should have is_emerging=True
    emerging = [s for s in skills_resp.top_skills if s.is_emerging]
    assert len(emerging) > 0


def test_strict_non_fabrication_missing_career(test_db: Session):
    """Verifies that non-existent careers raise ValueError and return 404."""
    svc = CareerMarketIntelligenceService(db=test_db)
    with pytest.raises(ValueError, match="not found"):
        svc.get_career_market_snapshot("quantum-time-traveler")

    response = client.get("/api/v1/careers/quantum-time-traveler/market")
    assert response.status_code == 404


def test_decision_trace_explainability_in_market_snapshot(test_db: Session):
    """Verifies UniversalDecisionTrace explainability attached to market snapshots."""
    svc = CareerMarketIntelligenceService(db=test_db)
    snap = svc.get_career_market_snapshot("doctor")

    assert snap.decision_trace is not None
    trace = snap.decision_trace
    assert trace["decision_type"] == "career_market_intelligence"
    assert len(trace["factors"]) >= 3
    assert len(trace["evidence"]) >= 1


def test_market_api_endpoints():
    """Verifies REST endpoints for career market intelligence."""
    # 1. Full snapshot
    resp = client.get("/api/v1/careers/doctor/market")
    assert resp.status_code == 200
    data = resp.json()
    assert data["career_slug"] == "doctor"
    assert data["salary_snapshot"]["available"] is True
    assert data["overall_market_score"] >= 0.80

    # 2. Market skills endpoint
    resp_skills = client.get("/api/v1/careers/doctor/market/skills")
    assert resp_skills.status_code == 200
    skills_data = resp_skills.json()
    assert skills_data["total_skills"] > 0

    # 3. Market salary endpoint
    resp_salary = client.get("/api/v1/careers/doctor/market/salary")
    assert resp_salary.status_code == 200
    salary_data = resp_salary.json()
    assert salary_data["salary_snapshot"]["currency"] == "INR"

    # 4. Market regions endpoint
    resp_regions = client.get("/api/v1/careers/doctor/market/regions")
    assert resp_regions.status_code == 200
    regions_data = resp_regions.json()
    assert len(regions_data["regions"]) > 0
