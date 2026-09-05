"""
Phase 12 Stage 2 Migration & Seeding Script: DSA Intelligence & Difficulty-Based Learning System
Creates dsa_domains, dsa_topics, dsa_subtopics, dsa_concepts tables and seeds 28 canonical topics across 5 domains.
"""

import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.dsa import DSADomain, DSATopic, DSASubtopic, DSAConcept
from backend.app.models.skill import Skill
from backend.app.seed.dsa_seed import get_dsa_catalog

def run_migration():
    print("Starting Phase 12 Stage 2 Migration...")

    # Create tables if not exists
    Base.metadata.create_all(
        bind=engine,
        tables=[
            DSADomain.__table__,
            DSATopic.__table__,
            DSASubtopic.__table__,
            DSAConcept.__table__,
        ]
    )
    print("Created DSA tables: dsa_domains, dsa_topics, dsa_subtopics, dsa_concepts.")

    db = SessionLocal()
    try:
        # Load skills for optional linkage
        skills = db.query(Skill).all()
        skill_map = {s.slug.lower(): s.id for s in skills}

        catalog = get_dsa_catalog()
        domains_seeded = 0
        topics_seeded = 0
        subtopics_seeded = 0
        concepts_seeded = 0

        for d_data in catalog:
            domain = db.query(DSADomain).filter(DSADomain.slug == d_data["slug"]).first()
            if not domain:
                domain = DSADomain(
                    slug=d_data["slug"],
                    name=d_data["name"],
                    description=d_data.get("description"),
                    order=d_data.get("order", 0)
                )
                db.add(domain)
                db.flush()
                domains_seeded += 1
            else:
                domain.name = d_data["name"]
                domain.description = d_data.get("description")
                domain.order = d_data.get("order", 0)

            for t_data in d_data.get("topics", []):
                topic = db.query(DSATopic).filter(DSATopic.slug == t_data["slug"]).first()
                # Find matching skill if available
                matching_skill_id = skill_map.get(t_data["slug"]) or skill_map.get(t_data["slug"].replace("-", ""))

                if not topic:
                    topic = DSATopic(
                        domain_id=domain.id,
                        skill_id=matching_skill_id,
                        slug=t_data["slug"],
                        name=t_data["name"],
                        description=t_data.get("description"),
                        order=t_data.get("order", 0),
                        typical_importance=t_data.get("typical_importance", "HIGH"),
                        prerequisite_topic_slugs=t_data.get("prerequisite_topic_slugs", [])
                    )
                    db.add(topic)
                    db.flush()
                    topics_seeded += 1
                else:
                    topic.name = t_data["name"]
                    topic.description = t_data.get("description")
                    topic.order = t_data.get("order", 0)
                    topic.typical_importance = t_data.get("typical_importance", "HIGH")
                    topic.prerequisite_topic_slugs = t_data.get("prerequisite_topic_slugs", [])
                    if matching_skill_id:
                        topic.skill_id = matching_skill_id

                for s_data in t_data.get("subtopics", []):
                    subtopic = db.query(DSASubtopic).filter(
                        DSASubtopic.topic_id == topic.id,
                        DSASubtopic.slug == s_data["slug"]
                    ).first()

                    if not subtopic:
                        subtopic = DSASubtopic(
                            topic_id=topic.id,
                            slug=s_data["slug"],
                            name=s_data["name"],
                            description=s_data.get("description"),
                            order=s_data.get("order", 0)
                        )
                        db.add(subtopic)
                        db.flush()
                        subtopics_seeded += 1
                    else:
                        subtopic.name = s_data["name"]
                        subtopic.description = s_data.get("description")
                        subtopic.order = s_data.get("order", 0)

                    for c_data in s_data.get("concepts", []):
                        concept = db.query(DSAConcept).filter(
                            DSAConcept.subtopic_id == subtopic.id,
                            DSAConcept.slug == c_data["slug"]
                        ).first()

                        if not concept:
                            concept = DSAConcept(
                                subtopic_id=subtopic.id,
                                slug=c_data["slug"],
                                name=c_data["name"],
                                description=c_data.get("description"),
                                difficulty=c_data.get("difficulty", "MEDIUM"),
                                learning_objectives=c_data.get("learning_objectives", []),
                                common_patterns=c_data.get("common_patterns", []),
                                common_mistakes=c_data.get("common_mistakes", []),
                                practice_resources=c_data.get("practice_resources", [])
                            )
                            db.add(concept)
                            concepts_seeded += 1
                        else:
                            concept.name = c_data["name"]
                            concept.description = c_data.get("description")
                            concept.difficulty = c_data.get("difficulty", "MEDIUM")
                            concept.learning_objectives = c_data.get("learning_objectives", [])
                            concept.common_patterns = c_data.get("common_patterns", [])
                            concept.common_mistakes = c_data.get("common_mistakes", [])
                            concept.practice_resources = c_data.get("practice_resources", [])

        db.commit()
        print(f"Migration complete: {domains_seeded} domains, {topics_seeded} topics, {subtopics_seeded} subtopics, {concepts_seeded} concepts seeded.")

        # Verification query
        total_domains = db.query(DSADomain).count()
        total_topics = db.query(DSATopic).count()
        total_concepts = db.query(DSAConcept).count()
        print(f"Verification - Total in DB: {total_domains} Domains, {total_topics} Topics, {total_concepts} Concepts.")

    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
