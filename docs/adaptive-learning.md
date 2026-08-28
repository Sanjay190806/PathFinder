# PathFinder ? Adaptive State & Feedback Loop

## 1. Feedback Adaptation Engine

When a learner interacts with the roadmap, their feedback directly adjusts skill confidence and triggers roadmap versioning:

- **Helpful (+ Rating ? 4)**: $+0.15$ confidence boost, $+0.05$ velocity.
- **Too Difficult**: $-0.20$ confidence reduction, triggers immediate insertion of foundational prerequisite modules into Phase 1.
- **Too Easy**: $+0.25$ confidence boost, auto-completes beginner materials and fast-tracks core topics.
- **Diagnostic Quiz Correct Answer**: $+0.35$ assessed confidence boost.
- **Diagnostic Quiz Incorrect Answer**: $-0.15$ confidence recalibration.

## 2. Versioning & Change Audit

To prevent duplicate versions, the engine computes a version hash:

$$	ext{version\_hash} = 	ext{SHA256}(	ext{PhaseNumber} : 	ext{ResourceId}_{1}, \dots)$$

If the adapted curriculum matches the current active version, no new version is created. If new items or phase shifts occur, a new `LearningPathVersion` is recorded with `RoadmapChange` audit trails.
