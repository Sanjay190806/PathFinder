# PathFinder Assessment Engine Architecture
**Phase 10: Complete Adaptive Assessment, Blueprints & Secure Exam Runtime**

---

## 1. Overview
The PathFinder Assessment Engine is an India-first, domain-agnostic, server-authoritative assessment runtime. It seamlessly handles practice evaluations, module checkpoints, and high-stakes certification exams.

## 2. Core Subsystems

### A. Assessment Blueprints (`blueprint_engine.py`)
- Authoritative mapping of syllabus modules, topics, and Bloom's taxonomy objectives to exam specifications.
- Configurable difficulty distribution (Beginner, Intermediate, Advanced) and question type constraints.
- Formal coverage validation ensuring that every exam comprehensively samples the underlying syllabus.

### B. Adaptive Question Selector (`adaptive_selector.py`)
- Real-time Item Response Theory (IRT) & Bayesian difficulty adaptation.
- Dynamically selects questions based on ongoing learner correctness while preventing oscillation.
- Strictly adheres to blueprint constraints (does not over-sample single topics or violate difficulty quotas).

### C. Secure Exam Runtime (`exam_runtime.py`)
- **Backend-Authoritative Timers**: Server controls session duration, expiration, and pause allowances (`max_pause_seconds`, `max_pauses_allowed`).
- **Answer Key Secrecy**: Correct answers and explanations are completely redacted from learner payloads during an active exam.
- **Idempotent Answer Submission**: Guards against double-clicks, network retries, and race conditions.
- **Navigation Policies**: Supports both `FREE_NAVIGATION` and `LOCK_AFTER_SUBMISSION`.

### D. Assessment Evaluation & Grading
- Backend owns `marks_awarded` and `max_marks`.
- Computes percentage, pass/fail status, and syllabus module/topic breakdowns from raw marks.
- Produces immutable result summaries and a `UniversalDecisionTrace`.
