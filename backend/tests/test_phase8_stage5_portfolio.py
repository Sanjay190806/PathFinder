import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage5_portfolio_unauthenticated():
    res = client.get("/api/v1/portfolio")
    assert res.status_code == 401

def test_stage5_portfolio_quality_and_artifacts():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add artifact
    art_payload = {
        "title": "Enterprise RAG Pipeline Implementation",
        "artifact_type": "source_repository",
        "url_or_path": "https://github.com/pathfinder/enterprise-rag",
        "skills": ["python", "deep-learning", "transformers"],
        "verification_level": "System-Verified",
        "is_featured": True
    }
    add_res = client.post("/api/v1/portfolio/artifacts", json=art_payload, headers=headers)
    assert add_res.status_code == 200
    port = add_res.json()
    assert port["quality_score"] > 0.0
    assert len(port["artifacts"]) > 0
    assert "technical_depth" in port["quality_dimensions"]
