import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.resource import LearningResource
from backend.app.models.skill import Skill
from backend.app.core.career_catalog import (
    get_career_catalog,
    resolve_target_skills_for_role,
    register_custom_career_role,
    CareerRoleDefinition
)
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.sequencer import PathSequencer
from backend.app.engine.scorer import ScoredCandidate
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.ai.context_builder import ContextBuilder

client = TestClient(app)

def test_centralized_career_catalog_resolution():
    # 1. Standard registered roles
    ai_skills = resolve_target_skills_for_role("AI/ML Engineer")
    assert ai_skills is not None
    assert "transformers" in ai_skills

    cyber_skills = resolve_target_skills_for_role("Cybersecurity Analyst")
    assert cyber_skills is not None
    assert "pentesting" in cyber_skills
    assert "transformers" not in cyber_skills

    # 2. Unknown role returns None (No silent AI/ML fallback)
    unknown_skills = resolve_target_skills_for_role("Quantum Cryptographer XYZ")
    assert unknown_skills is None

def test_onboarding_rejects_unregistered_role():
    # Register a new user
    rand_email = f"test_onboard_rej_{uuid.uuid4().hex[:6]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Rejection Tester"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt onboarding with unknown role
    onboard_res = client.post("/api/v1/profile/onboarding", json={
        "target_role": "CompletelyFakeDomainRole123",
        "weekly_hours": 10,
        "skills": []
    }, headers=headers)

    assert onboard_res.status_code == 400
    assert "not recognized" in onboard_res.json()["detail"]

def test_onboarding_cybersecurity_domain_no_ai_fallback():
    rand_email = f"test_cyber_{uuid.uuid4().hex[:6]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Cyber Tester"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    onboard_res = client.post("/api/v1/profile/onboarding", json={
        "target_role": "Cybersecurity Analyst",
        "weekly_hours": 10,
        "skills": []
    }, headers=headers)

    assert onboard_res.status_code == 200
    data = onboard_res.json()
    assert data["primary_goal"]["target_role"] == "Cybersecurity Analyst"
    target_skills = data["primary_goal"]["target_skills"]
    
    # Must contain cyber skills and NOT AI/ML default skills
    assert "networking" in target_skills
    assert "pentesting" in target_skills
    assert "transformers" not in target_skills
    assert "deep-learning" not in target_skills

def test_dynamic_domain_registration_vlsi_engineer():
    # Register a dynamic new career domain definition
    vlsi_def = CareerRoleDefinition(
        role="VLSI Engineer",
        slug="vlsi-engineer",
        title="Become a VLSI Engineer",
        description="Master Digital Logic, Verilog HDL, Computer Architecture, and ASIC Physical Design.",
        domain_category="Hardware Engineering",
        target_skills=["digital-logic", "verilog", "computer-architecture", "vlsi-design", "physical-design"]
    )
    register_custom_career_role(vlsi_def)

    # Verify resolution
    resolved = resolve_target_skills_for_role("VLSI Engineer")
    assert resolved == ["digital-logic", "verilog", "computer-architecture", "vlsi-design", "physical-design"]

    # Verify onboarding succeeds with dynamic new role
    rand_email = f"test_vlsi_{uuid.uuid4().hex[:6]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "VLSI Tester"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    onboard_res = client.post("/api/v1/profile/onboarding", json={
        "target_role": "VLSI Engineer",
        "weekly_hours": 15,
        "skills": []
    }, headers=headers)

    assert onboard_res.status_code == 200
    data = onboard_res.json()
    assert data["primary_goal"]["target_role"] == "VLSI Engineer"
    assert data["primary_goal"]["target_skills"] == vlsi_def.target_skills

def test_path_sequencer_pure_dag_and_metadata_ordering():
    db = SessionLocal()
    try:
        skill_dag = SkillDAG(db)
        sequencer = PathSequencer(skill_dag)

        # Create mock candidate resources across domains without keyword reliance
        res_found = LearningResource(
            id="res-f-1",
            title="Introduction to Digital Logic & Boolean Gates",
            difficulty="Beginner",
            resource_type="course"
        )
        res_core = LearningResource(
            id="res-c-1",
            title="Verilog HDL Synthesis & Simulation",
            difficulty="Intermediate",
            resource_type="course"
        )
        res_spec = LearningResource(
            id="res-s-1",
            title="ASIC Timing Closure & Clock Tree Synthesis",
            difficulty="Advanced",
            resource_type="course"
        )
        res_proj = LearningResource(
            id="res-p-1",
            title="RISC-V Core Implementation Capstone",
            difficulty="Advanced",
            resource_type="project"
        )

        candidates = [
            ScoredCandidate(res_found, 0.9, 0.9, 1.0, 0.9, 0.9, 0.9, 0.5, 1.0, 0.90, []),
            ScoredCandidate(res_core, 0.85, 0.85, 0.8, 0.8, 0.8, 0.8, 0.5, 1.0, 0.82, []),
            ScoredCandidate(res_spec, 0.80, 0.80, 0.7, 0.7, 0.7, 0.7, 0.5, 1.0, 0.75, []),
            ScoredCandidate(res_proj, 0.95, 0.95, 0.9, 0.9, 0.9, 0.9, 0.5, 1.0, 0.92, [])
        ]

        phases = sequencer.sequence(candidates)

        # Phase 1: Foundations
        assert any(c.resource.id == "res-f-1" for c in phases[0].items)
        # Phase 2: Core
        assert any(c.resource.id == "res-c-1" for c in phases[1].items)
        # Phase 3: Specialization
        assert any(c.resource.id == "res-s-1" for c in phases[2].items)
        # Phase 5: Capstone / Project
        assert any(c.resource.id == "res-p-1" for c in phases[4].items)
    finally:
        db.close()

def test_analytics_no_fabricated_strengths_for_empty_profile():
    rand_email = f"test_analytics_empty_{uuid.uuid4().hex[:6]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Empty Analytics Tester"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize empty profile
    prof_res = client.get("/api/v1/profile", headers=headers)
    assert prof_res.status_code == 200

    analytics_res = client.get("/api/v1/analytics", headers=headers)
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    # Unassessed learner must NOT receive fake Python/SQL/DL/Transformers
    assert data["strengths"] == []
    assert data["weaknesses"] == []

def test_deterministic_ai_provider_generic_domain():
    db = SessionLocal()
    try:
        user = User(email=f"test_ai_gen_{uuid.uuid4().hex[:6]}@example.com", hashed_password="pw", full_name="Generic Domain Learner")
        db.add(user)
        db.flush()
        profile = LearnerProfile(user_id=user.id, weekly_hours=10, skill_confidence_map={"networking": 0.50, "linux": 0.30})
        db.add(profile)
        db.flush()
        goal = Goal(profile_id=profile.id, title="Cybersecurity Analyst", target_role="Cybersecurity Analyst", target_skills=["networking", "linux", "web-security", "cryptography", "pentesting"], is_primary=True)
        db.add(goal)
        db.commit()

        cb = ContextBuilder(db)
        context = cb.build_context(profile, goal, "What prerequisite am I missing?")
        provider = DeterministicProvider()
        res = provider.generate_coach_response(context)

        assert res.grounded is True
        assert "Cybersecurity Analyst" in res.message
        # Must not fabricate AI/ML specific text when answering for Cybersecurity
        assert "Transformers" not in res.message
        assert "Linear Algebra" not in res.message
    finally:
        db.close()
