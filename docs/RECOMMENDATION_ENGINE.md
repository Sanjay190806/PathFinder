# Personalized Company-Aware Recommendation Engine

The `CompanyRecommendationService` integrates Target Company + Role Requirements + DSA Priorities + Learner Gaps + Roadmaps + Budget Preferences into bundled, actionable learning steps.

## 1. Recommendation Synthesis Pipeline
```
COMPANY + ROLE
      ↓
ROLE DSA PRIORITY (4-Tier)
      ↓
LEARNER MASTERY & GAPS (Prerequisite blocker check)
      ↓
NEXT RECOMMENDED TOPIC (Deterministic unblocked focus)
      ↓
MULTI-MODAL RESOURCE BUNDLE
   ├── Primary Resource (Best pedagogical fit)
   ├── Free Alternative (Genuinely free course / audit option)
   ├── Paid Alternative (Bootcamp / certificate option)
   ├── Curated YouTube Series (Striver / Abdul Bari / NeetCode)
   ├── Practice Set (Easy, Medium, Hard problems)
   └── Practical Assessment (Phase 10 verification)
      ↓
AUDITABLE DECISION TRACE (UniversalDecisionTrace)
```

## 2. Decision Trace Explainability
Every recommendation is accompanied by an auditable trace capturing:
- Primary milestone selected.
- Rationale explaining prerequisite safety and target company relevance.
- Evaluation factors: Role Priority, Learner Mastery %, Budget Alignment, and Language.
