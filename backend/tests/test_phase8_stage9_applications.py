import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage9_applications_unauthenticated():
    res = client.get("/api/v1/applications")
    assert res.status_code == 401

def test_stage9_application_lifecycle():
    demo_res = client.post("/api/v1/demo/login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    opps = client.get("/api/v1/opportunities", headers=headers).json()
    opp_id = opps[0]["id"]

    # Save application
    app_res = client.post("/api/v1/applications", json={"opportunity_id": opp_id, "status": "saved", "notes": "Target for Q3"}, headers=headers)
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["status"] == "saved"
    assert len(app_data["prep_actions"]) > 0
    app_id = app_data["id"]

    # Update application
    up_res = client.patch(f"/api/v1/applications/{app_id}", json={"status": "applied", "notes": "Submitted with portfolio"}, headers=headers)
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "applied"

    # List applications
    all_apps = client.get("/api/v1/applications", headers=headers).json()
    assert len(all_apps) > 0
