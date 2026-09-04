import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.resources.resource_discovery_engine import ResourceDiscoveryEngine
from backend.app.core.resource_catalog_extended import (
    EXTENDED_RESOURCES_REGISTRY, PRICE_CATEGORIES, SOURCE_TIERS
)

client = TestClient(app)

def test_stage5_resource_catalog_integrity_and_tiers():
    assert len(EXTENDED_RESOURCES_REGISTRY) >= 10
    
    # Check source tiers
    tiers_present = {r["source_tier"] for r in EXTENDED_RESOURCES_REGISTRY}
    assert 1 in tiers_present  # Tier 1 Gov / Institutional
    assert 2 in tiers_present  # Tier 2 Tech Provider
    assert 3 in tiers_present  # Tier 3 EdTech
    assert 4 in tiers_present  # Tier 4 YouTube

    # Check pricing taxonomy integrity
    for r in EXTENDED_RESOURCES_REGISTRY:
        assert r["price_type"] in PRICE_CATEGORIES
        assert "learning_cost" in r
        assert "certificate_cost" in r
        assert "verification_status" in r
        assert r["verification_status"] == "VERIFIED"
        assert "language" in r
        assert "skills" in r

def test_stage5_skill_and_career_matching():
    engine = ResourceDiscoveryEngine()

    # Search Python for AI/ML Engineer
    results = engine.discover_resources(career_slug="ai-ml-engineer", skill_slug="python")
    assert len(results) > 0
    for res in results:
        assert "python" in [s.lower() for s in res.skills]
        assert res.match_score > 0.0
        assert len(res.recommendation_reasons) > 0

def test_stage5_language_prioritization_tamil_and_hindi():
    engine = ResourceDiscoveryEngine()

    # Query Tamil resources
    tamil_results = engine.discover_resources(skill_slug="python", language="Tamil")
    assert len(tamil_results) > 0
    first = tamil_results[0]
    assert first.language == "Tamil"
    assert first.is_preferred_language is True
    assert any("Tamil" in r for r in first.recommendation_reasons)

    # Query Hindi resources
    hindi_results = engine.discover_resources(skill_slug="python", language="Hindi")
    assert len(hindi_results) > 0
    assert hindi_results[0].language == "Hindi"

def test_stage5_price_filtering_genuinely_free_vs_paid():
    engine = ResourceDiscoveryEngine()

    # Free filter
    free_res = engine.discover_resources(price_filter="FREE")
    assert len(free_res) > 0
    for r in free_res:
        assert r.price_type in ("GENUINELY_FREE", "YOUTUBE_FREE_CONTENT", "FREE_TO_ENROLL_PAID_CERTIFICATE")
        assert r.free_learning is True

    # Genuinely Free filter strictly
    genuinely_free_res = engine.discover_resources(price_filter="GENUINELY_FREE")
    assert len(genuinely_free_res) > 0
    for r in genuinely_free_res:
        assert r.price_type == "GENUINELY_FREE"
        assert r.learning_cost == 0.0

def test_stage5_youtube_and_institutional_distinction():
    engine = ResourceDiscoveryEngine()
    
    # YouTube video/playlist resources
    yt_res = engine.discover_resources(resource_type="youtube_video")
    assert len(yt_res) > 0
    for r in yt_res:
        assert r.source_tier == 4
        assert r.price_type == "YOUTUBE_FREE_CONTENT"
        assert "youtube.com" in r.url

    # Institutional NPTEL course
    nptel_res = [r for r in engine.get_all_catalog_resources() if r["provider"] == "NPTEL"]
    assert len(nptel_res) > 0
    assert nptel_res[0]["source_tier"] == 1
    assert nptel_res[0]["price_type"] == "FREE_TO_ENROLL_PAID_CERTIFICATE"
    assert nptel_res[0]["certificate_cost"] == "optional_paid"

def test_stage5_deduplication_by_provider_and_id():
    engine = ResourceDiscoveryEngine()
    resources = engine.get_all_catalog_resources()
    
    # Check no duplicate (provider, external_id) combinations
    seen = set()
    for r in resources:
        key = f"{r['provider']}::{r.get('external_id') or r['url']}"
        assert key not in seen, f"Duplicate detected: {key}"
        seen.add(key)

def test_stage5_api_discover_and_recommendations():
    # 1. GET /api/v1/resources/discover
    res = client.get("/api/v1/resources/discover?skill=python&language=Tamil")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert data[0]["language"] == "Tamil"
    assert data[0]["is_preferred_language"] is True

    # 2. Authenticated GET /api/v1/resources/recommendations
    login_res = client.post("/api/v1/demo/login")
    token = login_res.json()["access_token"]
    rec_res = client.get(
        "/api/v1/resources/recommendations?career=ai-ml-engineer",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert rec_res.status_code == 200
    assert len(rec_res.json()) > 0

    # 3. Unauthenticated access to recommendations is blocked
    unauth = client.get("/api/v1/resources/recommendations")
    assert unauth.status_code == 401

def test_stage5_multi_domain_scenarios():
    engine = ResourceDiscoveryEngine()

    # VLSI Hardware Engineer
    vlsi_res = engine.discover_resources(career_slug="vlsi-hardware-engineer")
    assert len(vlsi_res) > 0
    assert any("digital-logic" in r.skills for r in vlsi_res)

    # Cloud / DevOps Engineer
    cloud_res = engine.discover_resources(career_slug="cloud-devops-engineer")
    assert len(cloud_res) > 0
    assert any(r.provider in ("AWS Skill Builder", "Microsoft Learn") for r in cloud_res)

    # Data Scientist
    ds_res = engine.discover_resources(career_slug="data-scientist", skill_slug="sql")
    assert len(ds_res) > 0
    assert any("sql" in r.skills for r in ds_res)
