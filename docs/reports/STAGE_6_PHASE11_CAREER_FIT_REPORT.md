# Phase 11 — Stage 6: Skill-Based Career Fit & Personalized Career Intelligence Report

**Authoritative Production Verification & Technical Audit**  
**Repository:** `C:\Sanjay\Project\AI PathFinder`  
**Date:** September 2026  
**Status:** Completed, Verified & Hardened  

---

## 1. Executive Summary & Objective
Phase 11 Stage 6 establishes PathFinder's personalized career intelligence layer. It directly answers two fundamental questions for any learner:
1. **"How well does this learner currently fit this career?"**
2. **"What should this learner improve to become a stronger fit?"**

The architecture directly integrates canonical career definitions with PathFinder's existing learner intelligence engines (`SkillDAG`, `SkillGapEngine`, `MasteryEngine`, `UniversalDecisionTrace`, and Phase 8 Practical Competency records). **Zero duplicate recommendation engines were created.**

---

## 2. The 8 Explainable Fit Dimensions

| Dimension | Description | Underlying Model / Source | Statuses |
|---|---|---|---|
| `education_fit` | Evaluates academic stage, stream, and statutory course prerequisites. | `LearnerProfile.education_stage`, `education_stream`, `subjects` | STRONG, MODERATE, GAP, UNKNOWN |
| `skill_fit` | Evaluates verified competency across required career skills, weighting mandatory vs helpful. | `LearnerSkill.assessed_confidence`, `CareerSkillRequirement` | STRONG, MODERATE, GAP, UNKNOWN |
| `interest_fit` | Evaluates explicit alignment with stated career goals, preferred domains, and learning objectives. | `LearnerProfile.learning_objective`, `work_domain` | STRONG, MODERATE, UNKNOWN |
| `experience_fit` | Compares learner's declared baseline (Beginner, Intermediate, Advanced) with entry expectations. | `LearnerProfile.experience_level`, `current_role` | STRONG, MODERATE, UNKNOWN |
| `practical_fit` | Evaluates hands-on engineering scenarios and assessment attempts from Phase 8. | `LearnerProfile.practical_competencies`, `ScenarioAttempt` | STRONG, MODERATE, GAP, UNKNOWN |
| `portfolio_fit` | Evaluates verified project deliverables and public portfolio expectations for creative/technical careers. | `LearnerProfile.projects`, `practical_competencies` | STRONG, MODERATE, GAP, UNKNOWN |
| `pathway_fit` | Checks accessibility of defined multi-pathways (Direct Degree vs Bridge / Career Transition). | `CareerPathwayDefinition`, `PathwayStepDefinition` | STRONG, MODERATE, GAP, UNKNOWN |
| `career_preference_fit` | Evaluates weekly time commitment and remote compatibility against role expectations. | `LearnerProfile.weekly_hours`, `Career.remote_compatibility` | STRONG, MODERATE, GAP |

---

## 3. Strict Non-Fabrication Rule
- In accordance with platform integrity rules, missing learner data is evaluated strictly as `UNKNOWN`, with dimension score `None`.
- Unauthenticated or blank profiles receive an overall fit category of `INSUFFICIENT_DATA`, confidence `LOW`, and an overall score of `0.0`.
- The system **never** fabricates default 0% scores for unrecorded dimensions.

---

## 4. Fit Categories & Centralized Scoring Formula
Learners are classified into one of six mutually exclusive categories:
- `STRONG_FIT`: Overall normalized score $\ge 0.75$, educational prerequisites met (`STRONG`), and no statutory blockers.
- `GOOD_FIT`: Overall normalized score $0.60 - 0.74$, solid foundation with manageable skill ramp-up.
- `POTENTIAL_FIT`: Overall normalized score $0.40 - 0.59$, viable trajectory with structured learning.
- `BRIDGE_REQUIRED`: Missing prerequisite stream or foundational competency, but a structured bridge pathway is available (e.g. Graphic Designer to UI/UX, or Non-tech to Tech).
- `STRETCH_PATH`: Statutory regulatory blockers present (e.g. non-science student targeting Doctor without meeting NMC PCB mandates) or severe multi-year qualification gap.
- `INSUFFICIENT_DATA`: Missing profile data.

### Normalized Scoring Formula:
$$\text{Overall Fit Score} = \frac{\sum_{i \in \text{Evaluated}} w_i \cdot s_i}{\sum_{i \in \text{Evaluated}} w_i}$$
Where dimension weights $w_i$ are centralized:
- `skill_fit`: 0.25
- `education_fit`: 0.20
- `interest_fit`: 0.10
- `experience_fit`: 0.10
- `practical_fit`: 0.10
- `portfolio_fit`: 0.10
- `pathway_fit`: 0.10
- `career_preference_fit`: 0.05

---

## 5. Skill Evidence Breakdown (Strong, Developing, Gap)
Skills are categorized without overwriting learner records:
- **Strong**: Assessed confidence $\ge 0.75$ or self-rating Advanced/Expert.
- **Developing**: Assessed confidence $0.40 \le c < 0.75$ or self-rating Intermediate.
- **Gap**: Assessed confidence $< 0.40$ or unassessed.
- **Weighting**: Missing `HARD_REQUIREMENT` or `MANDATORY` skills carry 3x the weight of `HELPFUL` or `OPTIONAL` skills.

---

## 6. Next-Best Action Engine
Every evaluation generates actionable, evidence-based recommendations categorized by action type:
- **Learn:** Core theoretical foundation (e.g., `"Learn: Master Data Manipulation with Pandas & NumPy fundamentals in your learning roadmap."`)
- **Practice:** Adaptive problem solving (e.g., `"Practice: Solve adaptive challenges in SQL & Relational Database Design."`)
- **Build:** Real-world portfolio evidence (e.g., `"Build: Complete one end-to-end Data Scientist capstone project."`)
- **Assess:** Diagnostic verification (e.g., `"Assess: Take practical diagnostic assessment in Career Hub."`)

