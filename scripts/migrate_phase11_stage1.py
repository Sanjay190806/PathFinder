"""
Phase 11 Stage 1 Database Migration & Seed Loader
Creates tables and seeds canonical domains, families, careers, specializations,
skill requirements, education requirements, and relationships.
"""

import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.database import engine, SessionLocal, Base
from backend.app.models.skill import Skill
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
from backend.app.seed.career_seed import (
    CAREER_DOMAINS,
    CAREER_FAMILIES,
    ADDITIONAL_SKILLS_FOR_CAREERS,
    CANONICAL_CAREERS,
    CAREER_RELATIONSHIPS
)


def run_phase11_stage1_migration():
    print("=" * 60)
    print("PHASE 11 STAGE 1: CAREER TAXONOMY MIGRATION & SEEDING")
    print("=" * 60)

    # 1. Create tables
    print("[1/6] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db: Session = SessionLocal()
    try:
        # 2. Seed additional canonical skills
        print("[2/6] Ensuring canonical skills exist in `skills` table...")
        for name, slug, cat, desc, diff in ADDITIONAL_SKILLS_FOR_CAREERS:
            existing = db.query(Skill).filter(Skill.slug == slug).first()
            if not existing:
                s = Skill(
                    name=name,
                    slug=slug,
                    category=cat,
                    description=desc,
                    difficulty_tier=diff
                )
                db.add(s)
        db.commit()
        all_skills = {s.slug: s for s in db.query(Skill).all()}
        print(f"Total canonical skills available: {len(all_skills)}")

        # 3. Seed Domains
        print("[3/6] Seeding Career Domains...")
        domain_map = {}
        for d_data in CAREER_DOMAINS:
            domain = db.query(CareerDomain).filter(CareerDomain.slug == d_data["slug"]).first()
            if not domain:
                domain = CareerDomain(
                    slug=d_data["slug"],
                    name=d_data["name"],
                    description=d_data.get("description"),
                    order=d_data.get("order", 0),
                    icon=d_data.get("icon")
                )
                db.add(domain)
                db.flush()
            domain_map[domain.slug] = domain
        db.commit()
        print(f"Seeded/verified {len(domain_map)} career domains.")

        # 4. Seed Families
        print("[4/6] Seeding Career Families...")
        family_map = {}
        for f_data in CAREER_FAMILIES:
            domain = domain_map.get(f_data["domain_slug"])
            if not domain:
                continue
            family = db.query(CareerFamily).filter(CareerFamily.slug == f_data["slug"]).first()
            if not family:
                family = CareerFamily(
                    domain_id=domain.id,
                    slug=f_data["slug"],
                    name=f_data["name"],
                    order=f_data.get("order", 0)
                )
                db.add(family)
                db.flush()
            family_map[family.slug] = family
        db.commit()
        print(f"Seeded/verified {len(family_map)} career families.")

        # 5. Seed Careers & Associated Entities
        print("[5/6] Seeding Canonical Careers & Requirements...")
        career_map = {}
        for c_data in CANONICAL_CAREERS:
            slug = c_data["slug"]
            career = db.query(Career).filter(Career.slug == slug).first()
            domain = domain_map.get(c_data["domain_slug"])
            family = family_map.get(c_data["family_slug"])

            if not career:
                career = Career(
                    slug=slug,
                    canonical_name=c_data["canonical_name"],
                    display_name=c_data["display_name"],
                    short_description=c_data["short_description"],
                    long_description=c_data.get("long_description"),
                    career_domain_id=domain.id if domain else None,
                    career_family_id=family.id if family else None,
                    specialization=c_data.get("specialization"),
                    aliases=c_data.get("aliases", []),
                    keywords=c_data.get("keywords", []),
                    status="ACTIVE",
                    is_active=True,
                    is_emerging=c_data.get("is_emerging", False),
                    emergence_source=c_data.get("emergence_source"),
                    is_regulated=c_data.get("is_regulated", False),
                    regulation_country=c_data.get("regulation_country"),
                    regulatory_requirement=c_data.get("regulatory_requirement"),
                    qualification_requirement=c_data.get("qualification_requirement"),
                    country_scope=c_data.get("country_scope", "GLOBAL"),
                    work_environment=c_data.get("work_environment"),
                    remote_compatibility=c_data.get("remote_compatibility", "MEDIUM"),
                    typical_tasks=c_data.get("typical_tasks", []),
                    tools=c_data.get("tools", []),
                    portfolio_expectations=c_data.get("portfolio_expectations"),
                    experience_levels=c_data.get("experience_levels", ["Entry", "Mid", "Senior"]),
                    version=1
                )
                db.add(career)
                db.flush()
            else:
                # Update core fields if existing
                career.career_domain_id = domain.id if domain else career.career_domain_id
                career.career_family_id = family.id if family else career.career_family_id
                career.aliases = c_data.get("aliases", career.aliases)
                career.keywords = c_data.get("keywords", career.keywords)
                career.is_regulated = c_data.get("is_regulated", career.is_regulated)
                career.regulatory_requirement = c_data.get("regulatory_requirement", career.regulatory_requirement)
                career.qualification_requirement = c_data.get("qualification_requirement", career.qualification_requirement)
                career.tools = c_data.get("tools", career.tools)
                career.typical_tasks = c_data.get("typical_tasks", career.typical_tasks)
                career.work_environment = c_data.get("work_environment", career.work_environment)
                career.remote_compatibility = c_data.get("remote_compatibility", career.remote_compatibility)
                career.portfolio_expectations = c_data.get("portfolio_expectations", career.portfolio_expectations)
                db.flush()

            career_map[slug] = career

            # Seed Specializations
            for spec_data in c_data.get("specializations", []):
                spec = db.query(CareerSpecialization).filter(
                    CareerSpecialization.career_id == career.id,
                    CareerSpecialization.slug == spec_data["slug"]
                ).first()
                if not spec:
                    db.add(CareerSpecialization(
                        career_id=career.id,
                        slug=spec_data["slug"],
                        name=spec_data["name"],
                        focus_areas=spec_data.get("focus_areas", [])
                    ))

            # Seed Skill Requirements (MANDATORY)
            for s_slug in c_data.get("mandatory_skills", []):
                skill_obj = all_skills.get(s_slug)
                if skill_obj:
                    req = db.query(CareerSkillRequirement).filter(
                        CareerSkillRequirement.career_id == career.id,
                        CareerSkillRequirement.skill_id == skill_obj.id
                    ).first()
                    if not req:
                        db.add(CareerSkillRequirement(
                            career_id=career.id,
                            skill_id=skill_obj.id,
                            importance="MANDATORY",
                            proficiency_level="PROFICIENT"
                        ))

            # Seed Skill Requirements (RECOMMENDED)
            for s_slug in c_data.get("recommended_skills", []):
                skill_obj = all_skills.get(s_slug)
                if skill_obj:
                    req = db.query(CareerSkillRequirement).filter(
                        CareerSkillRequirement.career_id == career.id,
                        CareerSkillRequirement.skill_id == skill_obj.id
                    ).first()
                    if not req:
                        db.add(CareerSkillRequirement(
                            career_id=career.id,
                            skill_id=skill_obj.id,
                            importance="RECOMMENDED",
                            proficiency_level="WORKING"
                        ))

            # Seed Education Requirements
            for edu_req in c_data.get("education_requirements", []):
                existing_edu = db.query(CareerEducationRequirement).filter(
                    CareerEducationRequirement.career_id == career.id,
                    CareerEducationRequirement.education_level == edu_req["education_level"]
                ).first()
                if not existing_edu:
                    db.add(CareerEducationRequirement(
                        career_id=career.id,
                        education_level=edu_req["education_level"],
                        preferred_streams=edu_req.get("preferred_streams", []),
                        subject_prerequisites=edu_req.get("subject_prerequisites", []),
                        requirement_type=edu_req.get("requirement_type", "RECOMMENDED"),
                        notes=edu_req.get("notes")
                    ))

            # Seed Regional Metadata
            for reg in c_data.get("regional_metadata", []):
                existing_reg = db.query(CareerRegionalMetadata).filter(
                    CareerRegionalMetadata.career_id == career.id,
                    CareerRegionalMetadata.country_code == reg["country_code"]
                ).first()
                if not existing_reg:
                    db.add(CareerRegionalMetadata(
                        career_id=career.id,
                        country_code=reg["country_code"],
                        regulatory_body=reg.get("regulatory_body"),
                        statutory_exam=reg.get("statutory_exam"),
                        notes=reg.get("notes")
                    ))

        db.commit()
        print(f"Seeded/verified {len(career_map)} canonical careers with sub-entities.")

        # 6. Seed Career Relationships
        print("[6/6] Seeding Career Relationships & Transition Graph...")
        rel_count = 0
        for r_data in CAREER_RELATIONSHIPS:
            source = career_map.get(r_data["source"])
            target = career_map.get(r_data["target"])
            if source and target:
                existing_rel = db.query(CareerRelationship).filter(
                    CareerRelationship.source_career_id == source.id,
                    CareerRelationship.target_career_id == target.id,
                    CareerRelationship.relationship_type == r_data["relationship_type"]
                ).first()
                if not existing_rel:
                    db.add(CareerRelationship(
                        source_career_id=source.id,
                        target_career_id=target.id,
                        relationship_type=r_data["relationship_type"],
                        notes=r_data.get("notes"),
                        transferable_skills=r_data.get("transferable_skills", []),
                        bridge_skills=r_data.get("bridge_skills", [])
                    ))
                    rel_count += 1
        db.commit()
        print(f"Seeded {rel_count} career relationship links.")

        print("=" * 60)
        print("MIGRATION COMPLETED SUCCESSFULLY.")
        print(f"Active Domains: {db.query(CareerDomain).count()}")
        print(f"Active Families: {db.query(CareerFamily).count()}")
        print(f"Active Careers: {db.query(Career).count()}")
        print(f"Career Specializations: {db.query(CareerSpecialization).count()}")
        print(f"Skill Requirements: {db.query(CareerSkillRequirement).count()}")
        print(f"Education Requirements: {db.query(CareerEducationRequirement).count()}")
        print(f"Relationships: {db.query(CareerRelationship).count()}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_phase11_stage1_migration()
