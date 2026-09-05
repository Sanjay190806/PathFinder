"""
Stage 12 Final Release Verification Test Suite
Executes controlled multi-domain user personas across 7 distinct career/educational paths:
A. Class 12 PCM -> Software Engineer (DSA + Core CS Roadmap)
B. ECE Student -> ML Engineer (ML + Python + DSA Roadmap)
C. ECE Student -> VLSI Engineer (Hardware / Semiconductor Roadmap)
D. Commerce + Math -> Data Analyst (SQL + BI + Analytics Roadmap)
E. Humanities -> Graphic Designer (Design Roadmap; DSA explicitly NOT_APPLICABLE)
F. Career Transition -> Cybersecurity (Network + Security Roadmap; Low DSA)
G. ITI / Diploma -> Technical / Vocational Role (Vocational Roadmap; Zero DSA)
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.company import Company, CompanyRole
from backend.app.dsa.dsa_priority_service import DSAPriorityService
from backend.app.roadmap.company_roadmap_service import CompanyRoadmapService
from backend.app.resources.company_recommendation_service import CompanyRecommendationService


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _create_learner(db, email, full_name, edu_level, field):
    user = User(
        full_name=full_name,
        email=email,
        hashed_password="hashed_password",
        is_demo=True
    )
    db.add(user)
    db.flush()
    profile = LearnerProfile(
        user_id=user.id,
        education_level=edu_level,
        field_of_study=field,
        experience_level="Beginner",
        weekly_hours=15
    )
    db.add(profile)
    db.commit()
    return user, profile


# =========================================================================
# PERSONA A: Class 12 PCM -> Software Engineer
# =========================================================================

def test_persona_a_pcm_to_software_engineer(db_session):
    user, profile = _create_learner(db_session, "pcm@pathfinder.io", "Aarav Sharma", "Class 12", "PCM")
    
    comp = Company(slug="google", canonical_name="Google", display_name="Google", industry="Technology", company_type="PRODUCT")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="software-engineer", canonical_role_name="Software Engineer", display_name="Software Engineer", dsa_relevance="VERY_HIGH")
    db_session.add(role)
    db_session.commit()

    # Verify DSA priority is VERY_HIGH
    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, company_slug="google", role_slug="software-engineer")
    assert dsa_prio["priority_level"] in ("HIGH", "VERY_HIGH")
    assert any(t["topic_slug"] == "graphs" for t in dsa_prio["core_topics"])

    # Verify 7-stage roadmap generates
    roadmap = CompanyRoadmapService.generate_company_roadmap(db_session, "google", "software-engineer", profile.id)
    assert roadmap is not None
    stages = [s["stage_name"] for s in roadmap.get("stages", [])]
    assert "FOUNDATION" in stages
    assert "INTERVIEW_PREPARATION" in stages


# =========================================================================
# PERSONA B: ECE Student -> ML Engineer
# =========================================================================

def test_persona_b_ece_to_ml_engineer(db_session):
    user, profile = _create_learner(db_session, "ece_ml@pathfinder.io", "Priya Nair", "Undergraduate", "Electronics & Communication")

    comp = Company(slug="meta", canonical_name="Meta", display_name="Meta", industry="Technology", company_type="PRODUCT")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="ml-engineer", canonical_role_name="ml engineer", display_name="ML Engineer", dsa_relevance="HIGH")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, company_slug="meta", role_slug="ml-engineer")
    assert dsa_prio["priority_level"] in ("HIGH", "VERY_HIGH", "MEDIUM")


# =========================================================================
# PERSONA C: ECE Student -> VLSI Engineer
# =========================================================================

def test_persona_c_ece_to_vlsi_engineer(db_session):
    user, profile = _create_learner(db_session, "vlsi@pathfinder.io", "Rohan Iyer", "Undergraduate", "Electronics & Communication")

    comp = Company(slug="nvidia", canonical_name="NVIDIA", display_name="NVIDIA", industry="Semiconductor", company_type="PRODUCT")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="vlsi-engineer", canonical_role_name="vlsi engineer", display_name="VLSI Design Engineer", dsa_relevance="MINIMAL")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, canonical_role_name="vlsi engineer")
    assert dsa_prio["priority_level"] == "MINIMAL"
    assert any(t["topic_slug"] == "bit-manipulation" for t in dsa_prio["core_topics"])


# =========================================================================
# PERSONA D: Commerce + Math -> Data Analyst
# =========================================================================

def test_persona_d_commerce_to_data_analyst(db_session):
    user, profile = _create_learner(db_session, "commerce@pathfinder.io", "Neha Gupta", "Undergraduate", "Commerce with Mathematics")

    comp = Company(slug="hdfc", canonical_name="HDFC Bank", display_name="HDFC Bank", industry="Banking & Financial Services", company_type="ENTERPRISE")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="data-analyst", canonical_role_name="financial analyst", display_name="Data Analyst", dsa_relevance="NOT_APPLICABLE")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, canonical_role_name="financial analyst")
    assert dsa_prio["priority_level"] == "NOT_APPLICABLE"


# =========================================================================
# PERSONA E: Humanities -> Graphic Designer
# =========================================================================

def test_persona_e_humanities_to_graphic_designer(db_session):
    user, profile = _create_learner(db_session, "design@pathfinder.io", "Ananya Sen", "Undergraduate", "Fine Arts & Humanities")

    comp = Company(slug="adobe", canonical_name="Adobe", display_name="Adobe", industry="Design & Software", company_type="PRODUCT")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="graphic-designer", canonical_role_name="Graphic Designer", display_name="Graphic Designer", dsa_relevance="NOT_APPLICABLE")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, canonical_role_name="Graphic Designer")
    assert dsa_prio["priority_level"] == "NOT_APPLICABLE"
    assert len(dsa_prio["core_topics"]) == 0


# =========================================================================
# PERSONA F: Career Transition -> Cybersecurity
# =========================================================================

def test_persona_f_transition_to_cybersecurity(db_session):
    user, profile = _create_learner(db_session, "cyber@pathfinder.io", "Vikram Patel", "Working Professional", "Information Technology")

    comp = Company(slug="palo-alto", canonical_name="Palo Alto Networks", display_name="Palo Alto", industry="Cybersecurity", company_type="PRODUCT")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="security-engineer", canonical_role_name="Security Engineer", display_name="Cyber Security Engineer", dsa_relevance="LOW")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, canonical_role_name="Security Engineer")
    assert dsa_prio["priority_level"] in ("LOW", "MEDIUM")


# =========================================================================
# PERSONA G: ITI / Diploma -> Vocational Role
# =========================================================================

def test_persona_g_vocational_technician(db_session):
    user, profile = _create_learner(db_session, "iti@pathfinder.io", "Suresh Kumar", "ITI / Diploma", "Mechanical Trade")

    comp = Company(slug="tata-motors", canonical_name="Tata Motors", display_name="Tata Motors", industry="Automotive & Manufacturing", company_type="ENTERPRISE")
    db_session.add(comp)
    db_session.flush()
    role = CompanyRole(company_id=comp.id, role_slug="mechanical-technician", canonical_role_name="Mechanical Engineer", display_name="Assembly Technician", dsa_relevance="NOT_APPLICABLE")
    db_session.add(role)
    db_session.commit()

    dsa_prio = DSAPriorityService.get_role_dsa_priority(db_session, canonical_role_name="Mechanical Engineer")
    assert dsa_prio["priority_level"] == "NOT_APPLICABLE"
