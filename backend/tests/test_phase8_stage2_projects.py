import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage2_projects_unauthenticated():
    res = client.get("/api/v1/projects")
    assert res.status_code == 401

def test_stage2_project_lifecycle_and_milestones():
    email = f"p8_proj_{uuid.uuid4().hex[:6]}@example.com"
    reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": "Project Builder"})
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/profile/onboarding", json={
        "target_role": "AI/ML Engineer", "current_level": "Beginner", "weekly_hours": 15, "primary_focus": "RAG Engineering", "skills": []
    }, headers=headers)

    # List projects
    projs = client.get("/api/v1/projects", headers=headers).json()
    assert len(projs) > 0
    target_proj = projs[0]
    template_id = target_proj["id"]

    # Start project
    start_res = client.post(f"/api/v1/projects/{template_id}/start", headers=headers)
    assert start_res.status_code == 200
    learner_p = start_res.json()
    assert learner_p["status"] == "in_progress"
    assert len(learner_p["milestones"]) > 0

    learner_p_id = learner_p["id"]
    m_id = learner_p["milestones"][0]["id"]

    # Complete milestone
    m_res = client.post(f"/api/v1/projects/{learner_p_id}/milestones/{m_id}", json={"artifact": "https://github.com/pathfinder/rag-pipeline"}, headers=headers)
    assert m_res.status_code == 200
    updated_p = m_res.json()
    assert updated_p["milestones"][0]["status"] == "completed"

    # Submit project
    sub_res = client.post(f"/api/v1/projects/{learner_p_id}/submit", json={"submission_url": "https://github.com/pathfinder/rag-pipeline"}, headers=headers)
    assert sub_res.status_code == 200
    final_p = sub_res.json()
    assert final_p["score"] > 0.0
