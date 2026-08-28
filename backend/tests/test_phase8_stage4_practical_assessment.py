import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage4_assessment_unauthenticated():
    res = client.get("/api/v1/practical-assessments")
    assert res.status_code == 401

def test_stage4_practical_assessment_submission_and_rubric():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    assessments = client.get("/api/v1/practical-assessments", headers=headers).json()
    assert len(assessments) > 0
    asm = assessments[0]

    sub_payload = {
        "submission_payload": {
            "code": "def scaled_dot_product_attention(Q, K, V, mask=None): ...",
            "answers": ["Batch invariant attention", "Causal triangular mask"]
        }
    }
    sub_res = client.post(f"/api/v1/practical-assessments/{asm['id']}/submit", json=sub_payload, headers=headers)
    assert sub_res.status_code == 200
    att = sub_res.json()
    assert att["score"] >= 0.70
    assert att["passed"] is True
    assert "correctness" in att["rubric_breakdown"]
