import pytest
import uuid
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.resource import LearningResource
from backend.app.models.learning_path import LearningPath, LearningPathVersion, RoadmapChange
from backend.app.adaptive.adaptive_engine import AdaptiveEngine
from backend.app.adaptive.state_updater import AdaptiveStateUpdater
from backend.app.adaptive.change_detector import ChangeDetector
from backend.app.adaptive.config import PREREQUISITE_THRESHOLD

def get_or_create_test_learner(db, email_prefix="adapt_test"):
    unique_email = f"{email_prefix}_{uuid.uuid4().hex[:6]}@example.com"
    user = User(email=unique_email, hashed_password="pw", full_name="Adaptive Tester")
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        weekly_hours=10,
        difficulty_tolerance=0.50,
        skill_confidence_map={"python": 0.65, "machine-learning": 0.35, "deep-learning": 0.20}
    )
    db.add(profile)
    db.flush()

    goal = Goal(
        profile_id=profile.id,
        title="Become an AI/ML Engineer",
        target_role="AI/ML Engineer",
        target_skills=["python", "machine-learning", "deep-learning", "transformers"],
        is_primary=True
    )
    db.add(goal)
    db.commit()
    return user, profile, goal

def test_event_validation():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db)
        engine = AdaptiveEngine(db)

        # Invalid event type should raise ValueError
        with pytest.raises(ValueError, match="Invalid event_type"):
            engine.process_event(
                event_id=str(uuid.uuid4()),
                profile_id=profile.id,
                event_type="invalid_event_type_xyz"
            )
    finally:
        db.close()

def test_idempotency_exact_same_event():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db)
        engine = AdaptiveEngine(db)
        res = db.query(LearningResource).filter(LearningResource.slug == "python-data-science-bootcamp").first()

        event_id = f"idem_evt_{uuid.uuid4().hex}"

        # 1st processing
        out1 = engine.process_event(
            event_id=event_id,
            profile_id=profile.id,
            event_type="course_completed",
            resource_id=res.id
        )
        assert out1["event_processed"] is True
        assert out1["is_duplicate"] is False
        conf_after_1 = profile.skill_confidence_map.get("python")

        # 2nd processing with SAME event_id
        out2 = engine.process_event(
            event_id=event_id,
            profile_id=profile.id,
            event_type="course_completed",
            resource_id=res.id
        )
        assert out2["is_duplicate"] is True
        assert out2["state_changed"] is False
        conf_after_2 = profile.skill_confidence_map.get("python")

        # Confidence must NOT be incremented a second time
        assert conf_after_1 == conf_after_2
    finally:
        db.close()

def test_confidence_bounds_and_clamping():
    profile = LearnerProfile(skill_confidence_map={"python": 0.98})
    # Add large delta -> must clamp at 1.0
    AdaptiveStateUpdater.apply_quiz_result(profile, "python", score_ratio=1.0)
    assert profile.skill_confidence_map["python"] <= 1.0

    profile.skill_confidence_map = {"python": 0.02}
    # Subtract large delta -> must clamp at 0.0
    AdaptiveStateUpdater.apply_quiz_result(profile, "python", score_ratio=0.0)
    assert profile.skill_confidence_map["python"] >= 0.0

def test_difficulty_adaptation():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db)
        engine = AdaptiveEngine(db)
        res = db.query(LearningResource).first()

        old_tol = profile.difficulty_tolerance
        out = engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile.id,
            event_type="difficulty_feedback",
            resource_id=res.id,
            payload={"feedback_type": "too_difficult"}
        )
        assert profile.difficulty_tolerance < old_tol
        assert 0.0 <= profile.difficulty_tolerance <= 1.0
    finally:
        db.close()

def test_prerequisite_transition_blocked_to_eligible():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db)
        # Set machine-learning below threshold (0.35 < 0.40)
        profile.skill_confidence_map = {"python": 0.80, "linear-algebra": 0.80, "machine-learning": 0.35}
        db.commit()

        engine = AdaptiveEngine(db)
        ml_res = db.query(LearningResource).filter(LearningResource.slug == "hands-on-ml-scikit-pytorch").first()

        # Complete ML course -> increases machine-learning confidence >= 0.40
        out = engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile.id,
            event_type="course_completed",
            resource_id=ml_res.id
        )

        assert profile.skill_confidence_map["machine-learning"] >= PREREQUISITE_THRESHOLD
        assert out["meaningful_change"] is True
        assert out["recommendations_regenerated"] is True
    finally:
        db.close()

def test_roadmap_versioning_invariants():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db)
        engine = AdaptiveEngine(db)
        ml_res = db.query(LearningResource).filter(LearningResource.slug == "hands-on-ml-scikit-pytorch").first()

        out = engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile.id,
            event_type="course_completed",
            resource_id=ml_res.id
        )

        lp = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
        assert lp is not None

        # Exactly ONE active version invariant
        active_versions = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == lp.id,
            LearningPathVersion.is_active == True
        ).all()
        assert len(active_versions) == 1

        # Check RoadmapChange records exist
        changes = db.query(RoadmapChange).filter(RoadmapChange.learning_path_id == lp.id).all()
        assert len(changes) > 0
    finally:
        db.close()

def test_user_isolation_security():
    db = SessionLocal()
    try:
        user_a, profile_a, goal_a = get_or_create_test_learner(db, "user_a")
        user_b, profile_b, goal_b = get_or_create_test_learner(db, "user_b")

        engine = AdaptiveEngine(db)
        # Event processed on Profile A must NOT affect Profile B
        conf_b_before = dict(profile_b.skill_confidence_map)
        res = db.query(LearningResource).first()

        engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile_a.id,
            event_type="course_completed",
            resource_id=res.id
        )

        db.refresh(profile_b)
        assert profile_b.skill_confidence_map == conf_b_before
    finally:
        db.close()

def test_synthetic_personas_adaptation_scenarios():
    db = SessionLocal()
    try:
        user, profile, goal = get_or_create_test_learner(db, "persona_eval")
        engine = AdaptiveEngine(db)

        # Scenario 1: Quiz answered correctly -> confidence increases
        old_py = profile.skill_confidence_map.get("python", 0.65)
        engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile.id,
            event_type="quiz_answered",
            skill_slug="python",
            payload={"is_correct": True}
        )
        assert profile.skill_confidence_map["python"] > old_py

        # Scenario 2: Quiz answered incorrectly -> confidence decreases
        old_ml = profile.skill_confidence_map.get("machine-learning", 0.35)
        engine.process_event(
            event_id=str(uuid.uuid4()),
            profile_id=profile.id,
            event_type="quiz_answered",
            skill_slug="machine-learning",
            payload={"is_correct": False}
        )
        assert profile.skill_confidence_map["machine-learning"] < old_ml
    finally:
        db.close()
