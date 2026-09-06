# PHASE 12 — STAGE 3: COMPANY -> ROLE -> SKILL MAPPING & GROUNDED REQUIREMENT INTELLIGENCE REPORT

## 1. Executive Summary
- **Phase**: 12 (Targeted Employability, Company & DSA Intelligence)
- **Stage**: 3 (Company -> Role -> Skill Mapping & Grounded Requirement Intelligence)
- **Status**: Complete & Verified
- **Scope**: Multi-tier grounded role requirement profiles, verified skill requirements, DSA difficulty targets, technology stack specifications, interview topics with weights, strict 4-tier provenance resolution, freshness audits, personalized learner-fit scoring, and Next.js role specification interface.

---

## 2. Multi-Tier Provenance Hierarchy & Conflict Resolution
PathFinder strictly enforces an evidence-based 4-tier requirement hierarchy:
1. **Tier 1 — CompanyRole Verified (`TIER_1_COMPANY_VERIFIED`)**:
   - Highest priority. Extracted directly from verified employer hiring specifications (e.g. Google SWE, Amazon SDE Bar Raiser, Nvidia Silicon Architecture).
   - Provenance tag: `Verified Employer Job Specification`, Confidence: `1.0`.
2. **Tier 2 — Generic Role Profile (`TIER_2_GENERIC_ROLE`)**:
   - Cross-company standard for the role title.
3. **Tier 3 — Canonical Career Requirement Baseline (`TIER_3_CAREER_FALLBACK`)**:
   - Phase 11 Canonical `CareerSkillRequirement` mapping if role lacks verified role-level overrides.
   - Provenance tag: `Canonical Career Requirement Baseline`, Confidence: `0.7`.
4. **Tier 4 — Industry Baseline (`TIER_4_INDUSTRY_BASELINE`)**:
   - Foundational baseline requirements.

### Strict Non-Guessing Policy
- Unverified, AI-guessed, or unvalidated requirements are **never** flagged as `VERIFIED`.
- Conflict resolution: Higher tiers strictly override lower tiers; fallback occurs only when higher-tier requirements are absent.
- Freshness decay: Records track `days_since_verified` and status (`FRESH` < 180 days, `ACCEPTABLE` < 365 days, `NEEDS_REFRESH` > 365 days).

---

## 3. Seeded Grounded Role Catalog
- **Role Skill Requirements Seeded**: 14 across top enterprise roles (Google, Amazon, Nvidia, Zerodha, etc.)
- **Role DSA Requirements Seeded**: 17 with explicit difficulty targets (`HARD`, `MEDIUM`, `EASY`)
- **Role Technology Stack Requirements Seeded**: 24 covering languages, frameworks, databases, cloud, and EDA tools
- **Role Interview Topics Seeded**: 15 with weights (1.0x - 2.0x) and structured focus areas.

---

## 4. API Endpoints Built & Verified
1. `GET /api/v1/companies/{company_slug}/roles/{role_slug}` — Populated role detail including verified skill, DSA, tech, and interview requirements.
2. `GET /api/v1/companies/{company_slug}/roles/{role_slug}/requirements-profile` — Multi-tiered grounded requirement profile with provenance and freshness metadata.
3. `GET /api/v1/companies/{company_slug}/roles/{role_slug}/learner-fit/{learner_id}` — Evidence-based learner fit score, readiness tier (`INTERVIEW_READY`, `MODERATE_ALIGNMENT`, `DEVELOPMENT_REQUIRED`), identified skill gaps, and interview prep targets.

---

## 5. Automated Test Suite
- **Test File**: `backend/tests/test_phase12_stage3_company_skill_mapping.py`
- **Result**: 5/5 tests passing (100% pass rate)
  - `test_get_role_requirements_profile_google_swe` (PASSED)
  - `test_get_role_requirements_profile_nvidia_vlsi` (PASSED)
  - `test_get_role_requirements_profile_zerodha` (PASSED)
  - `test_role_detail_requirements_populated` (PASSED)
  - `test_learner_fit_calculation` (PASSED)

---

## 6. Frontend Build Verification
- **Route Enhanced**:
  - `/companies/[slug]/roles/[roleSlug]` — Multi-section blueprint showcasing Grounded Skills, DSA Benchmarks with direct links to the DSA curriculum, Technology Stack, Interview Topics, and Personalized Learner Fit Analysis.
- **Build Status**: Clean production build (`npm run build`), 20/20 routes compiled with 0 errors.
