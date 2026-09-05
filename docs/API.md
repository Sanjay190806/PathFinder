# PathFinder REST API Reference
**Phase 11: Complete Career Intelligence, Taxonomy, Market & Multilingual Specifications**

---

## 1. Syllabus & Courses (Phase 10)
- `GET /api/v1/courses/{course_id}/syllabus`: Retrieve authoritative syllabus hierarchy.
- `POST /api/v1/courses/{course_id}/syllabus`: Admin creation/update of syllabus.

## 2. Assessment & Runtime (Phase 10)
- `GET /api/v1/assessments/{assessment_id}/rules`: Pre-exam rules, time limit, and attempt configuration.
- `POST /api/v1/assessments/{assessment_id}/session`: Start new or recover in-progress exam session.
- `GET /api/v1/assessment-sessions/{session_id}/questions/next`: Fetch current or next question with answer key redacted.
- `POST /api/v1/assessment-sessions/{session_id}/answers`: Submit answer with idempotency and time tracking.
- `POST /api/v1/assessment-sessions/{session_id}/pause`: Authoritatively pause exam (if permitted).
- `POST /api/v1/assessment-sessions/{session_id}/resume`: Resume paused exam with timer recalculation.
- `POST /api/v1/assessment-sessions/{session_id}/submit`: Finalize exam, evaluate score, and generate decision trace.

## 3. Proctoring & Integrity (Phase 10)
- `POST /api/v1/assessment-sessions/{session_id}/integrity-events`: Report client-debounced proctoring events.

## 4. Analytics (Phase 10)
- `GET /api/v1/analytics/overview`: Authoritative KPIs and completion rates.
- `GET /api/v1/analytics/courses`: Course progress and verified completions.
- `GET /api/v1/analytics/assessments`: Exam performance metrics.
- `GET /api/v1/analytics/modules`: Module, topic, and learning objective performance.
- `GET /api/v1/analytics/skills`: Bayesian skill mastery, decay risk, and evidence counts.
- `GET /api/v1/analytics/learning`: 14-day study effort histogram and streaks.
- `GET /api/v1/analytics/planner`: Study plan execution and milestone progress.
- `GET /api/v1/analytics/career-readiness`: Target career readiness pillars.
- `GET /api/v1/analytics/integrity`: Privacy-conscious exam monitoring audit.
- `GET /api/v1/analytics/definitions`: Canonical metric definitions and formulas.

## 5. Global Career Taxonomy & Catalog (Phase 11 Stages 1–3)
- `GET /api/v1/careers/domains`: Retrieve all 10 high-level career domains with icon and ordering.
- `GET /api/v1/careers/families?domain={domain_slug}`: Retrieve career families filtered optionally by domain.
- `GET /api/v1/careers/catalog`: Paginated canonical career catalog supporting domain, family, level, and tag filters.
- `GET /api/v1/careers/search?q={query}&language={lang}`: Full-text and keyword search across careers and native language translations.
- `GET /api/v1/careers/{career_slug}`: Comprehensive canonical detail for a specific career trajectory.
- `GET /api/v1/careers/{career_slug}/skills`: Mandatory, recommended, and emergent skill requirements.
- `GET /api/v1/careers/{career_slug}/specializations`: Career specialization tracks.
- `GET /api/v1/careers/{career_slug}/education-fit`: Evaluates learner's current education level and field fit for career.
- `GET /api/v1/careers/{career_slug}/transitions`: Transition pathways from source roles with bridge skill deltas.
- `POST /api/v1/careers/compare`: Side-by-side comparison of 2–4 careers.
- `POST /api/v1/careers/compare-matrix`: Cross-matrix feature comparison.
- `GET /api/v1/careers/{career_slug}/alternatives`: Feasible alternative roles based on shared competencies.

## 6. Career Eligibility, Requirements & Pathway Intelligence (Phase 11 Stages 4–6)
- `GET /api/v1/careers/{career_slug}/requirements`: Hard vs recommended requirements with verification authorities.
- `GET /api/v1/careers/{career_slug}/pathways`: Multi-step career roadmap definitions (milestones, weeks, prerequisites).
- `GET /api/v1/careers/{career_slug}/fit`: Personalized multi-pillar fit evaluation (skill, education, velocity, readiness).
- `GET /api/v1/careers/{career_slug}/gaps`: Gap analysis classifying critical, moderate, and minor skill deficiencies.
- `GET /api/v1/careers/{career_slug}/next-step`: Next immediate milestone recommendations with rationale.

