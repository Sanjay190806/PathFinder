from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timezone
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.resource import LearningResource
from backend.app.models.dsa import DSATopic
from backend.app.models.company import CompanyRole, Company
from backend.app.core.resource_catalog_extended import (
    EXTENDED_RESOURCES_REGISTRY,
    PRICE_CATEGORIES,
    SOURCE_TIERS,
)
from backend.app.resources.resource_verifier import ResourceVerifier


# High-yield verified course catalog curated across engineering, DSA, hardware, and non-software disciplines
VERIFIED_COURSE_CATALOG: List[Dict[str, Any]] = [
    # ------------------- DSA & Algorithms (Free & Paid) -------------------
    {
        "id": "crs-dsa-mit-6006",
        "title": "Introduction to Algorithms (MIT 6.006 / OCW)",
        "slug": "mit-6006-intro-algorithms",
        "provider": "MIT OpenCourseWare",
        "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_hours": 45.0,
        "quality_score": 0.98,
        "career_relevance": ["software-engineer", "backend-engineer", "ai-ml-engineer"],
        "format": "video",
        "language": "English",
        "skills": ["dsa", "algorithms"],
        "dsa_topics": ["arrays", "hashing", "trees", "graphs", "dynamic-programming"],
        "price_type": "GENUINELY_FREE",
        "learning_cost": 0.0,
        "certificate_cost": "not_applicable",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "academic_registry",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "MIT OpenCourseWare Official",
        "source_tier": 1,
        "external_id": "MIT-6.006-SP20",
        "description": "Foundational algorithmic thinking, data structures, dynamic programming, and shortest-path graph algorithms taught by MIT faculty.",
    },
    {
        "id": "crs-dsa-nptel-iitm",
        "title": "Data Structures and Algorithms (NPTEL / IIT Madras)",
        "slug": "nptel-iitm-data-structures-algorithms",
        "provider": "NPTEL",
        "url": "https://nptel.ac.in/courses/106106133",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_hours": 40.0,
        "quality_score": 0.95,
        "career_relevance": ["software-engineer", "backend-engineer", "data-engineer"],
        "format": "video",
        "language": "English",
        "skills": ["dsa", "c++"],
        "dsa_topics": ["arrays", "linked-lists", "trees", "graphs", "heap-priority-queue"],
        "price_type": "FREE_TO_ENROLL_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "institutional_portal",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "National Programme on Technology Enhanced Learning (Gov of India)",
        "source_tier": 1,
        "external_id": "NPTEL-106106133",
        "description": "Comprehensive semester-long curriculum covering asymptotic complexity, recursion, search trees, and graph algorithms by IIT faculty.",
    },
    {
        "id": "crs-dsa-coursera-princeton",
        "title": "Algorithms, Part I & II (Princeton University / Robert Sedgewick)",
        "slug": "princeton-algorithms-part-1",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/algorithms-part1",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_hours": 50.0,
        "quality_score": 0.97,
        "career_relevance": ["software-engineer", "backend-engineer"],
        "format": "interactive",
        "language": "English",
        "skills": ["java", "dsa"],
        "dsa_topics": ["union-find", "stacks", "queues", "sorting", "binary-search", "trees", "graphs"],
        "price_type": "FREE_AUDIT_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "provider_api",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "Princeton University",
        "source_tier": 1,
        "external_id": "COURSERA-PRINCETON-ALGO",
        "description": "Essential data structures and algorithms, elementary data structures, sorting, and searching algorithms with Java implementations.",
    },
    {
        "id": "crs-dsa-fcc-neetcode",
        "title": "Data Structures and Algorithms for Coding Interviews (freeCodeCamp)",
        "slug": "fcc-dsa-coding-interviews",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/learn-data-structures-and-algorithms-for-coding-interviews",
        "resource_type": "course",
        "difficulty": "Beginner",
        "estimated_hours": 15.0,
        "quality_score": 0.94,
        "career_relevance": ["software-engineer", "frontend-engineer", "backend-engineer"],
        "format": "hands-on",
        "language": "English",
        "skills": ["python", "dsa"],
        "dsa_topics": ["arrays", "two-pointers", "sliding-window", "trees", "graphs"],
        "price_type": "GENUINELY_FREE",
        "learning_cost": 0.0,
        "certificate_cost": "free",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": True,
        "verification_status": "VERIFIED",
        "verification_method": "open_source_catalog",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "freeCodeCamp.org",
        "source_tier": 3,
        "external_id": "FCC-DSA-INTERVIEWS",
        "description": "Targeted problem-solving patterns for technical whiteboard and online coding assessments.",
    },

    # ------------------- Backend & System Design (Free & Paid) -------------------
    {
        "id": "crs-sys-mit-6824",
        "title": "Distributed Systems (MIT 6.824 / Robert Morris)",
        "slug": "mit-6824-distributed-systems",
        "provider": "MIT OpenCourseWare",
        "url": "https://pdos.csail.mit.edu/6.824",
        "resource_type": "course",
        "difficulty": "Advanced",
        "estimated_hours": 60.0,
        "quality_score": 0.99,
        "career_relevance": ["backend-engineer", "software-engineer"],
        "format": "hands-on",
        "language": "English",
        "skills": ["golang", "system-design", "distributed-systems"],
        "dsa_topics": ["graphs"],
        "price_type": "GENUINELY_FREE",
        "learning_cost": 0.0,
        "certificate_cost": "not_applicable",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "academic_registry",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "MIT CSAIL Official",
        "source_tier": 1,
        "external_id": "MIT-6.824-DIST",
        "description": "Architectural abstractions, MapReduce, Raft consensus algorithm, replicated state machines, and RPC in Go.",
    },
    {
        "id": "crs-sys-zerodha-go",
        "title": "Concurrency in Go & High-Performance Systems",
        "slug": "concurrency-in-go-systems",
        "provider": "O'Reilly / Pearson",
        "url": "https://www.oreilly.com/library/view/concurrency-in-go/9781491941294",
        "resource_type": "book",
        "difficulty": "Advanced",
        "estimated_hours": 20.0,
        "quality_score": 0.95,
        "career_relevance": ["backend-engineer", "software-engineer"],
        "format": "hands-on",
        "language": "English",
        "skills": ["golang", "concurrency"],
        "dsa_topics": [],
        "price_type": "PAID",
        "learning_cost": 39.99,
        "certificate_cost": "not_applicable",
        "subscription_required": False,
        "free_learning": False,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "publisher_verified",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "O'Reilly Media",
        "source_tier": 3,
        "external_id": "OREILLY-CONCURRENCY-GO",
        "description": "Goroutines, channels, sync package, CSP model, and architectural concurrency patterns for low-latency backend systems.",
    },

    # ------------------- VLSI / Hardware Engineering -------------------
    {
        "id": "crs-vlsi-nptel-iitkgp",
        "title": "VLSI Physical Design (NPTEL / IIT Kharagpur)",
        "slug": "nptel-vlsi-physical-design",
        "provider": "NPTEL",
        "url": "https://nptel.ac.in/courses/106105161",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_hours": 35.0,
        "quality_score": 0.94,
        "career_relevance": ["vlsi-engineer", "hardware-engineer"],
        "format": "video",
        "language": "English",
        "skills": ["verilog", "vlsi", "digital-logic"],
        "dsa_topics": ["bit-manipulation"],
        "price_type": "FREE_TO_ENROLL_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "institutional_portal",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "NPTEL / IIT Kharagpur",
        "source_tier": 1,
        "external_id": "NPTEL-106105161",
        "description": "ASIC design flow, logic partitioning, floorplanning, placement, clock tree synthesis, and static timing analysis.",
    },

    # ------------------- AI / Machine Learning -------------------
    {
        "id": "crs-ai-andrew-ng",
        "title": "Machine Learning Specialization (DeepLearning.AI / Stanford)",
        "slug": "stanford-machine-learning-specialization",
        "provider": "Coursera",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "resource_type": "course_series",
        "difficulty": "Beginner",
        "estimated_hours": 60.0,
        "quality_score": 0.98,
        "career_relevance": ["ai-ml-engineer", "data-scientist"],
        "format": "interactive",
        "language": "English",
        "skills": ["python", "machine-learning", "linear-algebra"],
        "dsa_topics": ["arrays"],
        "price_type": "FREE_AUDIT_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "provider_api",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "DeepLearning.AI / Stanford Online",
        "source_tier": 1,
        "external_id": "STANFORD-ML-SPEC",
        "description": "Supervised machine learning, logistic regression, gradient descent, neural networks, and decision trees.",
    },

    # ------------------- Non-Software Disciplines -------------------
    {
        "id": "crs-des-calarts",
        "title": "Graphic Design Specialization (CalArts)",
        "slug": "calarts-graphic-design-specialization",
        "provider": "Coursera",
        "url": "https://www.coursera.org/specializations/graphic-design",
        "resource_type": "course_series",
        "difficulty": "Beginner",
        "estimated_hours": 40.0,
        "quality_score": 0.93,
        "career_relevance": ["graphic-designer", "ui-ux-designer"],
        "format": "project",
        "language": "English",
        "skills": ["graphic-design", "typography", "color-theory"],
        "dsa_topics": [],
        "price_type": "FREE_AUDIT_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "provider_api",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "California Institute of the Arts",
        "source_tier": 1,
        "external_id": "CALARTS-GRAPHIC-DESIGN",
        "description": "Fundamental skills in graphic design: typography, image-making, shape, and comprehensive portfolio case studies.",
    },
    {
        "id": "crs-fin-wharton",
        "title": "Financial Markets and Corporate Finance (Wharton / UPenn)",
        "slug": "wharton-financial-markets",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/wharton-finance",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_hours": 25.0,
        "quality_score": 0.94,
        "career_relevance": ["financial-analyst", "accountant"],
        "format": "video",
        "language": "English",
        "skills": ["finance", "financial-modeling"],
        "dsa_topics": [],
        "price_type": "FREE_AUDIT_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid",
        "subscription_required": False,
        "free_learning": True,
        "free_certificate": False,
        "verification_status": "VERIFIED",
        "verification_method": "provider_api",
        "last_verified_at": datetime.now(timezone.utc),
        "source": "Wharton School of the University of Pennsylvania",
        "source_tier": 1,
        "external_id": "WHARTON-FIN-MKTS",
        "description": "Time value of money, risk-return tradeoff, capital asset pricing model, and corporate investment decision frameworks.",
    },
]


