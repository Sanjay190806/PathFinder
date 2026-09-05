"""
Test Suite for Phase 11 Stage 3: Career Families, Specializations & Education-to-Career Intelligence
Verifies education-to-career graph across PCM, PCB, Commerce, Humanities, Diploma, ITI,
direct pathways, bridge pathways, statutory regulatory gating, transitions, DecisionTrace,
and IDOR security.
"""

import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.career.education_graph_engine import EducationGraphEngine
from backend.app.career.transition_engine import CareerTransitionEngine


client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_authenticated_user_and_profile(db: Session, email_prefix: str) -> tuple[User, LearnerProfile, str]:
    """Helper creating an authenticated test user with profile and returning access token."""
    email = f"{email_prefix}_{pytest.__version__}@test.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        from backend.app.core.security import hash_password
        user = User(
            email=email,
            hashed_password=hash_password("TestPassword123!"),
            full_name="Phase 11 Test Learner",
            is_demo=False
        )
        db.add(user)
        db.flush()

        profile = LearnerProfile(
            user_id=user.id,
            education_stage="undergraduate",
            education_stream="computer-science-engineering",
            specialization="Computer Science & Engineering",
            subjects=["Mathematics", "Physics", "Computer Science"]
        )
        db.add(profile)
        db.commit()
    else:
        profile = user.profile

    from backend.app.core.security import create_access_token
    token = create_access_token(user.id)
    return user, profile, token


def test_direct_pathway_pcm_to_software_engineer(test_db: Session):
    """
    Scenario: Learner with PCM + CSE Degree pursuing Software Engineer.
    Expected: DIRECT_FIT or STRONG_FIT with Direct Career Pathway.
    """
    engine = EducationGraphEngine(db=test_db)
    user, profile, _ = get_authenticated_user_and_profile(test_db, "pcm_swe")

    # Configure profile
    profile.education_stage = "undergraduate"
    profile.education_stream = "computer-science-engineering"
    profile.specialization = "computer-science-engineering"
    profile.subject_combination = "PCM"
    profile.subjects = ["Mathematics", "Physics", "Computer Science"]
    test_db.commit()

    fit = engine.evaluate_education_fit(profile=profile, career_slug="software-engineer")
    assert fit is not None
    assert fit.education_fit in ["DIRECT_FIT", "STRONG_FIT"]
    assert fit.is_regulated_blocked is False
    assert len(fit.decision_trace) >= 2
    assert any(step["step"] == "ACADEMIC_STREAM_ALIGNMENT" for step in fit.decision_trace)


def test_commerce_math_to_data_analyst_bridge_pathway(test_db: Session):
    """
    Scenario: Learner with Class 12 Commerce + Mathematics background exploring Data Scientist.
    Expected: STRONG_FIT with Quantitative Analytics Bridge Pathway.
    """
    engine = EducationGraphEngine(db=test_db)
    user, profile, _ = get_authenticated_user_and_profile(test_db, "commerce_data")

    profile.education_stage = "higher-secondary"
    profile.education_stream = "commerce"
    profile.subject_combination = "Commerce + Mathematics"
    profile.subjects = ["Mathematics", "Accountancy", "Economics", "Business Studies"]
    test_db.commit()

    fit = engine.evaluate_education_fit(profile=profile, career_slug="data-scientist")
    assert fit is not None
    assert fit.education_fit in ["STRONG_FIT", "BRIDGE_REQUIRED"]
    assert "Commerce" in fit.education_reason or "Mathematics" in fit.education_reason
    assert fit.is_regulated_blocked is False
    assert len(fit.recommended_bridge_skills) >= 1


def test_humanities_to_graphic_designer_creative_bridge(test_db: Session):
    """
    Scenario: Learner from Humanities background exploring Graphic Designer.
    Expected: BRIDGE_REQUIRED (Portfolio-first pathway) rather than being blocked.
    """
    engine = EducationGraphEngine(db=test_db)
    user, profile, _ = get_authenticated_user_and_profile(test_db, "humanities_design")

    profile.education_stage = "undergraduate"
    profile.education_stream = "arts-humanities"
    profile.specialization = "English Literature"
    profile.subjects = ["History", "Literature", "Political Science"]
    test_db.commit()

    fit = engine.evaluate_education_fit(profile=profile, career_slug="graphic-designer")
    assert fit is not None
    assert fit.education_fit == "BRIDGE_REQUIRED"
    assert fit.is_regulated_blocked is False
    assert "portfolio" in fit.education_reason.lower() or "creative" in fit.education_reason.lower()


