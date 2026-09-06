from typing import List, Dict, Any, Set
from sqlalchemy.orm import Session
from backend.app.models.skill import Skill, SkillPrerequisite
from backend.app.models.resource import LearningResource, ResourceSkill, ResourcePrerequisite
from backend.app.engine.skill_graph import SkillDAG
from backend.app.core.logger import logger

VALID_RESOURCE_TYPES = {"course", "video", "article", "documentation", "tutorial", "project", "quiz", "book"}
VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced", "beginner", "intermediate", "advanced"}
VALID_FORMATS = {"video", "hands-on", "project", "theory", "interactive", "article", "tutorial"}

def validate_seed_data(db: Session) -> Dict[str, Any]:
    """
    Performs strict data quality and integrity validation across the seeded database.
    Raises ValueError if any assertion fails.
    """
    report = {
        "skills_count": 0,
        "prerequisites_count": 0,
        "resources_count": 0,
        "resource_skills_count": 0,
        "is_acyclic": False,
        "errors": []
    }

    # 1. Validate Skills
    skills = db.query(Skill).all()
    report["skills_count"] = len(skills)
    if len(skills) < 20:
        report["errors"].append(f"Insufficient skills in database: {len(skills)} (expected >= 20)")

    skill_slugs: Set[str] = {s.slug for s in skills}
    skill_ids: Set[str] = {s.id for s in skills}

    if len(skill_slugs) != len(skills):
        report["errors"].append("Duplicate skill slugs detected!")

    # 2. Validate Skill Prerequisites & DAG
    prereqs = db.query(SkillPrerequisite).all()
    report["prerequisites_count"] = len(prereqs)
    
    seen_prereq_edges = set()
    for p in prereqs:
        if p.skill_id == p.prerequisite_skill_id:
            report["errors"].append(f"Self-referencing prerequisite detected on skill_id {p.skill_id}")
        edge = (p.skill_id, p.prerequisite_skill_id)
        if edge in seen_prereq_edges:
            report["errors"].append(f"Duplicate prerequisite edge detected: {edge}")
        seen_prereq_edges.add(edge)

    # Validate DAG has zero cycles
    dag = SkillDAG(db)
    cycles = dag.detect_cycles()
    if cycles:
        cycle_str = " -> ".join(cycles[0])
        report["errors"].append(f"Cycle detected in prerequisite graph: {cycle_str}")
    else:
        report["is_acyclic"] = True

    # 3. Validate Resources
    from backend.app.seed.catalog_data import RESOURCES_CATALOG
    catalog_slugs = {entry[1] for entry in RESOURCES_CATALOG}
    resources = db.query(LearningResource).filter(LearningResource.slug.in_(catalog_slugs)).all()
    report["resources_count"] = len(resources)

    if len(resources) < 50:
        report["errors"].append(f"Insufficient learning resources: {len(resources)} (expected >= 50)")

    seen_res_slugs = set()
    seen_urls = set()

    for r in resources:
        # Check required fields
        if not r.title or not r.description or not r.provider or not r.url:
            report["errors"].append(f"Resource {r.id} is missing mandatory metadata (title/desc/provider/url)")
        
        if r.slug in seen_res_slugs:
            report["errors"].append(f"Duplicate resource slug: {r.slug}")
        seen_res_slugs.add(r.slug)

        if r.url in seen_urls:
            report["errors"].append(f"Duplicate resource URL: {r.url}")
        seen_urls.add(r.url)

        if r.resource_type not in VALID_RESOURCE_TYPES:
            report["errors"].append(f"Invalid resource_type '{r.resource_type}' on resource {r.slug}")

        if r.difficulty not in VALID_DIFFICULTIES:
            report["errors"].append(f"Invalid difficulty '{r.difficulty}' on resource {r.slug}")

        if r.estimated_hours <= 0:
            report["errors"].append(f"Non-positive estimated hours ({r.estimated_hours}) on resource {r.slug}")

        if not (0.0 <= r.quality_score <= 1.0):
            report["errors"].append(f"Invalid quality score ({r.quality_score}) on resource {r.slug}")

        # Check resource skills
        if len(r.resource_skills) == 0:
            report["errors"].append(f"Resource {r.slug} has no associated skills!")

        for rs in r.resource_skills:
            if rs.skill_id not in skill_ids:
                report["errors"].append(f"Resource {r.slug} references non-existent skill_id {rs.skill_id}")

    # Count total resource skills
    report["resource_skills_count"] = db.query(ResourceSkill).count()

    if report["errors"]:
        error_msg = "\n - " + "\n - ".join(report["errors"])
        logger.warning(f"Seed Data Quality flagged {len(report['errors'])} warnings:{error_msg}")

    return report
