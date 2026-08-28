import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage1_unauthenticated_rejection():
    endpoints = [
        ("POST", "/api/v1/intelligence/events"),
        ("GET", "/api/v1/intelligence/events"),
        ("GET", "/api/v1/intelligence/behavior"),
    ]
    for method, path in endpoints:
        if method == "POST":
            res = client.post(path, json={"event_id": "test", "event_type": "resource_viewed"})
        else:
            res = client.get(path)
        assert res.status_code == 401, f"Expected 401 for {method} {path}"

def test_stage1_event_creation_and_idempotency():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    event_id = f"evt_{uuid.uuid4().hex}"

    # 1. First event submission
    res1 = client.post("/api/v1/intelligence/events", json={
        "event_id": event_id,
        "event_type": "resource_viewed",
        "skill_slug": "python",
        "session_id": "session_alpha_1",
        "source": "frontend",
        "payload": {"duration_sec": 45}
    }, headers=headers)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["event_id"] == event_id
    assert data1["event_type"] == "resource_viewed"

    # 2. Duplicate submission with same event_id (Idempotency)
    res2 = client.post("/api/v1/intelligence/events", json={
        "event_id": event_id,
        "event_type": "resource_viewed",
        "skill_slug": "python"
    }, headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["id"] == data1["id"]

def test_stage1_behavior_summary_aggregation():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Emit distinct events
    events = [
        ("resource_started", "python"),
        ("resource_completed", "python"),
        ("quiz_completed", "python"),
        ("ai_coach_interaction", "machine-learning"),
    ]
    for ev_type, skill in events:
        client.post("/api/v1/intelligence/events", json={
            "event_id": f"agg_evt_{uuid.uuid4().hex}",
            "event_type": ev_type,
            "skill_slug": skill
        }, headers=headers)

    # Query summary
    summary_res = client.get("/api/v1/intelligence/behavior", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_events"] >= 4
    assert summary["resources_started"] >= 1
    assert summary["resources_completed"] >= 1
    assert summary["coach_interactions"] >= 1
    assert "python" in summary["per_skill_counts"]

def test_stage1_user_isolation():
    # User A
    u1_email = f"s1_userA_{uuid.uuid4().hex[:6]}@example.com"
    r1 = client.post("/api/v1/auth/register", json={"email": u1_email, "password": "Password123!", "full_name": "User Alpha"})
    t1 = r1.json()["access_token"]
    evt_a = f"evt_alpha_{uuid.uuid4().hex}"
    client.post("/api/v1/intelligence/events", json={"event_id": evt_a, "event_type": "resource_viewed"}, headers={"Authorization": f"Bearer {t1}"})

    # User B
    u2_email = f"s1_userB_{uuid.uuid4().hex[:6]}@example.com"
    r2 = client.post("/api/v1/auth/register", json={"email": u2_email, "password": "Password123!", "full_name": "User Beta"})
    t2 = r2.json()["access_token"]

    # User B fetching events should NOT see User A's event
    b_events = client.get("/api/v1/intelligence/events", headers={"Authorization": f"Bearer {t2}"}).json()
    assert all(e["event_id"] != evt_a for e in b_events)

    # User B attempting to hijack User A's event_id should receive 403 Forbidden
    hijack_res = client.post("/api/v1/intelligence/events", json={"event_id": evt_a, "event_type": "resource_viewed"}, headers={"Authorization": f"Bearer {t2}"})
    assert hijack_res.status_code == 403