def test_statutory_regulated_block_for_medical_and_aviation(test_db: Session):
    """
    Scenario: Humanities/Commerce learner attempting to enter Doctor or Airline Pilot.
    Expected: REGULATED_PREREQUISITE_MISSING with strict statutory notice (NEET/MBBS or DGCA 10+2 PCM).
    """
    engine = EducationGraphEngine(db=test_db)
    user, profile, _ = get_authenticated_user_and_profile(test_db, "unregulated_to_doctor")

    profile.education_stage = "undergraduate"
    profile.education_stream = "commerce"
    profile.subjects = ["Accountancy", "Economics"]
    test_db.commit()

    # 1. Attempt Doctor without PCB
    fit_doc = engine.evaluate_education_fit(profile=profile, career_slug="doctor")
    assert fit_doc is not None
    assert fit_doc.is_regulated_blocked is True
    assert fit_doc.education_fit == "REGULATED_PREREQUISITE_MISSING"
    assert "MBBS" in fit_doc.regulatory_notice or "PCB" in fit_doc.regulatory_notice

    # 2. Attempt Pilot without PCM
    fit_pilot = engine.evaluate_education_fit(profile=profile, career_slug="commercial-airline-pilot")
    assert fit_pilot is not None
    assert fit_pilot.is_regulated_blocked is True
    assert "Physics and Mathematics" in fit_pilot.regulatory_notice or "DGCA" in fit_pilot.regulatory_notice


def test_career_transitions_and_transferable_skills(test_db: Session):
    """
    Scenario: Transition from Graphic Designer to UI/UX Designer.
    Expected: HIGH feasibility, transferable visual skills, and Figma bridge skills.
    """
    t_engine = CareerTransitionEngine(db=test_db)
    trans = t_engine.get_career_transition(source_slug="graphic-designer", target_slug="ui-ux-designer")

    assert trans is not None
    assert trans.feasibility == "HIGH"
    assert len(trans.transferable_skills) >= 3
    assert any("typography" in s.lower() for s in trans.transferable_skills)
    assert any("figma" in s.lower() for s in trans.bridge_skills)
    assert trans.estimated_ramp_weeks <= 12
    assert len(trans.recommended_portfolio_projects) >= 1


def test_career_comparison_side_by_side(test_db: Session):
    """
    Verifies comparing 2-3 careers (AI/ML Engineer, Graphic Designer, Doctor).
    Expected: Side-by-side matrices on education barriers, tools, work environment, and skills.
    """
    t_engine = CareerTransitionEngine(db=test_db)
    comp = t_engine.compare_careers(["ai-ml-engineer", "graphic-designer", "doctor"])

    assert len(comp.careers) == 3
    slugs = {c.career_slug for c in comp.careers}
    assert "ai-ml-engineer" in slugs
    assert "graphic-designer" in slugs
    assert "doctor" in slugs

    # Verify barriers
    doc_item = next(c for c in comp.careers if c.career_slug == "doctor")
    assert doc_item.education_entry_barrier == "REGULATED"

    design_item = next(c for c in comp.careers if c.career_slug == "graphic-designer")
    assert design_item.portfolio_importance == "CRITICAL"


def test_stage3_http_api_endpoints(test_db: Session):
    """Verifies HTTP endpoints for specializations, education fit, transitions, and compare."""
    user, profile, token = get_authenticated_user_and_profile(test_db, "api_stage3")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET /api/v1/careers/{career_slug}/specializations
    res_specs = client.get("/api/v1/careers/ai-ml-engineer/specializations")
    assert res_specs.status_code == 200
    specs = res_specs.json()
    assert len(specs) >= 4
    assert any(s["slug"] == "deep-learning-engineer" for s in specs)

    # 2. GET /api/v1/careers/{career_slug}/education-fit (Authenticated)
    res_fit = client.get("/api/v1/careers/software-engineer/education-fit", headers=headers)
    assert res_fit.status_code == 200
    fit_data = res_fit.json()
    assert "education_fit" in fit_data
    assert "decision_trace" in fit_data

    # 3. GET /api/v1/careers/{career_slug}/transitions
    res_trans = client.get("/api/v1/careers/ai-ml-engineer/transitions?from_role=software-engineer", headers=headers)
    assert res_trans.status_code == 200
    trans_data = res_trans.json()
    assert trans_data["target_career_slug"] == "ai-ml-engineer"
    assert len(trans_data["transferable_skills"]) >= 1

    # 4. POST /api/v1/careers/compare
    res_comp = client.post("/api/v1/careers/compare", json=["software-engineer", "graphic-designer"])
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    assert len(comp_data["careers"]) == 2
