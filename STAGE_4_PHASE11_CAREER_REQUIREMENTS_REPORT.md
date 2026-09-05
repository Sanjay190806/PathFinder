# Phase 11 — Stage 4: Career Eligibility, Requirements & Pathway Intelligence Report

**Authoritative System Verification & Audit Record**  
**Date:** September 2026  
**Status:** Completed & Verified  

---

## 1. Architectural Overview & Objectives
Phase 11 Stage 4 builds the authoritative career requirements and pathway intelligence layer on top of PathFinder's Phase 9 Indian Education Taxonomy and Phase 11 Stages 1–3 Career Taxonomy.

The system deterministically answers:
1. **What does this career require?** (Education, skills, regulatory bodies, exams, experience, and portfolios).
2. **What education pathways lead to it?** (Direct, degree, diploma, ITI/vocational, bridge, and career transition).
3. **Which requirements are hard vs. recommended?**
4. **What does the learner already satisfy?**
5. **What is missing?**
6. **Is a bridge pathway required?**
7. **What are realistic alternative pathways?**

---

## 2. Provenance & Non-Fabrication Architecture
- **Statutory Authority Verification**: Statutory professions strictly reference verified authorities:
  - Medical Doctor: **National Medical Commission (NMC)** / NEET-UG.
  - Commercial Airline Pilot: **Directorate General of Civil Aviation (DGCA)** / CPL / Class 1 Medical.
  - Chartered Accountant: **Institute of Chartered Accountants of India (ICAI)** / CA Foundation, Intermediate, Final, Articleship.
  - Corporate Lawyer: **Bar Council of India (BCI)** / AIBE.
  - Licensed Electrician: **NCVT / State Electrical Licensing Board**.
- **Strict Non-Fabrication Rule**: When learner profile data is missing or unauthenticated, requirements are evaluated as `UNKNOWN` with overall status `INSUFFICIENT_DATA` and score `None`. The system **never** substitutes 0% or guesses arbitrary values.

---

## 3. Data Models & Database Seeding
- **`CareerRequirement`**:
  - Fields: `id`, `career_id`, `requirement_type` (HARD_REQUIREMENT, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE_REQUIRED), `category` (EDUCATION, SUBJECT, DEGREE, CERTIFICATION, LICENSE, SKILL, EXPERIENCE, PORTFOLIO, PROJECT, REGULATORY), `requirement_name`, `description`, `education_level`, `skill_id`, `minimum_level`, `mandatory`, `source`, `verification_status`, `country_code`, `region_code`.
- **`CareerPathwayDefinition` & `PathwayStepDefinition`**:
  - Supports multi-pathway routes (e.g. AI/ML Engineer has both Direct Degree route and Career Transition route for Software Engineers; Doctor has Regulatory Direct Route).
  - Ordered step progression (`step_number`, `step_type`, `estimated_weeks`, `skills_to_acquire`, `prerequisites`).
- **Database Count**:
  - **106** canonical Career Requirements seeded.
  - **23** Multi-Pathway Definitions seeded.
  - **77** Pathway Step Definitions seeded.

---

## 4. Endpoints Exposed
- `GET /api/v1/careers/{career_slug}/requirements`
- `GET /api/v1/careers/{career_slug}/pathways`
- `GET /api/v1/careers/{career_slug}/eligibility`

---

## 5. Verification & Test Results
- Automated unit test suite: `backend/tests/test_phase11_stage4_requirements_pathways.py`
  - `test_career_requirements_exist`: PASSED
  - `test_pilot_statutory_requirements`: PASSED
  - `test_multi_pathway_structure`: PASSED
  - `test_unauthenticated_eligibility_non_fabrication`: PASSED
  - `test_learner_eligibility_matching_pcb_student`: PASSED
  - `test_learner_eligibility_non_science_for_doctor`: PASSED
- Total: 6 passed (0 failures).
