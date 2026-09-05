# PathFinder Advanced Learning Analytics Engine
**Phase 10: Authoritative Metrics, Syllabus Accuracy & Skill Mastery Projections**

---

## 1. Principles
1. **Backend as Source of Truth**: All metrics originate from authoritative database records.
2. **Zero Fabrication**: When data is insufficient, metrics explicitly return `null` (`NOT_AVAILABLE`).
3. **Canonical Metric Registry (`metric_definitions.py`)**: Formal definitions, formulas, sources, time windows, and versions.
4. **Academic vs. Integrity Separation**: Invalidated attempts are excluded from pass rates and average scores.

## 2. Metric Projections
- **Learning Overview**: Courses completed/started, valid assessment pass rate, qualifying study hours, and learning streaks.
- **Course Progress**: Module completion counts, assessment attempts, latest score, best score, and completion timestamp.
- **Assessment Intelligence**: Valid vs. invalidated attempts, score distribution, average duration, and question accuracy.
- **Syllabus Performance**: Module, topic, and learning objective accuracy with mastery signals (`HIGH_MASTERY`, `PROFICIENT`, `DEVELOPING`, `NEEDS_REVISION`).
- **Skill Mastery & Gaps**: Bayesian synthesis, decay risk, and target role career readiness pillars.
- **Consistency & Planner**: 14-day qualifying study effort histogram and adaptive planner milestone execution.
- **Integrity Summary**: Privacy-conscious proctoring audit.
