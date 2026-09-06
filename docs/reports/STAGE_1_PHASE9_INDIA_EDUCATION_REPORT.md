# 🇮🇳 Phase 9 Stage 1: India Education Profile & Taxonomy Report

**Module**: India Education Taxonomy & Learner Profile (Phase 9 - Stage 1)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 1 established a centralized, authoritative Indian Education Taxonomy and extended the `LearnerProfile` domain model with rich academic and institutional credentials. The architecture strictly follows PathFinder's principles:
- **Zero hardcoded if/else rules**: Centralized catalog design with stable identifiers.
- **Hierarchical cascading**: Education Level $\rightarrow$ Broad Stream $\rightarrow$ Specialization $\rightarrow$ Qualification.
- **National & State Board Recognition**: Formal support for CBSE, CISCE/ISC, State Boards, NIOS, and International boards.
- **Academic Progression Tracking**: Captured institution types (Central Univ, State Univ, Autonomous, Deemed, Private, Polytechnic/ITI) and study year stages (1st to Final year, Graduated, Upskilling).
- **Extensible & Backward-Compatible**: Nullable fields ensuring legacy profiles operate with 0 regression.

---

## 2. Taxonomy Hierarchy & Entities

The system provides 10 normalized education tiers:
1. `secondary-school` (Classes 9–10: NCF 2023 8 broad learning areas without stream locking)
2. `higher-secondary` (Classes 11–12: Science [PCM, PCB, PCMB, CS/IP], Commerce, Humanities/Arts, Vocational, Interdisciplinary)
3. `undergraduate` (19 canonical UGC/AICTE degree families)
4. `postgraduate` (M.Tech, MCA, MBA, M.Sc, M.A., etc.)
5. `diploma-polytechnic` (AICTE Technical & Non-technical diplomas)
6. `iti-industrial-training` (Engineering & Non-engineering trades: Electrician, Fitter, COPA, Welder, Machinist, etc.)
7. `vocational-skill-education` (NSDC/PMKVY sector skill councils)
8. `professional-degree` (CA, CS, CMA, MBBS, LLB, etc.)
9. `certification` (Industry & Swayam/NPTEL credentials)
10. `other` (Custom background with free-text fallback)

---

## 3. Database Schema & Migration

### Columns Added to `learner_profiles`:
- `board`: TEXT (nullable)
- `subject_combination`: TEXT (nullable)
- `institution_type`: TEXT (nullable)
- `current_year`: TEXT (nullable)
- `subjects`: JSON (nullable)

Executed migration: `scripts/migrate_phase9_stage1.py` with idempotent verification.

---

## 4. API Endpoints

- `GET /api/v1/education/catalog`: Complete 10-level hierarchy with version metadata.
- `GET /api/v1/education/levels`: Top-level metadata with stream counts.
- `GET /api/v1/education/streams/{level_id}`: Streams filtered by education tier.
- `GET /api/v1/education/specializations/{stream_id}`: Specializations under specific streams.
- `GET /api/v1/education/boards`: Supported school & university boards.
- `GET /api/v1/education/institution-types`: Recognized institution categories.
- `GET /api/v1/education/study-years`: Academic progression year options.
- `GET /api/v1/education/search?q={query}`: Multi-attribute alias search (`CSE`, `ECE`, `PCM`, `COPA`).
- `PUT /api/v1/profile/education`: Authenticated profile update persisting all extended attributes.

---

## 5. Verification & Test Results

- `pytest backend/tests/test_phase9_stage1_education.py -v`: **6 passed / 6 tests** (100%).
- `pytest backend/tests/test_education_catalog.py -v`: **7 passed / 7 tests** (100%).
- Full regression baseline maintained with 0 regressions.
