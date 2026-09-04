# -*- coding: utf-8 -*-
# PathFinder Comprehensive Report Data Module

DOC_TITLE = 'PATHFINDER'
DOC_SUBTITLE = 'Domain-Agnostic Adaptive Career Intelligence, Practical Competency & Employability Platform'
DOC_METADATA = [
    ('System Release Status', 'PRODUCTION READY (Phase 8 Release-Certified)'),
    ('Verified Test Baseline', '142/142 Backend Pytest Regression Tests Passing (100%)'),
    ('Frontend Production Build', 'Next.js 14.2 App Router — Clean Static Page Compilation (11 routes)'),
    ('Implementation Scope', 'Phase 6 (UI/UX) • Phase 7 (Intelligence) • Phase 8 (Experiential)'),
    ('Core Domains Certified', 'AI/ML, Cybersecurity, VLSI, Data Science, Full Stack, DevOps, SWE'),
    ('Repository Reference', 'https://github.com/Sanjay190806/PathFinder'),
    ('Release Date', 'August 2026')
]

PROBLEM_TABLE = [
    ['Static Linear Roadmaps', 'Learners waste hundreds of hours reviewing familiar concepts or hit insurmountable blockers.', 'Dynamic Topological DAGs that adaptively insert prerequisites or bypass mastered skills.'],
    ['Invisible Prerequisite Bottlenecks', 'Learners fail advanced topics (e.g. Transformers) due to unrecognized gaps in core math.', 'Prerequisite DAG evaluation that computes distance and gates advanced modules.'],
    ['Course Completion != Competency', 'Learners obtain certificates without knowing how to architect, build, or debug real code.', 'Practical Competency Engine with multi-milestone projects and rubric-graded code.'],
    ['Skill Decay Over Time', 'Knowledge fades over weeks of inactivity, causing unexpected failures in technical interviews.', 'Exponential half-life skill decay engine triggering proactive review recommendations.'],
    ['Opaque AI Hallucinations', 'Generic chatbots invent arbitrary recommendations without grounding in actual progress.', 'PromptGuard & ContextBuilder enforcing strict grounding in authoritative backend data.'],
    ['Disconnection from Job Market', 'Learners complete roadmaps that do not match current employer hiring requisitions.', 'Opportunity Match Engine scoring profiles against real job requirements and portfolio gaps.']
]

DOMAINS_TABLE = [
    ['AI/ML Engineer', 'python, deep-learning, transformers, vector-rag, mlops', 'Enterprise RAG Microservice with hybrid search and reranking.', 'Diagnose CUDA OOM and Transformer P99 latency spikes.'],
    ['Cybersecurity Analyst', 'networking, linux, web-security, cryptography, pentesting', 'Automated SOC Log Monitor parsing access bursts for attacks.', 'Investigate lateral movement via compromised SSH jump hosts.'],
    ['VLSI Hardware Engineer', 'linear-algebra, python, dsa, digital-logic, verilog', 'Pipelined 32-Bit Floating Point Arithmetic Multiplier in RTL.', 'Resolve setup/hold timing violations in synthesized modules.'],
    ['Data Scientist', 'python, sql, pandas, machine-learning, statistics', 'End-to-End Analytics Pipeline with automated feature stores.', 'Triage data drift and distribution shifts in streaming models.'],
    ['Full Stack Developer', 'typescript, react, next.js, rest-apis, docker, sql', 'Distributed Asynchronous Task Queue with exponential backoff.', 'Debug Redis connection pool exhaustion under concurrency bursts.'],
    ['Cloud / DevOps Engineer', 'linux, docker, kubernetes, aws, git-ci-cd', 'Multi-Stage GitOps CI/CD Deployment with telemetry monitoring.', 'Mitigate Kubernetes pod crash loops and memory leaks.'],
    ['Software Engineer', 'python, dsa, system-design, rest-apis, databases', 'High-Throughput Key-Value Storage Engine with write-ahead logging.', 'Mitigate cache thundering herds and lock contention in microservices.']
]

