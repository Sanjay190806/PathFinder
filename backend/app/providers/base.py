"""
Base Learning Provider Adapter:
Defines the canonical abstraction for multi-source educational platforms
(iGOT Karmayogi, NPTEL, SWAYAM, Microsoft Learn, Google, AWS, Cisco, IBM, YouTube).
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse


class LearningProviderAdapter(ABC):
    """
    Abstract adapter for learning content providers.
    Enforces official domain boundaries, canonical taxonomy mapping,
    and safe external link generation.
    """

    provider_id: str = "generic"
    provider_name: str = "Generic Provider"
    source_platform: str = "GENERIC"
    source_tier: int = 3  # 1=Gov/Institutional, 2=Tech Provider, 3=EdTech, 4=Video
    official_domains: List[str] = []
    trust_weight: float = 1.0

    def is_official_url(self, url: str) -> bool:
        """Validates that a URL belongs strictly to the provider's registered official domains."""
        if not url:
            return False
        try:
            parsed = urlparse(url.strip())
            hostname = (parsed.hostname or "").lower()
            return any(
                hostname == domain.lower() or hostname.endswith(f".{domain.lower()}")
                for domain in self.official_domains
            )
        except Exception:
            return False

    @abstractmethod
    def discover_courses(
        self,
        query: Optional[str] = None,
        skill: Optional[str] = None,
        career: Optional[str] = None,
        difficulty: Optional[str] = None,
        language: Optional[str] = None,
        free_only: bool = False,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Discovers verified candidate learning resources matching criteria."""
        pass

    @abstractmethod
    def get_course_by_id(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetches normalized course metadata by external identifier."""
        pass

    @abstractmethod
    def get_course_url(self, external_id: str) -> str:
        """Constructs or returns the official verified portal URL."""
        pass

    def map_competencies_to_skills(self, competencies: List[str]) -> List[str]:
        """Maps provider-specific taxonomy/competencies into canonical PathFinder skill slugs."""
        return [c.lower().replace(" ", "-") for c in competencies if c]

    def normalize_resource(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes provider metadata into PathFinder's canonical resource shape."""
        canonical_skills = self.map_competencies_to_skills(raw_item.get("competencies", []))
        if raw_item.get("skills"):
            canonical_skills.extend(s.lower() for s in raw_item["skills"])
        canonical_skills = list(dict.fromkeys(canonical_skills))

        url = raw_item.get("url", "")
        return {
            "id": raw_item.get("id"),
            "external_id": raw_item.get("external_id"),
            "title": raw_item.get("title", "Untitled Resource"),
            "slug": raw_item.get("slug") or raw_item.get("title", "").lower().replace(" ", "-")[:80],
            "description": raw_item.get("description", ""),
            "provider": self.provider_name,
            "provider_id": self.provider_id,
            "source_platform": self.source_platform,
            "source_tier": self.source_tier,
            "url": url,
            "canonical_url": raw_item.get("canonical_url") or url,
            "resource_type": raw_item.get("resource_type", "course"),
            "difficulty": raw_item.get("difficulty", "Beginner"),
            "estimated_hours": float(raw_item.get("estimated_hours", 5.0)),
            "quality_score": float(raw_item.get("quality_score", 0.90)),
            "career_relevance": raw_item.get("career_relevance", []),
            "format": raw_item.get("format", "interactive"),
            "language": raw_item.get("language", "English"),
            "skills": canonical_skills,
            "competencies": raw_item.get("competencies", []),
            "topics": raw_item.get("topics", []),
            "price_type": raw_item.get("price_type", "GENUINELY_FREE"),
            "learning_cost": float(raw_item.get("learning_cost", 0.0)),
            "certificate_cost": raw_item.get("certificate_cost", "free"),
            "subscription_required": bool(raw_item.get("subscription_required", False)),
            "free_learning": bool(raw_item.get("free_learning", True)),
            "free_certificate": bool(raw_item.get("free_certificate", False)),
            "verification_status": raw_item.get("verification_status", "VERIFIED"),
            "verification_method": raw_item.get("verification_method", "curated_catalog"),
            "last_verified_at": raw_item.get("last_verified_at") or datetime.now(timezone.utc),
            "retrieved_at": raw_item.get("retrieved_at") or datetime.now(timezone.utc),
            "freshness": raw_item.get("freshness", "FRESH"),
            "source": f"{self.provider_name} Official Portal",
            "why_recommended": raw_item.get("why_recommended")
        }
