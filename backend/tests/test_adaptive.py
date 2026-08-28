import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.engine.adaptive import generate_or_adapt_roadmap

def test_adaptive_versioning_and_idempotency():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        import uuid
        user = User(email=f"test_adaptive_{uuid.uuid4().hex[:6]}@example.com", hashed_password="pw", full_name="Tester")
        db.add(user)
        db.flush()

        profile = LearnerProfile(user_id=user.id, weekly_hours=10, skill_confidence_map={"python": 0.5})
        db.add(profile)
        db.flush()

        goal = Goal(profile_id=profile.id, title="AI/ML Engineer", target_role="AI/ML Engineer", target_skills=["python", "machine-learning"])
        db.add(goal)
        db.flush()

        path, v1, created1 = generate_or_adapt_roadmap(profile, goal, "initial", "Initial path", db)
        assert v1.version_number == 1
        assert created1 is True

        # Repeating with identical state should NOT create new version
        path, v1_repeat, created2 = generate_or_adapt_roadmap(profile, goal, "repeat", "Repeat", db)
        assert v1_repeat.version_number == 1
        assert created2 is False

        # Changing skill confidence should adapt to Version 2
        profile.skill_confidence_map = {"python": 0.90, "machine-learning": 0.75, "deep-learning": 0.50}
        path, v2, created3 = generate_or_adapt_roadmap(profile, goal, "skill_boost", "Learned ML", db)
        assert v2.version_number == 2
        assert created3 is True
        assert v2.is_active is True
        assert v1.is_active is False

        db.delete(user)
        db.commit()
    finally:
        db.close()
