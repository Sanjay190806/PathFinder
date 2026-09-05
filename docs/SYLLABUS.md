# PathFinder Syllabus Intelligence Architecture
**Phase 10: Canonical Course Syllabus, Module Decomposition & Learning Objectives**

---

## 1. Overview
The Syllabus Intelligence system models course structures across any educational domain (AI/ML, Data Science, Full Stack, Core Engineering, Finance, etc.) into a hierarchical, machine-actionable ontology.

## 2. Hierarchy Model
```
CourseSyllabus (versioned, course-linked)
  └── SyllabusModule (ordered, weighted)
        └── SyllabusTopic (competency-focused)
              └── LearningObjective (Bloom's taxonomy: Understand, Apply, Analyze, Evaluate)
```

## 3. Provenance & Verification
- Syllabus sources: `OFFICIAL_PROVIDER`, `INSTITUTION`, `COURSE_METADATA`, `AI_ASSISTED_EXTRACTION`, or `MANUAL_ADMIN`.
- Explicit verification states: `VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`.
- Version-controlled: Each syllabus update increments `version` and tracks `retrieved_at` and `verified_at`.

## 4. Assessment Integration
- Every assessment question links directly to a `module_id`, `topic_id`, and `objective_id`.
- Enables precise performance reporting and diagnostic skill-gap identification.
