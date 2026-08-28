import os

models = {}

models['backend/app/models/user.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
"""

models['backend/app/models/profile.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    education_level = Column(String(100), nullable=True) # High School, Undergraduate, Master, Self-taught
    field_of_study = Column(String(100), nullable=True)
    experience_level = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    weekly_hours = Column(Integer, default=10)
    preferred_formats = Column(JSON, default=lambda: ["video", "hands-on", "projects"])
    learning_objective = Column(String(100), default="Career Switch") # Internship, Placement, Portfolio, Skill
    skill_confidence_map = Column(JSON, default=dict) # { "skill_slug": 0.75 }
    velocity_score = Column(Float, default=1.0)
    difficulty_tolerance = Column(Float, default=0.5) # 0.0 (Gentle) to 1.0 (Challenging)
    state_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
    goals = relationship("Goal", back_populates="profile", cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="profile", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="profile", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="profile", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="profile", cascade="all, delete-orphan")
    interactions = relationship("Interaction", back_populates="profile", cascade="all, delete-orphan")
    assessment_responses = relationship("AssessmentResponse", back_populates="profile", cascade="all, delete-orphan")
"""

models['backend/app/models/goal.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False) # e.g. AI/ML Engineer
    description = Column(String(500), nullable=True)
    target_role = Column(String(100), nullable=False)
    target_skills = Column(JSON, default=list) # ["python", "machine-learning", "deep-learning"]
    is_primary = Column(Boolean, default=True)
    status = Column(String(50), default="active") # active, completed, paused
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="goals")
    learning_paths = relationship("LearningPath", back_populates="goal")
"""

models['backend/app/models/skill.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # Programming, AI/ML, Web, DevOps, etc.
    description = Column(String(500), nullable=True)
    difficulty_tier = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    embedding = Column(JSON, nullable=True) # Serialized float vector
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    prerequisites = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.skill_id",
        back_populates="skill",
        cascade="all, delete-orphan"
    )
    dependent_skills = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.prerequisite_skill_id",
        back_populates="prerequisite_skill",
        cascade="all, delete-orphan"
    )
    resource_skills = relationship("ResourceSkill", back_populates="skill", cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="skill", cascade="all, delete-orphan")
    assessment_questions = relationship("AssessmentQuestion", back_populates="skill")

class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    is_mandatory = Column(Boolean, default=True)

    skill = relationship("Skill", foreign_keys=[skill_id], back_populates="prerequisites")
    prerequisite_skill = relationship("Skill", foreign_keys=[prerequisite_skill_id], back_populates="dependent_skills")

class LearnerSkill(Base):
    __tablename__ = "learner_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    self_rating = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    assessed_confidence = Column(Float, default=0.2) # 0.0 to 1.0
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="learner_skills")
    skill = relationship("Skill", back_populates="learner_skills")
"""

models['backend/app/models/resource.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String(1000), nullable=False)
    provider = Column(String(100), default="Coursera") # Coursera, fast.ai, DeepLearning.AI, Harvard CS50, YouTube, Docs
    url = Column(String(500), nullable=False)
    resource_type = Column(String(50), default="course") # video, article, course, project, tutorial, quiz, doc
    difficulty = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    estimated_hours = Column(Float, default=5.0)
    quality_score = Column(Float, default=0.90) # 0.0 to 1.0
    career_relevance = Column(JSON, default=list) # ["ai-ml-engineer", "data-scientist"]
    format = Column(String(50), default="video") # hands-on, theory, project, interactive
    embedding = Column(JSON, nullable=True) # Serialized vector
    embedding_model = Column(String(100), default="text-embedding-004")
    embedding_model_version = Column(String(50), default="v1.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resource_skills = relationship("ResourceSkill", back_populates="resource", cascade="all, delete-orphan")
    path_items = relationship("LearningPathItem", back_populates="resource")
    progress_records = relationship("Progress", back_populates="resource")
    feedbacks = relationship("Feedback", back_populates="resource")
    interactions = relationship("Interaction", back_populates="resource")

class ResourceSkill(Base):
    __tablename__ = "resource_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, default=1.0) # How strongly this resource teaches this skill

    resource = relationship("LearningResource", back_populates="resource_skills")
    skill = relationship("Skill", back_populates="resource_skills")
"""

models['backend/app/models/learning_path.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    current_version_id = Column(String(36), nullable=True)
    algorithm_version = Column(String(50), default="v1.2.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="learning_paths")
    goal = relationship("Goal", back_populates="learning_paths")
    versions = relationship("LearningPathVersion", back_populates="learning_path", cascade="all, delete-orphan")

class LearningPathVersion(Base):
    __tablename__ = "learning_path_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, default=1)
    version_hash = Column(String(64), nullable=True)
    trigger = Column(String(100), default="initial_generation") # initial_generation, resource_completion, feedback_negative, feedback_positive, assessment_result, goal_change, availability_change, demo_reset
    change_summary = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    idempotency_key = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    learning_path = relationship("LearningPath", back_populates="versions")
    items = relationship("LearningPathItem", back_populates="version", cascade="all, delete-orphan", order_by="LearningPathItem.sequence_order")
    roadmap_changes = relationship("RoadmapChange", back_populates="version", cascade="all, delete-orphan")

class LearningPathItem(Base):
    __tablename__ = "learning_path_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    version_id = Column(String(36), ForeignKey("learning_path_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    phase_number = Column(Integer, default=1) # Phase 1 to 5
    phase_name = Column(String(100), default="Foundations")
    sequence_order = Column(Integer, default=1)
    is_completed = Column(Boolean, default=False)
    is_skipped = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)

    version = relationship("LearningPathVersion", back_populates="items")
    resource = relationship("LearningResource", back_populates="path_items")
    explanation = relationship("RecommendationExplanation", back_populates="path_item", uselist=False, cascade="all, delete-orphan")

class RoadmapChange(Base):
    __tablename__ = "roadmap_changes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version_id = Column(String(36), ForeignKey("learning_path_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_item_id = Column(String(36), nullable=True)
    new_item_id = Column(String(36), nullable=True)
    change_type = Column(String(50), default="inserted") # inserted, removed, reordered, phase_shifted, unchanged
    reason = Column(String(500), nullable=False)
    trigger = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    version = relationship("LearningPathVersion", back_populates="roadmap_changes")

class RecommendationExplanation(Base):
    __tablename__ = "recommendation_explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    path_item_id = Column(String(36), ForeignKey("learning_path_items.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    goal_relevance_score = Column(Float, default=0.0)
    skill_gap_score = Column(Float, default=0.0)
    prereq_score = Column(Float, default=0.0)
    difficulty_score = Column(Float, default=0.0)
    pref_score = Column(Float, default=0.0)
    time_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    diversity_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    structured_reasons = Column(JSON, default=list) # ["Matches AI/ML Goal", "Covers Neural Network gap"]
    human_readable_explanation = Column(String(1000), nullable=False)

    path_item = relationship("LearningPathItem", back_populates="explanation")
"""

models['backend/app/models/progress.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Progress(Base):
    __tablename__ = "progress_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="not_started") # not_started, in_progress, completed, skipped
    time_spent_minutes = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    last_accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="progress_records")
    resource = relationship("LearningResource", back_populates="progress_records")
"""

models['backend/app/models/feedback.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Feedback(Base):
    __tablename__ = "feedback_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_type = Column(String(50), nullable=False) # helpful, too_difficult, too_easy, not_relevant, outdated
    rating = Column(Integer, default=5) # 1 to 5 stars
    comment = Column(String(500), nullable=True)
    idempotency_key = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="feedbacks")
    resource = relationship("LearningResource", back_populates="feedbacks")
"""

models['backend/app/models/interaction.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Interaction(Base):
    __tablename__ = "interaction_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False) # view, start, complete, skip, search, chat, rate
    meta_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="interactions")
    resource = relationship("LearningResource", back_populates="interactions")
"""

models['backend/app/models/assessment.py'] = """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(200), nullable=False)
    domain = Column(String(100), nullable=False) # AI/ML, Data Science, Full Stack, DevOps, Cybersecurity
    target_skill_ids = Column(JSON, default=list)

    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(String(500), nullable=False)
    options = Column(JSON, nullable=False) # ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(String(500), nullable=True)
    difficulty_weight = Column(Float, default=0.5)

    assessment = relationship("Assessment", back_populates="questions")
    skill = relationship("Skill", back_populates="assessment_questions")
    responses = relationship("AssessmentResponse", back_populates="question", cascade="all, delete-orphan")

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    confidence_delta = Column(Float, default=0.0)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="assessment_responses")
    question = relationship("AssessmentQuestion", back_populates="responses")
"""

models['backend/app/models/__init__.py'] = """from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.learning_path import (
    LearningPath,
    LearningPathVersion,
    LearningPathItem,
    RoadmapChange,
    RecommendationExplanation,
)
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.interaction import Interaction
from backend.app.models.assessment import (
    Assessment,
    AssessmentQuestion,
    AssessmentResponse,
)

__all__ = [
    "User",
    "LearnerProfile",
    "Goal",
    "Skill",
    "SkillPrerequisite",
    "LearnerSkill",
    "LearningResource",
    "ResourceSkill",
    "LearningPath",
    "LearningPathVersion",
    "LearningPathItem",
    "RoadmapChange",
    "RecommendationExplanation",
    "Progress",
    "Feedback",
    "Interaction",
    "Assessment",
    "AssessmentQuestion",
    "AssessmentResponse",
]
"""

for filepath, content in models.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filepath}")
