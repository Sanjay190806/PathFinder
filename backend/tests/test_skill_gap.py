import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.skill_gap import analyze_skill_gap

def test_skill_gap_analysis():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        profile = LearnerProfile(
            skill_confidence_map={"python": 0.85, "linear-algebra": 0.30, "sql": 0.60}
        )
        goal = Goal(
            target_role="AI/ML Engineer",
            target_skills=["python", "linear-algebra", "machine-learning", "deep-learning"]
        )
        report = analyze_skill_gap(profile, goal, db)
        assert "python" in report.mastered_skills
        assert "linear-algebra" in report.missing_skills
        assert "machine-learning" in report.missing_skills
        assert len(report.priority_skills) >= 2
    finally:
        db.close()
