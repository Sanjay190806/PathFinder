# STAGE 5 ? CAREER SKILL-GAP INTELLIGENCE REPORT

## 1. Objective
Implement a multi-tier deterministic skill-gap engine comparing demonstrated learner capabilities against target career requirements from the career catalog.

## 2. Architecture & Algorithms
- **Six-Tier Competency Taxonomy**: Unknown (0), Beginner (1), Developing (2), Competent (3), Strong (4), Mastery (5).
- **Target Role Resolution**: Dynamic lookup in `CAREER_ROLES_CATALOG` supporting AI/ML, Cybersecurity, VLSI, Data Science, Full Stack, DevOps, and Software Engineering.
- **DAG-Aware Gap Evaluation**: Computes prerequisite distances and identifies critical blockers where weak foundational skills bottleneck downstream competencies.
- **Priority Scoring**: Bounded formula weighting gap magnitude, critical blocker status, and foundational priority.

## 3. Files & Endpoints
- `backend/app/intelligence/gap_engine.py`: `CareerSkillGapEngine`.
- `backend/app/api/v1/intelligence.py`: Exposed `GET /api/v1/intelligence/skill-gaps`.
- `backend/tests/test_phase7_stage5_skill_gap.py`: 3/3 tests passing.

## 4. Verification
- Deterministic output across repeated evaluations.
- Multi-domain tests passing across multiple career paths.
