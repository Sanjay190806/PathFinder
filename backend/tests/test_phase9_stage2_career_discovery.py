"""
Phase 9 Stage 2: Career Discovery Engine Tests
Validates multi-dimensional fit scoring, deterministic sorting, transparent reasoning,
incomplete profile resilience, Indian education stream evaluations, and user isolation.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.core.career_catalog import CAREER_ROLES_CATALOG
from backend.app.career_discovery.career_discovery_engine import CareerDiscoveryEngine
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile

client = TestClient(app)

def test_stage2_discovery_all_registered_careers():
    """Validates that career discovery only returns authentic registered catalog roles."""
    db = SessionLocal()
    try:
        profile = LearnerProfile(
            education_stage="undergraduate",
            education_domain="engineering-technology",
            specialization="Computer Science Engineering",
            skill_confidence_map={"python": 0.8, "dsa": 0.7}
        )
        engine = CareerDiscoveryEngine(db=db)
        results = engine.discover_careers(profile)

        assert len(results) == len(CAREER_ROLES_CATALOG)
        catalog_slugs = set(CAREER_ROLES_CATALOG.keys())
        for r in results:
            assert r.career_slug in catalog_slugs
            assert 0.0 <= r.overall_score <= 1.0
            assert r.fit_tier in ["Strong Fit", "Potential Fit", "Stretch Path", "Alternative Path"]
            assert len(r.strengths) > 0
            assert len(r.reasoning) > 0
            assert len(r.pathway_summary) > 0

        # Check deterministic ordering: score descending
        scores = [r.overall_score for r in results]
        assert scores == sorted(scores, reverse=True)
    finally:
        db.close()

def test_stage2_incomplete_profile_resilience():
    """Validates that discovery works smoothly for sparse or newly initialized profiles."""
    engine = CareerDiscoveryEngine(db=None)

    # Empty profile
    empty_profile = LearnerProfile()
    results = engine.discover_careers(empty_profile)
    assert len(results) == len(CAREER_ROLES_CATALOG)
    for r in results:
        assert 0.0 <= r.overall_score <= 1.0
        assert r.fit_tier is not None

    # School level only
    school_profile = LearnerProfile(education_stage="secondary-school", subjects=["Mathematics", "Science"])
    school_results = engine.discover_careers(school_profile)
    assert len(school_results) > 0
    assert all(r.overall_score > 0 for r in school_results)

def test_stage2_indian_education_scenarios():
    """Evaluates multi-domain Indian education scenarios."""
    engine = CareerDiscoveryEngine(db=None)

    # 1. PCM (+2 Science)
    pcm_profile = LearnerProfile(
        education_stage="higher-secondary",
        education_stream="science",
        specialization="pcm",
        subjects=["Physics", "Chemistry", "Mathematics"]
    )
    pcm_results = engine.discover_careers(pcm_profile)
    top_pcm = pcm_results[0]
    assert top_pcm.overall_score >= 0.55
    assert top_pcm.fit_tier in ["Strong Fit", "Potential Fit"]
    assert any(c in ["software-engineer", "ai-ml-engineer", "data-scientist"] for c in [pcm_results[0].career_slug, pcm_results[1].career_slug])

    # 2. PCB (+2 Pre-Medical)
    pcb_profile = LearnerProfile(
        education_stage="higher-secondary",
        education_stream="science",
        specialization="pcb",
        subjects=["Physics", "Chemistry", "Biology"]
    )
    pcb_results = engine.discover_careers(pcb_profile)
    # PCB has strong potential for data science / bioinformatics
    ds_match = next((r for r in pcb_results if r.career_slug == "data-scientist"), None)
    assert ds_match is not None
    assert ds_match.overall_score >= 0.50

    # 3. ECE Undergraduate
    ece_profile = LearnerProfile(
        education_stage="undergraduate",
        education_stream="electronics-communication-engineering",
        specialization="electronics-communication-engineering",
        subjects=["Digital Electronics", "Microprocessors"]
    )
    ece_results = engine.discover_careers(ece_profile)
    vlsi_match = next((r for r in ece_results if r.career_slug == "vlsi-hardware-engineer"), None)
    assert vlsi_match is not None
    assert vlsi_match.fit_tier in ["Strong Fit", "Potential Fit"]
    assert vlsi_match.overall_score >= 0.55

    # With skills added, ECE learner achieves Strong Fit
    ece_skilled = LearnerProfile(
        education_stage="undergraduate",
        education_stream="electronics-communication-engineering",
        specialization="electronics-communication-engineering",
        skill_confidence_map={"linear-algebra": 0.85, "python": 0.80, "dsa": 0.75}
    )
    ece_skilled_results = engine.discover_careers(ece_skilled)
    vlsi_skilled_match = next((r for r in ece_skilled_results if r.career_slug == "vlsi-hardware-engineer"), None)
    assert vlsi_skilled_match is not None
    assert vlsi_skilled_match.fit_tier == "Strong Fit"
    assert vlsi_skilled_match.overall_score >= 0.70

    # 4. Commerce
    commerce_profile = LearnerProfile(
        education_stage="undergraduate",
        education_stream="commerce-finance",
        specialization="b-com",
        subjects=["Accounting", "Financial Analysis", "Statistics"]
    )
    commerce_results = engine.discover_careers(commerce_profile)
    # Check that Data Scientist is evaluated as potential fit
    ds_comm = next((r for r in commerce_results if r.career_slug == "data-scientist"), None)
    assert ds_comm is not None
    assert ds_comm.overall_score >= 0.50

    # 5. Diploma / ITI
    iti_profile = LearnerProfile(
        education_stage="iti-industrial-training",
        specialization="iti-industrial-training",
        subjects=["Computer Operator and Programming", "Networking"]
    )
    iti_results = engine.discover_careers(iti_profile)
    assert len(iti_results) == len(CAREER_ROLES_CATALOG)
    # Shows practical tech trajectories without absolute lockout
    assert all(r.fit_tier in ["Strong Fit", "Potential Fit", "Stretch Path", "Alternative Path"] for r in iti_results)

def test_stage2_authenticated_api_discover():
    """Tests GET /api/v1/careers/discover with token and query parameters."""
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Discover without query
    res = client.get("/api/v1/careers/discover", headers=headers)
    assert res.status_code == 200
    careers = res.json()
    assert len(careers) == len(CAREER_ROLES_CATALOG)
    assert "fit_tier" in careers[0]
    assert "overall_score" in careers[0]

    # Discover with interest query e.g. 'Cloud'
    res_q = client.get("/api/v1/careers/discover?q=Cloud", headers=headers)
    assert res_q.status_code == 200
    careers_q = res_q.json()
    assert len(careers_q) == len(CAREER_ROLES_CATALOG)

    # Specific career fit endpoint
    res_single = client.get("/api/v1/careers/ai-ml-engineer/discovery-fit", headers=headers)
    assert res_single.status_code == 200
    single = res_single.json()
    assert single["career_slug"] == "ai-ml-engineer"

    # 404 on malformed career
    res_404 = client.get("/api/v1/careers/non-existent-career/discovery-fit", headers=headers)
    assert res_404.status_code == 404

def test_stage2_unauthenticated_access_blocked():
    """Verifies that private discovery requires authentication."""
    res = client.get("/api/v1/careers/discover")
    assert res.status_code in [401, 403]
