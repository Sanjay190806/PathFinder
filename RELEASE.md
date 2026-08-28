# PATHFINDER ? RELEASE CANDIDATE (RC 1.0)

PathFinder is an authoritative, domain-agnostic adaptive career-learning and intelligent curriculum synthesis platform.

---

## 1. Release Summary
- **Version**: 1.0.0-RC1
- **Release Status**: **PRODUCTION RELEASE CANDIDATE ? APPROVED**
- **Core Architecture**:
  - **Backend**: FastAPI + SQLAlchemy + SQLite / PostgreSQL + Pydantic v2
  - **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS + Recharts
  - **AI & Explainability**: Grounded AI Career Coach + Deterministic Fallback Engine + 6-Factor Multi-Signal Recommender
  - **Domain Scope**: Domain-Agnostic with dynamic support across AI/ML, Data Science, Full Stack, Cloud/DevOps, Cybersecurity, VLSI Hardware, and Software Engineering.

---

## 2. Core Platform Capabilities
1. **Interactive Career Domain Catalog**: Pre-registered technical tracks and extensible dynamic domain synthesis.
2. **Multi-Step Diagnostic Calibration**: Onboarding assessment and progressive skill calibration.
3. **Adaptive DAG Curriculum Generation**: Topological skill dependency graphs with prerequisite unlocking and dynamic difficulty matching.
4. **Authoritative Progress Tracking**: Backend-enforced completion persistence via `POST /api/v1/progress`.
5. **Human Growth Analytics**: Authoritative curriculum progress, study effort, skill mastery heatmaps, and learning velocity telemetry.
6. **AI Career Coach**: Real-time grounded coaching with live learner context retrieval, prompt injection defense, and validated action proposals.
7. **Transparent Explainability**: "Why Recommended" modal offering human summaries alongside mathematical multi-factor scoring breakdowns.

---

## 3. Security & Safety Posture
- **Strict Endpoint Authentication**: All private routes enforce HTTP 401 on missing or invalid JWT tokens.
- **Cross-User Data Isolation**: Zero IDOR vulnerabilities; all database operations strictly scope to `current_user.profile.id`.
- **Adversarial Prompt Defense**: Deterministic `PromptGuard` intercepts system-prompt extraction and unauthorized command attempts.
- **Safe External Links**: Enforces `target="_blank"` and `rel="noopener noreferrer"`.
- **Zero Hardcoded Secrets**: Environment-driven secret management with production safety defaults.

---

## 4. Verification Results
- **Backend Test Suite**: **77/77 PASSING** (`pytest` regression suite)
- **Frontend Production Build**: **PASS** (0 TypeScript errors, 0 ESLint errors, 11 static pages generated)
- **Zero P0 / P1 Blockers**: Clean release candidate state.
