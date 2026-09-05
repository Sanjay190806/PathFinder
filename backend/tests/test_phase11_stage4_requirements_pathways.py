"""
Phase 11 Stage 4 Test Suite: Career Eligibility, Requirements & Pathway Intelligence
Tests canonical career requirements, statutory bodies, multi-pathway structures,
and learner eligibility evaluation with strict non-fabrication rules.
"""

import pytest
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.models.career import (
    Career,
    CareerRequirement,
    CareerPathwayDefinition,
    PathwayStepDefinition
)
from backend.app.career.requirement_engine import CareerRequirementEngine


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_career_requirements_exist(db: Session):
    """Verify that canonical requirements exist with verified sources and regulatory bodies."""
    doctor = db.query(Career).filter(Career.slug == "doctor").first()
    assert doctor is not None, "Doctor career must exist in database."

    reqs = db.query(CareerRequirement).filter(CareerRequirement.career_id == doctor.id).all()
    assert len(reqs) >= 4, f"Doctor should have at least 4 granular requirements, found {len(reqs)}"

    # Check for statutory authority NMC
    nmc_reqs = [r for r in reqs if "NMC" in (r.source or "") or "Medical Commission" in (r.source or "")]
    assert len(nmc_reqs) >= 1, "Doctor must have requirements sourced from National Medical Commission (NMC)."

    # Verify mandatory flag
    mandatory_reqs = [r for r in reqs if r.mandatory]
    assert len(mandatory_reqs) >= 2, "Doctor must have mandatory hard requirements."


def test_pilot_statutory_requirements(db: Session):
    """Verify Commercial Pilot regulatory requirements under DGCA."""
    pilot = db.query(Career).filter(Career.slug == "commercial-airline-pilot").first()
    assert pilot is not None

    reqs = db.query(CareerRequirement).filter(CareerRequirement.career_id == pilot.id).all()
    dgca_reqs = [r for r in reqs if "DGCA" in (r.source or "")]
    assert len(dgca_reqs) >= 2, "Pilot must have DGCA-sourced requirements (Class 1 Medical, CPL, etc.)."


def test_multi_pathway_structure(db: Session):
    """Verify multi-pathway definitions and ordered steps."""
    aiml = db.query(Career).filter(Career.slug == "ai-ml-engineer").first()
    assert aiml is not None

    pathways = db.query(CareerPathwayDefinition).filter(CareerPathwayDefinition.career_id == aiml.id).all()
    assert len(pathways) >= 2, "AI/ML Engineer should have at least 2 pathways (Direct Degree and Career Transition)."

    primary_path = next((p for p in pathways if p.is_primary), None)
    assert primary_path is not None, "Primary pathway must exist."
    assert len(primary_path.steps) >= 3, "Primary pathway must contain ordered steps."
    assert primary_path.steps[0].step_number == 1, "First step must be step 1."


def test_unauthenticated_eligibility_non_fabrication(db: Session):
    """Verify that evaluating eligibility without a learner profile returns UNKNOWN, never fabricated zeroes."""
    engine = CareerRequirementEngine(db=db)
    res = engine.evaluate_career_eligibility(career_slug="ai-ml-engineer", profile_id=None)

    assert res.career_slug == "ai-ml-engineer"
    assert res.overall_eligibility == "INSUFFICIENT_DATA"
    assert res.satisfaction_score is None, "Satisfaction score must be None (not 0.0) when profile is missing."
    assert res.unknown_count > 0, "Unknown count must be positive when profile is missing."

    for item in res.requirements:
        assert item.status == "UNKNOWN", f"Requirement {item.requirement_name} must be UNKNOWN without profile."


def test_learner_eligibility_matching_pcb_student(db: Session):
    """Verify eligibility evaluation for a qualified PCB student targeting Doctor."""
    engine = CareerRequirementEngine(db=db)

    # Create temporary PCB test user & profile
    user = User(email="test_pcb_student@pathfinder.internal", hashed_password="pw", full_name="PCB Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="higher-secondary",
        education_stream="pcb",
        subjects=["Physics", "Chemistry", "Biology", "English"],
        experience_level="Beginner"
    )
    db.add(profile)
    db.flush()

    try:
        res = engine.evaluate_career_eligibility(career_slug="doctor", profile_id=profile.id)
        assert res.overall_eligibility in ["BRIDGE_REQUIRED", "ELIGIBLE"]
        # Check that PCB coursework requirement is SATISFIED
        pcb_eval = next((r for r in res.requirements if "pcb" in r.requirement_name.lower() or "biology" in r.requirement_name.lower()), None)
        assert pcb_eval is not None
        assert pcb_eval.status == "SATISFIED", "PCB coursework requirement should be SATISFIED for PCB student."
    finally:
        db.delete(profile)
        db.delete(user)
        db.commit()


def test_learner_eligibility_non_science_for_doctor(db: Session):
    """Verify that a commerce/arts learner has bridge requirements and gaps when targeting Doctor."""
    engine = CareerRequirementEngine(db=db)

    user = User(email="test_arts_student@pathfinder.internal", hashed_password="pw", full_name="Arts Student", is_demo=True)
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_stage="higher-secondary",
        education_stream="arts-humanities",
        subjects=["History", "Political Science", "Economics"],
        experience_level="Beginner"
    )
    db.add(profile)
    db.flush()

    try:
        res = engine.evaluate_career_eligibility(career_slug="doctor", profile_id=profile.id)
        assert res.overall_eligibility == "BRIDGE_REQUIRED"
        assert len(res.bridge_requirements) > 0, "Bridge requirements must be flagged for non-science student."
        assert any("pcb" in b.lower() or "bridge" in b.lower() for b in res.bridge_requirements)
    finally:
        db.delete(profile)
        db.delete(user)
        db.commit()
