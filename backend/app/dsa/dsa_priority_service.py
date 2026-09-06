from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.company import Company, CompanyRole
from backend.app.models.company_requirements import RoleDSARequirement, RoleInterviewTopic
from backend.app.models.career import Career
from backend.app.models.dsa import DSATopic
from backend.app.models.dsa_priority import DSAPriorityProfile


# Canonical benchmark policies by normalized role name
NON_SOFTWARE_ROLES = {
    "graphic designer",
    "video editor",
    "nurse",
    "accountant",
    "civil engineer",
    "mechanical engineer",
    "digital marketer",
    "content creator",
    "ui/ux designer",
    "product designer",
    "financial analyst",
    "human resources manager",
}

ROLE_DSA_BENCHMARKS = {
    "software engineer": {
        "priority_level": "VERY_HIGH",
        "expected_level": "ADVANCED",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "HARD",
        "core_topics": ["arrays", "hashing", "two-pointers", "binary-search", "trees", "graphs", "dynamic-programming"],
        "secondary_topics": ["linked-lists", "stacks", "queues", "heap-priority-queue", "greedy-algorithms"],
        "optional_topics": ["trie", "segment-tree", "union-find", "bit-manipulation"],
    },
    "backend engineer": {
        "priority_level": "HIGH",
        "expected_level": "PROFICIENT",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees", "graphs", "heap-priority-queue"],
        "secondary_topics": ["two-pointers", "binary-search", "greedy-algorithms", "dynamic-programming"],
        "optional_topics": ["trie", "union-find", "segment-tree"],
    },
    "frontend engineer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "strings", "hashing", "trees"],
        "secondary_topics": ["two-pointers", "recursion", "stacks"],
        "optional_topics": ["graphs", "dynamic-programming"],
    },
    "full stack developer": {
        "priority_level": "HIGH",
        "expected_level": "PROFICIENT",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees", "binary-search", "graphs"],
        "secondary_topics": ["stacks", "queues", "recursion", "greedy-algorithms"],
        "optional_topics": ["dynamic-programming", "heap-priority-queue"],
    },
    "mobile developer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees"],
        "secondary_topics": ["two-pointers", "binary-search", "recursion"],
        "optional_topics": ["graphs", "dynamic-programming"],
    },
    "data engineer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees", "graphs"],
        "secondary_topics": ["binary-search", "heap-priority-queue", "two-pointers"],
        "optional_topics": ["dynamic-programming", "trie"],
    },
    "ml engineer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees", "graphs"],
        "secondary_topics": ["binary-search", "recursion", "heap-priority-queue"],
        "optional_topics": ["dynamic-programming", "trie"],
    },
    "ai engineer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "trees", "graphs"],
        "secondary_topics": ["binary-search", "recursion"],
        "optional_topics": ["dynamic-programming"],
    },
    "devops engineer": {
        "priority_level": "LOW",
        "expected_level": "FOUNDATIONAL",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "EASY",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing"],
        "secondary_topics": ["two-pointers", "binary-search"],
        "optional_topics": ["trees", "graphs"],
    },
    "cloud architect": {
        "priority_level": "LOW",
        "expected_level": "FOUNDATIONAL",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "EASY",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing"],
        "secondary_topics": ["graphs"],
        "optional_topics": ["trees"],
    },
    "qa engineer": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "strings", "hashing"],
        "secondary_topics": ["binary-search", "two-pointers"],
        "optional_topics": ["trees"],
    },
    "sdet": {
        "priority_level": "MEDIUM",
        "expected_level": "WORKING",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "MEDIUM",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "strings", "hashing", "trees"],
        "secondary_topics": ["binary-search", "two-pointers"],
        "optional_topics": ["graphs"],
    },
    "security engineer": {
        "priority_level": "LOW",
        "expected_level": "FOUNDATIONAL",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "EASY",
        "interview_difficulty": "MEDIUM",
        "core_topics": ["arrays", "hashing", "bit-manipulation"],
        "secondary_topics": ["trees", "graphs"],
        "optional_topics": ["dynamic-programming"],
    },
    "vlsi engineer": {
        "priority_level": "MINIMAL",
        "expected_level": "FOUNDATIONAL",
        "minimum_difficulty": "EASY",
        "recommended_difficulty": "EASY",
        "interview_difficulty": "EASY",
        "core_topics": ["bit-manipulation"],
        "secondary_topics": ["arrays"],
        "optional_topics": ["graphs"],
    },
}


CANONICAL_DSA_PRIORITY_WEIGHTS: Dict[str, float] = {
    "VERY_HIGH": 1.0,
    "HIGH": 0.8,
    "MEDIUM": 0.5,
    "LOW": 0.3,
    "MINIMAL": 0.1,
    "NOT_APPLICABLE": 0.0,
    "UNKNOWN": 0.0,
}


