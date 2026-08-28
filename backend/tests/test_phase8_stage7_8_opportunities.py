import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage7_8_opportunities_unauthenticated():
    res = client.get("/api/v1/opportunities")
    assert res.status_code == 401
    res_m = client.get("/api/v1/opportunities/matches")
    assert res_m.status_code == 401

def test_stage7_8_opportunity_listing_and_matching():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List opportunities
    opps = client.get("/api/v1/opportunities", headers=headers).json()
    assert len(opps) > 0
    first_opp = opps[0]
    assert "title" in first_opp
    assert "salary_range" in first_opp

    # Match opportunities
    matches = client.get("/api/v1/opportunities/matches", headers=headers).json()
    assert len(matches) > 0
    top_m = matches[0]
    assert 0.0 <= top_m["match_score"] <= 100.0
    assert top_m["match_level"] in ["Strong Fit", "Competitive Fit", "Developing Fit", "Early Prerequisite"]
    assert "skill_coverage" in top_m["factor_breakdown"]
    assert len(top_m["match_reasons"]) > 0
