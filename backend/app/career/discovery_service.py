"""
Career Search, Filtering & Discovery Engine (Phase 11 Stage 2)
Authoritative discovery service supporting query normalization, deterministic ranking,
typo-tolerant fuzzy matching, multi-attribute filtering, and pagination.
"""

import re
import difflib
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func

from backend.app.models.career import (
    Career,
    CareerDomain,
    CareerFamily,
    CareerSpecialization,
    CareerSkillRequirement,
    CareerEducationRequirement,
    CareerRegionalMetadata,
    CareerRelationship
)
from backend.app.schemas.career import (
    CareerSummaryOut,
    CareerSearchResponse,
    CareerDetailOut,
    CareerSpecializationOut,
    CareerSkillRequirementOut,
    CareerEducationRequirementOut,
    CareerRegionalMetadataOut,
    CareerRelationshipOut
)


ABBREVIATION_SYNONYMS: Dict[str, str] = {
    "sde": "software engineer",
    "swe": "software engineer",
    "dev": "software engineer",
    "developer": "software engineer",
    "ai": "ai/ml engineer",
    "ml": "machine learning",
    "aiml": "ai/ml engineer",
    "ai/ml": "ai/ml engineer",
    "ca": "chartered accountant",
    "cpa": "chartered accountant",
    "mbbs": "doctor",
    "rn": "registered nurse",
    "cpl": "commercial airline pilot",
    "pilot": "commercial airline pilot",
    "ux": "ui/ux designer",
    "ui": "ui/ux designer",
    "ui/ux": "ui/ux designer",
    "graphics": "graphic designer",
    "graphic": "graphic designer",
    "video": "video editor",
    "editing": "video editor",
    "cyber": "cybersecurity analyst",
    "infosec": "cybersecurity analyst",
    "devops": "cloud / devops engineer",
    "cloud": "cloud / devops engineer",
    "law": "corporate lawyer",
    "lawyer": "corporate lawyer",
    "attorney": "corporate lawyer",
    "teacher": "secondary school teacher",
    "teaching": "secondary school teacher",
    "mechanic": "automotive mechanic",
    "electrician": "licensed electrician",
    "agri": "agricultural scientist",
    "farmer": "agricultural scientist",
    "agriculture": "agricultural scientist",
    "vlsi": "vlsi hardware engineer",
    "hardware": "vlsi hardware engineer",
    "chip": "vlsi hardware engineer"
}


def normalize_query(query: str) -> str:
    """Normalizes case, whitespace, and punctuation from search terms."""
    if not query:
        return ""
    q = query.strip().lower()
    # Normalize punctuation except slashes/hyphens for common terms
    q = re.sub(r'[^\w\s\-\/]', ' ', q)
    q = re.sub(r'\s+', ' ', q).strip()
    return q


def calculate_match_score(query: str, career: Career) -> float:
    """
    Deterministic ranking scoring:
    Exact match: 100.0
    Prefix match: 80.0
    Alias exact: 70.0
    Alias substring: 50.0
    Keyword match: 40.0
    Specialization match: 35.0
    Family/Domain match: 30.0
    Description match: 20.0
    Fuzzy ratio: up to 25.0
    """
    q = query.lower()
    score = 0.0

    name_lower = career.canonical_name.lower()
    slug_lower = career.slug.lower()

    # 1. Exact match on canonical name or slug
    if q == name_lower or q == slug_lower:
        return 100.0

    # 2. Prefix match
    if name_lower.startswith(q) or slug_lower.startswith(q):
        score = max(score, 80.0)

    # 3. Substring match in name
    if q in name_lower:
        score = max(score, 65.0)

    # 4. Synonym expansion check
    expanded = ABBREVIATION_SYNONYMS.get(q)
    if expanded and (expanded in name_lower or name_lower in expanded):
        score = max(score, 75.0)

    # 5. Alias match
    aliases = career.aliases or []
    for alias in aliases:
        a_lower = alias.lower()
        if q == a_lower:
            score = max(score, 70.0)
        elif q in a_lower:
            score = max(score, 50.0)

    # 6. Keywords match
    keywords = career.keywords or []
    for kw in keywords:
        kw_lower = kw.lower()
        if q == kw_lower:
            score = max(score, 45.0)
        elif q in kw_lower:
            score = max(score, 35.0)

    # 7. Specialization match
    if career.specialization and q in career.specialization.lower():
        score = max(score, 35.0)

    # 8. Domain / Family match
    if career.domain and q in career.domain.name.lower():
        score = max(score, 30.0)
    if career.family and q in career.family.name.lower():
        score = max(score, 30.0)

    # 9. Description match
    if career.short_description and q in career.short_description.lower():
        score = max(score, 20.0)

    # 10. Typo-tolerant Fuzzy match
    sim = difflib.SequenceMatcher(None, q, name_lower).ratio()
    if sim >= 0.70:
        score = max(score, 15.0 + (sim * 25.0))

    # 11. Multilingual Translation & Native Script match (Phase 11 Stage 10)
    if getattr(career, "translations", None):
        for trans in career.translations:
            t_title = (trans.title or "").lower()
            if q == t_title:
                return 100.0
            elif q in t_title or t_title in q:
                score = max(score, 85.0)
            if trans.search_terms:
                for term in trans.search_terms:
                    term_lower = str(term).lower()
                    if q == term_lower:
                        score = max(score, 80.0)
                    elif q in term_lower or term_lower in q:
                        score = max(score, 65.0)

    return score


