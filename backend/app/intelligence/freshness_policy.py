"""
Freshness Policy (Phase 12 Stage 10)
Centralized freshness and TTL policy for PathFinder intelligence layers:
Companies, Roles, Requirements, Courses, Pricing, YouTube, and Practice.
"""

from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel


class FreshnessState(str, Enum):
    FRESH = "FRESH"
    RECENT = "RECENT"
    STALE = "STALE"
    EXPIRED = "EXPIRED"
    UNKNOWN = "UNKNOWN"


class DomainTTL(BaseModel):
    domain: str
    fresh_window_days: float
    recent_window_days: float
    stale_window_days: float
    description: str


class FreshnessResult(BaseModel):
    domain: str
    state: FreshnessState
    age_days: Optional[float]
    observed_at: Optional[datetime]
    ttl_days: float
    needs_refresh: bool
    description: str


class FreshnessPolicy:
    """
    Centralized freshness policy enforcing domain-specific time-to-live boundaries.
    Never scatters TTL magic numbers throughout the codebase.
    """

    # Domain TTL matrix in days
    DOMAIN_CONFIGS: Dict[str, DomainTTL] = {
        "COMPANY_PROFILE": DomainTTL(
            domain="COMPANY_PROFILE",
            fresh_window_days=7.0,
            recent_window_days=30.0,
            stale_window_days=90.0,
            description="Company firmographics, headquarters, industry, and corporate identity"
        ),
        "COMPANY_ROLE_REQUIREMENTS": DomainTTL(
            domain="COMPANY_ROLE_REQUIREMENTS",
            fresh_window_days=3.0,
            recent_window_days=7.0,
            stale_window_days=21.0,
            description="Role skill requirements, DSA expectations, and technology stacks"
        ),
        "COURSE_PRICING_AVAILABILITY": DomainTTL(
            domain="COURSE_PRICING_AVAILABILITY",
            fresh_window_days=1.0,
            recent_window_days=3.0,
            stale_window_days=7.0,
            description="Course URL reachability, pricing model, free vs paid, and active status"
        ),
        "YOUTUBE_METADATA": DomainTTL(
            domain="YOUTUBE_METADATA",
            fresh_window_days=7.0,
            recent_window_days=14.0,
            stale_window_days=45.0,
            description="YouTube playlist metadata, channel status, and view metrics"
        ),
        "PRACTICE_PROBLEMS": DomainTTL(
            domain="PRACTICE_PROBLEMS",
            fresh_window_days=14.0,
            recent_window_days=30.0,
            stale_window_days=90.0,
            description="LeetCode/GFG/HackerRank curated problem sets and difficulty tags"
        ),
        "MARKET_SIGNALS": DomainTTL(
            domain="MARKET_SIGNALS",
            fresh_window_days=7.0,
            recent_window_days=14.0,
            stale_window_days=45.0,
            description="Macro hiring volume, salary trends, and regional skill demand indices"
        ),
    }

    DEFAULT_CONFIG = DomainTTL(
        domain="DEFAULT",
        fresh_window_days=7.0,
        recent_window_days=14.0,
        stale_window_days=30.0,
        description="Default fallback freshness window"
    )

    @classmethod
    def get_config(cls, domain: str) -> DomainTTL:
        return cls.DOMAIN_CONFIGS.get(domain.upper(), cls.DEFAULT_CONFIG)

    @classmethod
    def evaluate(
        cls,
        domain: str,
        observed_at: Optional[datetime],
        custom_ttl_days: Optional[float] = None,
    ) -> FreshnessResult:
        """
        Computes the freshness state of an observed record against configured TTL boundaries.
        """
        cfg = cls.get_config(domain)
        ttl = custom_ttl_days if custom_ttl_days is not None else cfg.stale_window_days

        if not observed_at:
            return FreshnessResult(
                domain=cfg.domain,
                state=FreshnessState.UNKNOWN,
                age_days=None,
                observed_at=None,
                ttl_days=ttl,
                needs_refresh=True,
                description="Observation timestamp missing or unverified."
            )

        now = datetime.now(timezone.utc)
        ts = observed_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        age_seconds = (now - ts).total_seconds()
        age_days = max(0.0, age_seconds / 86400.0)

        if age_days <= cfg.fresh_window_days:
            state = FreshnessState.FRESH
            needs_refresh = False
            desc = f"Verified fresh ({age_days:.1f} days old; within {cfg.fresh_window_days:.0f}d window)."
        elif age_days <= cfg.recent_window_days:
            state = FreshnessState.RECENT
            needs_refresh = False
            desc = f"Recent observation ({age_days:.1f} days old; within {cfg.recent_window_days:.0f}d window)."
        elif age_days <= ttl:
            state = FreshnessState.STALE
            needs_refresh = True
            desc = f"Observation is aging/stale ({age_days:.1f} days old; refresh recommended)."
        else:
            state = FreshnessState.EXPIRED
            needs_refresh = True
            desc = f"Observation expired ({age_days:.1f} days old; exceeded TTL {ttl:.0f}d)."

        return FreshnessResult(
            domain=cfg.domain,
            state=state,
            age_days=round(age_days, 2),
            observed_at=ts,
            ttl_days=ttl,
            needs_refresh=needs_refresh,
            description=desc
        )

    @classmethod
    def is_stale(cls, domain: str, observed_at: Optional[datetime]) -> bool:
        res = cls.evaluate(domain, observed_at)
        return res.state in (FreshnessState.STALE, FreshnessState.EXPIRED, FreshnessState.UNKNOWN)

    @classmethod
    def is_expired(cls, domain: str, observed_at: Optional[datetime]) -> bool:
        res = cls.evaluate(domain, observed_at)
        return res.state in (FreshnessState.EXPIRED, FreshnessState.UNKNOWN)