class DSAPriorityService:
    PRIORITY_WEIGHTS = CANONICAL_DSA_PRIORITY_WEIGHTS

    @classmethod
    def get_canonical_weight(cls, priority_level: str) -> float:
        """Returns normalized canonical weight (0.0 to 1.0) for a given priority tier."""
        return cls.PRIORITY_WEIGHTS.get(str(priority_level).upper(), 0.0)

    @staticmethod
    def get_role_dsa_priority(
        db: Session,
        company_slug: Optional[str] = None,
        role_slug: Optional[str] = None,
        canonical_role_name: Optional[str] = None,
        role_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Resolves role DSA priority applying 4-tier provenance hierarchy: COMPANY_ROLE -> ROLE -> CAREER -> INDUSTRY."""
        company_role: Optional[CompanyRole] = None
        company: Optional[Company] = None

        if role_id:
            company_role = db.query(CompanyRole).filter(CompanyRole.id == role_id).first()
            if company_role:
                company = company_role.company

        elif company_slug and role_slug:
            company = db.query(Company).filter(func.lower(Company.slug) == company_slug.lower()).first()
            if company:
                company_role = (
                    db.query(CompanyRole)
                    .filter(
                        CompanyRole.company_id == company.id,
                        func.lower(CompanyRole.role_slug) == role_slug.lower(),
                    )
                    .first()
                )

        target_role_name = ""
        if company_role:
            target_role_name = company_role.canonical_role_name or company_role.display_name
        elif canonical_role_name:
            target_role_name = canonical_role_name

        norm_role_name = target_role_name.lower().strip()

        # Check for non-software role first
        is_non_software = any(non_sw in norm_role_name for non_sw in NON_SOFTWARE_ROLES)
        if is_non_software:
            return DSAPriorityService._build_not_applicable_profile(
                company_role=company_role,
                company=company,
                role_name=target_role_name,
                reason=f"Role '{target_role_name}' is in a non-software domain where Data Structures & Algorithms are not evaluated in professional recruitment.",
            )

        # Check DB topic metadata
        db_topics = db.query(DSATopic).all()
        topic_meta_map = {t.slug: t for t in db_topics}

        # -------------------------------------------------------------
        # TIER 1: COMPANY_ROLE Verified Evidence
        # -------------------------------------------------------------
        if company_role:
            dsa_reqs = (
                db.query(RoleDSARequirement)
                .filter(RoleDSARequirement.role_id == company_role.id)
                .all()
            )
            interview_topics = (
                db.query(RoleInterviewTopic)
                .filter(RoleInterviewTopic.role_id == company_role.id)
                .all()
            )

            if dsa_reqs or (company_role.dsa_relevance and company_role.verification_status == "VERIFIED"):
                priority_level = company_role.dsa_relevance or "HIGH"
                expected_level = "ADVANCED" if priority_level == "VERY_HIGH" else "PROFICIENT" if priority_level == "HIGH" else "WORKING"
                
                # Derive target difficulties from verified requirements
                max_diff = "MEDIUM"
                for dr in dsa_reqs:
                    if dr.difficulty_target == "HARD":
                        max_diff = "HARD"
                interview_diff = max_diff if priority_level in ("VERY_HIGH", "HIGH") else "MEDIUM"

                core_slugs = [dr.dsa_topic_slug for dr in dsa_reqs if dr.importance == "HIGH"]
                secondary_slugs = [dr.dsa_topic_slug for dr in dsa_reqs if dr.importance == "MEDIUM"]
                optional_slugs = [dr.dsa_topic_slug for dr in dsa_reqs if dr.importance == "LOW"]

                # If company role has benchmark fallback for remaining topics
                benchmark = DSAPriorityService._get_benchmark_for_role(norm_role_name)
                if not core_slugs and benchmark:
                    core_slugs = benchmark["core_topics"]
                    secondary_slugs = benchmark["secondary_topics"]
                    optional_slugs = benchmark["optional_topics"]

                return DSAPriorityService._format_profile(
                    company_role=company_role,
                    company=company,
                    role_name=target_role_name,
                    priority_level=priority_level,
                    expected_level=expected_level,
                    minimum_difficulty="EASY",
                    recommended_difficulty="MEDIUM" if priority_level in ("HIGH", "VERY_HIGH") else "EASY",
                    interview_difficulty=interview_diff,
                    source_level="COMPANY_ROLE",
                    confidence=1.0 if company_role.verification_status == "VERIFIED" else 0.85,
                    source=f"Verified Company Role Blueprint ({company.display_name if company else 'Enterprise'})",
                    verification_status=company_role.verification_status or "VERIFIED",
                    core_slugs=core_slugs,
                    secondary_slugs=secondary_slugs,
                    optional_slugs=optional_slugs,
                    topic_meta_map=topic_meta_map,
                    rationale=f"Role DSA priority for {target_role_name} at {company.display_name if company else 'company'} is directly verified from company hiring specifications and interview pattern blueprints.",
                )

        # -------------------------------------------------------------
        # TIER 2: CANONICAL ROLE Benchmark Intelligence
        # -------------------------------------------------------------
        benchmark = DSAPriorityService._get_benchmark_for_role(norm_role_name)
        if benchmark:
            return DSAPriorityService._format_profile(
                company_role=company_role,
                company=company,
                role_name=target_role_name,
                priority_level=benchmark["priority_level"],
                expected_level=benchmark["expected_level"],
                minimum_difficulty=benchmark["minimum_difficulty"],
                recommended_difficulty=benchmark["recommended_difficulty"],
                interview_difficulty=benchmark["interview_difficulty"],
                source_level="ROLE",
                confidence=0.85,
                source="Canonical Role Intelligence Baseline",
                verification_status="BENCHMARK",
                core_slugs=benchmark["core_topics"],
                secondary_slugs=benchmark["secondary_topics"],
                optional_slugs=benchmark["optional_topics"],
                topic_meta_map=topic_meta_map,
                rationale=f"Priority for '{target_role_name}' is derived from standardized industry role benchmarks across technology hiring criteria.",
            )

        # -------------------------------------------------------------
        # TIER 3: CAREER Fallback
        # -------------------------------------------------------------
        if company_role and company_role.career_id:
            career = db.query(Career).filter(Career.id == company_role.career_id).first()
            if career:
                career_cat = (career.category or "").lower()
                if "software" in career_cat or "tech" in career_cat or "engineering" in career_cat:
                    p_level = "HIGH"
                else:
                    p_level = "LOW"

                return DSAPriorityService._format_profile(
                    company_role=company_role,
                    company=company,
                    role_name=target_role_name,
                    priority_level=p_level,
                    expected_level="WORKING",
                    minimum_difficulty="EASY",
                    recommended_difficulty="MEDIUM",
                    interview_difficulty="MEDIUM",
                    source_level="CAREER",
                    confidence=0.70,
                    source="Canonical Career Baseline",
                    verification_status="PARTIALLY_VERIFIED",
                    core_slugs=["arrays", "hashing", "trees"],
                    secondary_slugs=["graphs", "binary-search"],
                    optional_slugs=["dynamic-programming"],
                    topic_meta_map=topic_meta_map,
                    rationale=f"Role mapped to career category '{career.category}' baseline because specific role DSA benchmarks are currently unindexed.",
                )

        # -------------------------------------------------------------
        # TIER 4: UNKNOWN Fallback
        # -------------------------------------------------------------
        return {
            "role_id": company_role.id if company_role else None,
            "role_slug": company_role.role_slug if company_role else None,
            "role_name": company_role.display_name if company_role else target_role_name or "Unknown Role",
            "company_slug": company.slug if company else None,
            "company_name": company.display_name if company else None,
            "canonical_role_name": target_role_name or "Unknown",
            "priority_level": "UNKNOWN",
            "expected_level": "UNKNOWN",
            "minimum_difficulty": "UNKNOWN",
            "recommended_difficulty": "UNKNOWN",
            "interview_difficulty": "UNKNOWN",
            "source_level": "INDUSTRY",
            "confidence": 0.3,
            "source": "Unverified Industry Baseline",
            "verification_status": "UNKNOWN",
            "decision_trace": {
                "decision": "UNKNOWN",
                "rationale": f"Insufficient verified evidence to determine DSA priority for role '{target_role_name}'.",
                "factors": [],
                "evidence": [],
            },
            "core_topics": [],
            "secondary_topics": [],
            "optional_topics": [],
            "all_topics": [],
        }

    @staticmethod
    def _get_benchmark_for_role(norm_role_name: str) -> Optional[Dict[str, Any]]:
        for pattern, config in ROLE_DSA_BENCHMARKS.items():
            if pattern in norm_role_name:
                return config
        return None

    @staticmethod
    def _build_not_applicable_profile(
        company_role: Optional[CompanyRole],
        company: Optional[Company],
        role_name: str,
        reason: str,
    ) -> Dict[str, Any]:
        return {
            "role_id": company_role.id if company_role else None,
            "role_slug": company_role.role_slug if company_role else None,
            "role_name": company_role.display_name if company_role else role_name,
            "company_slug": company.slug if company else None,
            "company_name": company.display_name if company else None,
            "canonical_role_name": role_name,
            "priority_level": "NOT_APPLICABLE",
            "expected_level": "NOT_APPLICABLE",
            "minimum_difficulty": "NOT_APPLICABLE",
            "recommended_difficulty": "NOT_APPLICABLE",
            "interview_difficulty": "NOT_APPLICABLE",
            "source_level": "ROLE",
            "confidence": 1.0,
            "source": "Domain Scope Policy",
            "verification_status": "VERIFIED",
            "decision_trace": {
                "decision": "NOT_APPLICABLE",
                "rationale": reason,
                "factors": [
                    {
                        "name": "Domain Classification",
                        "weight": 1.0,
                        "raw_score": 0.0,
                        "contribution": 0.0,
                        "reason": "Professional role belongs to non-algorithmic / non-software discipline.",
                    }
                ],
                "evidence": [
                    {
                        "evidence_type": "DomainScope",
                        "description": "DSA requirements omitted by centralized policy to prevent irrelevant learning overhead.",
                        "source": "PathFinder Policy Engine",
                    }
                ],
            },
            "core_topics": [],
            "secondary_topics": [],
            "optional_topics": [],
            "all_topics": [],
        }

    @staticmethod
    def _format_profile(
        company_role: Optional[CompanyRole],
        company: Optional[Company],
        role_name: str,
        priority_level: str,
        expected_level: str,
        minimum_difficulty: str,
        recommended_difficulty: str,
        interview_difficulty: str,
        source_level: str,
        confidence: float,
        source: str,
        verification_status: str,
        core_slugs: List[str],
        secondary_slugs: List[str],
        optional_slugs: List[str],
        topic_meta_map: Dict[str, DSATopic],
        rationale: str,
    ) -> Dict[str, Any]:
        def create_item(slug: str, prio: str, imp: str, is_c: bool) -> Dict[str, Any]:
            meta = topic_meta_map.get(slug)
            name = meta.name if meta else slug.replace("-", " ").title()
            prereqs = meta.prerequisite_topic_slugs if meta and meta.prerequisite_topic_slugs else []
            return {
                "topic_slug": slug,
                "topic_name": name,
                "priority_level": prio,
                "importance": imp,
                "minimum_difficulty": minimum_difficulty,
                "recommended_difficulty": recommended_difficulty,
                "interview_difficulty": interview_difficulty,
                "is_core": is_c,
                "prerequisites": prereqs,
            }

        core_items = [create_item(s, "VERY_HIGH" if priority_level == "VERY_HIGH" else "HIGH", "HIGH", True) for s in core_slugs]
        sec_items = [create_item(s, "MEDIUM", "MEDIUM", False) for s in secondary_slugs]
        opt_items = [create_item(s, "LOW", "LOW", False) for s in optional_slugs]
        all_items = core_items + sec_items + opt_items

        return {
            "role_id": company_role.id if company_role else None,
            "role_slug": company_role.role_slug if company_role else None,
            "role_name": company_role.display_name if company_role else role_name,
            "company_slug": company.slug if company else None,
            "company_name": company.display_name if company else None,
            "career_slug": company_role.career.slug if company_role and company_role.career else None,
            "canonical_role_name": role_name,
            "priority_level": priority_level,
            "expected_level": expected_level,
            "minimum_difficulty": minimum_difficulty,
            "recommended_difficulty": recommended_difficulty,
            "interview_difficulty": interview_difficulty,
            "source_level": source_level,
            "confidence": round(confidence, 2),
            "source": source,
            "verification_status": verification_status,
            "decision_trace": {
                "decision": priority_level,
                "rationale": rationale,
                "factors": [
                    {
                        "name": "Role DSA Relevance",
                        "weight": 0.6,
                        "raw_score": CANONICAL_DSA_PRIORITY_WEIGHTS.get(priority_level, 0.5),
                        "contribution": round(CANONICAL_DSA_PRIORITY_WEIGHTS.get(priority_level, 0.5) * 0.6, 2),
                        "reason": f"Role classification indicates {priority_level} requirement tier.",
                    },
                    {
                        "name": "Source Provenance",
                        "weight": 0.4,
                        "raw_score": round(confidence, 2),
                        "contribution": round(confidence * 0.4, 2),
                        "reason": f"Evidence derived from {source_level} source hierarchy.",
                    },
                ],
                "evidence": [
                    {
                        "evidence_type": "Provenance",
                        "description": source,
                        "source": "RoleRequirementEngine",
                    }
                ],
            },
            "core_topics": core_items,
            "secondary_topics": sec_items,
            "optional_topics": opt_items,
            "all_topics": all_items,
        }
