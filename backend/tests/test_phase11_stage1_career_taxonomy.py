"""
Test Suite for Phase 11 Stage 1: Global Career Taxonomy & Canonical Data Model
Verifies domains, families, careers, specializations, skills, education requirements,
regulatory governance, emerging roles, aliases, versioning, and REST API endpoints.
"""

import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import get_db
from backend.app.models.career import (
    CareerDomain,
    CareerFamily,
    Career,
    CareerSpecialization,
    CareerRelationship,
    CareerSkillRequirement,
    CareerEducationRequirement,
    CareerRegionalMetadata
)
from backend.app.models.skill import Skill
from backend.app.core.career_catalog import get_career_catalog, resolve_target_skills_for_role


from backend.app.database import SessionLocal, get_db

client = TestClient(app)

@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_domains_and_families_seeded(test_db: Session):
    """Verifies that multi-domain domains and families are properly registered."""
    domains = test_db.query(CareerDomain).filter(CareerDomain.is_active == True).all()
    assert len(domains) >= 16, f"Expected at least 16 domains, found {len(domains)}"

    domain_slugs = {d.slug for d in domains}
    expected_domains = [
        "technology-computing",
        "electronics-semiconductor",
        "engineering-infrastructure",
        "healthcare-medicine",
        "finance-accounting",
        "law-legal",
        "education-academia",
        "design-creative",
        "media-film-entertainment",
        "agriculture-food",
        "aviation-aerospace",
        "skilled-trades-vocational"
    ]
    for exp in expected_domains:
        assert exp in domain_slugs, f"Domain {exp} missing from seeded taxonomy"

    families = test_db.query(CareerFamily).filter(CareerFamily.is_active == True).all()
    assert len(families) >= 25, f"Expected at least 25 families, found {len(families)}"


def test_canonical_careers_multi_domain_coverage(test_db: Session):
    """
    Verifies representation across Technology, Engineering, Healthcare, Finance,
    Law, Education, Design, Media, Agriculture, Aviation, and Skilled Trades.
    """
    expected_careers = [
        "ai-ml-engineer",
        "data-scientist",
        "software-engineer",
        "full-stack-developer",
        "cloud-devops-engineer",
        "cybersecurity-analyst",
        "vlsi-hardware-engineer",
        "graphic-designer",
        "ui-ux-designer",
        "video-editor",
        "doctor",
        "nurse",
        "civil-engineer",
        "mechanical-engineer",
        "chartered-accountant",
        "corporate-lawyer",
        "secondary-school-teacher",
        "commercial-airline-pilot",
        "automotive-mechanic",
        "licensed-electrician",
        "agricultural-scientist"
    ]

    for slug in expected_careers:
        career = test_db.query(Career).filter(Career.slug == slug).first()
        assert career is not None, f"Career '{slug}' not found in canonical database"
        assert career.canonical_name, f"Career '{slug}' has empty canonical name"
        assert career.domain is not None, f"Career '{slug}' has no associated domain"
        assert career.family is not None, f"Career '{slug}' has no associated family"
        assert career.short_description, f"Career '{slug}' has no description"


def test_regulated_and_emerging_career_metadata(test_db: Session):
    """Verifies that regulated professions have verified statutory requirements and non-invented data."""
    # 1. Doctor (Regulated)
    doctor_slug = "doctor"
    doctor = test_db.query(Career).filter(Career.slug == doctor_slug).first()
    assert doctor.is_regulated is True
    assert "MBBS" in doctor.regulatory_requirement or "NMC" in doctor.regulatory_requirement
    assert doctor.qualification_requirement is not None

    # Regional metadata check
    reg = test_db.query(CareerRegionalMetadata).filter(CareerRegionalMetadata.career_id == doctor.id).first()
    assert reg is not None
    assert reg.regulatory_body == "National Medical Commission (NMC)"
    assert "NEET" in reg.statutory_exam

    # 2. Pilot (Regulated)
    pilot = test_db.query(Career).filter(Career.slug == "commercial-airline-pilot").first()
    assert pilot.is_regulated is True
    assert "CPL" in pilot.regulatory_requirement or "DGCA" in pilot.regulatory_requirement

    # 3. AI/ML Engineer (Emerging)
    ai_eng = test_db.query(Career).filter(Career.slug == "ai-ml-engineer").first()
    assert ai_eng.is_emerging is True
    assert ai_eng.emergence_source is not None
    assert ai_eng.is_regulated is False


def test_career_skill_requirements_reuse_canonical_skills(test_db: Session):
    """
    CRITICAL ARCHITECTURAL RULE:
    Verifies that CareerSkillRequirement links directly to canonical `skills` table
    with zero duplicate skill records.
    """
    # Check Graphic Designer skills
    designer = test_db.query(Career).filter(Career.slug == "graphic-designer").first()
    assert designer is not None

    reqs = test_db.query(CareerSkillRequirement).filter(CareerSkillRequirement.career_id == designer.id).all()
    assert len(reqs) >= 4, f"Expected >= 4 skills for graphic designer, found {len(reqs)}"

    skill_slugs = [r.skill.slug for r in reqs if r.skill]
    assert "typography" in skill_slugs
    assert "layout-design" in skill_slugs
    assert "color-theory" in skill_slugs

    # Ensure every single skill belongs to the primary `skills` table
    for r in reqs:
        canonical_skill = test_db.query(Skill).filter(Skill.id == r.skill_id).first()
        assert canonical_skill is not None, "CareerSkillRequirement does not point to valid Skill"
        assert r.importance in ["MANDATORY", "RECOMMENDED", "HELPFUL", "OPTIONAL", "BRIDGE"]
        assert r.proficiency_level in ["FOUNDATIONAL", "WORKING", "PROFICIENT", "ADVANCED", "EXPERT"]


