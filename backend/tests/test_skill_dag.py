import pytest
from backend.app.database import SessionLocal
from backend.app.engine.skill_graph import SkillDAG
from backend.app.models.skill import Skill, SkillPrerequisite

def test_skill_dag_acyclicity():
    db = SessionLocal()
    try:
        dag = SkillDAG(db)
        # Verify base graph is acyclic
        assert dag.validate_acyclic() is True
        cycles = dag.detect_cycles()
        assert len(cycles) == 0

        # Verify topological sort returns all skills
        order = dag.topological_sort()
        assert len(order) == len(dag.prerequisites)
    finally:
        db.close()

def test_skill_dag_cycle_detection_on_simulated_cycle():
    db = SessionLocal()
    try:
        dag = SkillDAG(db)
        # Inject an intentional cycle in in-memory prerequisites: A -> B -> C -> A
        dag.prerequisites["skill-a"] = [("skill-b", True)]
        dag.prerequisites["skill-b"] = [("skill-c", True)]
        dag.prerequisites["skill-c"] = [("skill-a", True)]

        cycles = dag.detect_cycles()
        assert len(cycles) > 0
        with pytest.raises(ValueError, match="Cycle detected in skill graph"):
            dag.validate_acyclic()
    finally:
        db.close()

def test_skill_dag_transitive_prerequisites():
    db = SessionLocal()
    try:
        dag = SkillDAG(db)
        # In seeded graph: deep-learning requires machine-learning and linear-algebra
        # machine-learning requires python and linear-algebra
        trans = dag.get_transitive_prerequisites("deep-learning")
        assert "machine-learning" in trans
        assert "linear-algebra" in trans
        assert "python" in trans
    finally:
        db.close()
