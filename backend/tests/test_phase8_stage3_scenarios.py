import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage3_scenarios_unauthenticated():
    res = client.get("/api/v1/scenarios")
    assert res.status_code == 401

def test_stage3_scenario_evaluation_and_reasoning():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List scenarios
    scenarios = client.get("/api/v1/scenarios", headers=headers).json()
    assert len(scenarios) > 0
    sc = scenarios[0]

    # Submit attempt
    attempt_payload = {
        "selected_actions": [sc["available_actions"][0]["id"]],
        "learner_reasoning": "Mitigating inference bottleneck by applying dynamic batching to stabilize P99 SLA and prevent CUDA OOM."
    }
    att_res = client.post(f"/api/v1/scenarios/{sc['id']}/submit", json=attempt_payload, headers=headers)
    assert att_res.status_code == 200
    att = att_res.json()
    assert att["score"] > 0.0
    assert "technical_correctness" in att["component_scores"]
    assert "reasoning" in att["component_scores"]

    # History
    history = client.get("/api/v1/scenarios/attempts", headers=headers).json()
    assert len(history) > 0
