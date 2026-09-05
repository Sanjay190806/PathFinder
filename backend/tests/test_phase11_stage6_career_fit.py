"""
Phase 11 Stage 6 Comprehensive Test Suite: Skill-Based Career Fit & Personalized Career Intelligence
Tests:
- 8 explainable fit dimensions (education, skill, interest, experience, practical, portfolio, pathway, preference)
- 6 fit categories (STRONG_FIT, GOOD_FIT, POTENTIAL_FIT, BRIDGE_REQUIRED, STRETCH_PATH, INSUFFICIENT_DATA)
- Strict non-fabrication: unrecorded data = UNKNOWN and score None
- Hard requirements vs Recommended skills weighting
- 6 distinct learner personas (PCM to AI/ML, Commerce+Math to Data, Humanities to Graphic Design, ECE to VLSI, Diploma to Cloud, Software to Data)
- DecisionTrace generation (factors, evidence, rationale)
- Personalized alternatives for learners with major gaps
- Next-best action (Learn, Practice, Build, Assess)
- Security: Authorization enforcement and IDOR prevention
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.career.personalization_engine import CareerPersonalizationEngine
from backend.app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Persona 1: Class 12 PCM targeting AI/ML
# ---------------------------------------------------------------------------
def test_persona1_class12_pcm_aiml_target(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p1_pcm@test.internal", hashed_password="pw", full_name="PCM 12th Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="higher-secondary",
        education_stream="pcm",
        subjects=["Physics", "Chemistry", "Mathematics", "English"],
        experience_level="Beginner",
        weekly_hours=15,
        learning_objective="College Preparation"
    )
    db.add(profile)
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="ai-ml-engineer", profile_id=profile.id)
        assert res.dimensions["education_fit"].status in ["STRONG", "MODERATE"]
        assert res.fit_category in ["POTENTIAL_FIT", "BRIDGE_REQUIRED", "GOOD_FIT"]
        assert len(res.skill_evidence.gap_skills) > 0, "Should detect gaps in deep learning and production AI."
        assert any("Learn:" in act for act in res.recommended_next_actions)
        assert res.decision_trace["target_role"] == "ai-ml-engineer"
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Persona 2: Commerce + Math targeting Data Scientist
# ---------------------------------------------------------------------------
def test_persona2_commerce_math_data_target(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p2_comm@test.internal", hashed_password="pw", full_name="Commerce Math Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="undergraduate",
        education_stream="commerce-mathematics",
        field_of_study="Business Analytics",
        experience_level="Intermediate",
        weekly_hours=12,
        learning_objective="Job Placement"
    )
    db.add(profile)
    db.flush()

    skills = {s.slug: s for s in db.query(Skill).all()}
    if "statistics" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["statistics"].id, assessed_confidence=0.85, self_rating="Advanced"))
    if "sql" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["sql"].id, assessed_confidence=0.75, self_rating="Intermediate"))
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="data-scientist", profile_id=profile.id)
        assert any("statistic" in s.lower() for s in res.skill_evidence.strong_skills + res.skill_evidence.developing_skills)
        assert res.fit_category in ["GOOD_FIT", "POTENTIAL_FIT", "BRIDGE_REQUIRED"]
        assert res.overall_fit_score >= 0.45
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Persona 3: Humanities targeting Graphic Designer
# ---------------------------------------------------------------------------
def test_persona3_humanities_graphic_designer_target(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p3_humanities@test.internal", hashed_password="pw", full_name="Humanities Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="undergraduate",
        education_stream="arts-humanities",
        field_of_study="Visual Arts",
        experience_level="Intermediate",
        weekly_hours=15,
        work_domain="design-creative"
    )
    db.add(profile)
    db.flush()

    skills = {s.slug: s for s in db.query(Skill).all()}
    if "typography" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["typography"].id, assessed_confidence=0.80, self_rating="Advanced"))
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="graphic-designer", profile_id=profile.id)
        assert res.dimensions["interest_fit"].status == "STRONG"
        assert res.fit_category in ["GOOD_FIT", "BRIDGE_REQUIRED", "POTENTIAL_FIT"]
        assert any("portfolio" in g.lower() for g in res.primary_gaps) or any("Build:" in a for a in res.recommended_next_actions)
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Persona 4: ECE student targeting VLSI
# ---------------------------------------------------------------------------
def test_persona4_ece_vlsi_target(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p4_ece@test.internal", hashed_password="pw", full_name="ECE Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="undergraduate",
        education_stream="electronics-communication-engineering",
        field_of_study="Electronics",
        experience_level="Advanced",
        weekly_hours=20,
        work_domain="electronics-semiconductor"
    )
    db.add(profile)
    db.flush()

    skills = {s.slug: s for s in db.query(Skill).all()}
    if "verilog-rtl" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["verilog-rtl"].id, assessed_confidence=0.88, self_rating="Advanced"))
    if "embedded-c" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["embedded-c"].id, assessed_confidence=0.85, self_rating="Advanced"))
    if "linear-algebra" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["linear-algebra"].id, assessed_confidence=0.80, self_rating="Advanced"))
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="vlsi-hardware-engineer", profile_id=profile.id)
        assert res.dimensions["education_fit"].status == "STRONG"
        assert res.fit_category in ["STRONG_FIT", "GOOD_FIT"]
        assert res.confidence_level in ["HIGH", "MEDIUM"]
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Persona 5: Diploma targeting Cloud DevOps
# ---------------------------------------------------------------------------
def test_persona5_diploma_cloud_target(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p5_diploma@test.internal", hashed_password="pw", full_name="Diploma Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="diploma-polytechnic",
        education_stream="computer-engineering",
        experience_level="Intermediate",
        weekly_hours=15
    )
    db.add(profile)
    db.flush()

    skills = {s.slug: s for s in db.query(Skill).all()}
    if "linux" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["linux"].id, assessed_confidence=0.85, self_rating="Advanced"))
    if "docker" in skills:
        db.add(LearnerSkill(profile_id=profile.id, skill_id=skills["docker"].id, assessed_confidence=0.75, self_rating="Intermediate"))
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="cloud-devops-engineer", profile_id=profile.id)
        assert res.fit_category in ["GOOD_FIT", "POTENTIAL_FIT", "STRONG_FIT", "BRIDGE_REQUIRED"]
        assert len(res.skill_evidence.strong_skills) > 0
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Persona 6: Career Transition (Software -> Data)
# ---------------------------------------------------------------------------
def test_persona6_software_to_data_transition(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="p6_switch@test.internal", hashed_password="pw", full_name="Software Developer", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="undergraduate",
        education_stream="computer-science-engineering",
        current_role="Software Engineer",
        experience_level="Advanced",
        weekly_hours=15,
        learning_objective="Career Switch"
    )
    db.add(profile)
    db.flush()

    skills = {s.slug: s for s in db.query(Skill).all()}
    for s_name in ["python", "sql", "rest-apis", "dsa"]:
        if s_name in skills:
            db.add(LearnerSkill(profile_id=profile.id, skill_id=skills[s_name].id, assessed_confidence=0.90, self_rating="Advanced"))
    db.flush()

    try:
        res = engine.calculate_career_fit(career_slug="data-scientist", profile_id=profile.id)
        assert res.fit_category in ["GOOD_FIT", "STRONG_FIT", "BRIDGE_REQUIRED", "POTENTIAL_FIT"]
        assert any("python" in s.lower() for s in res.skill_evidence.strong_skills)
        assert any("sql" in s.lower() for s in res.skill_evidence.strong_skills)
        # Test personalized alternatives
        alts = engine.get_personalized_alternatives_for_learner(
            target_career_slug="doctor",
            profile_id=profile.id,
            limit=3
        )
        assert len(alts.alternatives) > 0
        assert alts.alternatives[0].label == "Alternative based on current evidence"
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Non-Fabrication & Unknown Data Integrity
# ---------------------------------------------------------------------------
def test_non_fabrication_unauthenticated_profile(db: Session):
    engine = CareerPersonalizationEngine(db=db)
    res = engine.calculate_career_fit(career_slug="software-engineer", profile_id=None)

    assert res.fit_category == "INSUFFICIENT_DATA"
    assert res.overall_fit_score == 0.0
    for dim_name, dim_obj in res.dimensions.items():
        assert dim_obj.status == "UNKNOWN", f"Dimension {dim_name} must be UNKNOWN when profile is missing."
        assert dim_obj.score is None, f"Dimension {dim_name} score must be None (not 0.0)."


# ---------------------------------------------------------------------------
# DecisionTrace Auditability
# ---------------------------------------------------------------------------
def test_decision_trace_explainability(db: Session):
    engine = CareerPersonalizationEngine(db=db)

    user = User(email="trace_user@test.internal", hashed_password="pw", full_name="Trace User", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(user_id=user.id, education_stage="undergraduate", education_stream="computer-science-engineering")
    db.add(profile)
    db.flush()

    try:
        explanation = engine.get_fit_explanation(career_slug="software-engineer", profile_id=profile.id)
        assert explanation.career_slug == "software-engineer"
        assert len(explanation.why_fit) > 10
        assert "factors" in explanation.decision_trace
        assert len(explanation.decision_trace["factors"]) >= 6
    finally:
        db.rollback()


# ---------------------------------------------------------------------------
# Security: Authorization & IDOR Prevention
# ---------------------------------------------------------------------------
def test_security_idor_prevention(db: Session):
    """Verify that a learner cannot evaluate another learner's private fit."""
    user_a = User(email="user_a@test.internal", hashed_password="pw", full_name="User A", is_demo=False)
    user_b = User(email="user_b@test.internal", hashed_password="pw", full_name="User B", is_demo=False)
    db.add_all([user_a, user_b])
    db.flush()

    profile_a = LearnerProfile(user_id=user_a.id)
    profile_b = LearnerProfile(user_id=user_b.id)
    db.add_all([profile_a, profile_b])
    db.commit()

    token_a = create_access_token(user_a.id)

    try:
        # User A attempts to access User B's profile fit -> Must be 403 Forbidden
        headers = {"Authorization": f"Bearer {token_a}"}
        res = client.get(f"/api/v1/careers/software-engineer/fit?profile_id={profile_b.id}", headers=headers)
        assert res.status_code == 403, f"Expected 403 Forbidden on IDOR attempt, got {res.status_code}"
        assert "Access denied" in res.json()["detail"]

        # Unauthenticated request to /alternatives-for-me -> Must be 401 Unauthorized
        res_unauth = client.get("/api/v1/careers/alternatives-for-me?target_career=software-engineer")
        assert res_unauth.status_code == 401, f"Expected 401 on unauthenticated alternatives, got {res_unauth.status_code}"
    finally:
        db.delete(profile_a)
        db.delete(profile_b)
        db.delete(user_a)
        db.delete(user_b)
        db.commit()
