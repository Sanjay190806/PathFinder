# 📚 Phase 9 Stage 5: Verified Course & Learning Resource Discovery Report

**Module**: Verified Learning Resource Discovery Engine (Phase 9 - Stage 5)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 5 established the **Verified Course & Learning Resource Discovery Engine**, allowing learners to discover current, vetted learning resources combining their educational background, target career role, skill gaps, preferred Indian language, and strict free/paid criteria.

- **Multi-Tier Source Hierarchy**: Classifies resources into Tier 1 (Gov/Institutional: NPTEL, SWAYAM), Tier 2 (Tech Providers: Microsoft, AWS, Google), Tier 3 (EdTech: freeCodeCamp, MIT OCW, Coursera), and Tier 4 (Curated YouTube Educational Playlists).
- **Strict Free vs. Paid Taxonomy**: Strictly prevents false "free" claims. Distinguishes `GENUINELY_FREE` (no paywall, zero learning cost) from `FREE_TO_ENROLL_PAID_CERTIFICATE` (audit/learning free, proctored certificate optional/paid) and `YOUTUBE_FREE_CONTENT`.
- **Indian Regional Language Prioritization**: Supports native educational content in Tamil, Hindi, Telugu, Kannada, etc., boosting language-matched resources in personalization ranking.
- **Skill-Gap-Driven Ranking**: Connects directly with Phase 7 `CareerSkillGapEngine` to prioritize resources that close active unmastered skill gaps.
- **Deduplication**: Enforces deduplication using `(provider, external_id)` and canonical normalized URLs.

---

## 2. Architecture & Components

### 2.1 Extended Database Schema & Models
- **Files**:
  - `backend/app/models/resource.py`: Extended `LearningResource` with `language`, `price_type`, `learning_cost`, `certificate_cost`, `subscription_required`, `free_learning`, `free_certificate`, `verification_status`, `verification_method`, `last_verified_at`, `canonical_url`, `source`, `source_tier`, `external_id`.
  - `backend/app/models/profile.py`: Added `preferred_language = Column(String(50), default="English")`.
  - `scripts/migrate_phase9_stage4_6.py`: Zero-downtime database migration updating `pathfinder.db`.

### 2.2 Curated & Multi-Tier Resource Catalog
- **File**: `backend/app/core/resource_catalog_extended.py`
  - Canonical registries for:
    - Tier 1: NPTEL IIT Madras (Python), NPTEL IIT Kharagpur (Deep Learning), SWAYAM (DBMS).
    - Tier 2: Microsoft Learn (Python), AWS Skill Builder (Cloud Practitioner).
    - Tier 3: freeCodeCamp (Relational Databases & SQL).
    - Tier 4: High-quality curated YouTube playlists in Tamil, Hindi, Telugu, and English.

### 2.3 Resource Discovery Engine
- **File**: `backend/app/resources/resource_discovery_engine.py`
  - Merges extended catalog with database resources.
  - Multi-signal scoring:
    $$\text{Score} = \text{Quality} + \text{Language Boost} (0.25) + \text{Gap Boost} (0.35) + \text{Career Boost} (0.15) + \text{Tier Boost} (0.10)$$
  - Returns explainable `recommendation_reasons` for every card.

### 2.4 API Layer
- **File**: `backend/app/api/v1/resources.py`
  - `GET /api/v1/resources/discover`: Public query endpoint with filters for `skill`, `career`, `language`, `price`, `difficulty`, `resource_type`, and `provider`.
  - `GET /api/v1/resources/recommendations`: Authenticated endpoint personalizing resource recommendations using current user's profile and active skill gaps.
  - Preserved backward compatibility for `GET /api/v1/resources` and `GET /api/v1/resources/{resource_id}`.

---

## 3. Verification & Test Results

- **Targeted Test Suite**: `backend/tests/test_phase9_stage5_resource_discovery.py`
  - `test_stage5_resource_catalog_integrity_and_tiers`: Verified catalog registry integrity across all 4 tiers.
  - `test_stage5_skill_and_career_matching`: Verified exact career role and skill filtering.
  - `test_stage5_language_prioritization_tamil_and_hindi`: Verified ranking boost for Tamil and Hindi educational resources.
  - `test_stage5_price_filtering_genuinely_free_vs_paid`: Verified strict separation of genuinely free from paid certificates.
  - `test_stage5_youtube_and_institutional_distinction`: Verified metadata labeling for YouTube vs. NPTEL courses.
  - `test_stage5_deduplication_by_provider_and_id`: Verified no duplicate resources in catalog.
  - `test_stage5_api_discover_and_recommendations`: Verified public discover route and authenticated personalized recommendations.
  - `test_stage5_multi_domain_scenarios`: Verified domain behavior across AI/ML, VLSI Hardware, and Cloud/DevOps.
  - **Result**: **8 passed / 8 tests** (100%).

---

## 4. Limitations & Scope Boundary
- Third-party YouTube videos require on-demand link checks to ensure ongoing availability.
- Stage 6 introduces the dedicated Trust & Verification Service (`ResourceVerifier`) to actively validate links and pricing integrity.
