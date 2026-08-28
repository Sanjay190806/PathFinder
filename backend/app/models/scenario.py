from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class EngineeringScenario(Base):
    __tablename__ = "engineering_scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=False)
    scenario_type = Column(String(50), default="Debugging")  # Debugging, Architecture Decision, Incident Response, System Design, Optimization
    career_roles = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    difficulty = Column(String(32), default="Intermediate")
    context_data = Column(JSON, default=dict)  # logs, metrics, code snippets
    available_actions = Column(JSON, default=list)
    constraints = Column(JSON, default=list)
    evaluation_rubric = Column(JSON, default=dict)
    time_limit_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)

class ScenarioAttempt(Base):
    __tablename__ = "scenario_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_id = Column(String(36), ForeignKey("engineering_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_actions = Column(JSON, default=list)
    learner_reasoning = Column(String(1000), default="")
    score = Column(Float, default=0.0)  # [0.0, 1.0]
    component_scores = Column(JSON, default=dict)  # technical_correctness, reasoning, risk_awareness, tradeoff_quality, prioritization
    feedback = Column(String(1000), default="")
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="scenario_attempts")
    scenario = relationship("EngineeringScenario")