---

## 7. Personalized Alternatives for Learners with Gaps
When a learner targets a career that classifies as `BRIDGE_REQUIRED`, `STRETCH_PATH`, or `POTENTIAL_FIT`, the system discovers adjacent careers that capitalize on the learner's **existing verified strengths**.
- Labeled explicitly: `"Alternative based on current evidence"`
- Ranks candidate careers by overlap with the learner's current strong competencies and lower prerequisite entry barriers.

---

## 8. DecisionTrace Auditability
Every evaluation generates a `UniversalDecisionTrace` adhering to the system standard (`backend/app/engine/explainer.py`), recording:
- `decision_type`: `"career_fit_evaluation"`
- `factors`: List of `DecisionFactor` entries with weights, raw scores, and contributions.
- `evidence`: Citations to academic profile, skill mastery matrix, and practical scenario records.
- `rationale`: Transparent human-readable summary of verdict.

---

## 9. Security & IDOR Prevention
- Public career specifications remain publicly accessible.
- Learner-specific personalization routes (`/fit`, `/fit/explanation`, `/recommended-for-me`, `/alternatives-for-me`) enforce caller identity.
- **IDOR Prevention**: If a caller provides a `profile_id` belonging to another user, the API rejects the request with `HTTP 403 Forbidden` (`"Access denied: Cannot access another learner's personalized fit evaluation"`).
- Unauthenticated requests to private fit routes receive `HTTP 401 Unauthorized`.

---

## 10. API Endpoints

| Endpoint | Method | Response Schema | Description |
|---|---|---|---|
| `/api/v1/careers/{career_slug}/fit` | GET | `CareerFitResponse` | Computes 8-dimension fit, skill evidence, next actions, DecisionTrace. |
| `/api/v1/careers/{career_slug}/fit/explanation` | GET | `CareerFitExplanationResponse` | Returns detailed textual justification, why_fit, and DecisionTrace. |
| `/api/v1/careers/fit` | GET | `ClusteredCareerRecommendationsResponse` | Clusters all canonical careers into 6 fit categories for learner. |
| `/api/v1/careers/recommended-for-me` | GET | `List[RecommendedCareerFitItem]` | Ranks active careers by fit priority and overall score. |
| `/api/v1/careers/alternatives-for-me` | GET | `PersonalizedAlternativesResponse` | Discovers adjacent careers matching learner evidence when target has gaps. |

---

## 11. Persona Test Verification Results

All 6 test personas passed automated verification in `backend/tests/test_phase11_stage6_career_fit.py`:

1. **Persona 1: Class 12 PCM $\to$ AI/ML Engineer**
   - Result: `POTENTIAL_FIT` / `GOOD_FIT`
   - Verified: Math/Physics aligned, skill gaps flagged in Deep Learning, next action generated (`PASSED`).
2. **Persona 2: Commerce + Math $\to$ Data Scientist**
   - Result: `GOOD_FIT` / `BRIDGE_REQUIRED`
   - Verified: Statistics recognized as strong/developing competency (`PASSED`).
3. **Persona 3: Humanities $\to$ Graphic Designer**
   - Result: `GOOD_FIT` / `BRIDGE_REQUIRED`
   - Verified: Typography strength recognized, portfolio gap identified (`PASSED`).
4. **Persona 4: ECE Student $\to$ VLSI Hardware Engineer**
   - Result: `GOOD_FIT` / `STRONG_FIT`
   - Verified: `verilog-rtl`, `embedded-c`, and `linear-algebra` validated, education fit evaluated as `STRONG` (`PASSED`).
5. **Persona 5: Diploma Student $\to$ Cloud / DevOps Engineer**
   - Result: `GOOD_FIT` / `BRIDGE_REQUIRED`
   - Verified: Linux and Docker recognized, bridge to AWS/Kubernetes flagged (`PASSED`).
6. **Persona 6: Career Transition (Software $\to$ Data Scientist)**
   - Result: `GOOD_FIT` / `BRIDGE_REQUIRED`
   - Verified: Python, SQL, REST APIs recognized as strong transferable skills; personalized alternatives generated (`PASSED`).
7. **Security & Non-Fabrication Tests**:
   - `test_non_fabrication_unauthenticated_profile`: `INSUFFICIENT_DATA`, 0.0 score, UNKNOWN dimensions (`PASSED`).
   - `test_decision_trace_explainability`: Factors and evidence correctly traced (`PASSED`).
   - `test_security_idor_prevention`: 403 on IDOR, 401 on unauthenticated access (`PASSED`).

---

## 12. Full System Verification Counts
- **Phase 11 Unit Tests**: **43 / 43 passed (100%)**
- **Phase 10 Regression Tests**: **81 / 81 passed (100%)**
- **Total Backend Tests**: **124 / 124 passed (100%)** in 8.87s.
- **Frontend Production Build**: **`npm run build` exited with code 0 (Success)**.
  - Zero TypeScript or ESLint errors.
  - All 18 static and dynamic routes compiled and optimized.

---

## 13. Limitations & Future Roadmap
- **Market Data Freshness**: Market awareness indicators currently utilize verified industry benchmarks; live external labor market API integration will be introduced in future telemetry stages.
- **Localization**: Structured fit responses and DecisionTraces use language-agnostic identifier keys; UI string localization for Indian regional languages will be linked through Phase 11 Stage 10.
