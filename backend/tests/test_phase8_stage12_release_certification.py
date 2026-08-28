import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_stage12_full_phase8_multi_domain_release_certification():
    domains = [
        "AI/ML Engineer",
        "Cybersecurity Analyst",
        "VLSI Hardware Engineer",
        "Data Scientist",
        "Full Stack Developer"
    ]
    for role in domains:
        email = f"p8_rc_{uuid.uuid4().hex[:6]}@example.com"
        reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!", "full_name": f"{role} Release Candidate"})
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Onboarding
        client.post("/api/v1/profile/onboarding", json={
            "target_role": role, "current_level": "Beginner", "weekly_hours": 12, "primary_focus": role, "skills": []
        }, headers=headers)

        # 1. Practical Competency
        comp = client.get("/api/v1/practical/competencies", headers=headers).json()
        assert isinstance(comp, list)

        # 2. Projects
        projs = client.get("/api/v1/projects", headers=headers).json()
        assert len(projs) > 0

        # 3. Scenarios
        scs = client.get("/api/v1/scenarios", headers=headers).json()
        assert len(scs) > 0

        # 4. Assessments
        asms = client.get("/api/v1/practical-assessments", headers=headers).json()
        assert len(asms) > 0

        # 5. Portfolio
        port = client.get("/api/v1/portfolio", headers=headers).json()
        assert port["target_role"] == role

        # 6. Employability
        emp = client.get("/api/v1/employability", headers=headers).json()
        assert 0.0 <= emp["employability_score"] <= 100.0

        # 7. Opportunity Matches
        matches = client.get("/api/v1/opportunities/matches", headers=headers).json()
        assert len(matches) > 0
