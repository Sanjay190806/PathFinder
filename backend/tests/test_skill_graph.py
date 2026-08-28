import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.engine.skill_graph import SkillDAG

def test_skill_graph_prerequisites():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        dag = SkillDAG(db)
        # Deep learning requires machine learning and linear algebra
        prereqs = [p[0] for p in dag.get_prerequisites("deep-learning")]
        assert "machine-learning" in prereqs
        assert "linear-algebra" in prereqs

        # Test evaluation when missing prerequisites
        is_sat, avg_c, missing = dag.evaluate_prerequisite_readiness(
            "deep-learning",
            {"machine-learning": 0.20, "linear-algebra": 0.20}
        )
        assert not is_sat
        assert "machine-learning" in missing
        assert "linear-algebra" in missing

        # Test evaluation when satisfied
        is_sat_ok, avg_c_ok, _ = dag.evaluate_prerequisite_readiness(
            "deep-learning",
            {"machine-learning": 0.80, "linear-algebra": 0.75}
        )
        assert is_sat_ok
        assert avg_c_ok >= 0.70
    finally:
        db.close()
