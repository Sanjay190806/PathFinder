from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class CareerRoleDefinition(BaseModel):
    role: str = Field(..., description="Career role display name")
    slug: str = Field(..., description="Unique URL-friendly slug")
    title: str = Field(..., description="Standard career target title")
    description: str = Field(..., description="Domain summary and objective")
    domain_category: str = Field(..., description="Engineering domain category")
    target_skills: List[str] = Field(..., description="Required competency skill slugs")

# Authoritative Single Source of Truth for Career Domain Roles
CAREER_ROLES_CATALOG: Dict[str, CareerRoleDefinition] = {
    "ai-ml-engineer": CareerRoleDefinition(
        role="AI/ML Engineer",
        slug="ai-ml-engineer",
        title="Become an AI/ML Engineer",
        description="Master machine learning algorithms, deep learning with PyTorch, transformers, LLM agent architectures, vector search, and production MLOps.",
        domain_category="Artificial Intelligence",
        target_skills=["python", "linear-algebra", "machine-learning", "deep-learning", "transformers", "langchain-agents", "vector-rag", "mlops"]
    ),
    "data-scientist": CareerRoleDefinition(
        role="Data Scientist",
        slug="data-scientist",
        title="Become a Data Scientist",
        description="Master SQL analytics, exploratory data analysis, statistical experimentation, predictive modeling, and big data processing with PySpark.",
        domain_category="Data Science",
        target_skills=["python", "pandas", "sql", "eda", "machine-learning", "statistics", "pyspark"]
    ),
    "full-stack-developer": CareerRoleDefinition(
        role="Full Stack Developer",
        slug="full-stack-developer",
        title="Become a Full Stack Developer",
        description="Build scalable modern web applications with TypeScript, React, Next.js, FastAPI, PostgreSQL, GraphQL, WebSockets, and Docker.",
        domain_category="Software Engineering",
        target_skills=["typescript", "react-nextjs", "tailwind", "rest-apis", "graphql-websockets", "docker"]
    ),
    "cloud-devops-engineer": CareerRoleDefinition(
        role="Cloud / DevOps Engineer",
        slug="cloud-devops-engineer",
        title="Become a Cloud / DevOps Engineer",
        description="Master Linux server administration, infrastructure as code, automated CI/CD pipelines, Docker container orchestration, Kubernetes, and AWS architecture.",
        domain_category="DevOps & Cloud",
        target_skills=["linux", "git-cicd", "docker", "kubernetes", "aws"]
    ),
    "cybersecurity-analyst": CareerRoleDefinition(
        role="Cybersecurity Analyst",
        slug="cybersecurity-analyst",
        title="Become a Cybersecurity Analyst",
        description="Master TCP/IP networking, Linux security hardening, applied cryptography, web application vulnerabilities, penetration testing, and ethical exploitation.",
        domain_category="Cybersecurity",
        target_skills=["networking", "linux", "web-security", "cryptography", "pentesting"]
    ),
    "vlsi-hardware-engineer": CareerRoleDefinition(
        role="VLSI Hardware Engineer",
        slug="vlsi-hardware-engineer",
        title="Become a VLSI Hardware Engineer",
        description="Master digital logic design, Verilog/VHDL RTL modeling, CMOS circuit design, ASIC synthesis, and FPGA prototyping.",
        domain_category="Hardware Engineering",
        target_skills=["linear-algebra", "python", "dsa"]
    ),
    "software-engineer": CareerRoleDefinition(
        role="Software Engineer",
        slug="software-engineer",
        title="Become a Software Engineer",
        description="Master fundamental data structures, algorithms, object-oriented design patterns, RESTful microservices, and distributed system architectures.",
        domain_category="Software Engineering",
        target_skills=["python", "dsa", "rest-apis", "system-design", "docker"]
    )
}

def get_career_catalog() -> List[CareerRoleDefinition]:
    """Returns the list of all registered career role definitions."""
    return list(CAREER_ROLES_CATALOG.values())

def resolve_target_skills_for_role(role_name_or_slug: str) -> Optional[List[str]]:
    """
    Resolves target skills for a given career role name or slug.
    Returns None if the role is not registered in the catalog.
    """
    if not role_name_or_slug:
        return None

    cleaned = role_name_or_slug.strip().lower()
    normalized_slug = cleaned.replace(" ", "-").replace("/", "-")

    # 1. Direct match by slug
    if normalized_slug in CAREER_ROLES_CATALOG:
        return list(CAREER_ROLES_CATALOG[normalized_slug].target_skills)

    # 2. Match by display name
    for defn in CAREER_ROLES_CATALOG.values():
        if defn.role.lower() == cleaned or defn.title.lower() == cleaned:
            return list(defn.target_skills)

    return None

def register_custom_career_role(role_def: CareerRoleDefinition) -> None:
    """Allows dynamic or test-time registration of new career domains."""
    CAREER_ROLES_CATALOG[role_def.slug] = role_def

def _populate_expanded_roles() -> None:
    """Populates multi-domain canonical careers into in-memory catalog for backward compatibility."""
    try:
        from backend.app.seed.career_seed import CANONICAL_CAREERS
        for c in CANONICAL_CAREERS:
            slug = c["slug"]
            if slug not in CAREER_ROLES_CATALOG:
                domain_cat = c.get("domain_slug", "General").replace("-", " ").title()
                CAREER_ROLES_CATALOG[slug] = CareerRoleDefinition(
                    role=c["canonical_name"],
                    slug=slug,
                    title=f"Become a {c['canonical_name']}",
                    description=c["short_description"],
                    domain_category=domain_cat,
                    target_skills=list(c.get("mandatory_skills", [])) + list(c.get("recommended_skills", []))
                )
    except Exception:
        pass

_populate_expanded_roles()
