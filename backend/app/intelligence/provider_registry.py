"""
Source / Provider Registry (Phase 12 Stage 10)
Centralized registry for all external and internal data sources supplying
companies, roles, courses, videos, practice problems, and market signals.
"""

from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class ProviderCategory(str, Enum):
    COMPANY = "COMPANY"
    CAREER = "CAREER"
    COURSE = "COURSE"
    EDUCATION = "EDUCATION"
    VIDEO = "VIDEO"
    JOB = "JOB"
    MARKET = "MARKET"
    GOVERNMENT = "GOVERNMENT"
    OTHER = "OTHER"


class AuthType(str, Enum):
    NONE = "NONE"
    API_KEY = "API_KEY"
    OAUTH2 = "OAUTH2"
    PUBLIC_FEED = "PUBLIC_FEED"


class SourceProvider(BaseModel):
    provider_id: str
    name: str
    category: ProviderCategory
    base_url: str
    country: str = "Global"
    api_available: bool = False
    auth_type: AuthType = AuthType.NONE
    supported_resources: List[str] = Field(default_factory=list)
    supported_regions: List[str] = Field(default_factory=lambda: ["Global"])
    supported_languages: List[str] = Field(default_factory=lambda: ["English"])
    rate_limit_per_min: int = 60
    update_frequency: str = "WEEKLY"  # DAILY, WEEKLY, MONTHLY
    verification_method: str = "HTTP_HEAD_AUDIT"
    status: str = "ACTIVE"  # ACTIVE, DEGRADED, OFFLINE


class ProviderRegistry:
    """
    In-memory registry of approved and verified data providers.
    Prevents uncontrolled ad-hoc network requests to arbitrary third-party endpoints.
    """

    def __init__(self):
        self._providers: Dict[str, SourceProvider] = {}
        self._seed_default_providers()

    def _seed_default_providers(self):
        defaults = [
            SourceProvider(
                provider_id="nptel",
                name="NPTEL (National Programme on Technology Enhanced Learning)",
                category=ProviderCategory.COURSE,
                base_url="https://nptel.ac.in",
                country="India",
                api_available=True,
                auth_type=AuthType.NONE,
                supported_resources=["courses", "assignments", "syllabus"],
                supported_regions=["India"],
                supported_languages=["English", "Hindi"],
                rate_limit_per_min=120,
                update_frequency="WEEKLY",
                verification_method="CURATED_FEED",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="swayam",
                name="SWAYAM Government Learning Portal",
                category=ProviderCategory.GOVERNMENT,
                base_url="https://swayam.gov.in",
                country="India",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["courses", "syllabi", "diplomas"],
                supported_regions=["India"],
                supported_languages=["English", "Hindi", "Tamil", "Telugu"],
                rate_limit_per_min=60,
                update_frequency="WEEKLY",
                verification_method="CURATED_FEED",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="coursera",
                name="Coursera",
                category=ProviderCategory.COURSE,
                base_url="https://www.coursera.org",
                country="Global",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["courses", "specializations", "degrees"],
                supported_regions=["Global", "India"],
                supported_languages=["English", "Hindi", "Spanish"],
                rate_limit_per_min=60,
                update_frequency="DAILY",
                verification_method="HTTP_HEAD_AUDIT",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="mit_ocw",
                name="MIT OpenCourseWare",
                category=ProviderCategory.EDUCATION,
                base_url="https://ocw.mit.edu",
                country="Global",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["courses", "lecture_notes", "assignments"],
                supported_regions=["Global"],
                supported_languages=["English"],
                rate_limit_per_min=100,
                update_frequency="MONTHLY",
                verification_method="CURATED_FEED",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="freecodecamp",
                name="freeCodeCamp",
                category=ProviderCategory.COURSE,
                base_url="https://www.freecodecamp.org",
                country="Global",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["curriculum", "certifications", "tutorials"],
                supported_regions=["Global"],
                supported_languages=["English", "Spanish", "Chinese"],
                rate_limit_per_min=120,
                update_frequency="WEEKLY",
                verification_method="CURATED_FEED",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="microsoft_learn",
                name="Microsoft Learn",
                category=ProviderCategory.COURSE,
                base_url="https://learn.microsoft.com",
                country="Global",
                api_available=True,
                auth_type=AuthType.NONE,
                supported_resources=["modules", "learning_paths", "certifications"],
                supported_regions=["Global"],
                supported_languages=["English", "Hindi", "Japanese"],
                rate_limit_per_min=150,
                update_frequency="WEEKLY",
                verification_method="OFFICIAL_API",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="youtube",
                name="YouTube Data API & Curated Channels",
                category=ProviderCategory.VIDEO,
                base_url="https://www.googleapis.com/youtube/v3",
                country="Global",
                api_available=True,
                auth_type=AuthType.API_KEY,
                supported_resources=["videos", "playlists", "channels"],
                supported_regions=["Global", "India"],
                supported_languages=["English", "Hindi"],
                rate_limit_per_min=60,
                update_frequency="DAILY",
                verification_method="OFFICIAL_API",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="leetcode",
                name="LeetCode",
                category=ProviderCategory.OTHER,
                base_url="https://leetcode.com",
                country="Global",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["practice_problems", "contests"],
                supported_regions=["Global"],
                supported_languages=["English"],
                rate_limit_per_min=30,
                update_frequency="MONTHLY",
                verification_method="HTTP_HEAD_AUDIT",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="geeksforgeeks",
                name="GeeksforGeeks",
                category=ProviderCategory.OTHER,
                base_url="https://www.geeksforgeeks.org",
                country="India",
                api_available=False,
                auth_type=AuthType.NONE,
                supported_resources=["practice_problems", "articles"],
                supported_regions=["India", "Global"],
                supported_languages=["English"],
                rate_limit_per_min=60,
                update_frequency="MONTHLY",
                verification_method="HTTP_HEAD_AUDIT",
                status="ACTIVE"
            ),
            SourceProvider(
                provider_id="pathfinder_company_registry",
                name="PathFinder Verified Corporate Registry",
                category=ProviderCategory.COMPANY,
                base_url="https://pathfinder.internal/registry",
                country="India",
                api_available=True,
                auth_type=AuthType.NONE,
                supported_resources=["company_profiles", "role_benchmarks", "dsa_priorities"],
                supported_regions=["India", "Global"],
                supported_languages=["English"],
                rate_limit_per_min=1000,
                update_frequency="DAILY",
                verification_method="AI_ASSISTED_REVIEW",
                status="ACTIVE"
            ),
        ]
        for p in defaults:
            self._providers[p.provider_id] = p

    def register(self, provider: SourceProvider) -> None:
        self._providers[provider.provider_id] = provider

    def get(self, provider_id: str) -> Optional[SourceProvider]:
        return self._providers.get(provider_id.lower().strip())

    def list_all(self) -> List[SourceProvider]:
        return list(self._providers.values())

    def list_by_category(self, category: ProviderCategory) -> List[SourceProvider]:
        return [p for p in self._providers.values() if p.category == category]

    def update_status(self, provider_id: str, status: str) -> bool:
        p = self.get(provider_id)
        if p:
            p.status = status
            return True
        return False


# Global singleton registry instance
provider_registry = ProviderRegistry()
