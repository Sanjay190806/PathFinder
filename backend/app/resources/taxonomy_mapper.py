"""
Canonical Taxonomy & Alias Mapping Engine:
Maps external competency concepts (especially iGOT Karmayogi behavioral, functional, and domain competencies)
into PathFinder's canonical skills and career domains without duplicate skill proliferation.
"""

from typing import Dict, List, Set, Optional

# Mapping of iGOT Competencies & Topics to Canonical PathFinder Skill Slugs
IGOT_COMPETENCY_TO_CANONICAL_SKILLS: Dict[str, List[str]] = {
    # Data & Analytics
    "data driven decision making": ["data-analysis", "decision-making", "data-literacy", "data-interpretation"],
    "data analysis": ["data-analysis", "statistics"],
    "data literacy": ["data-literacy", "data-analysis"],
    "microsoft excel": ["excel", "data-analysis", "spreadsheet-modeling"],
    "excel fundamentals": ["excel", "data-analysis"],
    "business analytics": ["business-intelligence", "data-analysis"],

    # AI & Modern Technology
    "ai using google bard and chatgpt": ["generative-ai", "prompt-engineering", "llms", "ai-tools"],
    "artificial intelligence for beginners": ["ai-fundamentals", "machine-learning"],
    "digital safety essentials": ["cybersecurity", "information-security", "digital-safety"],
    "cyber security": ["cybersecurity", "network-security"],
    "digital governance": ["e-governance", "digital-governance", "public-administration"],
    "e-governance and digital transformation": ["e-governance", "digital-transformation", "public-administration"],
    "cloud computing basics": ["cloud-computing", "aws", "azure"],

    # Public Sector, Governance & Law
    "fundamentals of public policy": ["public-policy", "policy-analysis", "governance"],
    "public policy formulation & analysis": ["public-policy", "policy-analysis", "governance"],
    "public policy analysis": ["public-policy", "policy-analysis", "governance"],
    "citizen centricity": ["citizen-centricity", "service-delivery", "public-administration"],
    "citizen-centric service delivery": ["citizen-centricity", "service-delivery"],
    "public procurement & gem": ["government-procurement", "supply-chain", "public-finance"],
    "data-driven governance": ["data-analysis", "digital-governance", "public-administration"],
    "public policy writing": ["public-policy", "technical-writing", "policy-analysis"],
    "public governance models": ["governance", "public-administration"],
    "basics of administrative law": ["administrative-law", "legal-compliance", "public-administration"],
    "public financial management & procurement": ["public-finance", "government-procurement", "accounting"],
    "government procurement": ["government-procurement", "supply-chain"],
    "disaster management and emergency response": ["disaster-management", "crisis-management", "risk-assessment"],
    "ethics and integrity in governance": ["public-ethics", "governance", "integrity"],

    # Management, Strategy & Operations
    "introduction to basics of project management": ["project-management", "agile", "operations"],
    "project management": ["project-management", "operations"],
    "six sigma fundamentals": ["process-optimization", "quality-management", "statistics"],
    "design thinking": ["design-thinking", "problem-solving", "user-research"],
    "strategic thinking": ["leadership", "decision-making", "problem-solving"],
    "communication skills for civil servants": ["communication", "technical-writing", "interpersonal-skills"],
}

# Domain mapping from iGOT context to PathFinder career domains
IGOT_TOPIC_TO_CAREER_DOMAINS: Dict[str, List[str]] = {
    "data driven decision making": ["data-analytics", "data-science", "public-sector", "business"],
    "fundamentals of public policy": ["public-sector", "law-social-science"],
    "basics of administrative law": ["public-sector", "law-social-science"],
    "public governance models": ["public-sector", "business"],
    "ai using google bard and chatgpt": ["ai-ml", "technology", "public-sector"],
    "digital safety essentials": ["cybersecurity", "technology", "public-sector"],
    "project management": ["business", "technology", "public-sector"],
    "six sigma fundamentals": ["business", "operations", "engineering"],
    "design thinking": ["design", "technology", "business"],
    "e-governance": ["public-sector", "technology", "cybersecurity"],
    "disaster management": ["public-sector", "infrastructure", "environment"],
    "public finance": ["public-sector", "finance-business"]
}


class TaxonomyMapper:
    """Provides canonical alias normalization and multi-domain mapping."""

    @staticmethod
    def map_competency_to_skills(competency: str) -> List[str]:
        """Normalizes a raw competency title to canonical PathFinder skill slugs."""
        if not competency:
            return []
        cleaned = competency.lower().strip()
        # Direct lookup
        if cleaned in IGOT_COMPETENCY_TO_CANONICAL_SKILLS:
            return IGOT_COMPETENCY_TO_CANONICAL_SKILLS[cleaned]
        # Substring / token matching
        for key, skills in IGOT_COMPETENCY_TO_CANONICAL_SKILLS.items():
            if key in cleaned or cleaned in key:
                return skills
        # Fallback to normalized slug
        return [cleaned.replace(" ", "-").replace("/", "-")]

    @staticmethod
    def map_competencies_to_skills(competencies: List[str]) -> List[str]:
        """Batch maps a list of competencies into unique canonical skill slugs."""
        res: List[str] = []
        for c in competencies:
            res.extend(TaxonomyMapper.map_competency_to_skills(c))
        return list(dict.fromkeys(res))

    @staticmethod
    def map_topic_to_careers(topic: str) -> List[str]:
        """Maps topic to relevant career domain slugs."""
        if not topic:
            return []
        cleaned = topic.lower().strip()
        for key, domains in IGOT_TOPIC_TO_CAREER_DOMAINS.items():
            if key in cleaned or cleaned in key:
                return domains
        return []
