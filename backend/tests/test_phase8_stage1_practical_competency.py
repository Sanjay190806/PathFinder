import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage1_practical_unauthenticated():
    res = client.get("/api/v1/practical/competencies")
    assert res.status_code == 401

def test_stage1_record_evidence_and_calculate_competency():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Record practical evidence
    ev_payload = {
        "skill_slug": "python",
        "evidence_type": "project",
        "source_id": "proj_demo_1",
        "score": 0.85,
        "confidence": 0.90,
        "evaluator": "project_rubric",
        "metadata_payload": {"milestones_completed": 4}
    }
    ev_res = client.post("/api/v1/practical/evidence", json=ev_payload, headers=headers)
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["skill_slug"] == "python"
    assert ev_data["score"] == 0.85

    # Get single competency
    comp_res = client.get("/api/v1/practical/competencies/python", headers=headers)
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert comp["skill_slug"] == "python"
    assert comp["level"] in ["Strong", "Mastery", "Competent"]
    assert comp["score"] >= 0.80
    assert comp["evidence_count"] >= 1
    assert "application" in comp["dimensions"]

def test_stage1_user_isolation():
    u_email = f"s1_p8_{uuid.uuid4().hex[:6]}@example.com"
    reg = client.post("/api/v1/auth/register", json={"email": u_email, "password": "Password123!", "full_name": "P8 S1 User"})
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ev_list = client.get("/api/v1/practical/evidence", headers=headers).json()
    assert len(ev_list) == 0
