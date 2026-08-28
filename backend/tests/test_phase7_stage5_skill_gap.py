import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage5_skill_gap_unauthenticated():
    res = client.get("/api/v1/intelligence/skill-gaps")
    assert res.status_code == 401

def test_stage5_skill_gap_calculation_and_blockers():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/intelligence/skill-gaps", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "profile_id" in data
    assert "target_role" in data
    assert "readiness_percentage" in data
    assert 0.0 <= data["readiness_percentage"] <= 100.0
    assert "critical_blockers" in data
    assert "gaps" in data
    assert len(data["gaps"]) > 0

    first_gap = data["gaps"][0]
    assert "skill_slug" in first_gap
    assert first_gap["current_level"] in ["Unknown", "Beginner", "Developing", "Competent", "Strong", "Mastery"]
    assert first_gap["target_level"] in ["Competent", "Strong", "Mastery"]
    assert first_gap["category"] in ["foundational", "prerequisite", "core", "advanced", "specialization", "mastered"]
    assert "priority_score" in first_gap

def test_stage5_multi_domain_gaps():
    roles = [
        ("Cybersecurity Analyst", "networking"),
        ("VLSI Hardware Engineer", "linear-algebra"),
        ("Data Scientist", "sql")
    ]
    for role, expected_skill in roles:
        email = f"s5_domain_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Gap User"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 12, "primary_focus": role, "skills": []
        }, headers=headers)

        gap_res = client.get("/api/v1/intelligence/skill-gaps", headers=headers)
        assert gap_res.status_code == 200
        gap_data = gap_res.json()
        assert gap_data["target_role"] == role
        assert any(g["skill_slug"] == expected_skill for g in gap_data["gaps"])
