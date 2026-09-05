"""
Schemas for Dynamic Intelligence (Phase 12 Stage 10)
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DataChangeEventItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    change_type: str
    old_version: int
    new_version: int
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    source: str
    source_url: Optional[str] = None
    detected_at: datetime
    applied_at: Optional[datetime] = None
    status: str
    reason: Optional[str] = None


class DynamicJobRecordItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    job_name: str
    job_type: str
    domain: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    latency_ms: float
    records_examined: int
    records_updated: int
    records_rejected: int
    failures_count: int
    error_details: List[Any] = Field(default_factory=list)
    summary: Optional[str] = None


class RefreshRequest(BaseModel):
    domain: str = "ALL"  # COMPANIES, ROLES, COURSES, YOUTUBE, PRACTICE, ALL
    entity_id: Optional[str] = None  # e.g., "google", "coursera-ml-specialization"
    force: bool = False
    ai_candidate_enrichment: bool = False


class RefreshResponse(BaseModel):
    job_id: str
    status: str
    domain: str
    records_examined: int
    records_updated: int
    records_rejected: int
    changes_detected_count: int
    latency_ms: float
    summary: str
    changes: List[DataChangeEventItem] = Field(default_factory=list)


class FreshnessSummaryResponse(BaseModel):
    total_entities_checked: int
    fresh_count: int
    recent_count: int
    stale_count: int
    expired_count: int
    unknown_count: int
    domains: List[Dict[str, Any]]
