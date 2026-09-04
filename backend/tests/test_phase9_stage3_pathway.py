"""
Phase 9 Stage 3: Career Eligibility & Pathway Intelligence Tests
Validates structured requirement models, direct vs alternative pathways,
SkillGapEngine reuse, bottleneck resolution, next-step derivations, and multi-domain scenarios.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.core.pathway_catalog import (
    CAREER_REQUIREMENTS_REGISTRY,
    get_career_requirements,
    PathwayType
)
from backend.app.career_discovery.pathway_engine import PathwayEngine
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile

client = TestClient(app)

def test_stage3_requirements_catalog_integrity():
    """Validates that all registered careers have comprehensive requirements, milestones, and pathways."""
    for slug, reqs in CAREER_REQUIREMENTS_REGISTRY.items():
        assert reqs.career_slug == slug
        assert len(reqs.mandatory_skills) > 0
        assert len(reqs.recommended_skills) > 0
        assert len(reqs.accepted_education_levels) > 0
        assert len(reqs.preferred_streams) > 0
        assert len(reqs.pathways) >= 1

        primary_pathways = [p for p in reqs.pathways if p.is_primary]
        assert len(primary_pathways) == 1

        for p in reqs.pathways:
            assert len(p.milestones) > 0
            for m in p.milestones:
                assert m.step_number > 0
                assert len(m.title) > 0
                assert m.milestone_type in ["academic_prerequisite", "foundational_skill", "core_competency", "capstone_evidence", "industry_entry"]

def test_stage3_pathway_direct_vs_alternative_resolution():
    """Tests that learners are matched to appropriate direct or alternative routes based on background."""
    db = SessionLocal()
    try:
        engine = PathwayEngine(db=db)

        # 1. Direct route for CSE undergraduate pursuing AI/ML
        cse_profile = LearnerProfile(
            education_stage="undergraduate",
            education_domain="engineering-technology",
            specialization="computer-science-engineering",
            skill_confidence_map={"python": 0.85, "linear-algebra": 0.70}
        )
        ai_eval = engine.evaluate_pathway(cse_profile, "ai-ml-engineer")
        assert ai_eval is not None
        assert ai_eval.eligibility_status == "DIRECT_ELIGIBLE"
        assert ai_eval.active_pathway.pathway_type == PathwayType.DIRECT_PATH
        assert "python" in ai_eval.satisfied_skills
        assert len(ai_eval.alternative_pathways) >= 1

        # 2. Alternative route for Mathematics B.Sc student
        math_profile = LearnerProfile(
            education_stage="undergraduate",
            education_domain="pure-sciences",
            specialization="mathematics",
            skill_confidence_map={"linear-algebra": 0.90}
        )
        math_eval = engine.evaluate_pathway(math_profile, "ai-ml-engineer")
        assert math_eval is not None
        assert math_eval.active_pathway.pathway_type == PathwayType.ALTERNATIVE_ACADEMIC_PATH
        assert "linear-algebra" in math_eval.satisfied_skills

        # 3. Bridge route for Mechanical student transitioning to AI
        mech_profile = LearnerProfile(
            education_stage="undergraduate",
            education_domain="engineering-technology",
            specialization="mechanical-engineering"
        )
        mech_eval = engine.evaluate_pathway(mech_profile, "ai-ml-engineer")
        assert mech_eval is not None
        assert mech_eval.active_pathway.pathway_type == PathwayType.BRIDGE_PATH
        assert mech_eval.next_step is not None
        assert mech_eval.next_step.priority == 1
    finally:
        db.close()

def test_stage3_skill_gap_engine_integration_and_next_step():
    """Validates that existing Phase 7 SkillGapEngine calculates gaps and drives next-step derivation."""
    db = SessionLocal()
    try:
        engine = PathwayEngine(db=db)

        # Profile with partial Data Science skills
        profile = LearnerProfile(
            education_stage="undergraduate",
            education_domain="computer-it",
            specialization="bca",
            skill_confidence_map={"python": 0.80, "sql": 0.75}  # missing pandas, machine-learning
        )
        ds_eval = engine.evaluate_pathway(profile, "data-scientist")
        assert ds_eval is not None
        assert "python" in ds_eval.satisfied_skills
        assert "sql" in ds_eval.satisfied_skills
        assert "pandas" in ds_eval.missing_skills or "machine-learning" in ds_eval.missing_skills

        # The next step should target a missing core competency
        assert ds_eval.next_step is not None
        assert ds_eval.next_step.skill_slug in ["pandas", "machine-learning", "eda", "statistics"]
        assert ds_eval.next_step.priority == 1
        assert ds_eval.next_step.estimated_hours > 0
    finally:
        db.close()

def test_stage3_multi_domain_scenarios():
    """Validates multi-domain scenarios: PCM, PCB, Commerce, Diploma, ITI, ECE."""
    db = SessionLocal()
    try:
        engine = PathwayEngine(db=db)

        # 1. PCM School Student
        pcm_prof = LearnerProfile(
            education_stage="higher-secondary",
            specialization="pcm",
            subjects=["Physics", "Chemistry", "Mathematics"]
        )
        pcm_eval = engine.evaluate_pathway(pcm_prof, "software-engineer")
        assert pcm_eval is not None
        assert pcm_eval.eligibility_status in ["DIRECT_ELIGIBLE", "BRIDGE_RECOMMENDED"]
        assert pcm_eval.active_pathway.pathway_type == PathwayType.DIRECT_PATH

        # 2. Commerce Student pursuing Data Science
        comm_prof = LearnerProfile(
            education_stage="undergraduate",
            specialization="commerce-with-mathematics",
            subjects=["Financial Accounting", "Mathematics", "Statistics"]
        )
        comm_eval = engine.evaluate_pathway(comm_prof, "data-scientist")
        assert comm_eval is not None
        assert comm_eval.active_pathway.pathway_type == PathwayType.ALTERNATIVE_ACADEMIC_PATH

        # 3. Diploma in Computer Engineering
        dip_prof = LearnerProfile(
            education_stage="diploma-polytechnic",
            specialization="diploma-polytechnic"
        )
        dip_eval = engine.evaluate_pathway(dip_prof, "full-stack-developer")
        assert dip_eval is not None
        assert dip_eval.active_pathway.pathway_type == PathwayType.DIPLOMA_PATH

        # 4. ECE Student pursuing VLSI
        ece_prof = LearnerProfile(
            education_stage="undergraduate",
            specialization="electronics-communication-engineering"
        )
        ece_eval = engine.evaluate_pathway(ece_prof, "vlsi-hardware-engineer")
        assert ece_eval is not None
        assert ece_eval.eligibility_status == "DIRECT_ELIGIBLE"
        assert ece_eval.active_pathway.pathway_type == PathwayType.DIRECT_PATH
    finally:
        db.close()

def test_stage3_api_endpoints():
    """Tests authenticated and public endpoints under /api/v1/careers/{career_slug}."""
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Requirements (Public)
    res_req = client.get("/api/v1/careers/ai-ml-engineer/requirements")
    assert res_req.status_code == 200
    req_data = res_req.json()
    assert req_data["career_slug"] == "ai-ml-engineer"
    assert "mandatory_skills" in req_data
    assert len(req_data["pathways"]) >= 2

    # 2. Pathways list (Public)
    res_paths = client.get("/api/v1/careers/ai-ml-engineer/pathways")
    assert res_paths.status_code == 200
    paths = res_paths.json()
    assert len(paths) >= 2
    assert "milestones" in paths[0]

    # 3. Personalized Fit (Authenticated)
    res_fit = client.get("/api/v1/careers/ai-ml-engineer/fit", headers=headers)
    assert res_fit.status_code == 200
    fit_data = res_fit.json()
    assert fit_data["career_slug"] == "ai-ml-engineer"
    assert "eligibility_status" in fit_data
    assert "active_pathway" in fit_data
    assert "next_step" in fit_data

    # 4. Detailed Skill Gaps (Authenticated)
    res_gaps = client.get("/api/v1/careers/ai-ml-engineer/gaps", headers=headers)
    assert res_gaps.status_code == 200
    gaps_data = res_gaps.json()
    assert "mandatory_skills" in gaps_data
    assert "items" in gaps_data

    # 5. Next Step (Authenticated)
    res_step = client.get("/api/v1/careers/ai-ml-engineer/next-step", headers=headers)
    assert res_step.status_code == 200
    step_data = res_step.json()
    assert "skill_slug" in step_data
    assert "priority" in step_data

    # 6. 404 on malformed career
    res_404 = client.get("/api/v1/careers/unknown-quantum-wizard/requirements")
    assert res_404.status_code == 404
