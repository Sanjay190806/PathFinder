import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_skills_graph_unauthenticated():
    response = client.get("/api/v1/skills/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0

    first_node = data["nodes"][0]
    assert "id" in first_node
    assert "slug" in first_node
    assert "name" in first_node
    assert "topological_depth" in first_node
    assert "status" in first_node
    assert "confidence" in first_node
    assert "prerequisites" in first_node
    assert "dependents" in first_node

    first_edge = data["edges"][0]
    assert "source" in first_edge
    assert "target" in first_edge
    assert "is_mandatory" in first_edge

def test_get_skills_graph_authenticated_demo():
    # Demo login
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    response = client.get(
        "/api/v1/skills/graph",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) > 0

    # Ensure status is computed dynamically (e.g. at least one is completed or in_progress or eligible)
    statuses = {n["status"] for n in data["nodes"]}
    assert len(statuses.intersection({"completed", "in_progress", "eligible", "locked"})) > 0
