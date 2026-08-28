import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage10_explainability_unauthenticated():
    res = client.get("/api/v1/intelligence/explanations/readiness")
    assert res.status_code == 401

def test_stage10_readiness_decision_trace():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/intelligence/explanations/readiness", headers=headers)
    assert res.status_code == 200
    trace = res.json()

    assert "decision_id" in trace
    assert trace["decision_type"] == "readiness"
    assert "target_role" in trace
    assert "factors" in trace
    assert len(trace["factors"]) >= 3
    assert "evidence" in trace
    assert "rationale" in trace
    assert "recommended_action" in trace

    # Check factors structure
    first_factor = trace["factors"][0]
    assert "name" in first_factor
    assert "weight" in first_factor
    assert "raw_score" in first_factor
    assert "contribution" in first_factor
    assert "reason" in first_factor

def test_stage10_roadmap_decision_trace():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/intelligence/explanations/roadmap_adaptation", headers=headers)
    assert res.status_code == 200
    trace = res.json()
    assert trace["decision_type"] == "roadmap_adaptation"
    assert len(trace["factors"]) > 0

def test_stage10_recommendation_trace_reconciliation():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rec_res = client.get("/api/v1/recommendations?top_k=3", headers=headers)
    assert rec_res.status_code == 200
    data = rec_res.json()
    first_rec = data["recommendations"][0]

    assert "explanation" in first_rec
    expl = first_rec["explanation"]
    assert "decision_trace" in expl
    d_trace = expl["decision_trace"]
    assert d_trace["decision_type"] == "recommendation"
    assert len(d_trace["factors"]) == 8

def test_stage10_user_isolation():
    u_email = f"s10_user_{uuid.uuid4().hex[:6]}@example.com"
    r = client.post("/api/v1/auth/register", json={"email": u_email, "password": "Password123!", "full_name": "Explainable User"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst", "current_level": "Beginner", "weekly_hours": 10, "primary_focus": "Network Defense", "skills": []
    }, headers=headers)

    res = client.get("/api/v1/intelligence/explanations/readiness", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["target_role"] == "Cybersecurity Analyst"
