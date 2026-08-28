import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage7_readiness_unauthenticated():
    res = client.get("/api/v1/intelligence/readiness")
    assert res.status_code == 401

def test_stage7_readiness_calculation_and_levels():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/intelligence/readiness", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "profile_id" in data
    assert "target_role" in data
    assert 0.0 <= data["readiness_score"] <= 100.0
    assert data["readiness_level"] in ["Not Ready", "Early Preparation", "Developing Readiness", "Near Ready", "Career Ready"]
    assert 0.0 <= data["competency_score"] <= 1.0
    assert 0.0 <= data["prerequisite_score"] <= 1.0
    assert 0.0 <= data["freshness_score"] <= 1.0
    assert "critical_blockers" in data
    assert "high_impact_actions" in data

def test_stage7_deterministic_repeatability():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res1 = client.get("/api/v1/intelligence/readiness", headers=headers).json()
    res2 = client.get("/api/v1/intelligence/readiness", headers=headers).json()

    assert res1["readiness_score"] == res2["readiness_score"]
    assert res1["readiness_level"] == res2["readiness_level"]
    assert res1["competency_score"] == res2["competency_score"]

def test_stage7_multi_domain_readiness():
    roles = [
        "Cybersecurity Analyst",
        "VLSI Hardware Engineer",
        "Data Scientist"
    ]
    for role in roles:
        email = f"s7_user_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Ready User"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 10, "primary_focus": role, "skills": []
        }, headers=headers)

        r_res = client.get("/api/v1/intelligence/readiness", headers=headers)
        assert r_res.status_code == 200
        r_data = r_res.json()
        assert r_data["target_role"] == role
        assert 0.0 <= r_data["readiness_score"] <= 100.0
