import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage3_mastery_and_decay_unauthenticated():
    assert client.get("/api/v1/intelligence/mastery").status_code == 401
    assert client.get("/api/v1/intelligence/decay").status_code == 401

def test_stage3_skill_mastery_and_competency_tier():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch all mastery
    res = client.get("/api/v1/intelligence/mastery", headers=headers)
    assert res.status_code == 200
    mastery_list = res.json()
    assert len(mastery_list) > 0

    first = mastery_list[0]
    assert "skill_slug" in first
    assert 0.0 <= first["mastery_score"] <= 1.0
    assert first["competency_tier"] in ["Unknown", "Beginner", "Developing", "Competent", "Strong", "Mastery"]
    assert "contributing_factors" in first
    assert len(first["explanation"]) > 5

    # Fetch single skill mastery
    single = client.get(f"/api/v1/intelligence/mastery/{first['skill_slug']}", headers=headers).json()
    assert single["skill_slug"] == first["skill_slug"]
    assert single["mastery_score"] == first["mastery_score"]

def test_stage3_skill_decay_and_freshness_states():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch decay summary
    decay_res = client.get("/api/v1/intelligence/decay", headers=headers)
    assert decay_res.status_code == 200
    decay_data = decay_res.json()

    assert "profile_id" in decay_data
    assert "mastery" in decay_data
    assert "decay" in decay_data
    assert 0.0 <= decay_data["overall_mastery_score"] <= 1.0
    assert (decay_data["fresh_count"] + decay_data["aging_count"] + decay_data["review_recommended_count"] + decay_data["decay_risk_count"]) >= 0

    first_decay = decay_data["decay"][0]
    assert 0.0 <= first_decay["demonstrated_mastery_score"] <= 1.0
    assert 0.0 <= first_decay["freshness_score"] <= 1.0
    assert first_decay["decay_state"] in ["Fresh", "Aging", "Review Recommended", "Decay Risk"]
    assert first_decay["half_life_days"] > 0
    assert len(first_decay["explanation"]) > 10

def test_stage3_multi_domain_intelligence():
    roles = [
        ("Cybersecurity Analyst", "network-security"),
        ("VLSI Hardware Engineer", "digital-logic"),
        ("Data Scientist", "sql")
    ]
    for role, skill in roles:
        email = f"p7_domain_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Tester"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 12, "primary_focus": role, "skills": []
        }, headers=headers)

        # Ingest skill event
        client.post("/api/v1/intelligence/events", json={
            "event_id": f"evt_{uuid.uuid4().hex}",
            "event_type": "resource_completed",
            "skill_slug": skill
        }, headers=headers)

        # Check single mastery
        m = client.get(f"/api/v1/intelligence/mastery/{skill}", headers=headers).json()
        assert m["skill_slug"] == skill
        assert 0.0 <= m["mastery_score"] <= 1.0

        # Check decay
        d = client.get(f"/api/v1/intelligence/decay/{skill}", headers=headers).json()
        assert d["skill_slug"] == skill
        assert d["decay_state"] in ["Fresh", "Aging", "Review Recommended", "Decay Risk"]
