"""
Phase 12 Stage 1 Migration & Seeding Script: Company & Role Intelligence Foundation
Creates companies and company_roles tables and seeds 250+ enterprise companies and verified roles.
"""

import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.company import Company, CompanyRole
from backend.app.models.career import Career
from backend.app.seed.company_seed import get_all_companies

def run_migration():
    print("Starting Phase 12 Stage 1 Migration...")
    
    # 1. Create tables if not exists
    Base.metadata.create_all(bind=engine, tables=[Company.__table__, CompanyRole.__table__])
    print("Created 'companies' and 'company_roles' tables.")

    db = SessionLocal()
    try:
        # Load canonical careers for foreign key mapping
        careers = db.query(Career).all()
        career_map = {c.slug: c.id for c in careers}
        print(f"Loaded {len(career_map)} existing canonical careers for role linkage.")

        all_company_data = get_all_companies()
        print(f"Seeding {len(all_company_data)} enterprise companies...")

        companies_seeded = 0
        companies_updated = 0
        roles_seeded = 0

        for c_data in all_company_data:
            existing_company = db.query(Company).filter(Company.slug == c_data["slug"]).first()
            if not existing_company:
                company = Company(
                    slug=c_data["slug"],
                    canonical_name=c_data["canonical_name"],
                    display_name=c_data["display_name"],
                    aliases=c_data.get("aliases", []),
                    website=c_data.get("website"),
                    careers_url=c_data.get("careers_url"),
                    industry=c_data["industry"],
                    company_type=c_data["company_type"],
                    headquarters_country=c_data.get("headquarters_country", "India"),
                    headquarters_region=c_data.get("headquarters_region"),
                    operating_countries=c_data.get("operating_countries", ["India"]),
                    operating_regions=c_data.get("operating_regions", ["National"]),
                    description=c_data.get("description"),
                    status=c_data.get("status", "ACTIVE"),
                    is_verified=c_data.get("is_verified", True),
                    verification_status=c_data.get("verification_status", "VERIFIED"),
                    source=c_data.get("source", "Corporate Filings & Employer Registry"),
                    version=c_data.get("version", 1),
                )
                db.add(company)
                db.flush()
                companies_seeded += 1
            else:
                company = existing_company
                company.canonical_name = c_data["canonical_name"]
                company.display_name = c_data["display_name"]
                company.aliases = c_data.get("aliases", [])
                company.website = c_data.get("website")
                company.careers_url = c_data.get("careers_url")
                company.industry = c_data["industry"]
                company.company_type = c_data["company_type"]
                company.headquarters_country = c_data.get("headquarters_country", "India")
                company.headquarters_region = c_data.get("headquarters_region")
                company.operating_countries = c_data.get("operating_countries", ["India"])
                company.operating_regions = c_data.get("operating_regions", ["National"])
                company.description = c_data.get("description")
                companies_updated += 1

            # Seed roles if defined
            roles = c_data.get("roles", [])
            for r_data in roles:
                existing_role = db.query(CompanyRole).filter(
                    CompanyRole.company_id == company.id,
                    CompanyRole.role_slug == r_data["role_slug"]
                ).first()

                career_id = career_map.get(r_data.get("career_slug"))

                if not existing_role:
                    role = CompanyRole(
                        company_id=company.id,
                        career_id=career_id,
                        role_slug=r_data["role_slug"],
                        canonical_role_name=r_data["canonical_role_name"],
                        display_name=r_data["display_name"],
                        aliases=r_data.get("aliases", []),
                        description=r_data.get("description"),
                        employment_type=r_data.get("employment_type", "FULL_TIME"),
                        experience_level=r_data.get("experience_level", "ENTRY_LEVEL"),
                        location_scope=r_data.get("location_scope", "National"),
                        remote_type=r_data.get("remote_type", "HYBRID"),
                        status="ACTIVE",
                        dsa_relevance=r_data.get("dsa_relevance", "UNKNOWN"),
                        cs_fundamentals_relevance=r_data.get("cs_fundamentals_relevance", {}),
                        source="Verified Employer Job Specification",
                        verification_status="VERIFIED",
                        version=1,
                    )
                    db.add(role)
                    roles_seeded += 1
                else:
                    existing_role.career_id = career_id
                    existing_role.canonical_role_name = r_data["canonical_role_name"]
                    existing_role.display_name = r_data["display_name"]
                    existing_role.aliases = r_data.get("aliases", [])
                    existing_role.description = r_data.get("description")
                    existing_role.employment_type = r_data.get("employment_type", "FULL_TIME")
                    existing_role.experience_level = r_data.get("experience_level", "ENTRY_LEVEL")
                    existing_role.dsa_relevance = r_data.get("dsa_relevance", "UNKNOWN")
                    existing_role.cs_fundamentals_relevance = r_data.get("cs_fundamentals_relevance", {})

        db.commit()
        print(f"Migration complete: {companies_seeded} companies created, {companies_updated} updated, {roles_seeded} roles seeded.")
        
        # Verify counts in DB
        total_companies = db.query(Company).count()
        total_roles = db.query(CompanyRole).count()
        print(f"Verification - Total Companies in DB: {total_companies}, Total Roles in DB: {total_roles}")

    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