## 7. Live Market Intelligence & Priority Ranking (Phase 11 Stages 7–8)
- `GET /api/v1/careers/{career_slug}/market`: Comprehensive market snapshot (demand, salary, hiring velocity, regions).
- `GET /api/v1/careers/{career_slug}/market/skills`: Top in-demand skills and emerging technologies from current job postings.
- `GET /api/v1/careers/{career_slug}/market/salary`: Experience-stratified salary distributions (entry, mid, senior in INR).
- `GET /api/v1/careers/{career_slug}/market/regions`: Regional hiring demand across major Indian employment hubs.
- `GET /api/v1/careers/ranked-priority?mode={EXPLORE|BALANCED|EMPLOYABILITY_FIRST}`: Ranked careers with explainable score breakdowns.
- `POST /api/v1/careers/select-target`: Authoritative target career destination selection with automatic roadmap sync.

## 8. Multilingual Career Discovery & Accessibility (Phase 11 Stage 10)
- `GET /api/v1/careers/languages`: Authoritative catalog of 12 supported Indian and global languages with direction and locale.
- `POST /api/v1/careers/languages/preference`: Persist learner primary and fallback language preference (Protected).
- `GET /api/v1/careers/{career_slug}/translations?lang={code}`: Localized career title, description, and search terms.
- `GET /api/v1/careers/{career_slug}/ai-explanation?lang={code}`: Fact-grounded AI narrative in target language with preserved Latin technical terms.

## 9. Company & Role Intelligence (Phase 12 Stages 1–3)
- `GET /api/v1/companies`: Paginated enterprise corporate registry with industry, country, and company-type filters.
- `GET /api/v1/companies/{slug}`: Full company profile, firmographics, and provenance.
- `GET /api/v1/companies/{slug}/roles`: Approved company roles offered by the target company.
- `GET /api/v1/companies/{slug}/roles/{role_slug}`: Company role details, employment type, and core signals.
- `GET /api/v1/companies/{slug}/roles/{role_slug}/dsa`: Role-specific DSA requirements and interview topics.
- `GET /api/v1/companies/{slug}/roles/{role_slug}/learner-gaps`: Learner skill gaps compared against role expectations.
- `GET /api/v1/companies/{slug}/roles/{role_slug}/next-topic`: Prerequisite-safe immediate next recommended topic.
- `GET /api/v1/companies/compare/company-gaps`: Side-by-side gap comparison across 2 target companies.

## 10. DSA Domain & Topic Hierarchy (Phase 12 Stage 2)
- `GET /api/v1/dsa/domains`: 8 top-level DSA domains.
- `GET /api/v1/dsa/topics`: All 24 DSA topics with domain filters.
- `GET /api/v1/dsa/topics/{slug}`: Topic detail with concepts, difficulty, and interview weight.
- `GET /api/v1/dsa/graph`: Complete DSA prerequisite dependency graph.

## 11. Company Learning Roadmaps (Phase 12 Stage 6)
- `GET /api/v1/company-roadmaps/generate`: Generate personalized 7-stage company-aware roadmap.
- `GET /api/v1/company-roadmaps/{roadmap_id}`: Retrieve active roadmap with prerequisite locks.
- `POST /api/v1/company-roadmaps/{roadmap_id}/switch-company`: Switch employer target, versioning roadmap and preserving progress.
- `GET /api/v1/company-roadmaps/{roadmap_id}/planner-handoff`: Handoff schedule-ready items to Phase 9 planner.

## 12. Verified Learning Resources & YouTube (Phase 12 Stages 7–8)
- `GET /api/v1/resources/courses`: Multi-filter course catalog with price classification.
- `GET /api/v1/resources/pricing-categories`: Pricing distribution (`GENUINELY_FREE`, `FREE_TO_ENROLL_PAID_CERTIFICATE`, `PAID`).
- `GET /api/v1/resources/by-dsa/{topic_slug}`: Courses mapped to a specific DSA topic.
- `GET /api/v1/resources/by-company-role/{company_slug}/{role_slug}`: Resources tailored for a specific company role.
- `GET /api/v1/resources/youtube/by-topic/{topic_slug}`: Curated educational YouTube playlists.
- `GET /api/v1/resources/practice/by-topic/{topic_slug}`: Practice problems partitioned into Easy, Medium, and Hard.

## 13. Personalized Recommendations & Dynamic Updates (Phase 12 Stages 9–10)
- `GET /api/v1/recommendations/company-role-learning`: Personalized bundled action sequence with decision trace.
- `GET /api/v1/recommendations/dsa-dashboard`: Topic-by-topic readiness dashboard.
- `GET /api/v1/dynamic-intelligence/jobs`: History of scheduled and manual refresh jobs.
- `POST /api/v1/dynamic-intelligence/refresh`: Manual trigger for company, role, course, or provider refresh.
- `GET /api/v1/dynamic-intelligence/change-events`: Auditable log of all data change events detected.
- `GET /api/v1/dynamic-intelligence/providers`: Centralized provider registry.
- `GET /api/v1/dynamic-intelligence/freshness-summary`: Freshness metrics across all entities.

