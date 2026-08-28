import pytest
import uuid
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill
from backend.app.models.resource import LearningResource
from backend.app.models.progress import Progress
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.skill_gap import SkillGapEngine
from backend.app.engine.hard_constraints import HardConstraintFilter
from backend.app.engine.scorer import RecommendationScorer
from backend.app.engine.ranker import DeterministicRanker
from backend.app.engine.diversity import DiversitySelector
from backend.app.engine.sequencer import PathSequencer
from backend.app.engine.explainer import RecommendationExplainer
from backend.app.engine.fingerprint import StateFingerprinter
from backend.app.engine.recommendation_engine import RecommendationEngine
from backend.app.engine.evaluation import evaluate_recommendation_performance
from backend.app.core.weights import RECOMMENDATION_WEIGHTS

def get_demo_profile_and_goal(db):
    user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    if user and user.profile:
        goal = next((g for g in user.profile.goals if g.is_primary), user.profile.goals[0] if user.profile.goals else None)
        return user.profile, goal
    
    # Fallback create test profile and goal
    u = User(email=f"test_rec_{uuid.uuid4().hex[:6]}@example.com", hashed_password="pw", full_name="Test Rec")
    db.add(u)
    db.flush()
    p = LearnerProfile(user_id=u.id, weekly_hours=10, skill_confidence_map={"python": 0.65, "machine-learning": 0.35})
    db.add(p)
    db.flush()
    g = Goal(profile_id=p.id, title="Become an AI Engineer", target_role="AI/ML Engineer", target_skills=["python", "machine-learning", "deep-learning"])
    db.add(g)
    db.commit()
    return p, g

def test_weights_configuration():
    assert abs(sum(RECOMMENDATION_WEIGHTS.values()) - 1.0) < 1e-6
    assert RECOMMENDATION_WEIGHTS["goal_relevance"] == 0.30
    assert RECOMMENDATION_WEIGHTS["skill_gap"] == 0.25
    assert RECOMMENDATION_WEIGHTS["prerequisite"] == 0.15

def test_skill_gap_engine():
    db = SessionLocal()
    try:
        profile, goal = get_demo_profile_and_goal(db)
        gap_engine = SkillGapEngine(db)
        report = gap_engine.calculate(profile, goal)

        assert len(report.items) > 0
        for item in report.items:
            assert 0.0 <= item.current_confidence <= 1.0
            assert 0.0 <= item.target_confidence <= 1.0
            assert 0.0 <= item.gap <= 1.0
            assert 0.0 <= item.priority <= 1.0
        
        # Verify sorting: higher gaps first
        for i in range(len(report.items) - 1):
            assert report.items[i].gap >= report.items[i+1].gap or report.items[i].goal_relevance >= report.items[i+1].goal_relevance
    finally:
        db.close()

def test_hard_constraint_filter():
    db = SessionLocal()
    try:
        dag = SkillDAG(db)
        filter_svc = HardConstraintFilter(dag)
        all_resources = db.query(LearningResource).all()

        # Learner with 0 confidence in Python
        conf_map = {"python": 0.0, "linear-algebra": 0.0}
        eligible, rejections = filter_svc.filter_candidates(
            candidates=all_resources,
            learner_confidence_map=conf_map
        )
        
        # Resources requiring Python or ML must be blocked
        assert len(rejections) > 0
        blocked_slugs = [r.resource_slug for r in rejections]
        assert "deep-learning-specialization-andrew-ng" in blocked_slugs or "hands-on-ml-scikit-pytorch" in blocked_slugs

        # Completed resource must be blocked
        comp_id = eligible[0].id if eligible else all_resources[0].id
        eligible2, rejections2 = filter_svc.filter_candidates(
            candidates=all_resources,
            learner_confidence_map={"python": 0.8, "linear-algebra": 0.8, "machine-learning": 0.8, "deep-learning": 0.8},
            completed_resource_ids={comp_id}
        )
        assert comp_id not in [r.id for r in eligible2]
    finally:
        db.close()

def test_soft_time_constraint():
    db = SessionLocal()
    try:
        profile, goal = get_demo_profile_and_goal(db)
        profile.weekly_hours = 5
        
        # Resource with 14 hours should NOT be hard-blocked, but scored with pacing adjustment
        scorer = RecommendationScorer(SkillDAG(db))
        gap_report = SkillGapEngine(db).calculate(profile, goal)
        res = db.query(LearningResource).filter(LearningResource.estimated_hours >= 12.0).first()
        
        scored = scorer.score(res, profile, goal, gap_report)
        assert 0.0 <= scored.time_score <= 1.0
        assert 0.0 <= scored.composite_score <= 1.0
    finally:
        db.close()

def test_deterministic_ranking_and_stability():
    db = SessionLocal()
    try:
        engine = RecommendationEngine(db)
        profile, goal = get_demo_profile_and_goal(db)

        res1 = engine.generate(profile_id=profile.id, goal_id=goal.id, top_k=5, persist=False)
        res2 = engine.generate(profile_id=profile.id, goal_id=goal.id, top_k=5, persist=False)

        # Invariant 5 & 8: Same state -> same ranking, same scores, same fingerprint
        assert res1["fingerprint"] == res2["fingerprint"]
        ids1 = [r["resource"]["id"] for r in res1["recommendations"]]
        ids2 = [r["resource"]["id"] for r in res2["recommendations"]]
        assert ids1 == ids2
        
        scores1 = [r["score"] for r in res1["recommendations"]]
        scores2 = [r["score"] for r in res2["recommendations"]]
        assert scores1 == scores2
    finally:
        db.close()

def test_path_sequencing_pedagogical_phases():
    db = SessionLocal()
    try:
        engine = RecommendationEngine(db)
        profile, goal = get_demo_profile_and_goal(db)

        res = engine.generate(profile_id=profile.id, goal_id=goal.id, top_k=10, persist=False)
        phases = res.get("phases", [])
        assert len(phases) > 0
        
        # Verify all phase numbers are progressive 1 to 5
        phase_nums = [p["phase_number"] for p in phases]
        assert phase_nums == sorted(phase_nums)
    finally:
        db.close()

def test_structured_explanations():
    db = SessionLocal()
    try:
        engine = RecommendationEngine(db)
        profile, goal = get_demo_profile_and_goal(db)

        res = engine.generate(profile_id=profile.id, goal_id=goal.id, top_k=5, persist=False)
        for item in res["recommendations"]:
            expl = item["explanation"]
            assert "goal_relevance_score" in expl
            assert "skill_gap_score" in expl
            assert "prereq_score" in expl
            assert "difficulty_score" in expl
            assert "composite_score" in expl
            assert "human_readable_explanation" in expl
            assert len(expl["human_readable_explanation"]) > 10
            # Composite score must match
            assert abs(expl["composite_score"] - item["score"]) < 1e-4
    finally:
        db.close()

def test_evaluation_framework_metrics():
    db = SessionLocal()
    try:
        metrics = evaluate_recommendation_performance(db)
        assert metrics["evaluations_count"] > 0
        assert metrics["precision_at_k"] >= 0.70
        assert metrics["ndcg_at_k"] >= 0.70
        assert metrics["prerequisite_violation_rate"] == 0.0  # Zero prerequisite violations!
        assert metrics["recommendation_stability_rate"] == 1.0  # 100% deterministic stability
    finally:
        db.close()