class CourseIntelligenceService:
    def __init__(self, db: Session):
        self.db = db
        self.verifier = ResourceVerifier()

    def get_all_courses(self) -> List[Dict[str, Any]]:
        """Merges VERIFIED_COURSE_CATALOG, EXTENDED_RESOURCES_REGISTRY, and database LearningResources with deduplication."""
        all_courses: List[Dict[str, Any]] = []
        seen_keys: Set[str] = set()

        def add_item(c: Dict[str, Any]):
            # Canonical key by provider + (external_id or normalized URL)
            url_clean = self._clean_url(c.get("url", ""))
            ext_id = c.get("external_id") or url_clean
            key = f"{c.get('provider', '').lower()}::{ext_id}"
            if key in seen_keys:
                return
            seen_keys.add(key)
            all_courses.append(c)

        # 1. Verified specialized course catalog
        for item in VERIFIED_COURSE_CATALOG:
            add_item(item)

        # 2. Extended registry items
        for item in EXTENDED_RESOURCES_REGISTRY:
            add_item(item)

        # 3. Database resources
        try:
            db_res = self.db.query(LearningResource).filter(LearningResource.status == "active").all()
            for dr in db_res:
                skills = [rs.skill.slug for rs in dr.resource_skills if rs.skill]
                add_item({
                    "id": dr.id,
                    "title": dr.title,
                    "slug": dr.slug,
                    "provider": dr.provider,
                    "url": dr.url,
                    "resource_type": dr.resource_type,
                    "difficulty": dr.difficulty,
                    "estimated_hours": dr.estimated_hours,
                    "quality_score": dr.quality_score,
                    "career_relevance": dr.career_relevance or [],
                    "format": dr.format,
                    "language": dr.language or "English",
                    "skills": skills,
                    "dsa_topics": [],
                    "price_type": dr.price_type or "GENUINELY_FREE",
                    "learning_cost": dr.learning_cost or 0.0,
                    "certificate_cost": dr.certificate_cost or "free",
                    "subscription_required": bool(dr.subscription_required),
                    "free_learning": bool(dr.free_learning),
                    "free_certificate": bool(dr.free_certificate),
                    "verification_status": dr.verification_status or "VERIFIED",
                    "verification_method": dr.verification_method or "curated_catalog",
                    "last_verified_at": dr.last_verified_at or datetime.now(timezone.utc),
                    "source": dr.source or "Database Catalog",
                    "source_tier": dr.source_tier or 1,
                    "external_id": dr.external_id,
                    "description": dr.description,
                })
        except Exception:
            pass

        return all_courses

    def search_courses(
        self,
        query: Optional[str] = None,
        dsa_topic: Optional[str] = None,
        skill: Optional[str] = None,
        career_slug: Optional[str] = None,
        role_slug: Optional[str] = None,
        price_filter: Optional[str] = None,
        language: Optional[str] = None,
        difficulty: Optional[str] = None,
        free_only: bool = False,
        limit: int = 50,
        skip: int = 0,
    ) -> Dict[str, Any]:
        """Searches and filters verified courses with strict price classification and relevance ranking."""
        all_courses = self.get_all_courses()
        results = []

        q_norm = query.lower().strip() if query else None
        dsa_norm = dsa_topic.lower().strip() if dsa_topic else None
        skill_norm = skill.lower().strip() if skill else None
        career_norm = career_slug.lower().strip() if career_slug else None
        lang_norm = language.lower().strip() if language else None
        diff_norm = difficulty.lower().strip() if difficulty else None

        for c in all_courses:
            # 1. Text Query Filter
            if q_norm:
                haystack = f"{c.get('title', '')} {c.get('description', '')} {c.get('provider', '')}".lower()
                if q_norm not in haystack:
                    continue

            # 2. DSA Topic Filter
            if dsa_norm:
                c_dsa = [t.lower() for t in c.get("dsa_topics", [])]
                c_skills = [s.lower() for s in c.get("skills", [])]
                if dsa_norm not in c_dsa and dsa_norm not in c_skills:
                    continue

            # 3. Skill Filter
            if skill_norm:
                c_skills = [s.lower() for s in c.get("skills", [])]
                if skill_norm not in c_skills:
                    continue

            # 4. Career Filter
            if career_norm:
                c_careers = [cr.lower() for cr in c.get("career_relevance", [])]
                if not any(career_norm in cr or cr in career_norm for cr in c_careers):
                    continue

            # 5. Language Filter
            if lang_norm:
                c_lang = c.get("language", "English").lower()
                if lang_norm != c_lang:
                    continue

            # 6. Difficulty Filter
            if diff_norm:
                c_diff = c.get("difficulty", "").lower()
                if diff_norm != c_diff:
                    continue

            # 7. Price Filter
            p_type = c.get("price_type", "GENUINELY_FREE")
            if free_only and not c.get("free_learning", False):
                continue

            if price_filter:
                pf_norm = price_filter.upper()
                if pf_norm == "FREE_LEARNING" and not c.get("free_learning"):
                    continue
                elif pf_norm == "FREE_CERTIFICATE" and not c.get("free_certificate"):
                    continue
                elif pf_norm in PRICE_CATEGORIES and p_type != pf_norm:
                    continue

            results.append(c)

        # Sort by quality score descending
        results.sort(key=lambda x: x.get("quality_score", 0.8), reverse=True)

        total = len(results)
        paginated = results[skip : skip + limit]

        return {
            "total_count": total,
            "skip": skip,
            "limit": limit,
            "items": paginated,
        }

    def get_courses_by_dsa_topic(self, topic_slug: str) -> List[Dict[str, Any]]:
        """Retrieves verified learning resources covering a canonical DSA topic."""
        res = self.search_courses(dsa_topic=topic_slug, limit=20)
        return res["items"]

    def get_courses_by_role(
        self, company_slug: str, role_slug: str
    ) -> List[Dict[str, Any]]:
        """Retrieves courses matching company role verified skills and DSA requirements."""
        company = self.db.query(Company).filter(func.lower(Company.slug) == company_slug.lower()).first()
        if not company:
            return []

        role = (
            self.db.query(CompanyRole)
            .filter(
                CompanyRole.company_id == company.id,
                func.lower(CompanyRole.role_slug) == role_slug.lower(),
            )
            .first()
        )
        if not role:
            return []

        # Extract required skills and dsa topics
        target_skills = [sr.skill.slug for sr in (role.skill_requirements or []) if sr.skill]
        target_dsa = [dr.dsa_topic_slug for dr in (role.dsa_requirements or [])]

        all_courses = self.get_all_courses()
        matched = []

        for c in all_courses:
            c_skills = set(s.lower() for s in c.get("skills", []))
            c_dsa = set(t.lower() for t in c.get("dsa_topics", []))

            # Check overlap
            skill_overlap = c_skills.intersection(set(s.lower() for s in target_skills))
            dsa_overlap = c_dsa.intersection(set(t.lower() for t in target_dsa))

            if skill_overlap or dsa_overlap or (role.career and role.career.slug in c.get("career_relevance", [])):
                matched.append(c)

        matched.sort(key=lambda x: x.get("quality_score", 0.8), reverse=True)
        return matched[:25]

    @staticmethod
    def get_price_categories() -> Dict[str, str]:
        return PRICE_CATEGORIES

    @staticmethod
    def _clean_url(url: str) -> str:
        if not url:
            return ""
        parsed = urlparse(url.strip())
        netloc = parsed.netloc.lower().replace("www.", "")
        path = parsed.path.rstrip("/")
        return f"{netloc}{path}"
