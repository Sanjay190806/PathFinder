from typing import Dict, List, Any, Optional, Set
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from urllib.parse import urlparse

from backend.app.models.resource import LearningResource
from backend.app.models.profile import LearnerProfile
from backend.app.core.resource_catalog_extended import (
    EXTENDED_RESOURCES_REGISTRY, PRICE_CATEGORIES, SOURCE_TIERS
)
from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.schemas.resource import ResourceDiscoveryOut

class ResourceDiscoveryEngine:
    """
    Personalized, multi-signal learning resource discovery engine.
    Combines Career, Skill Gaps, Level, Language, Price taxonomy, and Source Tiers.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def normalize_url(self, url: str) -> str:
        if not url:
            return ""
        parsed = urlparse(url.strip())
        netloc = parsed.netloc.lower().replace("www.", "")
        path = parsed.path.rstrip("/")
        return f"{netloc}{path}"

    def get_all_catalog_resources(self) -> List[Dict[str, Any]]:
        """
        Merges extended registry with database LearningResource entries.
        """
        merged: List[Dict[str, Any]] = []
        seen_keys: Set[str] = set()

        # 1. Extended curated catalog
        for r in EXTENDED_RESOURCES_REGISTRY:
            dedup_key = f"{r.get('provider', '').lower()}::{r.get('external_id', '') or self.normalize_url(r['url'])}"
            seen_keys.add(dedup_key)
            merged.append(r)

        # 2. Database resources (if db session active)
        if self.db:
            try:
                db_res = self.db.query(LearningResource).all()
                for dr in db_res:
                    canonical = dr.canonical_url or dr.url
                    dedup_key = f"{dr.provider.lower()}::{dr.external_id or self.normalize_url(canonical)}"
                    if dedup_key in seen_keys:
                        continue
                    seen_keys.add(dedup_key)
                    skills = [rs.skill.slug for rs in dr.resource_skills if rs.skill]
                    merged.append({
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
                        "price_type": dr.price_type or "GENUINELY_FREE",
                        "learning_cost": dr.learning_cost or 0.0,
                        "certificate_cost": dr.certificate_cost or "free",
                        "subscription_required": bool(dr.subscription_required),
                        "free_learning": bool(dr.free_learning),
                        "free_certificate": bool(dr.free_certificate),
                        "verification_status": dr.verification_status or "VERIFIED",
                        "verification_method": dr.verification_method or "curated_catalog",
                        "last_verified_at": dr.last_verified_at or datetime.now(timezone.utc),
                        "source": dr.source or "curated_catalog",
                        "source_tier": dr.source_tier or 1,
                        "external_id": dr.external_id,
                        "description": dr.description
                    })
            except Exception:
                pass

        return merged

    def discover_resources(
        self,
        career_slug: Optional[str] = None,
        skill_slug: Optional[str] = None,
        language: Optional[str] = None,
        price_filter: Optional[str] = None,
        difficulty: Optional[str] = None,
        resource_type: Optional[str] = None,
        provider: Optional[str] = None,
        learner_profile: Optional[LearnerProfile] = None
    ) -> List[ResourceDiscoveryOut]:
        """
        Executes multi-dimensional filtering, ranking, and explainable scoring.
        """
        all_resources = self.get_all_catalog_resources()
        target_lang = (language or (learner_profile.preferred_language if learner_profile else None) or "English").strip()

        # Retrieve learner's active skill gaps if profile provided
        active_gaps: Set[str] = set()
        if learner_profile and self.db:
            try:
                gap_engine = CareerSkillGapEngine(self.db)
                gap_report = gap_engine.calculate_skill_gaps(learner_profile.id)
                active_gaps = {g["skill_slug"].lower() for g in gap_report.get("gaps", [])}
            except Exception:
                pass

        scored_candidates: List[tuple[float, Dict[str, Any], List[str], bool, bool]] = []

        for r in all_resources:
            # 1. Hard filters
            if provider and provider.lower() not in r["provider"].lower():
                continue
            if resource_type and resource_type.lower() != r["resource_type"].lower():
                continue
            if difficulty and difficulty.lower() != r["difficulty"].lower():
                continue
            if skill_slug and skill_slug.lower() not in [s.lower() for s in r.get("skills", [])]:
                continue
            if career_slug and career_slug.lower() not in [c.lower() for c in r.get("career_relevance", [])]:
                # If career specified, allow high general skill matches or direct relevance
                if not any(s in active_gaps for s in r.get("skills", [])):
                    continue

            # 2. Strict Price Filter
            if price_filter:
                p_filter = price_filter.upper()
                if p_filter == "FREE":
                    # Free filter includes ONLY Genuinely Free, YouTube Free, and Free-to-enroll
                    if r["price_type"] not in ("GENUINELY_FREE", "YOUTUBE_FREE_CONTENT", "FREE_TO_ENROLL_PAID_CERTIFICATE"):
                        continue
                elif p_filter == "GENUINELY_FREE":
                    if r["price_type"] != "GENUINELY_FREE":
                        continue
                elif p_filter == "PAID":
                    if r["price_type"] not in ("PAID", "SUBSCRIPTION_REQUIRED"):
                        continue

            # 3. Multi-Signal Ranking
            base_score = float(r.get("quality_score", 0.90))
            reasons: List[str] = []
            is_preferred_lang = False
            is_gap_match = False

            # Language match boost
            r_lang = r.get("language", "English")
            if target_lang.lower() == r_lang.lower():
                base_score += 0.25
                is_preferred_lang = True
                reasons.append(f"Taught directly in your preferred language ({r_lang})")
            elif target_lang.lower() != "english" and r_lang.lower() == "english":
                # Fallback to English available
                base_score += 0.05
                reasons.append("English baseline resource available")

            # Skill Gap match boost
            matched_gaps = [s for s in r.get("skills", []) if s.lower() in active_gaps]
            if matched_gaps:
                base_score += 0.35
                is_gap_match = True
                reasons.append(f"Directly resolves your identified skill gap: {', '.join(matched_gaps)}")
            elif skill_slug and skill_slug.lower() in [s.lower() for s in r.get("skills", [])]:
                base_score += 0.20
                reasons.append(f"Directly covers requested target skill: {skill_slug}")

            # Career Alignment
            if career_slug and career_slug.lower() in [c.lower() for c in r.get("career_relevance", [])]:
                base_score += 0.15
                reasons.append("Specifically engineered for this career path")

            # Source Tier Boost & Verification
            tier = r.get("source_tier", 3)
            if tier == 1:
                base_score += 0.10
                reasons.append("Institutional Indian curriculum (NPTEL / SWAYAM)")
            elif tier == 2:
                base_score += 0.08
                reasons.append("Official tech provider curriculum")
            elif tier == 4:
                reasons.append("Verified high-engagement YouTube educational series")

            # Pricing Transparency
            if r["price_type"] == "GENUINELY_FREE":
                reasons.append("Genuinely free: full learning content with no paywall")
            elif r["price_type"] == "FREE_TO_ENROLL_PAID_CERTIFICATE":
                reasons.append("Free learning access with optional paid proctored exam")
            elif r["price_type"] == "YOUTUBE_FREE_CONTENT":
                reasons.append("Publicly accessible free YouTube video series")

            scored_candidates.append((base_score, r, reasons, is_preferred_lang, is_gap_match))

        # Sort by total score descending
        scored_candidates.sort(key=lambda item: item[0], reverse=True)

        results: List[ResourceDiscoveryOut] = []
        for score, r, reasons, is_pref, is_gap in scored_candidates:
            results.append(ResourceDiscoveryOut(
                id=r["id"],
                title=r["title"],
                slug=r["slug"],
                description=r.get("description", ""),
                provider=r["provider"],
                url=r["url"],
                resource_type=r["resource_type"],
                difficulty=r["difficulty"],
                estimated_hours=float(r["estimated_hours"]),
                quality_score=float(r["quality_score"]),
                career_relevance=r.get("career_relevance", []),
                format=r.get("format", "video"),
                skills=r.get("skills", []),
                language=r.get("language", "English"),
                price_type=r.get("price_type", "GENUINELY_FREE"),
                learning_cost=float(r.get("learning_cost", 0.0)),
                certificate_cost=r.get("certificate_cost", "free"),
                subscription_required=bool(r.get("subscription_required", False)),
                free_learning=bool(r.get("free_learning", True)),
                free_certificate=bool(r.get("free_certificate", False)),
                verification_status=r.get("verification_status", "VERIFIED"),
                verification_method=r.get("verification_method", "curated_catalog"),
                last_verified_at=r.get("last_verified_at"),
                canonical_url=r.get("canonical_url", r["url"]),
                source=r.get("source", "curated_catalog"),
                source_tier=int(r.get("source_tier", 1)),
                external_id=r.get("external_id"),
                match_score=round(min(1.0, score), 3),
                recommendation_reasons=reasons,
                is_preferred_language=is_pref,
                is_exact_gap_match=is_gap
            ))

        return results
