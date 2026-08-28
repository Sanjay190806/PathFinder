import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage9_recommendations_unauthenticated():
    res = client.get("/api/v1/recommendations")
    assert res.status_code == 401

def test_stage9_deterministic_ranking_and_traces():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch recommendations
    res = client.get("/api/v1/recommendations?top_k=5", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "recommendations" in data
    recs = data["recommendations"]
    assert len(recs) > 0

    first = recs[0]
    assert "score" in first
    assert "explanation" in first
    assert "composite_score" in first["explanation"]
    assert "goal_relevance_score" in first["explanation"]
    assert "skill_gap_score" in first["explanation"]
    assert "prereq_score" in first["explanation"]
    assert "difficulty_score" in first["explanation"]
    assert "pref_score" in first["explanation"]
    assert "time_score" in first["explanation"]
    assert "diversity_score" in first["explanation"]

def test_stage9_recommendation_stability():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res1 = client.get("/api/v1/recommendations?top_k=5", headers=headers).json()
    res2 = client.get("/api/v1/recommendations?top_k=5", headers=headers).json()

    ids1 = [r["resource"]["id"] for r in res1["recommendations"]]
    ids2 = [r["resource"]["id"] for r in res2["recommendations"]]
    assert ids1 == ids2
    assert res1["fingerprint"] == res2["fingerprint"]

def test_stage9_multi_domain_recommendations():
    roles = [
        "Cybersecurity Analyst",
        "VLSI Hardware Engineer",
        "Data Scientist"
    ]
    for role in roles:
        email = f"s9_user_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Rec User"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 10, "primary_focus": role, "skills": []
        }, headers=headers)

        rec_res = client.get("/api/v1/recommendations?top_k=3", headers=headers)
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert len(rec_data["recommendations"]) > 0