PHASE6_STAGES = [
    ['Stage 1: Design System', 'Semantic typography, accessible color tokens, badges, modals, and buttons.', 'Component audit PASS'],
    ['Stage 2: Navigation', 'Global header, role switcher, route guards, active link tracking.', 'Route testing PASS'],
    ['Stage 3: Landing & Auth', 'Feature showcase, JWT authentication, bcrypt password hashing, error boundaries.', 'Auth suite PASS'],
    ['Stage 4: Onboarding', 'Multi-step onboarding wizard calibrating target roles, current level, and weekly hours.', 'Profile flow PASS'],
    ['Stage 5: Dashboard', 'Metrics overview, active roadmap progress, next recommended actions, quick stats.', 'Dashboard PASS'],
    ['Stage 6: Interactive Graph', 'Recharts & SVG-rendered Skill DAG displaying prerequisite relationships and node states.', 'DAG rendering PASS'],
    ['Stage 7: Diagnostics', 'Skill calibration diagnostic assessments calculating baseline confidence maps.', 'Assessment PASS'],
    ['Stage 8: Resource Detail', 'Curated learning content detail, prerequisite checks, completion tracker.', 'Resource PASS'],
    ['Stage 9: Growth Analytics', 'Time-series mastery charts, weekly study pace, velocity tracking, domain coverage.', 'Analytics PASS'],
    ['Stage 10: AI Coach UI', 'Slide-over career coach interface with suggested grounded prompt action buttons.', 'Coach UI PASS'],
    ['Stage 11: Global QA', 'Full accessibility audit, keyboard navigation (Tab/Enter/Escape), responsive QA.', 'QA Matrix PASS'],
    ['Stage 12: Production Release', 'Release validation, zero P0/P1 blockers, production build clean (77/77 tests).', '77/77 Tests PASS']
]

PHASE7_STAGES = [
    ['Stage 1: Behavior Telemetry', 'Real-time telemetry event collector recording clicks, completions, assessments, and active dwell time.', 'Behavior Engine PASS'],
    ['Stage 2: Learning Velocity', 'Rolling velocity and pacing model calculating time-per-skill and consistency scores.', 'Velocity Model PASS'],
    ['Stage 3: Mastery & Decay', '6-tier mastery taxonomy and exponential half-life decay modeling recency of active practice.', 'Mastery & Decay PASS'],
    ['Stage 4: Adaptive Roadmap', 'Dynamic DAG optimizer performing prerequisite insertion, mastery bypass, and review injection.', 'Roadmap Adapter PASS'],
    ['Stage 5: Skill Gap Intelligence', 'DAG-aware prerequisite distance computation identifying critical career blockers.', 'Gap Engine PASS'],
    ['Stage 6: Market Intelligence', 'Career demand signals, emerging skill tags, and provenance-backed salary insights.', 'Market Service PASS'],
    ['Stage 7: Readiness Engine', 'Composite career readiness index (0–100) evaluating competency, prerequisites, and freshness.', 'Readiness Engine PASS'],
    ['Stage 8: Grounded AI Coach', 'Career coach grounding dynamically in backend telemetry, velocity, and readiness.', 'AI Coach Grounding PASS'],
    ['Stage 9: Personalization', 'Multi-signal recommendation engine combining goal fit, difficulty tolerance, and format.', 'Recs Engine PASS'],
    ['Stage 10: Decision Traceability', 'Universal decision trace model providing structured 8-factor mathematical explanations.', 'Explainer Engine PASS'],
    ['Stage 11: Global QA', 'Full regression pass verifying mathematical consistency and cross-engine isolation.', 'QA Matrix PASS'],
    ['Stage 12: Phase 7 Release', 'Final release certification (43/43 Phase 7 tests, 120/120 cumulative tests passing).', '120/120 Tests PASS']
]