class CareerDiscoveryService:
    def __init__(self, db: Session):
        self.db = db

    def _to_summary(self, career: Career) -> CareerSummaryOut:
        # Extract top 3-4 key skill names
        key_skills = []
        if career.skill_requirements:
            for req in career.skill_requirements[:4]:
                if req.skill:
                    key_skills.append(req.skill.name)

        return CareerSummaryOut(
            id=career.id,
            slug=career.slug,
            canonical_name=career.canonical_name,
            display_name=career.display_name,
            short_description=career.short_description,
            domain_slug=career.domain.slug if career.domain else None,
            domain_name=career.domain.name if career.domain else None,
            family_slug=career.family.slug if career.family else None,
            family_name=career.family.name if career.family else None,
            specialization=career.specialization,
            is_emerging=career.is_emerging,
            is_regulated=career.is_regulated,
            remote_compatibility=career.remote_compatibility,
            key_skills=key_skills,
            status=career.status,
            version=career.version
        )

    def search_careers(
        self,
        query: Optional[str] = None,
        domain_slug: Optional[str] = None,
        family_slug: Optional[str] = None,
        specialization_slug: Optional[str] = None,
        education_level: Optional[str] = None,
        is_regulated: Optional[bool] = None,
        is_emerging: Optional[bool] = None,
        remote_compatibility: Optional[str] = None,
        country: Optional[str] = None,
        language: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> CareerSearchResponse:
        """
        Executes multi-factor filtering, text normalization, deterministic ranking,
        and fuzzy typo matching with pagination.
        """
        page = max(1, page)
        page_size = min(max(1, page_size), 50)  # capped at 50

        # Base query with active status
        q_builder = self.db.query(Career).filter(
            Career.is_active == True,
            Career.status.in_(["ACTIVE", "ARCHIVED"])
        ).options(
            joinedload(Career.domain),
            joinedload(Career.family),
            joinedload(Career.translations),
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill),
            joinedload(Career.education_requirements)
        )

        # Filters
        if domain_slug:
            q_builder = q_builder.join(Career.domain).filter(CareerDomain.slug == domain_slug)
        if family_slug:
            q_builder = q_builder.join(Career.family).filter(CareerFamily.slug == family_slug)
        if is_regulated is not None:
            q_builder = q_builder.filter(Career.is_regulated == is_regulated)
        if is_emerging is not None:
            q_builder = q_builder.filter(Career.is_emerging == is_emerging)
        if remote_compatibility:
            q_builder = q_builder.filter(Career.remote_compatibility == remote_compatibility.upper())
        if country and country != "GLOBAL":
            q_builder = q_builder.filter(
                or_(Career.country_scope == "GLOBAL", Career.country_scope == country)
            )

        candidates = q_builder.all()

        # Filter by education level if provided
        if education_level:
            edu_filtered = []
            for c in candidates:
                if not c.education_requirements:
                    edu_filtered.append(c)
                else:
                    levels = [er.education_level.lower() for er in c.education_requirements]
                    if any(education_level.lower() in lvl for lvl in levels):
                        edu_filtered.append(c)
            candidates = edu_filtered

        clean_q = normalize_query(query) if query else ""

        # Rank candidates
        scored_items: List[Tuple[float, Career]] = []
        for c in candidates:
            if not clean_q:
                scored_items.append((1.0, c))
            else:
                score = calculate_match_score(clean_q, c)
                if score > 0:
                    scored_items.append((score, c))

        # Sort descending by score, then canonical name
        scored_items.sort(key=lambda x: (x[0], x[1].canonical_name), reverse=True)

        total_count = len(scored_items)
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_records = scored_items[start_idx:end_idx]

        summaries = [self._to_summary(item[1]) for item in paged_records]

        # Suggested alternatives when exact query yields 0 results or weak matches
        suggested_alternatives: List[CareerSummaryOut] = []
        has_exact_match = any(item[0] >= 65.0 for item in scored_items)

        if total_count == 0 and clean_q:
            # Look for related domains or broad matches across all active careers
            broad = self.db.query(Career).filter(Career.is_active == True).limit(4).all()
            suggested_alternatives = [self._to_summary(b) for b in broad]

        return CareerSearchResponse(
            query=query,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=summaries,
            suggested_alternatives=suggested_alternatives,
            has_exact_match=has_exact_match
        )

    def get_career_detail(self, slug: str) -> Optional[CareerDetailOut]:
        """Loads complete career specification with relations."""
        career = self.db.query(Career).filter(
            Career.slug == slug,
            Career.is_active == True
        ).options(
            joinedload(Career.domain),
            joinedload(Career.family),
            joinedload(Career.specializations),
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill),
            joinedload(Career.education_requirements),
            joinedload(Career.regional_metadata),
            joinedload(Career.outgoing_relationships).joinedload(CareerRelationship.target_career)
        ).first()

        if not career:
            return None

        # Build nested outputs
        specs = [
            CareerSpecializationOut(
                id=s.id,
                slug=s.slug,
                name=s.name,
                description=s.description,
                focus_areas=s.focus_areas or [],
                order=s.order
            )
            for s in (career.specializations or [])
        ]

        skills = [
            CareerSkillRequirementOut(
                id=sr.id,
                skill_id=sr.skill_id,
                skill_slug=sr.skill.slug if sr.skill else "",
                skill_name=sr.skill.name if sr.skill else "",
                category=sr.skill.category if sr.skill else "General",
                importance=sr.importance,
                proficiency_level=sr.proficiency_level,
                evidence_type=sr.evidence_type
            )
            for sr in (career.skill_requirements or [])
        ]

        edus = [
            CareerEducationRequirementOut(
                id=er.id,
                education_level=er.education_level,
                preferred_streams=er.preferred_streams or [],
                subject_prerequisites=er.subject_prerequisites or [],
                requirement_type=er.requirement_type,
                notes=er.notes
            )
            for er in (career.education_requirements or [])
        ]

        regs = [
            CareerRegionalMetadataOut(
                id=rm.id,
                country_code=rm.country_code,
                region_code=rm.region_code,
                regulatory_body=rm.regulatory_body,
                statutory_exam=rm.statutory_exam,
                notes=rm.notes
            )
            for rm in (career.regional_metadata or [])
        ]

        rels = [
            CareerRelationshipOut(
                target_career_slug=rel.target_career.slug if rel.target_career else "",
                target_career_name=rel.target_career.canonical_name if rel.target_career else "",
                relationship_type=rel.relationship_type,
                notes=rel.notes,
                transferable_skills=rel.transferable_skills or [],
                bridge_skills=rel.bridge_skills or []
            )
            for rel in (career.outgoing_relationships or [])
        ]

        return CareerDetailOut(
            id=career.id,
            slug=career.slug,
            canonical_name=career.canonical_name,
            display_name=career.display_name,
            short_description=career.short_description,
            long_description=career.long_description,
            domain_id=career.career_domain_id,
            domain_slug=career.domain.slug if career.domain else None,
            domain_name=career.domain.name if career.domain else None,
            family_id=career.career_family_id,
            family_slug=career.family.slug if career.family else None,
            family_name=career.family.name if career.family else None,
            specialization=career.specialization,
            aliases=career.aliases or [],
            keywords=career.keywords or [],
            status=career.status,
            is_emerging=career.is_emerging,
            emergence_source=career.emergence_source,
            last_verified_at=career.last_verified_at,
            is_regulated=career.is_regulated,
            regulation_country=career.regulation_country,
            regulatory_requirement=career.regulatory_requirement,
            qualification_requirement=career.qualification_requirement,
            country_scope=career.country_scope,
            global_relevance=career.global_relevance,
            work_environment=career.work_environment,
            remote_compatibility=career.remote_compatibility,
            typical_tasks=career.typical_tasks or [],
            tools=career.tools or [],
            portfolio_expectations=career.portfolio_expectations,
            experience_levels=career.experience_levels or ["Entry", "Mid", "Senior"],
            employment_types=career.employment_types or ["Full-Time"],
            industry_types=career.industry_types or [],
            version=career.version,
            created_at=career.created_at,
            updated_at=career.updated_at,
            specializations=specs,
            skill_requirements=skills,
            education_requirements=edus,
            regional_metadata=regs,
            relationships=rels
        )
