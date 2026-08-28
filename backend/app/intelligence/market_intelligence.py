from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta

VALID_MARKET_CATEGORIES = {
    "technology_demand",
    "emerging_skill",
    "role_demand",
    "certification_relevance",
    "skill_trend",
    "ecosystem_relevance"
}

class MarketSignal:
    def __init__(
        self,
        skill_slug: str,
        role: str,
        category: str,
        signal_value: str,
        demand_score: float,
        confidence: float,
        source: str = "local_market_fixture",
        source_type: str = "mock",
        observed_at: Optional[datetime] = None,
        source_url: Optional[str] = None
    ):
        self.skill_slug = skill_slug
        self.role = role
        self.category = category
        self.signal_value = signal_value
        self.demand_score = max(0.0, min(1.0, demand_score))
        self.confidence = max(0.0, min(1.0, confidence))
        self.source = source
        self.source_type = source_type
        self.observed_at = observed_at or datetime.now(timezone.utc)
        self.source_url = source_url

    def get_freshness_state(self) -> str:
        now = datetime.now(timezone.utc)
        ts = self.observed_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        days = (now - ts).total_seconds() / 86400.0
        if days < 30:
            return "Fresh"
        elif days < 90:
            return "Recent"
        elif days < 180:
            return "Aging"
        return "Stale"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill_slug": self.skill_slug,
            "role": self.role,
            "category": self.category,
            "signal_value": self.signal_value,
            "demand_score": self.demand_score,
            "confidence": self.confidence,
            "freshness": self.get_freshness_state(),
            "source": self.source,
            "source_type": self.source_type,
            "observed_at": self.observed_at.isoformat(),
            "source_url": self.source_url
        }

class MarketIntelligenceProvider(ABC):
    @abstractmethod
    def get_role_signals(self, role: str) -> List[MarketSignal]:
        pass

    @abstractmethod
    def get_skill_signals(self, skill_slug: str) -> List[MarketSignal]:
        pass

class MockMarketIntelligenceProvider(MarketIntelligenceProvider):
    """
    Local deterministic provider backed by structured market fixtures.
    All signals clearly indicate source_type='mock' for provenance integrity.
    """
    def __init__(self):
        now = datetime.now(timezone.utc)
        self._fixtures: List[MarketSignal] = [
            # AI / ML
            MarketSignal("python", "AI/ML Engineer", "technology_demand", "Tier 1 Core Language", 0.98, 0.95, observed_at=now),
            MarketSignal("deep-learning", "AI/ML Engineer", "technology_demand", "Foundational Deep Learning", 0.94, 0.90, observed_at=now),
            MarketSignal("transformers", "AI/ML Engineer", "emerging_skill", "High Growth Architecture", 0.96, 0.92, observed_at=now),
            MarketSignal("mlops", "AI/ML Engineer", "technology_demand", "Production Deployment", 0.88, 0.85, observed_at=now),
            
            # Cybersecurity
            MarketSignal("networking", "Cybersecurity Analyst", "technology_demand", "Core TCP/IP & Protocol Analysis", 0.95, 0.90, observed_at=now),
            MarketSignal("web-security", "Cybersecurity Analyst", "technology_demand", "OWASP & AppSec Auditing", 0.92, 0.88, observed_at=now),
            MarketSignal("pentesting", "Cybersecurity Analyst", "skill_trend", "Offensive Security Simulation", 0.89, 0.85, observed_at=now),

            # VLSI Hardware
            MarketSignal("digital-logic", "VLSI Hardware Engineer", "technology_demand", "RTL Design Fundamentals", 0.96, 0.92, observed_at=now),
            MarketSignal("linear-algebra", "VLSI Hardware Engineer", "technology_demand", "Signal Processing Mathematics", 0.85, 0.80, observed_at=now),

            # Full Stack
            MarketSignal("typescript", "Full Stack Developer", "technology_demand", "Universal Type Safety", 0.95, 0.92, observed_at=now),
            MarketSignal("react-nextjs", "Full Stack Developer", "technology_demand", "Modern Frontend Framework", 0.94, 0.90, observed_at=now),
            MarketSignal("docker", "Full Stack Developer", "ecosystem_relevance", "Containerization Standard", 0.90, 0.88, observed_at=now),

            # Data Science
            MarketSignal("sql", "Data Scientist", "technology_demand", "Essential Data Querying", 0.96, 0.95, observed_at=now),
            MarketSignal("statistics", "Data Scientist", "technology_demand", "Inference & Hypothesis Testing", 0.92, 0.90, observed_at=now),
        ]

    def get_role_signals(self, role: str) -> List[MarketSignal]:
        role_cleaned = role.strip().lower()
        return [s for s in self._fixtures if role_cleaned in s.role.lower()]

    def get_skill_signals(self, skill_slug: str) -> List[MarketSignal]:
        return [s for s in self._fixtures if s.skill_slug.lower() == skill_slug.lower()]

    def query_signals(
        self,
        role: Optional[str] = None,
        skill_slug: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[MarketSignal]:
        results = self._fixtures
        if role:
            results = [s for s in results if role.strip().lower() in s.role.lower()]
        if skill_slug:
            results = [s for s in results if s.skill_slug.lower() == skill_slug.strip().lower()]
        if category:
            results = [s for s in results if s.category.lower() == category.strip().lower()]
        return results

class MarketIntelligenceService:
    def __init__(self, provider: Optional[MarketIntelligenceProvider] = None):
        self.provider = provider or MockMarketIntelligenceProvider()

    def get_market_signals(
        self,
        role: Optional[str] = None,
        skill_slug: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        signals = self.provider.query_signals(role=role, skill_slug=skill_slug, category=category)
        return {
            "total_signals": len(signals),
            "role_filter": role,
            "skill_filter": skill_slug,
            "category_filter": category,
            "signals": [s.to_dict() for s in signals]
        }
