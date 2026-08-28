import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage11_unauthenticated_security_matrix():
    protected_get_endpoints = [
        "/api/v1/auth/me",
        "/api/v1/learning-path",
                "/api/v1/analytics",
        "/api/v1/recommendations",
        "/api/v1/intelligence/events",
        "/api/v1/intelligence/behavior",
        "/api/v1/intelligence/velocity",
        "/api/v1/intelligence/mastery",
        "/api/v1/intelligence/decay",
        "/api/v1/intelligence/skill-gaps",
        "/api/v1/intelligence/market",
        "/api/v1/intelligence/readiness",
        "/api/v1/intelligence/explanations/readiness",
    ]
    for path in protected_get_endpoints:
        res = client.get(path)
        assert res.status_code == 401, f"Expected 401 on unauthenticated GET {path}, got {res.status_code}"

    protected_post_endpoints = [
        ("/api/v1/ai/chat", {"message": "hello"}),
        ("/api/v1/progress", {"resource_id": "test", "status": "completed"}),
        ("/api/v1/intelligence/events", {"event_id": "evt_test", "event_type": "resource_viewed"}),
        ("/api/v1/intelligence/adaptive-evaluate", {}),
    ]
    for path, payload in protected_post_endpoints:
        res = client.post(path, json=payload)
        assert res.status_code == 401, f"Expected 401 on unauthenticated POST {path}, got {res.status_code}"

def test_stage11_cross_user_isolation_audit():
    # User Alpha
    u_alpha = f"alpha_{uuid.uuid4().hex[:6]}@example.com"
    r_alpha = client.post("/api/v1/auth/register", json={"email": u_alpha, "password": "Password123!", "full_name": "Alpha User"})
    token_a = r_alpha.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst", "current_level": "Beginner", "weekly_hours": 15, "primary_focus": "Network Defense", "skills": []
    }, headers=headers_a)

    evt_a = f"evt_a_{uuid.uuid4().hex}"
    client.post("/api/v1/intelligence/events", json={"event_id": evt_a, "event_type": "resource_started", "skill_slug": "networking"}, headers=headers_a)

    # User Beta
    u_beta = f"beta_{uuid.uuid4().hex[:6]}@example.com"
    r_beta = client.post("/api/v1/auth/register", json={"email": u_beta, "password": "Password123!", "full_name": "Beta User"})
    token_b = r_beta.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    client.post("/api/v1/profile/onboarding", json={
        "target_role": "Data Scientist", "current_level": "Beginner", "weekly_hours": 8, "primary_focus": "Analytics", "skills": []
    }, headers=headers_b)

    # Verify Beta cannot see Alpha's events or role
    b_events = client.get("/api/v1/intelligence/events", headers=headers_b).json()
    assert all(e["event_id"] != evt_a for e in b_events)

    b_readiness = client.get("/api/v1/intelligence/readiness", headers=headers_b).json()
    assert b_readiness["target_role"] == "Data Scientist"

    # User B attempting to overwrite User A event_id fails with 403
    hijack_res = client.post("/api/v1/intelligence/events", json={"event_id": evt_a, "event_type": "resource_viewed"}, headers=headers_b)
    assert hijack_res.status_code == 403

def test_stage11_full_end_to_end_journey():
    # Complete learner lifecycle
    email = f"e2e_learner_{uuid.uuid4().hex[:6]}@example.com"
    reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": "E2E Master"})
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Onboarding
    onb = client.post("/api/v1/profile/onboarding", json={
        "target_role": "Full Stack Developer", "current_level": "Beginner", "weekly_hours": 12, "primary_focus": "Web Engineering", "skills": []
    }, headers=headers)
    assert onb.status_code == 200

    # 2. Roadmap inspection
    path_res = client.get("/api/v1/learning-path", headers=headers)
    assert path_res.status_code == 200

    # 3. Ingest behavior events
    client.post("/api/v1/intelligence/events", json={
        "event_id": f"e2e_{uuid.uuid4().hex}",
        "event_type": "resource_started",
        "skill_slug": "typescript"
    }, headers=headers)
    client.post("/api/v1/intelligence/events", json={
        "event_id": f"e2e_{uuid.uuid4().hex}",
        "event_type": "resource_completed",
        "skill_slug": "typescript"
    }, headers=headers)

    # 4. Check Velocity, Mastery, Gap, Decay, Readiness
    vel = client.get("/api/v1/intelligence/velocity", headers=headers).json()
    assert 0.0 <= vel["velocity_score"] <= 1.0

    mastery = client.get("/api/v1/intelligence/mastery/typescript", headers=headers).json()
    assert mastery["skill_slug"] == "typescript"

    gaps = client.get("/api/v1/intelligence/skill-gaps", headers=headers).json()
    assert gaps["target_role"] == "Full Stack Developer"

    decay = client.get("/api/v1/intelligence/decay/typescript", headers=headers).json()
    assert decay["decay_state"] in ["Fresh", "Aging", "Review Recommended", "Decay Risk"]

    readiness = client.get("/api/v1/intelligence/readiness", headers=headers).json()
    assert 0.0 <= readiness["readiness_score"] <= 100.0

    # 5. Recommendations and Explanation
    recs = client.get("/api/v1/recommendations?top_k=3", headers=headers).json()
    assert len(recs["recommendations"]) > 0

    expl = client.get("/api/v1/intelligence/explanations/readiness", headers=headers).json()
    assert expl["decision_type"] == "readiness"

    # 6. AI Coach chat
    chat = client.post("/api/v1/ai/chat", json={"message": "What is my readiness score?"}, headers=headers).json()
    assert "message" in chat
