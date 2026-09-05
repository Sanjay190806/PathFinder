import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    JSON,
    DateTime,
    Text,
    Index,
)
from backend.app.database import Base


class DataChangeEvent(Base):
    __tablename__ = "data_change_events"
    __table_args__ = (
        Index("idx_change_events_entity", "entity_type", "entity_id"),
        Index("idx_change_events_type_status", "change_type", "status"),
        Index("idx_change_events_detected_at", "detected_at"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    entity_type = Column(String(50), nullable=False, index=True)   # COMPANY, COMPANY_ROLE, LEARNING_RESOURCE, DSA_REQUIREMENT, CAREER_REQUIREMENT
    entity_id = Column(String(100), nullable=False, index=True)     # Slug, ID, or URI
    change_type = Column(String(50), nullable=False, index=True)   # CREATED, UPDATED, REMOVED, PRICE_CHANGED, URL_CHANGED, STATUS_CHANGED, REQUIREMENT_CHANGED, SKILL_ADDED, SKILL_REMOVED, TRANSLATION_CHANGED, VERIFICATION_CHANGED
    
    old_version = Column(Integer, default=1)
    new_version = Column(Integer, default=2)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    
    source = Column(String(150), default="Dynamic Update Service")
    source_url = Column(String(300), nullable=True)
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    approved_at = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="DISCOVERED", index=True)  # DISCOVERED, VALIDATING, VERIFICATION_REQUIRED, APPROVED, REJECTED, APPLIED, FAILED, RETRY_PENDING
    reason = Column(Text, nullable=True)


class DynamicJobRecord(Base):
    __tablename__ = "dynamic_job_records"
    __table_args__ = (
        Index("idx_job_records_type_status", "job_type", "status"),
        Index("idx_job_records_domain", "domain"),
        Index("idx_job_records_started_at", "started_at"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    job_id = Column(String(100), nullable=False, index=True)
    job_name = Column(String(150), nullable=False)
    job_type = Column(String(50), default="SCHEDULED", index=True)  # SCHEDULED, MANUAL
    domain = Column(String(50), default="ALL", index=True)          # COMPANIES, ROLES, COURSES, YOUTUBE, PRACTICE, ALL
    
    status = Column(String(30), default="RUNNING", index=True)      # RUNNING, SUCCESS, PARTIAL_SUCCESS, FAILED
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)
    latency_ms = Column(Float, default=0.0)
    
    records_examined = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    failures_count = Column(Integer, default=0)
    error_details = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
