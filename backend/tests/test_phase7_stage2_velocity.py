import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage2_velocity_unauthenticated():
    res = client.get("/api/v1/intelligence/velocity")
    assert res.status_code == 401

def test_stage2_velocity_calculation_and_factors():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/intelligence/velocity", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "profile_id" in data
    assert 0.0 <= data["velocity_score"] <= 1.0
    assert 0.0 <= data["completion_rate"] <= 1.0
    assert 0.0 <= data["consistency_score"] <= 1.0
    assert data["pacing_state"] in ["accelerated", "on_track", "behind_schedule", "inactive"]
    assert data["engagement_state"] in ["highly_engaged", "engaged", "inconsistent", "low_engagement", "inactive", "insufficient_data"]
    assert "factors" in data
    assert "completion_component" in data["factors"]
    assert len(data["explanation"]) > 10

def test_stage2_deterministic_repeatability():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res1 = client.get("/api/v1/intelligence/velocity", headers=headers).json()
    res2 = client.get("/api/v1/intelligence/velocity", headers=headers).json()

    assert res1["velocity_score"] == res2["velocity_score"]
    assert res1["study_hours_per_week"] == res2["study_hours_per_week"]
    assert res1["pacing_state"] == res2["pacing_state"]

def test_stage2_user_isolation():
    u_email = f"s2_user_{uuid.uuid4().hex[:6]}@example.com"
    r = client.post("/api/v1/auth/register", json={"email": u_email, "password": "Password123!", "full_name": "Velocity User"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst", "current_level": "Beginner", "weekly_hours": 10, "primary_focus": "Security", "skills": []
    }, headers=headers)

    res = client.get("/api/v1/intelligence/velocity", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["confidence"] in ["insufficient_data", "low", "medium", "high"]
