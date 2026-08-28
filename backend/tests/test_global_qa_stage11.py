import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_protected_endpoints_unauthenticated_rejection():
    endpoints = [
        ("GET", "/api/v1/profile"),
        ("GET", "/api/v1/learning-path"),
        ("GET", "/api/v1/learning-path/versions"),
        ("POST", "/api/v1/learning-path/regenerate"),
        ("POST", "/api/v1/progress"),
        ("GET", "/api/v1/analytics"),
        ("GET", "/api/v1/ai/context"),
        ("POST", "/api/v1/ai/chat"),
        ("POST", "/api/v1/feedback"),
    ]

    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 for {method} {path}, got {res.status_code}"

def test_user_data_isolation():
    # Register User A
    user_a_email = f"user_a_{uuid.uuid4().hex[:8]}@example.com"
    reg_a = client.post("/api/v1/auth/register", json={
        "email": user_a_email,
        "password": "Password123!",
        "full_name": "User Alpha"
    })
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]

    # Register User B
    user_b_email = f"user_b_{uuid.uuid4().hex[:8]}@example.com"
    reg_b = client.post("/api/v1/auth/register", json={
        "email": user_b_email,
        "password": "Password123!",
        "full_name": "User Beta"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]

    # User A onboard as Cybersecurity Analyst
    onboard_a = client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst",
        "current_level": "Beginner",
        "weekly_hours": 12,
        "primary_focus": "Network Security & Defense",
        "skills": []
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert onboard_a.status_code == 200

    # User B onboard as VLSI Hardware Engineer
    onboard_b = client.post("/api/v1/profile/onboarding", json={
        "target_role": "VLSI Hardware Engineer",
        "current_level": "Beginner",
        "weekly_hours": 15,
        "primary_focus": "Digital Logic & Chip Design",
        "skills": []
    }, headers={"Authorization": f"Bearer {token_b}"})
    assert onboard_b.status_code == 200

    # Verify User A's profile & context are isolated
    prof_a = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert prof_a["full_name"] == "User Alpha"
    assert prof_a["primary_goal"]["target_role"] == "Cybersecurity Analyst"

    context_a = client.get("/api/v1/ai/context", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert context_a["target_role"] == "Cybersecurity Analyst"

    # Verify User B's profile & context are isolated
    prof_b = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert prof_b["full_name"] == "User Beta"
    assert prof_b["primary_goal"]["target_role"] == "VLSI Hardware Engineer"

    context_b = client.get("/api/v1/ai/context", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert context_b["target_role"] == "VLSI Hardware Engineer"

def test_full_end_to_end_journey_and_authoritative_persistence():
    # Login as demo user
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    # 1. Fetch active roadmap
    path_res = client.get("/api/v1/learning-path", headers={"Authorization": f"Bearer {token}"})
    assert path_res.status_code == 200
    path_data = path_res.json()
    assert path_data["current_version"] is not None
    items = path_data["current_version"]["items"]
    assert len(items) > 0

    first_item = items[0]
    resource_id = first_item["resource_id"]

    # 2. Inspect resource details
    res_detail = client.get(f"/api/v1/resources/{resource_id}", headers={"Authorization": f"Bearer {token}"})
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == resource_id

    # 3. Complete resource authoritatively
    prog_res = client.post("/api/v1/progress", json={
        "resource_id": resource_id,
        "status": "completed",
        "time_spent_minutes": 90
    }, headers={"Authorization": f"Bearer {token}"})
    assert prog_res.status_code == 200
    assert prog_res.json()["status"] == "completed"

    # 4. Verify progress persists in resource detail
    res_detail_updated = client.get(f"/api/v1/resources/{resource_id}", headers={"Authorization": f"Bearer {token}"})
    assert res_detail_updated.json()["learner_status"] == "completed"

    # 5. Verify progress reflects in analytics
    analytics_res = client.get("/api/v1/analytics", headers={"Authorization": f"Bearer {token}"})
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["completed_resources"] >= 1
    assert analytics_data["hours_completed"] > 0

    # 6. Verify AI Coach context reflects updated completed count
    coach_context = client.get("/api/v1/ai/context", headers={"Authorization": f"Bearer {token}"})
    assert coach_context.status_code == 200
    assert coach_context.json()["completed_count"] >= 1

def test_multi_domain_curriculum_integrity():
    roles = ["Cybersecurity Analyst", "VLSI Hardware Engineer"]

    for role in roles:
        email = f"domain_test_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password123!",
            "full_name": f"{role} Candidate"
        })
        assert reg.status_code == 200
        token = reg.json()["access_token"]

        onboard = client.post("/api/v1/profile/onboarding", json={
            "target_role": role,
            "current_level": "Beginner",
            "weekly_hours": 10,
            "primary_focus": role,
            "skills": []
        }, headers={"Authorization": f"Bearer {token}"})
        assert onboard.status_code == 200

        path_res = client.get("/api/v1/learning-path", headers={"Authorization": f"Bearer {token}"})
        assert path_res.status_code == 200
        assert path_res.json()["goal_title"] == role or role in path_res.json()["goal_title"]
