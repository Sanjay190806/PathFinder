import pytest
import os
from fastapi.testclient import TestClient
from backend.app.main import app

os.environ["SECRET_KEY"] = "test_secret_key_12345678901234567890"

@pytest.fixture
def client():
    return TestClient(app)

def test_get_role_requirements_profile_google_swe(client):
    res = client.get("/api/v1/companies/google/roles/software-engineer/requirements-profile")
    assert res.status_code == 200
    data = res.json()
    assert data["role_slug"] == "software-engineer"
    assert data["company_slug"] == "google"
    assert data["dsa_relevance"] == "VERY_HIGH"

    # Provenance and Freshness
    assert data["provenance"]["verification_status"] == "VERIFIED"
    assert data["provenance"]["confidence_score"] == 1.0
    assert data["freshness"]["status"] in ["FRESH", "ACCEPTABLE"]

    # Skills
    assert len(data["skills"]) >= 2
    for sk in data["skills"]:
        assert sk["tier"] in ["TIER_1_COMPANY_VERIFIED", "TIER_3_CAREER_FALLBACK"]
        assert sk["verification_status"] in ["VERIFIED", "PARTIALLY_VERIFIED"]

    # DSA Requirements
    assert len(data["dsa_requirements"]) >= 3
    dsa_slugs = [d["dsa_topic_slug"] for d in data["dsa_requirements"]]
    assert "arrays" in dsa_slugs
    assert "binary-trees" in dsa_slugs

    # Tech Requirements
    assert len(data["technology_requirements"]) >= 3
    tech_names = [t["technology_name"] for t in data["technology_requirements"]]
    assert "C++" in tech_names or "Java" in tech_names or "Python" in tech_names

    # Interview Topics
    assert len(data["interview_topics"]) >= 2
    int_categories = [i["topic_category"] for i in data["interview_topics"]]
    assert "DSA" in int_categories
    assert "BEHAVIORAL" in int_categories

def test_get_role_requirements_profile_nvidia_vlsi(client):
    res = client.get("/api/v1/companies/nvidia/roles/vlsi-hardware-engineer/requirements-profile")
    assert res.status_code == 200
    data = res.json()
    assert data["company_slug"] == "nvidia"
    assert data["role_slug"] == "vlsi-hardware-engineer"

    tech_names = [t["technology_name"] for t in data["technology_requirements"]]
    assert "SystemVerilog" in tech_names
    assert "Verilog" in tech_names

    dsa_slugs = [d["dsa_topic_slug"] for d in data["dsa_requirements"]]
    assert "bit-manipulation" in dsa_slugs

def test_get_role_requirements_profile_zerodha(client):
    res = client.get("/api/v1/companies/zerodha/roles/software-engineer/requirements-profile")
    assert res.status_code == 200
    data = res.json()
    assert data["company_slug"] == "zerodha"

    tech_names = [t["technology_name"] for t in data["technology_requirements"]]
    assert "Go" in tech_names
    assert "PostgreSQL" in tech_names

def test_role_detail_requirements_populated(client):
    res = client.get("/api/v1/companies/google/roles/software-engineer")
    assert res.status_code == 200
    data = res.json()
    assert len(data["skill_requirements"]) >= 1
    assert len(data["dsa_requirements"]) >= 1
    assert len(data["tech_requirements"]) >= 1
    assert len(data["interview_topics"]) >= 1

def test_learner_fit_calculation(client):
    # Using existing profile or fallback ID
    res = client.get("/api/v1/companies/google/roles/software-engineer/learner-fit/e14a827e-5541-41e4-86ba-bc13e1a5a9a0")
    assert res.status_code == 200
    data = res.json()
    assert "overall_fit_score" in data
    assert "readiness_tier" in data
    assert data["readiness_tier"] in ["INTERVIEW_READY", "MODERATE_ALIGNMENT", "DEVELOPMENT_REQUIRED"]
    assert "identified_skill_gaps" in data
    assert "target_interview_topics" in data
    assert "recommendation" in data
