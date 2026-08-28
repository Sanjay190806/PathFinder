# PathFinder ? System Architecture

## 1. High-Level Architecture Overview

PathFinder is built upon a layered, decoupled full-stack architecture combining deterministic recommendation engines with LLM-grounded explainability and adaptive state tracking.

```
+-------------------------------------------------------------------------------+
|                               NEXT.JS FRONTEND                                |
|  - App Router (React 18 / Next.js 14)       - Recharts & Tailwind CSS         |
|  - 6-Step Onboarding Wizard                 - Transparent Explainability Modal|
|  - Interactive 5-Phase Roadmap              - AI Learning Coach Side-Drawer   |
+---------------------------------------+---------------------------------------+
                                        | (REST APIs / JWT Bearer Auth)
+---------------------------------------v---------------------------------------+
|                               FASTAPI BACKEND                                 |
|  +-------------------------------------------------------------------------+  |
|  | API Routing Layer (/api/v1/)                                            |  |
|  | auth, profile, goals, skills, resources, learning-path, feedback, ai...  |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|  +------------------------------------v------------------------------------+  |
|  | DETERMINISTIC RECOMMENDATION & ADAPTIVE STATE ENGINE                    |  |
|  | 1. Goal & Prerequisite DAG Retrieval    5. Multi-Factor Hybrid Scorer   |  |
|  | 2. Skill Gap Vector Analysis            6. Diversity Optimization       |  |
|  | 3. Strict Hard Constraint Filtering     7. Phased Topological Sequencer |  |
|  | 4. Semantic Matching (Safe Cosine / KW) 8. Versioned Roadmap Audit     |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|  +------------------------------------v------------------------------------+  |
|  | AI REASONING & EXPLAINABILITY LAYER                                     |  |
|  | - Grounded Gemini 1.5 Flash Provider                                    |  |
|  | - Fully Offline Deterministic Fallback Engine                           |  |
|  | - Structured Explainability & Contextual AI Tutor                       |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|  +------------------------------------v------------------------------------+  |
|  | DATA PERSISTENCE & ORM LAYER (SQLAlchemy 2.0)                           |  |
|  | - SQLite (Zero-Config Hackathon / Demo Mode)                            |  |
|  | - PostgreSQL + pgvector (Production Mode)                               |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

## 2. Invariant Rules
1. **Separation of Concerns**: The LLM does NOT rank or order resources. The deterministic engine guarantees hard mathematical constraints, 0% prerequisite violations, and balanced curriculum pacing.
2. **Hard Constraints Before Scoring**: Candidates violating mandatory prerequisites ($<0.40$ confidence) are blocked before scoring occurs.
3. **Immutable Versioning**: Roadmaps are never mutated in-place; each change creates a version record with audit metadata.
