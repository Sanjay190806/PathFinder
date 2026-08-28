# PathFinder ? AI-Powered Personalized Learning Path Recommender

> **College Hackathon Round 2 Prototype**  
> An intelligent, adaptive learning path recommender that maps dynamic career curriculums using deterministic skill graphs, multi-factor hybrid ranking, and profile-grounded AI reasoning.

---

## ?? Key Capabilities

1. **6-Step Personalized Onboarding**: Captures Education, Career Goal, Current Skills & Self-Ratings, Weekly Commitment, and Diagnostic Quiz calibration.
2. **Deterministic Recommendation Pipeline**:
   - Skill-Gap Vector Analysis (Mastered vs Missing skills).
   - Directed Acyclic Prerequisite DAG Graph (Enforces **0% Prerequisite Violations**).
   - Hard Constraint Pre-Filtering.
   - 8-Factor Hybrid Scoring Formula ($\sum w_i = 1.0$).
   - Topological 5-Phase Progressive Curriculum Sequencing.
3. **Transparent Explainable AI**: Granular "Why this recommendation?" modal with exact mathematical factor breakdowns (Goal Relevance, Skill Gap, Readiness, Difficulty, Format, Pacing).
4. **Adaptive Feedback Loop**: Submitting feedback ("Too Difficult", "Too Easy", "Helpful") dynamically adjusts skill confidence and generates versioned roadmaps (`v1.0 -> v2.0`) with audit history.
5. **Grounded AI Learning Coach**: Real-time contextual assistant grounded in the learner's active roadmap, available hours, and catalog.
6. **Dual Database & Zero-Config Demo Mode**: Pre-seeded demo learner (Alex Mercer) for 100% offline evaluation with instant "Reset Demo" capability.

---

## ?? Quick Start (Local Setup)

### 1. Backend (FastAPI + Python 3.11+)
```bash
# From workspace root:
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at: `http://localhost:8000` (Swagger UI at `/docs`).

### 2. Frontend (Next.js 14 + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Frontend App will be live at: `http://localhost:3000`.

---

## ?? Evaluation Benchmark Suite
Run the recommendation benchmark suite across 10 diverse synthetic learner personas:
```bash
python -m backend.evaluation.evaluate
```

Run full unit and API integration tests:
```bash
python -m pytest backend/tests
```

---

## ?? System Documentation
- [Architecture Overview](docs/architecture.md)
- [Recommendation Engine & Scoring Formula](docs/recommendation-engine.md)
- [Adaptive Learning & Feedback Loop](docs/adaptive-learning.md)
- [Evaluation Benchmark Results](docs/evaluation.md)
- [Hackathon Demo Script](docs/demo-script.md)
