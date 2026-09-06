# PathFinder Multi-Source Learning Provider Architecture

## 1. Architectural Architecture Overview

The PathFinder Learning Provider subsystem provides an extensible, modular adapter architecture capable of indexing, validating, and harmonizing courses across diverse international and national educational ecosystems.

```
                  ┌────────────────────────────────────────┐
                  │       ResourceDiscoveryEngine          │
                  │ (Deterministic Multi-Signal Ranking)   │
                  └───────────────────┬────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │           ProviderRegistry              │
                 │   (Dispatching, Tier Rules & Metadata)  │
                 └────────────────────┬────────────────────┘
                                      │
      ┌─────────────────┬─────────────┴───────┬──────────────────┐
      │ Tier 1: Govt    │ Tier 2: Tech        │ Tier 3: EdTech   │ Tier 4: Video
      ▼                 ▼                     ▼                  ▼
┌──────────────┐ ┌───────────────┐     ┌──────────────┐   ┌───────────────┐
│ iGOT Adapter │ │ Microsoft     │     │ Coursera     │   │ YouTube       │
│ NPTEL Adapter│ │ Google Cloud  │     │ edX          │   │ Practice      │
│ SWAYAM       │ │ AWS Builder   │     │ Udemy        │   │ Service       │
└──────────────┘ │ Cisco / IBM   │     └──────────────┘   └───────────────┘
                 └───────────────┘
```

---

## 2. The 4-Tier Provider Classification Framework

| Tier Level | Category Description | Providers Included | Institutional Trust Weight | Primary Objective |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Government & Academic Institutions** | iGOT Karmayogi, NPTEL (IITs/IISc), SWAYAM | $1.25 - 1.30$ | Authoritative certifications, academic rigor, public governance standards |
| **Tier 2** | **Official Technology Vendors** | Microsoft Learn, Google Cloud, AWS Skill Builder, Cisco Networking Academy, IBM SkillsBuild | $1.20$ | Industry-standard cloud, enterprise software, network engineering, and AI skills |
| **Tier 3** | **Global Massive Open Online Courses (MOOCs)** | Coursera, edX, Udemy, freeCodeCamp | $1.10 - 1.15$ | Broad career curricula, university partnerships, flexible modular content |
| **Tier 4** | **Verified Video & Community Learning** | Curated YouTube Series & Playlists | $1.05$ | Visual walkthroughs, project builds, targeted problem solving |

---

## 3. The `LearningProviderAdapter` Interface

All adapters inherit from `LearningProviderAdapter` in `backend/app/providers/base.py`:

```python
class LearningProviderAdapter(ABC):
    provider_id: str
    provider_name: str
    source_platform: str
    source_tier: int
    official_domains: List[str]
    trust_weight: float = 1.0

    @abstractmethod
    def discover_courses(self, **kwargs) -> List[Dict[str, Any]]: ...

    @abstractmethod
    def get_course_by_id(self, external_id: str) -> Optional[Dict[str, Any]]: ...

    @abstractmethod
    def get_course_url(self, external_id: str) -> str: ...

    def is_official_url(self, url: str) -> bool:
        """Enforces domain whitelisting to prevent SSRF and phishing."""
        ...
```

---

## 4. Provider Registry Specification

The `ProviderRegistry` (`backend/app/providers/registry.py`) operates as a central singleton:
- **Registration**: Auto-registers all 12 default provider adapters.
- **Provider Resolution**: Dispatches queries by ID (`get_adapter(provider_id)`) or URL hostname (`get_adapter_by_url(url)`).
- **Domain Guard**: Enforces that external links strictly match known official domains before indexing or presenting to users.
- **Diagnostics**: Supplies real-time operational status and metrics to the `/api/v1/resources/providers` and `/api/v1/resources/diagnostics` endpoints.
