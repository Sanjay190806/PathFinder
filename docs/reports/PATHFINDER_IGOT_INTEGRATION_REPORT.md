# PathFinder — iGOT Karmayogi Integration Implementation Report

## 1. Project Context & Objectives
The integration of **iGOT Karmayogi** represents a landmark expansion of PathFinder's learning intelligence capabilities. As India's National Programme for Civil Services Capacity Building (Mission Karmayogi), iGOT provides essential functional, behavioral, and domain competencies required by civil servants and public sector leaders.

This report summarizes the end-to-end implementation ensuring iGOT operates inside the central PathFinder intelligence engine rather than as a disconnected sub-portal.

---

## 2. Implementation Deliverables

### 2.1 Backend Data Model & Persistence
- Extended `LearningResource` (`backend/app/models/resource.py`) with:
  - `provider_id`: set to `igot_karmayogi`.
  - `source_platform`: set to `IGOT`.
  - `source_tier`: Tier 1 (Institutional & Government).
  - `competencies`: JSON array of functional/behavioral/domain competencies.
  - `topics`: JSON array of specific policy and governance subtopics.
  - `retrieved_at` & `freshness`: Lifecycle freshness metadata.

### 2.2 Canonical Taxonomy Mapper
- Built `TaxonomyMapper` (`backend/app/resources/taxonomy_mapper.py`) mapping:
  - `"Fundamentals of Public Policy"` $\to$ `["public-policy", "policy-analysis", "governance"]`
  - `"Data Driven Decision Making"` $\to$ `["data-analysis", "decision-making", "data-literacy"]`
  - `"AI Using Google Bard and ChatGPT"` $\to$ `["generative-ai", "prompt-engineering", "llms"]`
  - Eliminates duplicate skill models while preserving the rich language of civil service competencies.

### 2.3 Provider Adapter & Domain Security
- Implemented `IGOTProviderAdapter` (`backend/app/providers/igot_adapter.py`):
  - Authoritative domains enforced: `igotkarmayogi.gov.in` and `portal.igotkarmayogi.gov.in`.
  - Institutional trust weight calibrated to $1.30$.
  - 10 verified public courses populated with complete metadata, duration, competencies, and direct portal links.

### 2.4 User Interface Integration
- Enhanced Unified Course Hub (`frontend/src/app/(app)/courses/page.tsx`):
  - Dedicated **"🏛️ Tier 1: Govt & Institutional (iGOT, NPTEL)"** filter pill.
  - Provider selector includes **"🏛️ iGOT Karmayogi (Govt of India)"**.
  - Distinctive amber/gold branding badge: `🏛️ iGOT Karmayogi • Govt of India`.
  - Direct, verified external action button: **"View on iGOT Karmayogi"**.
  - Explainability callout: **"Why Recommended"** detailing civil service and governance synergy.

---

## 3. Verification & Validation Metrics

| Test Criterion | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| **Domain Whitelisting** | Accept `igotkarmayogi.gov.in`, reject spoofed domains | Accepted valid portal URLs, rejected `evil.com` | **PASS** |
| **Taxonomy Mapping** | Map competencies to canonical slugs without duplicate skills | Clean slug projection (`public-policy`, `citizen-centricity`) | **PASS** |
| **SSRF Guard** | Block private IP, loopback, and cloud metadata | Immediate rejection with descriptive error | **PASS** |
| **Governance Ranking** | iGOT ranks #1 for Public Policy & Administration queries | Fundamentals of Public Policy scored 1.0 (Top Rank) | **PASS** |
| **Tech Fairness** | Irrelevant iGOT courses do not outrank tech courses | Python/NPTEL ranked #1 for software queries | **PASS** |
| **Catalog Count** | Authoritative iGOT courses indexed | 10 verified courses active | **PASS** |
