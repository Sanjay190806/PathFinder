import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.resource import LearningResource
from backend.app.engine.skill_gap import analyze_skill_gap
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.scorer import score_resource_candidate

def test_hybrid_scoring_bounds():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        res = db.query(LearningResource).first()
        profile = LearnerProfile(weekly_hours=10, difficulty_tolerance=0.5)
        goal = Goal(title="AI/ML Engineer", target_role="AI/ML Engineer", target_skills=["python", "machine-learning"])
        gap_report = analyze_skill_gap(profile, goal, db)
        skill_dag = SkillDAG(db)

        scored = score_resource_candidate(res, profile, goal, gap_report, skill_dag)
        assert 0.0 <= scored.composite_score <= 1.0
        assert 0.0 <= scored.goal_relevance_score <= 1.0
        assert 0.0 <= scored.skill_gap_score <= 1.0
        assert 0.0 <= scored.prereq_score <= 1.0
        assert len(scored.reasons) > 0
    finally:
        db.close()
