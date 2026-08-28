import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_demo_login_and_dashboard():
    # 1. Demo Login
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    data = login_res.json()
    token = data["access_token"]
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Profile
    prof_res = client.get("/api/v1/profile", headers=headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["full_name"] == "Alex Mercer"
    assert prof["primary_goal"]["target_role"] == "AI/ML Engineer"

    # 3. Get Active Learning Path
    path_res = client.get("/api/v1/learning-path", headers=headers)
    assert path_res.status_code == 200
    path_data = path_res.json()
    assert path_data["current_version"] is not None
    assert len(path_data["current_version"]["items"]) > 0

    # 4. Check Explainability Card
    first_item = path_data["current_version"]["items"][0]
    assert first_item["explanation"] is not None
    assert len(first_item["explanation"]["structured_reasons"]) > 0

    # 5. Submit Feedback -> Triggers Adaptation
    fb_res = client.post("/api/v1/feedback", json={
        "resource_id": first_item["resource_id"],
        "feedback_type": "too_difficult",
        "rating": 2,
        "comment": "Neural network math was challenging"
    }, headers=headers)
    assert fb_res.status_code == 200

    # 6. Verify Roadmap Versions count increased
    versions_res = client.get("/api/v1/learning-path/versions", headers=headers)
    assert versions_res.status_code == 200
    versions = versions_res.json()
    assert len(versions) >= 2

    # 7. AI Assistant Grounded Chat
    chat_res = client.post("/api/v1/ai/chat", json={
        "message": "I only have 5 hours this week. What should I focus on?"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 20

    # 8. Reset Demo
    reset_res = client.post("/api/v1/demo/reset")
    assert reset_res.status_code == 200
