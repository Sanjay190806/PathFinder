# PathFinder ? Hybrid Recommendation Engine

## 1. 9-Stage Recommendation Pipeline

```
[Learner Profile + Goal]
          ?
          ?
1. Target Skill & Prerequisite Expansion
          ?
          ?
2. Candidate Resource Retrieval (Catalog Filter)
          ?
          ?
3. Skill Gap Vectorization (Mastered vs Missing)
          ?
          ?
4. Hard Constraint Pre-Filtering (Prerequisite Confidence ? 0.40)
          ?
          ?
5. Multi-Factor Deterministic Hybrid Scoring (Weights ? = 1.0)
          ?
          ?
6. Diversity & Provider Selection
          ?
          ?
7. Topological Phased Curriculum Sequencing (Phases 1-5)
          ?
          ?
8. Granular Deterministic Explainability Payload Synthesis
          ?
          ?
9. Version Hash Generation & Atomic Persistence
```

## 2. Mathematical Scoring Formula

Each candidate resource $r$ receives a composite score $S(r) \in [0.0, 1.0]$:

$$S(r) = \sum_{i=1}^{8} w_i \cdot s_i(r)$$

Where $\sum_{i=1}^8 w_i = 1.00$:

| Weight | Factor | Weight Value | Description |
| :--- | :--- | :--- | :--- |
| $w_1$ | **Goal Relevance** | 0.30 | Role and career alignment |
| $w_2$ | **Skill Gap Priority** | 0.25 | Coverage of unmastered target skills |
| $w_3$ | **Prerequisite Readiness** | 0.15 | Average confidence in required precursors |
| $w_4$ | **Difficulty Calibration** | 0.10 | Pacing match against learner tolerance |
| $w_5$ | **Format Preference** | 0.08 | Alignment with video/hands-on/project preferences |
| $w_6$ | **Time / Pacing Fit** | 0.05 | Fit within weekly allocated hours |
| $w_7$ | **Engagement & Velocity** | 0.04 | Past velocity and feedback bonus |
| $w_8$ | **Diversity Bonus** | 0.03 | Penalizes consecutive duplicate providers |
