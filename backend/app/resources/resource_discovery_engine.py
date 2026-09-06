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

        # 2. iGOT authoritative courses from adapter
        try:
            from backend.app.providers.igot_adapter import IGOTProviderAdapter
            for igot_res in IGOTProviderAdapter().discover_courses():
                dedup_key = f"igot karmayogi::{igot_res.get('external_id', '') or self.normalize_url(igot_res['url'])}"
                if dedup_key not in seen_keys:
                    seen_keys.add(dedup_key)
                    merged.append(igot_res)
        except Exception:
            pass

        # 3. Database resources (if db session active)
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
                        "provider_id": getattr(dr, "provider_id", None) or "generic_provider",
                        "source_platform": getattr(dr, "source_platform", None) or "GENERIC",
                        "competencies": getattr(dr, "competencies", None) or [],
                        "topics": getattr(dr, "topics", None) or [],
                        "retrieved_at": getattr(dr, "retrieved_at", None) or datetime.now(timezone.utc),
                        "freshness": getattr(dr, "freshness", None) or "FRESH",
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
        source_tier: Optional[int] = None,
        competency: Optional[str] = None,
        free_only: bool = False,
        learner_profile: Optional[LearnerProfile] = None
    ) -> List[ResourceDiscoveryOut]:
        """
        Executes multi-dimensional filtering, ranking, and explainable scoring.
        Source-agnostic: balances Government/iGOT authority, tech vendor rigor,
        skill gap matches, and career domain context.
        """
        all_resources = self.get_all_catalog_resources()
        target_lang = (language or (learner_profile.preferred_language if learner_profile else None) or "English").strip()

        # Retrieve learner's active skill gaps if profile provided
        active_gaps: Set[str] = set()
        learner_career: Optional[str] = None
        if learner_profile and self.db:
            try:
                gap_engine = CareerSkillGapEngine(self.db)
                gap_report = gap_engine.calculate_skill_gaps(learner_profile.id)
                active_gaps = {g["skill_slug"].lower() for g in gap_report.get("gaps", [])}
                if learner_profile.goals:
                    primary_goal = next((g for g in learner_profile.goals if g.is_primary), learner_profile.goals[0])
                    if primary_goal and primary_goal.target_role:
                        learner_career = primary_goal.target_role.lower().replace(" ", "-")
            except Exception:
                pass

        effective_career = (career_slug or learner_career or "").lower()

        scored_candidates: List[tuple[float, Dict[str, Any], List[str], bool, bool]] = []

        for r in all_resources:
            # 1. Provider filter (matches provider name, provider_id, or source_platform)
            if provider:
                pq = provider.lower().strip()
                prov_match = (
                    pq in r.get("provider", "").lower()
                    or pq == r.get("provider_id", "").lower()
                    or pq == r.get("source_platform", "").lower()
                )
                if not prov_match:
                    continue

            # 2. Source Tier filter
            if source_tier is not None and r.get("source_tier") != source_tier:
                continue

            # 3. Resource type and difficulty
            if resource_type and resource_type.lower() != r.get("resource_type", "").lower():
                continue
            if difficulty and difficulty.lower() != "all" and difficulty.lower() != r.get("difficulty", "").lower():
                continue

            # 4. Skill filter
            r_skills = [s.lower() for s in r.get("skills", [])]
            if skill_slug and skill_slug.lower() not in r_skills:
                continue

            # 5. Competency filter
            if competency:
                cq = competency.lower().strip()
                comp_match = any(cq in c.lower() for c in r.get("competencies", [])) or any(cq in t.lower() for t in r.get("topics", []))
                if not comp_match:
                    continue

            # 6. Career relevance filter (relaxed if skills directly match active gap)
            if effective_career and effective_career not in [c.lower() for c in r.get("career_relevance", [])]:
                if not any(s in active_gaps for s in r_skills):
                    continue

            # 7. Price Filter
            if free_only and not r.get("free_learning", False):
                continue

            if price_filter:
                p_filter = price_filter.upper()
                if p_filter == "FREE":
                    if r["price_type"] not in ("GENUINELY_FREE", "YOUTUBE_FREE_CONTENT", "FREE_TO_ENROLL_PAID_CERTIFICATE"):
                        continue
                elif p_filter == "GENUINELY_FREE":
                    if r["price_type"] != "GENUINELY_FREE":
                        continue
                elif p_filter == "PAID":
                    if r["price_type"] not in ("PAID", "SUBSCRIPTION_REQUIRED"):
                        continue

            # 8. Deterministic Multi-Signal Ranking Formula
            base_score = float(r.get("quality_score", 0.90))
            reasons: List[str] = []
            is_preferred_lang = False
            is_gap_match = False

            # Language match boost
            r_lang = r.get("language", "English")
            if target_lang.lower() == r_lang.lower():
                base_score += 0.20
                is_preferred_lang = True
                reasons.append(f"Taught directly in your preferred language ({r_lang})")
            elif target_lang.lower() != "english" and r_lang.lower() == "english":
                base_score += 0.05
                reasons.append("English baseline resource available")

            # Skill Gap match boost
            matched_gaps = [s for s in r_skills if s in active_gaps]
            if matched_gaps:
                base_score += 0.35
                is_gap_match = True
                reasons.append(f"Directly resolves your identified skill gap: {', '.join(matched_gaps)}")
            elif skill_slug and skill_slug.lower() in r_skills:
                base_score += 0.25
                reasons.append(f"Directly covers requested target skill: {skill_slug}")

            # Career Alignment
            if effective_career and effective_career in [c.lower() for c in r.get("career_relevance", [])]:
                base_score += 0.15
                reasons.append("Specifically engineered for your target career role")

            # Source Tier Authority & Provider Trust
            tier = r.get("source_tier", 3)
            pid = r.get("provider_id", "").lower()
            if pid == "igot_karmayogi" or "igot" in r.get("provider", "").lower():
                base_score += 0.12
                reasons.append("Official Government of India national learning platform (iGOT Karmayogi)")
                # Public sector / governance synergy boost
                if any(k in effective_career for k in ("gov", "policy", "admin", "public", "civil")):
                    base_score += 0.20
                    reasons.append("High-priority curriculum directly aligned with public sector leadership & governance standards")
            elif tier == 1:
                base_score += 0.10
                reasons.append("Institutional university curriculum (NPTEL / SWAYAM)")
            elif tier == 2:
                base_score += 0.09
                reasons.append(f"Official {r.get('provider')} enterprise technology curriculum")
            elif tier == 4:
                reasons.append("Verified high-engagement YouTube educational series")

            # Pricing Transparency
            if r["price_type"] == "GENUINELY_FREE":
                reasons.append("Genuinely free: full learning content with no paywall")
            elif r["price_type"] == "FREE_TO_ENROLL_PAID_CERTIFICATE":
                reasons.append("Free learning access with optional paid proctored exam")
            elif r["price_type"] == "YOUTUBE_FREE_CONTENT":
                reasons.append("Publicly accessible free educational video series")

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
                provider_id=r.get("provider_id") or "generic_provider",
                source_platform=r.get("source_platform") or "GENERIC",
                competencies=r.get("competencies") or [],
                topics=r.get("topics") or [],
                retrieved_at=r.get("retrieved_at"),
                freshness=r.get("freshness", "FRESH"),
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

    def get_diagnostics(self) -> Dict[str, Any]:
        """Provides authoritative data quality diagnostics for multi-source learning resources."""
        all_res = self.get_all_catalog_resources()
        tier_counts = {1: 0, 2: 0, 3: 0, 4: 0}
        status_counts = {"VERIFIED": 0, "STALE": 0, "EXPIRED": 0, "UNVERIFIED": 0}
        provider_counts: Dict[str, int] = {}
        igot_metrics = {
            "total_courses": 0,
            "verified_courses": 0,
            "official_domains": ["igotkarmayogi.gov.in", "portal.igotkarmayogi.gov.in"],
            "mapped_competencies": 0,
            "status": "HEALTHY"
        }

        try:
            from backend.app.resources.taxonomy_mapper import IGOT_COMPETENCY_TO_CANONICAL_SKILLS
            igot_metrics["mapped_competencies"] = len(IGOT_COMPETENCY_TO_CANONICAL_SKILLS)
        except Exception:
            pass

        for r in all_res:
            t = int(r.get("source_tier", 3))
            tier_counts[t] = tier_counts.get(t, 0) + 1

            v = r.get("verification_status", "UNVERIFIED")
            status_counts[v] = status_counts.get(v, 0) + 1

            p = r.get("provider", "Unknown")
            provider_counts[p] = provider_counts.get(p, 0) + 1

            pid = (r.get("provider_id") or "").lower()
            if pid == "igot_karmayogi" or "igot" in p.lower() or "karmayogi" in p.lower():
                igot_metrics["total_courses"] += 1
                if v == "VERIFIED":
                    igot_metrics["verified_courses"] += 1

        return {
            "total_resources": len(all_res),
            "total_learning_resources": len(all_res),
            "igot_resources_count": igot_metrics["total_courses"],
            "by_tier": {
                "tier_1": tier_counts.get(1, 0),
                "tier_2": tier_counts.get(2, 0),
                "tier_3": tier_counts.get(3, 0),
                "tier_4": tier_counts.get(4, 0)
            },
            "source_tiers": tier_counts,
            "verification_breakdown": status_counts,
            "providers_distribution": provider_counts,
            "igot_karmayogi": igot_metrics,
            "diagnostics_timestamp": datetime.now(timezone.utc).isoformat()
        }
