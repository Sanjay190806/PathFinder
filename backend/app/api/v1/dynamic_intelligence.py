"""
Dynamic Intelligence API Router (Phase 12 Stage 10)
Exposes scheduled/manual refresh triggers, provider registry, change event audit log,
and freshness metrics for system administrators and developers.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.dynamic_update import DataChangeEvent, DynamicJobRecord
from backend.app.models.company import Company
from backend.app.models.resource import LearningResource
from backend.app.schemas.dynamic_intelligence import (
    DataChangeEventItem,
    DynamicJobRecordItem,
    RefreshRequest,
    RefreshResponse,
    FreshnessSummaryResponse,
)
from backend.app.intelligence.provider_registry import provider_registry, SourceProvider
from backend.app.intelligence.freshness_policy import FreshnessPolicy
from backend.app.intelligence.scheduler import scheduler
from backend.app.intelligence.dynamic_update_service import DynamicIntelligenceService

router = APIRouter(prefix="/dynamic-intelligence", tags=["Dynamic Intelligence"])


@router.get("/jobs", response_model=List[DynamicJobRecordItem])
def list_job_records(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieves execution history of scheduled and manual dynamic intelligence jobs.
    """
    records = db.query(DynamicJobRecord).order_by(desc(DynamicJobRecord.started_at)).limit(limit).all()
    return records


@router.post("/refresh", response_model=RefreshResponse)
def trigger_refresh(
    request: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Manually triggers an observable, idempotent refresh across requested domains.
    """
    service = DynamicIntelligenceService(db)
    job_record = service.run_refresh_job(
        domain=request.domain,
        entity_id=request.entity_id,
        job_type="MANUAL",
        force=request.force
    )

    # Fetch any change events created during this run
    changes = db.query(DataChangeEvent).filter(
        DataChangeEvent.detected_at >= job_record.started_at
    ).order_by(desc(DataChangeEvent.detected_at)).limit(20).all()

    return RefreshResponse(
        job_id=job_record.job_id,
        status=job_record.status,
        domain=job_record.domain,
        records_examined=job_record.records_examined,
        records_updated=job_record.records_updated,
        records_rejected=job_record.records_rejected,
        changes_detected_count=len(changes),
        latency_ms=job_record.latency_ms,
        summary=job_record.summary or "Refresh completed",
        changes=[DataChangeEventItem.model_validate(c) for c in changes]
    )


@router.get("/change-events", response_model=List[DataChangeEventItem])
def list_change_events(
    entity_type: Optional[str] = Query(None, description="COMPANY, COMPANY_ROLE, LEARNING_RESOURCE"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns an auditable log of all data change events detected across the platform.
    """
    query = db.query(DataChangeEvent)
    if entity_type:
        query = query.filter(DataChangeEvent.entity_type == entity_type.upper())
    events = query.order_by(desc(DataChangeEvent.detected_at)).limit(limit).all()
    return events


@router.get("/providers", response_model=List[SourceProvider])
def list_registered_providers():
    """
    Returns the centralized provider registry containing approved data sources.
    """
    return provider_registry.list_all()


@router.get("/freshness-summary", response_model=FreshnessSummaryResponse)
def get_freshness_summary(db: Session = Depends(get_db)):
    """
    Summarizes freshness states (FRESH, RECENT, STALE, EXPIRED, UNKNOWN) across entities.
    """
    companies = db.query(Company).all()
    resources = db.query(LearningResource).all()

    fresh_cnt = 0
    recent_cnt = 0
    stale_cnt = 0
    expired_cnt = 0
    unknown_cnt = 0

    comp_summary = {"domain": "COMPANY_PROFILE", "total": len(companies), "fresh": 0, "recent": 0, "stale": 0, "expired": 0, "unknown": 0}
    for c in companies:
        res = FreshnessPolicy.evaluate("COMPANY_PROFILE", c.last_verified_at)
        comp_summary[res.state.value.lower()] += 1

    res_summary = {"domain": "COURSE_PRICING_AVAILABILITY", "total": len(resources), "fresh": 0, "recent": 0, "stale": 0, "expired": 0, "unknown": 0}
    for r in resources:
        res = FreshnessPolicy.evaluate("COURSE_PRICING_AVAILABILITY", r.last_verified_at)
        res_summary[res.state.value.lower()] += 1

    for s in [comp_summary, res_summary]:
        fresh_cnt += s["fresh"]
        recent_cnt += s["recent"]
        stale_cnt += s["stale"]
        expired_cnt += s["expired"]
        unknown_cnt += s["unknown"]

    total = len(companies) + len(resources)
    return FreshnessSummaryResponse(
        total_entities_checked=total,
        fresh_count=fresh_cnt,
        recent_count=recent_cnt,
        stale_count=stale_cnt,
        expired_count=expired_cnt,
        unknown_count=unknown_cnt,
        domains=[comp_summary, res_summary]
    )
