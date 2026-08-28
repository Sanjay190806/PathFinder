import pytest
import uuid
from sqlalchemy.exc import IntegrityError
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from backend.app.models.resource import LearningResource, ResourceSkill, ResourcePrerequisite
from backend.app.models.learning_path import LearningPath, LearningPathVersion, LearningPathItem, RoadmapChange, RecommendationExplanation
from backend.app.models.recommendation import Recommendation
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.interaction import Interaction
from backend.app.models.assessment import Assessment, AssessmentQuestion, AssessmentResponse

def test_all_19_domain_models_instantiation():
    db = SessionLocal()
    try:
        # 1. User & Profile
        user = User(email=f"model_test_{uuid.uuid4().hex[:6]}@example.com", hashed_password="pw", full_name="Model Test")
        db.add(user)
        db.flush()

        profile = LearnerProfile(user_id=user.id, weekly_hours=12, education_level="Undergraduate")
        db.add(profile)
        db.flush()

        # 2. Goal
        goal = Goal(profile_id=profile.id, title="Become an AI Engineer", target_role="AI/ML Engineer", target_skills=["python", "ml"])
        db.add(goal)
        db.flush()

        # 3. Skills & DAG
        s1 = Skill(name=f"Skill A {uuid.uuid4().hex[:4]}", slug=f"skill-a-{uuid.uuid4().hex[:4]}", category="AI/ML")
        s2 = Skill(name=f"Skill B {uuid.uuid4().hex[:4]}", slug=f"skill-b-{uuid.uuid4().hex[:4]}", category="AI/ML")
        db.add_all([s1, s2])
        db.flush()

        prereq = SkillPrerequisite(skill_id=s2.id, prerequisite_skill_id=s1.id, is_mandatory=True)
        db.add(prereq)
        db.flush()

        l_skill = LearnerSkill(profile_id=profile.id, skill_id=s1.id, assessed_confidence=0.75, target_confidence=0.90)
        db.add(l_skill)
        db.flush()

        # 4. Learning Resource & Skills
        res = LearningResource(
            title=f"Resource {uuid.uuid4().hex[:4]}",
            slug=f"res-{uuid.uuid4().hex[:4]}",
            description="Detailed guide",
            provider="TestProvider",
            url=f"https://example.com/res-{uuid.uuid4().hex[:4]}",
            estimated_hours=6.0,
            quality_score=0.95
        )
        db.add(res)
        db.flush()

        rs = ResourceSkill(resource_id=res.id, skill_id=s1.id, relevance_weight=0.95)
        rp = ResourcePrerequisite(resource_id=res.id, skill_id=s1.id, is_mandatory=True)
        db.add_all([rs, rp])
        db.flush()

        # 5. Learning Path & Versions
        lp = LearningPath(profile_id=profile.id, goal_id=goal.id, title="Test Path")
        db.add(lp)
        db.flush()

        lp_ver = LearningPathVersion(learning_path_id=lp.id, version_number=1, is_active=True)
        db.add(lp_ver)
        db.flush()

        lp_item = LearningPathItem(version_id=lp_ver.id, resource_id=res.id, sequence_order=1)
        db.add(lp_item)
        db.flush()

        expl = RecommendationExplanation(
            path_item_id=lp_item.id,
            goal_relevance_score=0.9,
            composite_score=0.88,
            human_readable_explanation="Highly aligned."
        )
        db.add(expl)

        change = RoadmapChange(
            learning_path_id=lp.id,
            version_id=lp_ver.id,
            reason="Initial build",
            trigger="initial_generation"
        )
        db.add(change)
        db.flush()

        # 6. Recommendation
        rec = Recommendation(profile_id=profile.id, resource_id=res.id, score=0.88, rank=1)
        db.add(rec)
        db.flush()

        # 7. Progress, Feedback, Interaction
        prog = Progress(profile_id=profile.id, resource_id=res.id, status="in_progress", completion_percentage=50.0)
        fb = Feedback(profile_id=profile.id, resource_id=res.id, feedback_type="helpful", rating=5)
        inter = Interaction(profile_id=profile.id, resource_id=res.id, event_type="view")
        db.add_all([prog, fb, inter])
        db.flush()

        # 8. Assessment
        assess = Assessment(title="Test Quiz", domain="AI/ML")
        db.add(assess)
        db.flush()

        quest = AssessmentQuestion(
            assessment_id=assess.id,
            skill_id=s1.id,
            question_text="What is X?",
            options=["A", "B"],
            correct_option_index=0
        )
        db.add(quest)
        db.flush()

        resp = AssessmentResponse(
            profile_id=profile.id,
            question_id=quest.id,
            selected_option_index=0,
            is_correct=True
        )
        db.add(resp)
        db.commit()

        # Assert clean relationships
        assert user.profile.id == profile.id
        assert len(profile.goals) >= 1
        assert len(res.resource_skills) >= 1
        assert len(lp.versions) >= 1
        assert lp_item.explanation is not None

        db.delete(user)
        db.delete(res)
        db.delete(assess)
        db.delete(s1)
        db.delete(s2)
        db.commit()
    finally:
        db.close()

def test_unique_user_email_constraint():
    db = SessionLocal()
    try:
        unique_email = f"dup_{uuid.uuid4().hex[:6]}@example.com"
        u1 = User(email=unique_email, hashed_password="pw", full_name="User 1")
        db.add(u1)
        db.commit()

        u2 = User(email=unique_email, hashed_password="pw", full_name="User 2")
        db.add(u2)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
        db.delete(u1)
        db.commit()
    finally:
        db.close()
