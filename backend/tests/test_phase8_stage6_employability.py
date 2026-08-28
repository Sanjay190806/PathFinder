import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage6_employability_unauthenticated():
    res = client.get("/api/v1/employability")
    assert res.status_code == 401

def test_stage6_employability_composite_calculation():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/employability", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert 0.0 <= data["employability_score"] <= 100.0
    assert data["readiness_level"] in ["Foundation Required", "Early Development", "Developing", "Interview Preparation", "Job-Ready Track", "Strongly Demonstrated"]
    assert 0.0 <= data["career_readiness_score"] <= 100.0
    assert 0.0 <= data["practical_readiness_score"] <= 100.0
    assert 0.0 <= data["portfolio_quality_score"] <= 100.0
    assert "career_readiness" in data["weights"]
    assert "practical_readiness" in data["weights"]
    assert len(data["explanation"]) > 0

def test_stage6_multi_domain_employability():
    domains = [
        "AI/ML Engineer",
        "Cybersecurity Analyst",
        "VLSI Hardware Engineer",
        "Data Scientist",
        "Full Stack Developer"
    ]
    for role in domains:
        email = f"emp_user_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Candidate"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 12, "primary_focus": role, "skills": []
        }, headers=headers)

        emp_res = client.get("/api/v1/employability", headers=headers)
        assert emp_res.status_code == 200
        emp = emp_res.json()
        assert emp["target_role"] == role
        assert 0.0 <= emp["employability_score"] <= 100.0
