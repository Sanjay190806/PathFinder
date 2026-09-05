"""
Targeted Cache Invalidator (Phase 12 Stage 10)
Provides tag-based fine-grained cache invalidation for companies, roles,
resources, pricing, and personalized recommendations.
Never purges the global application cache indiscriminately.
"""

from typing import Set, List, Dict, Any, Optional
from datetime import datetime, timezone


class CacheInvalidator:
    """
    Centralized invalidation coordinator that evicts fine-grained cache tags
    when underlying intelligence data mutates.
    """

    def __init__(self):
        self._invalidated_tags: Set[str] = set()
        self._invalidation_history: List[Dict[str, Any]] = []

    def invalidate_tag(self, tag: str, reason: str = "data_updated") -> None:
        clean_tag = tag.strip().lower()
        self._invalidated_tags.add(clean_tag)
        record = {
            "tag": clean_tag,
            "reason": reason,
            "invalidated_at": datetime.now(timezone.utc).isoformat()
        }
        self._invalidation_history.append(record)
        # Keep log bounded
        if len(self._invalidation_history) > 1000:
            self._invalidation_history = self._invalidation_history[-1000:]

    def invalidate_tags(self, tags: List[str], reason: str = "data_updated") -> None:
        for t in tags:
            self.invalidate_tag(t, reason)

    def is_invalidated(self, tag: str) -> bool:
        return tag.strip().lower() in self._invalidated_tags

    def clear_tag(self, tag: str) -> None:
        self._invalidated_tags.discard(tag.strip().lower())

    def invalidate_on_resource_change(
        self,
        resource_slug: str,
        old_price_type: Optional[str] = None,
        new_price_type: Optional[str] = None,
        old_status: Optional[str] = None,
        new_status: Optional[str] = None
    ) -> List[str]:
        """
        Calculates affected cache tags when a resource's price or availability changes.
        """
        tags = [
            f"resource:{resource_slug}",
            "resources:catalog",
            "resources:pricing-categories"
        ]
        
        # If pricing flipped (e.g. GENUINELY_FREE -> PAID) or status went unavailable,
        # invalidate all active recommendation caches
        if old_price_type != new_price_type or old_status != new_status:
            tags.append("recommendations:global")
            tags.append("recommendations:free_catalog")
            tags.append(f"recommendations:resource:{resource_slug}")

        self.invalidate_tags(tags, reason=f"Resource {resource_slug} updated (price={new_price_type}, status={new_status})")
        return tags

    def invalidate_on_role_change(
        self,
        company_slug: str,
        role_slug: str,
        skills_changed: bool = False,
        dsa_changed: bool = False
    ) -> List[str]:
        """
        Evicts caches when a company role changes requirements or DSA priorities.
        """
        tags = [
            f"company:{company_slug}",
            f"company_role:{company_slug}:{role_slug}",
            f"recommendations:company:{company_slug}"
        ]
        if dsa_changed:
            tags.append(f"dsa_priority:{company_slug}:{role_slug}")
        if skills_changed:
            tags.append(f"learner_gaps:{company_slug}:{role_slug}")
            tags.append(f"roadmaps:{company_slug}:{role_slug}")

        self.invalidate_tags(tags, reason=f"Role {company_slug}/{role_slug} updated (skills={skills_changed}, dsa={dsa_changed})")
        return tags

    def invalidate_on_company_change(self, company_slug: str) -> List[str]:
        tags = [
            f"company:{company_slug}",
            f"recommendations:company:{company_slug}",
            "companies:list"
        ]
        self.invalidate_tags(tags, reason=f"Company {company_slug} profile updated")
        return tags

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._invalidation_history[-limit:]

    def clear_all(self) -> None:
        self._invalidated_tags.clear()
        self._invalidation_history.clear()


# Global singleton cache invalidator instance
cache_invalidator = CacheInvalidator()
