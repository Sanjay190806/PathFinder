import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_resource_detail_authenticated():
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    # List resources to get an ID
    list_res = client.get("/api/v1/resources")
    assert list_res.status_code == 200
    resources = list_res.json()
    assert len(resources) > 0

    target_id = resources[0]["id"]
    detail_res = client.get(
        f"/api/v1/resources/{target_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert detail_res.status_code == 200
    detail = detail_res.json()

    assert detail["id"] == target_id
    assert "title" in detail
    assert "provider" in detail
    assert "format" in detail
    assert "difficulty" in detail
    assert "estimated_hours" in detail
    assert "quality_score" in detail
    assert "skills" in detail
    assert "prerequisites" in detail
    assert "learner_status" in detail

def test_update_progress_authoritative():
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    list_res = client.get("/api/v1/resources")
    target_id = list_res.json()[0]["id"]

    # Mark as completed
    prog_res = client.post(
        "/api/v1/progress",
        json={"resource_id": target_id, "status": "completed", "time_spent_minutes": 60},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["status"] == "completed"
    assert prog_data["resource_id"] == target_id

    # Verify resource detail now reflects completed learner_status
    detail_res = client.get(
        f"/api/v1/resources/{target_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert detail_res.status_code == 200
    assert detail_res.json()["learner_status"] == "completed"
