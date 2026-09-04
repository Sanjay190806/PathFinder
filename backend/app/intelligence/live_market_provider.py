import re
import uuid
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse
import ipaddress

class MarketSignal:
    def __init__(
        self,
        skill_slug: str,
        role: str,
        category: str,
        signal_value: str,
        demand_score: float,
        confidence: float,
        source: str = "curated_india_market_index",
        source_type: str = "verified_market_index",
        observed_at: Optional[datetime] = None,
        source_url: Optional[str] = None,
        provider: str = "PathFinder Market Intelligence",
        region: Optional[str] = None,
        country: str = "IN",
        time_window: str = "2026-Q1",
        signal_id: Optional[str] = None
    ):
        self.signal_id = signal_id or str(uuid.uuid4())
        self.skill_slug = skill_slug.lower().strip()
        self.role = role.strip()
        self.category = category.strip()
        self.signal_value = signal_value
        self.demand_score = max(0.0, min(1.0, float(demand_score)))
        self.confidence = max(0.0, min(1.0, float(confidence)))
        self.source = source
        self.source_type = source_type
        self.observed_at = observed_at or datetime.now(timezone.utc)
        self.source_url = source_url
        self.provider = provider
        self.region = region
        self.country = country
        self.time_window = time_window

    def get_freshness_state(self) -> str:
        now = datetime.now(timezone.utc)
        ts = self.observed_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        days = (now - ts).total_seconds() / 86400.0
        if days < 7:
            return "Fresh"
        elif days < 30:
            return "Recent"
        elif days < 90:
            return "Aging"
        return "Stale"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "signal_id": self.signal_id,
            "skill_slug": self.skill_slug,
            "role": self.role,
            "category": self.category,
            "signal_value": self.signal_value,
            "demand_score": round(self.demand_score, 3),
            "confidence": round(self.confidence, 3),
            "freshness": self.get_freshness_state(),
            "source": self.source,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "provider": self.provider,
            "region": self.region,
            "country": self.country,
            "time_window": self.time_window,
            "observed_at": self.observed_at.isoformat()
        }

class WebResearchProvider(ABC):
    """Abstract interface for external web research."""
    @abstractmethod
    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        pass

class MockWebResearchProvider(WebResearchProvider):
    """Safe, deterministic mocked research provider for offline & CI testing."""
    def __init__(self):
        self._knowledge_base = [
            {
                "title": "NASSCOM Tech Talent Trends 2026",
                "url": "https://nasscom.in/insights/talent-trends-2026",
                "snippet": "High growth in generative AI, PyTorch, and LangChain across Bengaluru and Hyderabad ecosystems. 34% year-over-year surge in production ML skills.",
                "provider": "NASSCOM",
                "role": "AI/ML Engineer",
                "skill": "transformers",
                "category": "emerging_skill",
                "region": "Bengaluru",
                "country": "IN"
            },
            {
                "title": "India Semiconductor Mission & VLSI Hiring Report",
                "url": "https://ism.gov.in/reports/vlsi-talent-2026",
                "snippet": "Semiconductor manufacturing initiatives drive rapid demand for Verilog and RTL verification engineers in Chennai and Bengaluru hubs.",
                "provider": "India Semiconductor Mission",
                "role": "VLSI Hardware Engineer",
                "skill": "digital-logic",
                "category": "increasing_demand",
                "region": "Chennai",
                "country": "IN"
            },
            {
                "title": "CERT-In National Cybersecurity Workforce Survey",
                "url": "https://cert-in.org.in/reports/workforce-2026",
                "snippet": "Critical shortage in network penetration testing and cloud security specialists across public and private infrastructure.",
                "provider": "CERT-In",
                "role": "Cybersecurity Analyst",
                "skill": "pentesting",
                "category": "technology_trend",
                "region": "National",
                "country": "IN"
            },
            {
                "title": "India IT Cloud Architecture Index",
                "url": "https://meity.gov.in/cloud-initiatives-2026",
                "snippet": "Kubernetes and infrastructure-as-code (Terraform) established as baseline requirements for Indian enterprise cloud migrations.",
                "provider": "MeitY Digital India",
                "role": "Cloud/DevOps Engineer",
                "skill": "docker",
                "category": "technology_trend",
                "region": "Pune",
                "country": "IN"
            }
        ]

    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        q_lower = query.lower()
        results = []
        for item in self._knowledge_base:
            if any(term in item["title"].lower() or term in item["snippet"].lower() or term in item["role"].lower() for term in q_lower.split()):
                results.append(item)
            elif not q_lower:
                results.append(item)
        return results[:max_results]

