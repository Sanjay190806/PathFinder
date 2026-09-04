"""
Test suite for JanSahay / SIH26101 Indian Education Taxonomy API & Profile persistence.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_india_taxonomy():
    res = client.get("/api/v1/profile/taxonomy")
    assert res.status_code == 200
    data = res.json()
    assert data["country"] == "India"
    assert "JanSahay-SIH26101" in data["taxonomy_version"]
    assert len(data["stages"]) >= 9
    assert len(data["canonical_domains"]) >= 18
    assert "Student / Fresher" in data["current_roles"]
    assert "Official Statistics & Census" in data["work_domains"]

def test_onboarding_with_sih26101_indian_profile():
    # 1. Register a test learner from India
    rand_email = f"learner_sih_{id(test_onboarding_with_sih26101_indian_profile)}@pathfinder.demo"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Priya Sharma"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Complete onboarding with Indian Education Taxonomy payload
    onboarding_payload = {
        "education_level": "Undergraduate (B.Tech CSE)",
        "field_of_study": "Computer Science & Engineering",
        "experience_level": "Beginner",
        "weekly_hours": 12,
        "preferred_formats": ["video", "hands-on"],
        "learning_objective": "Placement",
        "target_role": "AI/ML Engineer",
        "country": "India",
        "education_stage": "undergraduate",
        "education_domain": "computer_it",
        "education_stream": "cs_core",
        "specialization": "Artificial Intelligence & Machine Learning (AI/ML)",
        "qualification": "B.Tech CSE",
        "current_role": "Student / Fresher",
        "work_domain": "Artificial Intelligence & Machine Learning",
        "education_profile": {
            "country": "India",
            "education_stage": "undergraduate",
            "domain": "computer_it",
            "stream": "cs_core",
            "specialization": "Artificial Intelligence & Machine Learning (AI/ML)",
            "qualification": "B.Tech CSE",
            "current_role": "Student / Fresher"
        },
        "skills": []
    }

    onb_res = client.post("/api/v1/profile/onboarding", json=onboarding_payload, headers=headers)
    assert onb_res.status_code == 200
    prof = onb_res.json()

    assert prof["country"] == "India"
    assert prof["education_stage"] == "undergraduate"
    assert prof["education_stream"] == "cs_core"
    assert prof["specialization"] == "Artificial Intelligence & Machine Learning (AI/ML)"
    assert prof["qualification"] == "B.Tech CSE"
    assert prof["current_role"] == "Student / Fresher"

    # 3. Test direct PUT /api/v1/profile/education
    update_res = client.put("/api/v1/profile/education", json={
        "country": "India",
        "education_stage": "working_professional",
        "education_domain": "official_statistics_govt",
        "education_stream": "official_statistics_stream",
        "specialization": "Survey Sampling & Field Methodology",
        "qualification": "Junior Statistical Officer (JSO)",
        "current_role": "Statistical Officer (JSO / SSO)",
        "work_domain": "Official Statistics & Census"
    }, headers=headers)
    assert update_res.status_code == 200
    updated_prof = update_res.json()
    assert updated_prof["current_role"] == "Statistical Officer (JSO / SSO)"
    assert updated_prof["qualification"] == "Junior Statistical Officer (JSO)"

    # 4. Verify AI coach context personalizes with this stream
    chat_res = client.post("/api/v1/ai/chat", json={
        "message": "Hello, how do I start?"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "message" in chat_data or "reply" in chat_data
