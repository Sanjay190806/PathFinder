"""
Phase 11 Stage 10 Database Migration & Seed Script
Creates career_translations table and adds fallback_language to learner_profiles.
Seeds canonical multilingual translations for PathFinder careers across 12 languages.
"""

import sys
import os

# Ensure backend path is discoverable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.career import Career, CareerTranslation
from backend.app.models.profile import LearnerProfile
from backend.app.seed.career_translations_seed import (
    CAREER_TRANSLATIONS_SEED,
    SUPPORTED_LANGUAGES_REGISTRY
)


def run_migration():
    print("Beginning Phase 11 Stage 10 Multilingual Migration...")

    # 1. Create table career_translations if not exists
    Base.metadata.create_all(bind=engine)
    print("Ensured all database tables exist.")

    # 2. Check for fallback_language in learner_profiles
    db = SessionLocal()
    try:
        # Check columns of learner_profiles
        with engine.connect() as conn:
            try:
                res = conn.execute(text("PRAGMA table_info(learner_profiles)")).fetchall()
                col_names = [row[1] for row in res]
                if "fallback_language" not in col_names:
                    print("Adding 'fallback_language' column to learner_profiles table...")
                    conn.execute(text("ALTER TABLE learner_profiles ADD COLUMN fallback_language VARCHAR(50) DEFAULT 'English'"))
                    conn.commit()
                    print("Column 'fallback_language' added successfully.")
                else:
                    print("Column 'fallback_language' already exists in learner_profiles.")
            except Exception as e:
                print(f"Note during column inspection: {e}")

        # 3. Seed Translations
        print("Seeding canonical multilingual translations...")
        seeded_count = 0
        careers = db.query(Career).all()
        career_map = {c.slug: c for c in careers}

        for slug, lang_dict in CAREER_TRANSLATIONS_SEED.items():
            career = career_map.get(slug)
            if not career:
                continue

            for lang_code, data in lang_dict.items():
                existing = db.query(CareerTranslation).filter(
                    CareerTranslation.career_id == career.id,
                    CareerTranslation.language_code == lang_code
                ).first()

                if not existing:
                    trans = CareerTranslation(
                        career_id=career.id,
                        career_slug=career.slug,
                        language_code=lang_code,
                        title=data.get("title", career.display_name),
                        description=data.get("description", career.short_description),
                        family_name=data.get("family_name", career.family.name if career.family else None),
                        domain_name=data.get("domain_name", career.domain.name if career.domain else None),
                        specialization_names=[s.name for s in career.specializations],
                        search_terms=data.get("search_terms", []),
                        requirement_notes=data.get("requirement_notes", {}),
                        pathway_notes=data.get("pathway_notes", {})
                    )
                    db.add(trans)
                    seeded_count += 1
                else:
                    # Update fields
                    existing.title = data.get("title", existing.title)
                    existing.description = data.get("description", existing.description)
                    existing.family_name = data.get("family_name", existing.family_name)
                    existing.domain_name = data.get("domain_name", existing.domain_name)
                    existing.search_terms = data.get("search_terms", existing.search_terms)
                    existing.requirement_notes = data.get("requirement_notes", existing.requirement_notes)
                    existing.pathway_notes = data.get("pathway_notes", existing.pathway_notes)

        db.commit()
        print(f"Migration completed successfully. Seeded/verified {seeded_count} career translations across 12 languages.")

    except Exception as e:
        db.rollback()
        print(f"Migration failed with error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