PHASE8_STAGES = [
    ['Stage 1: Practical Competency', 'Ingests multi-type practical evidence across 6 engineering dimensions (Application, Problem Solving, Debugging, Decision Making, Tools, Discipline).', 'GET /practical/competencies\nPOST /practical/evidence'],
    ['Stage 2: Real-World Projects', 'State-machine project engine managing multi-milestone applied engineering deliverables with verification.', 'GET /projects\nPOST /projects/{id}/start\nPOST /projects/{id}/submit'],
    ['Stage 3: Engineering Scenarios', 'Production incident and architecture tradeoff simulation engine recording tradeoff choices and written reasoning.', 'GET /scenarios\nPOST /scenarios/{id}/submit\nGET /scenarios/attempts'],
    ['Stage 4: Practical Assessments', 'Rubric-graded coding and system design assessments evaluating correctness, engineering quality, robustness, and docs.', 'GET /practical-assessments\nPOST /practical-assessments/{id}/submit'],
    ['Stage 5: Portfolio & Evidence', 'Aggregates verified projects and assessments into a quantified career portfolio (0–100 quality score).', 'GET /portfolio\nPOST /portfolio/artifacts'],
    ['Stage 6: Employability Engine', 'Computes composite employability index combining readiness, practical competency, portfolio evidence, and market fit.', 'GET /employability'],
    ['Stage 7: Opportunity Intelligence', 'Curated career opportunity catalog containing job roles, internships, and open-source contributions.', 'GET /opportunities'],
    ['Stage 8: Opportunity Matching', 'Multi-dimensional match scoring against learner profile, practical competencies, and portfolio evidence.', 'GET /opportunities/matches'],
    ['Stage 9: Application Execution', 'Unified career action tracker managing job applications, deadlines, notes, and preparation action checklists.', 'GET /applications\nPOST /applications\nPATCH /applications/{id}'],
    ['Stage 10: Resume & Interview', 'ATS keyword density audit and interactive technical mock interview simulation engine.', 'POST /career-prep/resume/audit\nPOST /career-prep/interview/start'],
    ['Stage 11: Coach Integration', 'AI Career Coach grounded in complete Phase 8 experiential context with PromptGuard and ActionValidator.', 'POST /ai/chat'],
    ['Stage 12: Phase 8 Release', 'Final regression freeze certifying 142/142 tests passing with clean Next.js 14.2 production build.', '142/142 Tests PASS']
]

SECURITY_TABLE = [
    ['Unauthorized API Access', 'Data breach of private learner progress or records.', 'JWT Bearer token authentication required on all private routes (HTTP 401).'],
    ['Insecure Direct Object Reference (IDOR)', 'User A modifies or reads User B profile or portfolio.', 'All queries strictly scoped through current_user.profile.id.'],
    ['Prompt Injection Attacks', 'Leakage of internal system prompts or adversarial bypass.', 'PromptGuard pattern inspection refusing adversarial queries.'],
    ['Unauthorized AI State Mutation', 'LLM modifies mastery or project completion fraudulently.', 'ActionValidator blocking direct database writes from AI agents.'],
    ['Credential Exposure', 'API keys or database passwords leaked in code.', '100% environment-driven configuration with zero committed secrets.'],
    ['Database Inconsistency', 'Partial writes during complex multi-step adaptations.', 'Atomic SQLAlchemy transactions with explicit commit/rollback boundaries.']
]

QA_SUMMARY_TABLE = [
    ['Phase 6 UI/UX & Navigation', 'Automated Pytest + Next.js build validation', '77/77 PASS (100%)'],
    ['Phase 7 Intelligence & Decay', 'Automated unit & integration regression tests', '43/43 PASS (100%)'],
    ['Phase 8 Experiential & Projects', 'Automated end-to-end lifecycle verification', '22/22 PASS (100%)'],
    ['Cumulative Backend Suite', 'Full test suite execution via pytest', '142/142 PASS (100% in 34.7s)'],
    ['Frontend Production Build', 'next build static page generation (11 routes)', '0 Errors / 0 Warnings (PASS)'],
    ['Cross-User Data Isolation', 'Multi-tenant IDOR attack simulation tests', 'Verified (Zero cross-talk)'],
    ['Prompt Injection Defenses', 'Adversarial jailbreak and override test suite', 'Verified (100% Refusal)'],
    ['Multi-Domain Career Catalog', 'Cross-domain end-to-end test execution', '7/7 Technical Domains PASS'],
    ['Production Blockers', 'Full security and architecture audit', '0 P0 Blockers / 0 P1 Blockers']
]

TECH_STACK_TABLE = [
    ['Frontend UI', 'Next.js 14.2 (App Router), React, TypeScript', 'Server-rendered and client-hydrated reactive user interface.'],
    ['Styling & Viz', 'Tailwind CSS, Recharts, Lucide Icons', 'Accessible design system and interactive visual analytics.'],
    ['Backend API', 'FastAPI, Python 3.11, Pydantic v2', 'High-performance asynchronous REST API gateway and validation.'],
    ['Database / ORM', 'SQLAlchemy 2.0, Alembic, SQLite/PostgreSQL', 'Relational persistence with strict foreign keys and cascades.'],
    ['Security', 'JWT (python-jose), Passlib (bcrypt)', 'Stateless bearer authentication and cryptographic hashing.'],
    ['AI Provider', 'Google Gemini API / Deterministic Provider', 'Grounded career coaching with deterministic offline fallback.']
]
