from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=False)
    career_roles = Column(JSON, default=list)  # ["AI/ML Engineer", "Data Scientist"]
    difficulty = Column(String(32), default="Intermediate")
    project_level = Column(String(32), default="Applied Project")  # Guided, Applied, Intermediate, Advanced, Capstone
    estimated_hours = Column(Float, default=10.0)
    skills = Column(JSON, default=list)  # ["python", "pytorch", "docker"]
    prerequisites = Column(JSON, default=list)  # ["python", "linear-algebra"]
    deliverables = Column(JSON, default=list)  # ["GitHub Repository", "Deployment Link"]
    evaluation_rubric = Column(JSON, default=dict)
    tools = Column(JSON, default=list)  # ["Docker", "FastAPI", "PyTorch"]
    portfolio_value = Column(Float, default=0.85)
    is_active = Column(Boolean, default=True)

class LearnerProject(Base):
    __tablename__ = "learner_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    project_template_id = Column(String(36), ForeignKey("project_templates.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="not_started", index=True)  # not_started, in_progress, blocked, submitted, under_review, completed, abandoned
    current_milestone_index = Column(Integer, default=0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, default=0.0)  # [0.0, 1.0]
    evaluation_feedback = Column(String(1000), default="")
    submission_metadata = Column(JSON, default=dict)

    profile = relationship("LearnerProfile", back_populates="projects")
    template = relationship("ProjectTemplate")
    milestones = relationship("LearnerProjectMilestone", back_populates="learner_project", cascade="all, delete-orphan")

class LearnerProjectMilestone(Base):
    __tablename__ = "learner_project_milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    learner_project_id = Column(String(36), ForeignKey("learner_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=False)
    status = Column(String(32), default="pending")  # pending, in_progress, completed
    submission_artifact = Column(String(500), default="")
    completed_at = Column(DateTime, nullable=True)

    learner_project = relationship("LearnerProject", back_populates="milestones")
