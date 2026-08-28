import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage10_career_prep_unauthenticated():
    res = client.post("/api/v1/career-prep/resume/audit", json={"resume_text": "Sample resume text..."})
    assert res.status_code == 401

def test_stage10_resume_audit_and_mock_interview():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Resume Audit
    sample_resume = (
        "Experienced Engineer with deep expertise in Python, PyTorch, Transformers, and Docker. "
        "Built enterprise RAG pipelines and scalable deep learning architectures reducing P99 latency."
    )
    res_audit = client.post("/api/v1/career-prep/resume/audit", json={"resume_text": sample_resume, "target_role": "AI/ML Engineer"}, headers=headers)
    assert res_audit.status_code == 200
    audit = res_audit.json()
    assert 0.0 <= audit["ats_score"] <= 100.0
    assert len(audit["matched_keywords"]) > 0

    # 2. Mock Interview
    int_res = client.post("/api/v1/career-prep/interview/start", json={"interview_type": "Technical Core", "target_role": "AI/ML Engineer"}, headers=headers)
    assert int_res.status_code == 200
    interview = int_res.json()
    assert len(interview["questions"]) >= 2
    assert "feedback" in interview
