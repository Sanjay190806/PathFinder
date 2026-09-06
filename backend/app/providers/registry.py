"""
Learning Provider Registry:
Central catalog and dispatcher for multi-source learning providers.
Manages provider tiers, domain validation, and adapter dispatching.
"""

from typing import Dict, List, Optional, Any
from urllib.parse import urlparse

from backend.app.providers.base import LearningProviderAdapter
from backend.app.providers.igot_adapter import IGOTProviderAdapter
from backend.app.providers.tech_adapters import (
    NPTELProviderAdapter,
    SWAYAMProviderAdapter,
    MicrosoftLearnProviderAdapter,
    GoogleCloudProviderAdapter,
    AWSProviderAdapter,
    CiscoProviderAdapter,
    IBMProviderAdapter,
    CourseraProviderAdapter,
    EDXProviderAdapter,
    UdemyProviderAdapter,
    YouTubeProviderAdapter
)


class ProviderRegistry:
    """Singleton registry indexing all learning provider adapters."""

    def __init__(self):
        self._adapters: Dict[str, LearningProviderAdapter] = {}
        self._register_default_adapters()

    def _register_default_adapters(self):
        adapters = [
            IGOTProviderAdapter(),
            NPTELProviderAdapter(),
            SWAYAMProviderAdapter(),
            MicrosoftLearnProviderAdapter(),
            GoogleCloudProviderAdapter(),
            AWSProviderAdapter(),
            CiscoProviderAdapter(),
            IBMProviderAdapter(),
            CourseraProviderAdapter(),
            EDXProviderAdapter(),
            UdemyProviderAdapter(),
            YouTubeProviderAdapter()
        ]
        for a in adapters:
            self._adapters[a.provider_id] = a

    def get_adapter(self, provider_id: str) -> Optional[LearningProviderAdapter]:
        """Retrieves provider adapter by provider identifier."""
        return self._adapters.get(provider_id.lower().strip())

    def get_adapter_by_url(self, url: str) -> Optional[LearningProviderAdapter]:
        """Identifies provider adapter corresponding to an external course URL."""
        if not url:
            return None
        try:
            parsed = urlparse(url.strip())
            hostname = (parsed.hostname or "").lower()
            for adapter in self._adapters.values():
                if any(hostname == d or hostname.endswith(f".{d}") for d in adapter.official_domains):
                    return adapter
        except Exception:
            pass
        return None

    def list_providers(self) -> List[Dict[str, Any]]:
        """Returns structured metadata for all registered providers and their source tiers."""
        return [
            {
                "provider_id": a.provider_id,
                "provider_name": a.provider_name,
                "source_platform": a.source_platform,
                "source_tier": a.source_tier,
                "official_domains": a.official_domains,
                "trust_weight": a.trust_weight
            }
            for a in self._adapters.values()
        ]


# Global singleton instance
provider_registry = ProviderRegistry()
