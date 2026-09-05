# Phase 11 — Stage 7: Live Career Market, Demand, Salary & Regional Intelligence Report

## Executive Summary
Phase 11 Stage 7 delivers an authoritative, current-data career market intelligence layer connecting PathFinder's canonical career universe with live market realities, Indian metropolitan hiring hubs, tiered data sources, and strict non-fabrication governance.

---

## 1. Core Architecture & Signal Model

### Signal Taxonomy & Model
The system introduces the `CareerMarketSignal` relational model in `backend/app/models/career.py`, indexing the following signal types:
- `DEMAND` & `DEMAND_TREND`: Macro employment demand trajectories and growth rate indices.
- `SALARY` & `SALARY_RANGE`: Compensation benchmarks categorized by experience tiers (`ENTRY`, `MID`, `SENIOR`).
- `SKILL_DEMAND` & `EMERGING_SKILL`: Technical and occupational competency frequencies mapped directly to canonical `Skill` IDs.
- `JOB_COUNT` & `HIRING_TREND`: Hiring velocity and open job index estimations.
- `REGIONAL_DEMAND`: Geographic hiring concentrations across key Indian economic zones.
- `TECHNOLOGY_TREND` & `INDUSTRY_TREND`: Cross-sector technology adoption.

### Source Priority Hierarchy
- **Tier 1 (Official / Government / Statutory)**: NASSCOM Tech Talent Surveys, Ministry of Electronics & IT (MeitY), India Semiconductor Mission (ISM), CERT-In National Cybersecurity Survey, National Medical Commission (NMC), Directorate General of Civil Aviation (DGCA), Institute of Chartered Accountants of India (ICAI), Indian Council of Agricultural Research (ICAR).
- **Tier 2 (Verified Industry Benchmarks / Approved APIs)**: Analytics India Industry Survey, Media Entertainment Skills Council (MESC), Automotive Skills Development Council (ASDC), Design In Tech India Survey, SIAM.
- **Tier 3 (Secondary / Aggregated Scrapes)**: Auxiliary job index indicators.

### Freshness & TTL Computation
- **`FRESH`**: Observed within 7 days.
- **`RECENT`**: Observed within 30 days.
- **`STALE`**: Observed between 30 and 90 days.
- **`EXPIRED`**: Observed > 90 days ago (or past custom signal TTL).
- **`UNKNOWN`**: Missing observation timestamp or signal not present in index.

---

## 2. India-First Salary & Regional Intelligence

### Metropolitan Hubs Covered
- **Bengaluru**: AI/ML, Semiconductor Design, Cloud Hyperscalers, Product Startups.
- **Hyderabad**: Global Capability Centers (GCCs), Pharma, Semiconductor Verification, Media.
- **Mumbai**: BFSI, Advertising, Media Production, Corporate Legal & Chartered Accountancy.
- **Delhi NCR**: E-Commerce, Public Infrastructure, Defense & Cyber Governance, Aviation Hub (IGI).
- **Pune**: Automotive R&D, Heavy Machinery, Enterprise Cloud Services.
- **Chennai**: Hardware Manufacturing, SaaS, Medical Super-Specialties, Automotive OEM.

### Salary Benchmarking (INR • Annual LPA)
- Strict non-fabrication rule: If compensation data is not verified for a career, `available = False`, `data_quality = "UNKNOWN"`, and numeric values are returned as `None`.
- Supported experience tiers:
  - **Entry Level (0–2 years)**: Junior / Associate roles.
  - **Mid Level (3–6 years)**: Core individual contributors and technical leads.
  - **Senior Level (7+ years)**: Staff, principal, and practice heads.

---

## 3. Endpoints Implemented

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/careers/{career_slug}/market` | Complete market snapshot (demand, salary, regions, skills, DecisionTrace) |
| `GET` | `/api/v1/careers/{career_slug}/market/skills` | Top in-demand and surging emerging skills |
| `GET` | `/api/v1/careers/{career_slug}/market/salary` | Tiered salary breakdown across experience levels |
| `GET` | `/api/v1/careers/{career_slug}/market/regions` | Indian metropolitan demand distribution |

---

## 4. Verification & Audit Results
- **Dedicated Test Suite**: `backend/tests/test_phase11_stage7_market_intelligence.py` (8 tests passing).
- **Database Migration**: `scripts/migrate_phase11_stage7.py` successfully seeded 225 canonical market signals.
- **DecisionTrace Explainability**: Fully integrates `UniversalDecisionTrace` recording factor weights, raw scores, contributions, reasons, and evidence provenance.
