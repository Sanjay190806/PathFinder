# Data Structures & Algorithms (DSA) Intelligence Architecture

PathFinder models a 4-tier topic-by-topic DSA ontology with prerequisite graphs and role-specific priority mapping.

## 1. DSA Ontology
- **Domains**: 8 top-level domains (Core Data Structures, Tree Structures, Graph Algorithms, Dynamic Programming, Sorting & Searching, String & Pattern Matching, Advanced Structures, Algorithmic Paradigms).
- **Topics**: 24 topics (Arrays, Hashing, Trees, Graphs, Dynamic Programming, etc.).
- **Subtopics & Concepts**: 72 subtopics and 200+ concepts with dependency graphs, difficulty classifications, and interview frequencies.

## 2. 4-Tier Provenance Hierarchy for Role Priority
DSA relevance is determined using a strict fallback hierarchy:
$$COMPANY\_ROLE \succ ROLE \succ CAREER \succ INDUSTRY$$

1. **Company Role Evidence**: Direct job specification flags from verified company postings.
2. **Canonical Role Benchmarks**: Industry standard benchmarks for canonical roles (e.g. SDE $\rightarrow$ VERY_HIGH, Backend $\rightarrow$ HIGH, Frontend $\rightarrow$ MEDIUM, DevOps $\rightarrow$ LOW).
3. **Career Category**: High-level domain expectations.
4. **Non-Software Handling**: Careers in Design, Nursing, Accounting, Civil Engineering, and Video Editing resolve strictly to `NOT_APPLICABLE` without artificial DSA demands.

## 3. Prerequisite Graph & Blocker Detection
Before recommending an advanced topic (e.g. Dynamic Programming), the prerequisite graph verifies that foundational topics (e.g. Recursion, Arrays) are satisfied. Unmastered prerequisites flag the advanced topic as `BLOCKED`.