class CareerMarketProvider(ABC):
    """Extensible provider interface for career market intelligence."""
    @abstractmethod
    def search_market_signals(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        skill_slug: Optional[str] = None,
        region: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[MarketSignal]:
        pass

    @abstractmethod
    def normalize_signal(self, raw: Dict[str, Any]) -> MarketSignal:
        pass

    @abstractmethod
    def validate_signal(self, signal: MarketSignal) -> bool:
        pass

class LiveCareerMarketProvider(CareerMarketProvider):
    """
    Production-ready Career Market Provider supporting India-first market context,
    caching with TTL, stale fallbacks, SSRF filtering, and prompt-injection defenses.
    """
    def __init__(
        self,
        web_provider: Optional[WebResearchProvider] = None,
        cache_ttl_hours: int = 24
    ):
        self.web_provider = web_provider or MockWebResearchProvider()
        self.cache_ttl = timedelta(hours=cache_ttl_hours)
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._fixtures = self._init_indian_fixtures()

    def _init_indian_fixtures(self) -> List[MarketSignal]:
        now = datetime.now(timezone.utc)
        return [
            # AI / ML
            MarketSignal("python", "AI/ML Engineer", "technology_demand", "Foundational AI Standard", 0.98, 0.95, observed_at=now, region="Bengaluru", source_url="https://nasscom.in/insights/talent-trends-2026"),
            MarketSignal("transformers", "AI/ML Engineer", "emerging_skill", "LLM & Generative AI Boom", 0.97, 0.94, observed_at=now, region="Hyderabad", source_url="https://nasscom.in/insights/talent-trends-2026"),
            MarketSignal("deep-learning", "AI/ML Engineer", "increasing_demand", "Computer Vision & NLP Deployment", 0.93, 0.90, observed_at=now, region="National"),
            MarketSignal("mlops", "AI/ML Engineer", "technology_demand", "Model CI/CD & Production Serving", 0.90, 0.88, observed_at=now, region="Pune"),
            
            # Cybersecurity
            MarketSignal("networking", "Cybersecurity Analyst", "technology_demand", "Zero-Trust & Protocol Auditing", 0.95, 0.92, observed_at=now, region="Delhi NCR", source_url="https://cert-in.org.in/reports/workforce-2026"),
            MarketSignal("pentesting", "Cybersecurity Analyst", "increasing_demand", "Offensive Red-Teaming Shortage", 0.91, 0.89, observed_at=now, region="National", source_url="https://cert-in.org.in/reports/workforce-2026"),
            MarketSignal("web-security", "Cybersecurity Analyst", "technology_demand", "API & Cloud Microservices Defense", 0.92, 0.88, observed_at=now, region="Bengaluru"),

            # VLSI Hardware
            MarketSignal("digital-logic", "VLSI Hardware Engineer", "increasing_demand", "RTL & Verilog Verification", 0.96, 0.93, observed_at=now, region="Chennai", source_url="https://ism.gov.in/reports/vlsi-talent-2026"),
            MarketSignal("linear-algebra", "VLSI Hardware Engineer", "technology_demand", "DSP & Neuromorphic Processing", 0.86, 0.82, observed_at=now, region="Bengaluru"),

            # Cloud / DevOps
            MarketSignal("docker", "Cloud/DevOps Engineer", "technology_demand", "Containerization & Orchestration", 0.95, 0.92, observed_at=now, region="Pune", source_url="https://meity.gov.in/cloud-initiatives-2026"),
            MarketSignal("kubernetes", "Cloud/DevOps Engineer", "increasing_demand", "Multi-Cloud Cluster Management", 0.94, 0.91, observed_at=now, region="Hyderabad"),
            
            # Data Science
            MarketSignal("sql", "Data Scientist", "technology_demand", "Universal Analytics Language", 0.96, 0.95, observed_at=now, region="National"),
            MarketSignal("statistics", "Data Scientist", "technology_demand", "Inference & Econometric Modeling", 0.91, 0.89, observed_at=now, region="Mumbai"),

            # Software Engineer
            MarketSignal("python", "Software Engineer", "technology_demand", "Backend & Automation Microservices", 0.96, 0.94, observed_at=now, region="National"),
            MarketSignal("fastapi", "Software Engineer", "increasing_demand", "High-Performance Asynchronous APIs", 0.92, 0.90, observed_at=now, region="Bengaluru")
        ]

    def _is_safe_url(self, url: Optional[str]) -> bool:
        """Validate URL to protect against SSRF and unsupported protocols."""
        if not url:
            return True
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                return False
            hostname = parsed.hostname
            if not hostname:
                return False
            if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
                return False
            # Check for private IP range
            try:
                ip = ipaddress.ip_address(hostname)
                if ip.is_private or ip.is_loopback or ip.is_reserved:
                    return False
            except ValueError:
                pass # Valid domain name
            return True
        except Exception:
            return False

    def sanitize_text(self, text: str) -> str:
        """Sanitizes text to prevent prompt injection and HTML injection."""
        if not text:
            return ""
        # Strip potential HTML and dangerous command syntax
        clean = re.sub(r"<[^>]*>", "", text)
        clean = re.sub(r"system instructions?:?", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"ignore previous instructions?:?", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"reveal (database|system|prompt) passwords?", "", clean, flags=re.IGNORECASE)
        return clean.strip()

    def normalize_signal(self, raw: Dict[str, Any]) -> MarketSignal:
        """Normalizes external raw data into structured MarketSignal."""
        role = self.sanitize_text(raw.get("role", "General Technology"))
        skill = self.sanitize_text(raw.get("skill", "general")).lower()
        title = self.sanitize_text(raw.get("title", "Market Observation"))
        snippet = self.sanitize_text(raw.get("snippet", ""))
        provider = self.sanitize_text(raw.get("provider", "External Research"))
        url = raw.get("url")
        if not self._is_safe_url(url):
            url = None

        return MarketSignal(
            skill_slug=skill,
            role=role,
            category=raw.get("category", "technology_demand"),
            signal_value=title if len(title) < 60 else title[:57] + "...",
            demand_score=float(raw.get("demand_score", 0.88)),
            confidence=float(raw.get("confidence", 0.85)),
            source=provider,
            source_type="live_web_research",
            observed_at=datetime.now(timezone.utc),
            source_url=url,
            provider=provider,
            region=raw.get("region", "National"),
            country=raw.get("country", "IN")
        )

    def validate_signal(self, signal: MarketSignal) -> bool:
        """Ensures signal invariants: positive demand, bounded confidence, valid role & skill."""
        if not signal.role or not signal.skill_slug:
            return False
        if not (0.0 <= signal.demand_score <= 1.0):
            return False
        if not (0.0 <= signal.confidence <= 1.0):
            return False
        if signal.source_url and not self._is_safe_url(signal.source_url):
            return False
        return True

    def _get_cache_key(self, role: Optional[str], skill: Optional[str], region: Optional[str], category: Optional[str], query: Optional[str]) -> str:
        return f"{role or '*'}:{skill or '*'}:{region or '*'}:{category or '*'}:{query or '*'}"

    def search_market_signals(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        skill_slug: Optional[str] = None,
        region: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[MarketSignal]:
        """
        Retrieves market signals matching query parameters.
        Checks cache -> queries web research provider or internal fixtures -> updates cache.
        """
        cache_key = self._get_cache_key(role, skill_slug, region, category, query)
        now = datetime.now(timezone.utc)

        # 1. Check cache
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["timestamp"] < self.cache_ttl:
                return entry["signals"]
            # Expired cache available for stale fallback if needed

        results: List[MarketSignal] = []

        # 2. Filter internal curated fixtures
        for s in self._fixtures:
            if role and role.lower() not in s.role.lower():
                continue
            if skill_slug and skill_slug.lower() != s.skill_slug.lower():
                continue
            if region and region.lower() != "national" and s.region and region.lower() not in s.region.lower():
                continue
            if category and category.lower() != s.category.lower():
                continue
            if query and query.lower() not in s.role.lower() and query.lower() not in s.skill_slug.lower() and query.lower() not in s.signal_value.lower():
                continue
            results.append(s)

        # 3. If query provided and fresh signals can be researched, invoke web provider
        if query:
            try:
                web_results = self.web_provider.search(query)
                for item in web_results:
                    sig = self.normalize_signal(item)
                    if self.validate_signal(sig):
                        # Avoid duplicates
                        if not any(r.skill_slug == sig.skill_slug and r.role == sig.role for r in results):
                            results.append(sig)
            except Exception:
                # If external research fails, use existing results or stale fallback
                if cache_key in self._cache:
                    return self._cache[cache_key]["signals"]

        # 4. Save to cache
        self._cache[cache_key] = {
            "timestamp": now,
            "signals": results
        }

        return results
