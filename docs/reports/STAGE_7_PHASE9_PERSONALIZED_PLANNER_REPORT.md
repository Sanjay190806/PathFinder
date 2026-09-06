# 📅 Phase 9 Stage 7: Personalized Learning Planner & Adaptive Course Paths Report

**Module**: Personalized Learning Planner & Adaptive Course Paths (Phase 9 - Stage 7)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 7 delivered the **Personalized Learning Planner & Adaptive Course Paths Engine**, translating learner profiles, target careers, skill gaps (Phase 6), skill decay warnings (Phase 7), and verified learning resources (Stage 5 & 6) into structured, actionable, and mathematically bounded study schedules.

Key innovations delivered:
- **Deterministic Priority Ordering**: Evaluates urgency and sequencing via a 4-tier hierarchy:
  - Critical: Decaying core skills needing immediate reinforcement.
  - High: Mandatory missing prerequisites for target careers.
  - Medium: Secondary competencies and project execution milestones.
  - Low: General elective skills and long-term exploratory goals.
- **Strict Time Allocation & Workload Packing**: Adheres strictly to learner's stated weekly_hours budget. High-priority items are scheduled into the active 7-day matrix; tasks exceeding the weekly budget are mathematically designated as deferred_overflow_hours with transparent explainability.
- **Multidimensional Granularity**: Generates actionable schedules at 4 temporal horizons:
  - **Today's Focus**: Top 1–3 highest-leverage tasks with estimated minutes and decay flags.
  - **Weekly Schedule**: Day-by-day (Monday–Sunday) schedule matrix with rest day spacing.
  - **Monthly Projections**: Weeks 1–4 thematic progression roadmap.
  - **Next Milestone**: Concrete deliverable (e.g., project, capstone, or certified module) with clear definition of done.
- **Integrated Trust & Verification**: Every planned task links directly to a curated, verified learning resource with canonical pricing badges (100% Genuinely Free, Audit Free • Cert Optional, etc.).
- **Interactive Workspace**: A rich Next.js interface at /planner providing live recalculation, weekly overview, today's tactical cards, milestone countdown, and why-this-order explainability.

---

## 2. Architecture & Components

### 2.1 Domain & Database Layer
- **Model**: backend/app/models/planner.py -> LearnerPlan
- **Migration Script**: scripts/migrate_phase9_stage7.py
  - Columns: id, user_id, version, status, target_career_id, target_career_title, weekly_hours, plan_data (JSON), created_at, updated_at.
- **Schemas**: backend/app/schemas/planner.py
  - PlanItemOut: Task title, skill, priority, duration, resource details, verification status, and sequencing rationale.
  - DailyPlanOut: Today's actionable items, estimated total minutes, and decay warnings.
  - WeeklyDayPlanOut & WeeklyPlanOut: 7-day schedule matrix, allocated hours, and deferred overflow tracking.
  - MilestoneOut & MonthlyPlanOut: High-level milestone deliverables, target weeks, and themes.
  - FullPlannerResponse: Comprehensive plan aggregation with versioning and learner weekly budget.

### 2.2 Core Planner Engines
- **Priority Engine**: backend/app/planner/priority_engine.py
  - Evaluates priority scores using skill gap importance, decay status, and prerequisite chains.
- **Schedule Allocator**: backend/app/planner/schedule_allocator.py
  - Bounded knapsack-style packing: packs items up to weekly_hours * 60 minutes. Surfaces remaining items as deferred overflow with clear human-readable notices.
- **Daily Planner**: backend/app/planner/daily_planner.py
  - Synthesizes tactical today's focus with decay reviews prioritized first.
- **Weekly Planner**: backend/app/planner/weekly_planner.py
  - Distributes workload across 5–6 study days with built-in rest/consolidation days.
- **Milestone Planner**: backend/app/planner/milestone_planner.py
  - Maps practical projects and competency assessments into progressive monthly checkpoints.
- **Orchestrator**: backend/app/planner/planner_engine.py
  - Coordinates gap evaluation, verified resource linking, plan generation, persistence, and version incrementing.

### 2.3 API Integration
- **Router**: backend/app/api/v1/planner.py
  - GET /api/v1/planner/today: Quick tactical focus for the dashboard.
  - GET /api/v1/planner/week: Current week's 7-day schedule with overflow breakdown.
  - GET /api/v1/planner/month: 4-week thematic learning trajectory.
  - GET /api/v1/planner/next-milestone: Next capstone or project deliverable.
  - POST /api/v1/planner/recalculate: Recalculates plan based on updated weekly hours or career choice.
  - GET /api/v1/planner/history: Historical plan versions.

### 2.4 Frontend Interactive UI
- **Page**: frontend/src/app/planner/page.tsx
- **Navigation**: Linked via Desktop & Mobile navigation bars (navConfig.ts, DesktopNav.tsx, MobileNav.tsx).
- **Features**:
  - Interactive weekly study hours slider with instant re-plan button.
  - Today's Focus banner with high-contrast priority tags and direct course launch buttons.
  - 7-Day interactive schedule cards with rest day indicators.
  - Visual Milestone banner highlighting the upcoming project deliverable.
  - Explainability modal/section (Why this order?) providing transparent reasoning for the sequencing.
  - Overflow Warning Banner when selected study hours are insufficient for current gap velocity.

---

## 3. Verification & Test Results

- **Targeted Test Suite**: backend/tests/test_phase9_stage7_planner.py
  - test_stage7_priority_engine_and_overflow: Verified decay skill prioritised to Critical, gap skill to High, strictly bounded against 5 weekly hours, and overflow calculation verified.
  - test_stage7_full_planner_orchestrator: End-to-end plan generation verifying today, weekly, monthly, and milestone outputs with resource linking.
  - test_stage7_planner_api_endpoints: Verified authenticated FastAPI endpoints (/today, /week, /next-milestone, /recalculate) with 200 responses and 401 unauthenticated guard.
- **Results**: 3/3 passing tests in 0.94s.
- **TypeScript Verification**: Zero compilation errors across all frontend files.
