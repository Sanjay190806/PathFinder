import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage4_adaptive_unauthenticated():
    res = client.post("/api/v1/intelligence/adaptive-evaluate")
    assert res.status_code == 401

def test_stage4_adaptive_evaluation_and_rules():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Evaluate intelligence signals
    res = client.post("/api/v1/intelligence/adaptive-evaluate?force=true", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "adaptation_applied" in data
    assert "trigger" in data
    assert "reason" in data
    assert "explanation" in data

def test_stage4_user_isolation():
    u_email = f"s4_user_{uuid.uuid4().hex[:6]}@example.com"
    r = client.post("/api/v1/auth/register", json={"email": u_email, "password": "Password123!", "full_name": "Adaptive User"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst", "current_level": "Beginner", "weekly_hours": 10, "primary_focus": "Network Defense", "skills": []
    }, headers=headers)

    res = client.post("/api/v1/intelligence/adaptive-evaluate?force=true", headers=headers)
    assert res.status_code == 200
    assert "reason" in res.json()
