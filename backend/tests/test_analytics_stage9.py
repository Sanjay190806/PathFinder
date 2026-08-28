import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_analytics_unauthenticated():
    response = client.get("/api/v1/analytics")
    assert response.status_code == 401

def test_get_analytics_authenticated():
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    response = client.get(
        "/api/v1/analytics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert "total_resources" in data
    assert "completed_resources" in data
    assert "in_progress_resources" in data
    assert "total_learning_hours" in data
    assert "hours_completed" in data
    assert "current_streak_days" in data
    assert "active_phase" in data
    assert "overall_progress_percentage" in data
    assert "skill_mastery" in data
    assert "strengths" in data
    assert "weaknesses" in data
    assert "acceptance_rate" in data
    assert "weekly_velocity" in data
    assert "phase_progress" in data

    # Verify phase_progress structure
    if data["phase_progress"]:
        first_phase = data["phase_progress"][0]
        assert "phase_number" in first_phase
        assert "phase_name" in first_phase
        assert "total_modules" in first_phase
        assert "completed_modules" in first_phase
        assert "completion_percentage" in first_phase
