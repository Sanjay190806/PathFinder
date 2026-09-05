# Phase 11 — Stage 8: Personalized Career Ranking & Priority Recommendation Engine Report

## Executive Summary
Phase 11 Stage 8 establishes the authoritative multi-signal Career Priority Ranking Engine (`CareerPriorityRankingEngine`), bridging 8-dimension learner fit (Phase 11 Stage 6), live market viability (Phase 11 Stage 7), and learner goals with primary target preservation and domain diversity controls.

---

## 1. Core Architecture & Engine Reuse

### Zero Duplicate Engines
Stage 8 directly connects:
- `CareerPersonalizationEngine`: 8-dimension fit evaluation (`education_fit`, `skill_fit`, `interest_fit`, `experience_fit`, `practical_fit`, `portfolio_fit`, `pathway_fit`, `career_preference_fit`).
- `CareerMarketIntelligenceService`: Stage 7 demand trajectories, salary competitiveness, and regional depth.
- `SkillGapEngine` & `SkillDAG`: Competency prerequisite resolution and gap detection.
- `UniversalDecisionTrace`: Explainable ranking factor breakdowns.

### Primary Goal Preservation Rule
When a learner selects a target career (in their profile or active goal), the ranking engine preserves that career as their `is_primary_goal = True` anchor. Even if another catalog role scores higher due to market hype or broader skill overlap, the learner's chosen objective is highlighted and prioritized at the top of their workspace.

---

## 2. Goal Modes

The ranking engine supports 5 adaptive goal modes:
1. **`EXPLORE`** (Default): Broad multi-domain discovery; balances fit (65%), market viability (30%), and preferences (5%) with strict domain diversity caps.
2. **`TARGET_CAREER`**: Focuses on the learner's primary chosen destination; ranks the primary role first, followed by immediate stepping stones, adjacent specializations, and bridge routes.
3. **`CAREER_CHANGE`**: Designed for career pivoters; prioritizes transferable skill overlap, lower transition friction, and accessible bridge pathways.
4. **`FIRST_CAREER`**: Designed for early-career students; weights academic prerequisite alignment, foundational competencies, and entry-level accessibility.
5. **`SKILL_BASED`**: Pure competency matching; strictly maximizes current skill overlap without applying domain caps.

---

## 3. Career Clusters & Diversity Filtering

### 5 Priority Clusters
- **`TOP_FIT`**: Composite Priority Score $\ge 0.75$ with minimal or no academic blockers.
- **`STRONG_OPTIONS`**: Composite Priority Score $\ge 0.60$.
- **`POTENTIAL_OPTIONS`**: Composite Priority Score $\ge 0.45$.
- **`BRIDGE_OPTIONS`**: Strong aptitude/interest but statutory exam or certification bridge is required.
- **`STRETCH_OPTIONS`**: Significant prerequisite or skill gap requiring extended roadmap preparation.

### Domain Diversity Quotas
To prevent single-domain monopolization (e.g. tech roles crowding out all other professions), the engine enforces `max_per_domain` (default: 2) in top recommendations across all modes except `SKILL_BASED`.

---

## 4. Endpoints Implemented

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/careers/ranked-priority` | Personalized priority ranked career recommendations with goal modes, cluster breakdown, and DecisionTrace |
| `POST` | `/api/v1/careers/select-target` | Records target destination selection with provenance source and updates profile/goal |

---

## 5. Verification & Audit Results
- **Dedicated Test Suite**: `backend/tests/test_phase11_stage8_career_ranking.py` (8 tests passing).
- **Persona Testing**: CS undergraduate, medical aspirant, creative designer, and unauthenticated anonymous learner personas validated.
- **Explainability**: DecisionTrace records mode weighting, target preservation, domain diversity, and market alignment.