def test_career_specializations_and_relationships(test_db: Session):
    """Verifies sub-specializations and inter-career relationships (transition/adjacent)."""
    # 1. Video Editor Specializations
    editor = test_db.query(Career).filter(Career.slug == "video-editor").first()
    assert editor is not None
    specs = test_db.query(CareerSpecialization).filter(CareerSpecialization.career_id == editor.id).all()
    spec_slugs = {s.slug for s in specs}
    assert "film-editor" in spec_slugs
    assert "commercial-editor" in spec_slugs
    assert "youtube-content-editor" in spec_slugs

    # 2. Transition relationships (e.g. Graphic Designer -> UI/UX Designer)
    designer = test_db.query(Career).filter(Career.slug == "graphic-designer").first()
    ui_ux = test_db.query(Career).filter(Career.slug == "ui-ux-designer").first()
    rel = test_db.query(CareerRelationship).filter(
        CareerRelationship.source_career_id == designer.id,
        CareerRelationship.target_career_id == ui_ux.id
    ).first()
    assert rel is not None
    assert rel.relationship_type == "TRANSITION"
    assert "typography" in rel.transferable_skills
    assert "figma-ui" in rel.bridge_skills


def test_backward_compatibility_with_historical_roles(test_db: Session):
    """
    Verifies that legacy get_career_catalog() and resolve_target_skills_for_role()
    continue to work seamlessly and support both historical 7 roles and new 21 roles.
    """
    catalog = get_career_catalog()
    assert len(catalog) >= 7

    # Historical role check
    historical_slugs = [
        "ai-ml-engineer",
        "data-scientist",
        "full-stack-developer",
        "cloud-devops-engineer",
        "cybersecurity-analyst",
        "vlsi-hardware-engineer",
        "software-engineer"
    ]
    catalog_slugs = {r.slug for r in catalog}
    for h_slug in historical_slugs:
        assert h_slug in catalog_slugs

    # Target skill resolution
    ai_skills = resolve_target_skills_for_role("ai-ml-engineer")
    assert ai_skills is not None
    assert "python" in ai_skills
    assert "machine-learning" in ai_skills

    # Graphic designer resolution
    designer_skills = resolve_target_skills_for_role("graphic-designer")
    assert designer_skills is not None
    assert "typography" in designer_skills


def test_api_careers_endpoints():
    """Verifies Phase 11 Stage 1 REST API endpoints."""
    # 1. GET /api/v1/careers/domains
    res_domains = client.get("/api/v1/careers/domains")
    assert res_domains.status_code == 200
    domains = res_domains.json()
    assert len(domains) >= 16
    assert any(d["slug"] == "technology-computing" for d in domains)
    assert any(d["slug"] == "healthcare-medicine" for d in domains)

    # 2. GET /api/v1/careers/families
    res_families = client.get("/api/v1/careers/families?domain=design-creative")
    assert res_families.status_code == 200
    families = res_families.json()
    assert len(families) >= 3
    family_slugs = {f["slug"] for f in families}
    assert "graphic-visual-design" in family_slugs
    assert "ui-ux-product-design" in family_slugs

    # 3. GET /api/v1/careers/catalog
    res_catalog = client.get("/api/v1/careers/catalog")
    assert res_catalog.status_code == 200
    careers = res_catalog.json()
    assert len(careers) >= 20
    assert any(c["slug"] == "doctor" for c in careers)
    assert any(c["slug"] == "video-editor" for c in careers)

    # 4. GET /api/v1/careers/{career_slug}
    res_single = client.get("/api/v1/careers/video-editor")
    assert res_single.status_code == 200
    single = res_single.json()
    assert single["canonical_name"] == "Video Editor"
    assert single["remote_compatibility"] == "HIGH"
    assert len(single["specializations"]) >= 3
    assert len(single["skill_requirements"]) >= 3

    # 5. GET /api/v1/careers/{career_slug}/skills
    res_skills = client.get("/api/v1/careers/video-editor/skills")
    assert res_skills.status_code == 200
    skills = res_skills.json()
    assert any(s["skill_slug"] == "video-editing" for s in skills)

    # 6. GET /api/v1/careers/{career_slug}/requirements
    res_reqs = client.get("/api/v1/careers/doctor/requirements")
    assert res_reqs.status_code == 200
    reqs = res_reqs.json()
    assert reqs["career_slug"] == "doctor"
    assert "anatomy-physiology" in reqs["mandatory_skills"]
