import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage6_market_unauthenticated():
    res = client.get("/api/v1/intelligence/market")
    assert res.status_code == 401

def test_stage6_market_signals_and_provenance():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch signals
    res = client.get("/api/v1/intelligence/market?role=AI/ML%20Engineer", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "total_signals" in data
    assert data["total_signals"] > 0
    assert "signals" in data

    first = data["signals"][0]
    assert "skill_slug" in first
    assert "role" in first
    assert "category" in first
    assert 0.0 <= first["confidence"] <= 1.0
    assert 0.0 <= first["demand_score"] <= 1.0
    assert first["source_type"] == "mock"  # Explicit provenance tag
    assert first["freshness"] in ["Fresh", "Recent", "Aging", "Stale"]

def test_stage6_market_filtering():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Filter by skill
    res = client.get("/api/v1/intelligence/market?skill=python", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert all(s["skill_slug"] == "python" for s in data["signals"])

    # Filter by category
    res_cat = client.get("/api/v1/intelligence/market?category=technology_demand", headers=headers)
    assert res_cat.status_code == 200
    assert all(s["category"] == "technology_demand" for s in res_cat.json()["signals"])
