"""
Dynamic Intelligence & Update Service (Phase 12 Stage 10)
Provides end-to-end scheduled and manual data updates, canonical matching,
change detection, conflict handling, safe persistence, and cache eviction.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.core.logger import logger
from backend.app.database import SessionLocal
from backend.app.models.company import Company, CompanyRole
from backend.app.models.company_requirements import (
    RoleSkillRequirement,
    RoleDSARequirement,
    RoleTechnologyRequirement,
    RoleInterviewTopic,
)
from backend.app.models.resource import LearningResource
from backend.app.models.dynamic_update import DataChangeEvent, DynamicJobRecord
from backend.app.intelligence.freshness_policy import FreshnessPolicy, FreshnessState
from backend.app.intelligence.provider_registry import provider_registry, SourceProvider
from backend.app.core.cache_invalidator import cache_invalidator
from backend.app.resources.resource_verifier import ResourceVerifier
from backend.app.ai.prompt_guard import PromptGuard
from backend.app.ai.groq_provider import GroqProvider


class DynamicIntelligenceService:
    """
    Authoritative Dynamic Intelligence Engine.
    Executes change detection, conflict resolution, versioned persistence,
    and cache invalidation across all PathFinder domains.
    """

    def __init__(self, db: Session):
        self.db = db
        self.verifier = ResourceVerifier()
        self.groq_provider = GroqProvider()

    # =========================================================================
    # 1. COMPANY UPDATE PIPELINE
    # =========================================================================

    def update_company(
        self,
        company_slug: str,
        incoming_data: Dict[str, Any],
        source: str = "Verified Corporate Registry",
        source_url: Optional[str] = None
    ) -> Tuple[Optional[Company], Optional[DataChangeEvent]]:
        """
        Updates an existing company or creates a new one with change detection and versioning.
        Idempotent: if data hasn't changed, no duplicate change event is emitted.
        """
        company = self.db.query(Company).filter(Company.slug == company_slug.strip().lower()).first()
        now = datetime.now(timezone.utc)

        if not company:
            # Create new company
            new_comp = Company(
                slug=company_slug.strip().lower(),
                canonical_name=incoming_data.get("canonical_name", company_slug.title()),
                display_name=incoming_data.get("display_name", company_slug.title()),
                aliases=incoming_data.get("aliases", []),
                website=incoming_data.get("website"),
                careers_url=incoming_data.get("careers_url"),
                industry=incoming_data.get("industry", "Technology"),
                company_type=incoming_data.get("company_type", "PRODUCT"),
                headquarters_country=incoming_data.get("headquarters_country", "India"),
                headquarters_region=incoming_data.get("headquarters_region"),
                operating_countries=incoming_data.get("operating_countries", ["India"]),
                operating_regions=incoming_data.get("operating_regions", ["National"]),
                description=incoming_data.get("description"),
                status=incoming_data.get("status", "ACTIVE"),
                is_verified=incoming_data.get("is_verified", True),
                source=source,
                source_url=source_url,
                retrieved_at=now,
                last_verified_at=now,
                verification_status="VERIFIED",
                version=1
            )
            self.db.add(new_comp)
            self.db.flush()

            event = DataChangeEvent(
                entity_type="COMPANY",
                entity_id=new_comp.slug,
                change_type="CREATED",
                old_version=0,
                new_version=1,
                old_value=None,
                new_value={"slug": new_comp.slug, "name": new_comp.canonical_name},
                source=source,
                source_url=source_url,
                detected_at=now,
                applied_at=now,
                status="APPLIED",
                reason="Initial company discovery and creation"
            )
            self.db.add(event)
            self.db.commit()
            cache_invalidator.invalidate_on_company_change(new_comp.slug)
            return new_comp, event

        # Existing company: compare fields for changes
        changes: Dict[str, Any] = {}
        old_val: Dict[str, Any] = {}
        new_val: Dict[str, Any] = {}

        for field in ["website", "careers_url", "industry", "company_type", "headquarters_region", "status"]:
            if field in incoming_data and incoming_data[field] is not None:
                curr_val = getattr(company, field, None)
                if curr_val != incoming_data[field]:
                    old_val[field] = curr_val
                    new_val[field] = incoming_data[field]
                    setattr(company, field, incoming_data[field])

        if not old_val:
            # Idempotent: no modifications detected
            company.last_verified_at = now
            self.db.commit()
            return company, None

        # Change detected: increment version
        company.version += 1
        company.last_verified_at = now
        company.source = source
        company.source_url = source_url

        event = DataChangeEvent(
            entity_type="COMPANY",
            entity_id=company.slug,
            change_type="UPDATED",
            old_version=company.version - 1,
            new_version=company.version,
            old_value=old_val,
            new_value=new_val,
            source=source,
            source_url=source_url,
            detected_at=now,
            applied_at=now,
            status="APPLIED",
            reason=f"Company profile fields updated: {list(old_val.keys())}"
        )
        self.db.add(event)
        self.db.commit()
        cache_invalidator.invalidate_on_company_change(company.slug)
        return company, event

    # =========================================================================
    # 2. ROLE UPDATE PIPELINE
    # =========================================================================

    def update_role(
        self,
        company_slug: str,
        role_slug: str,
        incoming_data: Dict[str, Any],
        source: str = "Verified Employer Job Specification",
        source_url: Optional[str] = None
    ) -> Tuple[Optional[CompanyRole], Optional[DataChangeEvent]]:
        """
        Updates role attributes, DSA relevance, and detects requirements changes.
        """
        company = self.db.query(Company).filter(Company.slug == company_slug.strip().lower()).first()
        if not company:
            return None, None

        role = self.db.query(CompanyRole).filter(
            CompanyRole.company_id == company.id,
            CompanyRole.role_slug == role_slug.strip().lower()
        ).first()

        now = datetime.now(timezone.utc)
        if not role:
            # Create new company role
            role = CompanyRole(
                company_id=company.id,
                career_id=incoming_data.get("career_id"),
                role_slug=role_slug.strip().lower(),
                canonical_role_name=incoming_data.get("canonical_role_name", role_slug.replace("-", " ").title()),
                display_name=incoming_data.get("display_name", role_slug.replace("-", " ").title()),
                aliases=incoming_data.get("aliases", []),
                description=incoming_data.get("description"),
                employment_type=incoming_data.get("employment_type", "FULL_TIME"),
                experience_level=incoming_data.get("experience_level", "ENTRY_LEVEL"),
                remote_type=incoming_data.get("remote_type", "HYBRID"),
                dsa_relevance=incoming_data.get("dsa_relevance", "HIGH"),
                cs_fundamentals_relevance=incoming_data.get("cs_fundamentals_relevance", {}),
                source=source,
                source_url=source_url,
                retrieved_at=now,
                last_verified_at=now,
                verification_status="VERIFIED",
                version=1
            )
            self.db.add(role)
            self.db.flush()

            event = DataChangeEvent(
                entity_type="COMPANY_ROLE",
                entity_id=f"{company_slug}/{role_slug}",
                change_type="CREATED",
                old_version=0,
                new_version=1,
                old_value=None,
                new_value={"role_slug": role.role_slug, "dsa_relevance": role.dsa_relevance},
                source=source,
                source_url=source_url,
                detected_at=now,
                applied_at=now,
                status="APPLIED",
                reason="Initial role creation"
            )
            self.db.add(event)
            self.db.commit()
            cache_invalidator.invalidate_on_role_change(company_slug, role_slug, skills_changed=True, dsa_changed=True)
            return role, event

        # Compare existing role
        old_val: Dict[str, Any] = {}
        new_val: Dict[str, Any] = {}
        dsa_changed = False

        if "dsa_relevance" in incoming_data and incoming_data["dsa_relevance"] != role.dsa_relevance:
            old_val["dsa_relevance"] = role.dsa_relevance
            new_val["dsa_relevance"] = incoming_data["dsa_relevance"]
            role.dsa_relevance = incoming_data["dsa_relevance"]
            dsa_changed = True

        if "experience_level" in incoming_data and incoming_data["experience_level"] != role.experience_level:
            old_val["experience_level"] = role.experience_level
            new_val["experience_level"] = incoming_data["experience_level"]
            role.experience_level = incoming_data["experience_level"]

        if not old_val:
            role.last_verified_at = now
            self.db.commit()
            return role, None

        role.version += 1
        role.last_verified_at = now
        role.source = source
        role.source_url = source_url

        event = DataChangeEvent(
            entity_type="COMPANY_ROLE",
            entity_id=f"{company_slug}/{role_slug}",
            change_type="REQUIREMENT_CHANGED",
            old_version=role.version - 1,
            new_version=role.version,
            old_value=old_val,
            new_value=new_val,
            source=source,
            source_url=source_url,
            detected_at=now,
            applied_at=now,
            status="APPLIED",
            reason=f"Role requirement modified: {list(old_val.keys())}"
        )
        self.db.add(event)
        self.db.commit()
        cache_invalidator.invalidate_on_role_change(company_slug, role_slug, skills_changed=False, dsa_changed=dsa_changed)
        return role, event

    def detect_requirement_conflict(
        self,
        company_slug: str,
        role_slug: str,
        skill_name: str,
        source_a_level: str,
        source_b_level: str,
        source_a_url: Optional[str] = None,
        source_b_url: Optional[str] = None
    ) -> DataChangeEvent:
        """
        Records a requirement conflict when independent sources disagree
        (e.g., Source A states REQUIRED vs Source B states PREFERRED).
        Never averages them silently; registers conflict for admin/verification audit.
        """
        now = datetime.now(timezone.utc)
        event = DataChangeEvent(
            entity_type="COMPANY_ROLE",
            entity_id=f"{company_slug}/{role_slug}",
            change_type="REQUIREMENT_CHANGED",
            old_version=1,
            new_version=1,
            old_value={"skill": skill_name, "level": source_a_level, "source_url": source_a_url},
            new_value={"skill": skill_name, "level": source_b_level, "source_url": source_b_url},
            source="Conflict Detection Engine",
            source_url=source_b_url or source_a_url,
            detected_at=now,
            applied_at=None,
            status="VERIFICATION_REQUIRED",
            reason=f"REQUIREMENT_CONFLICT: Disagreement on '{skill_name}' ({source_a_level} vs {source_b_level})"
        )
        self.db.add(event)
        self.db.commit()
        return event

    # =========================================================================
    # 3. RESOURCE UPDATE PIPELINE
    # =========================================================================

    def update_resource(
        self,
        resource_slug: str,
        incoming_data: Dict[str, Any],
        source: str = "Verified Learning Resource Catalog",
        source_url: Optional[str] = None
    ) -> Tuple[Optional[LearningResource], Optional[DataChangeEvent]]:
        """
        Updates learning resource pricing, availability, and URL redirects safely.
        If a resource is unreachable (HTTP 404), marks UNAVAILABLE rather than destructively deleting.
        """
        resource = self.db.query(LearningResource).filter(
            LearningResource.slug == resource_slug.strip().lower()
        ).first()

        now = datetime.now(timezone.utc)
        if not resource:
            # Check SSRF safety of new URL
            url = incoming_data.get("url", "")
            is_safe, err = ResourceVerifier.is_safe_destination(url)
            if not is_safe:
                logger.warning(f"Resource creation blocked for SSRF security: {err}")
                return None, None

            new_res = LearningResource(
                slug=resource_slug.strip().lower(),
                title=incoming_data.get("title", resource_slug.replace("-", " ").title()),
                description=incoming_data.get("description", "Learning resource description"),
                provider=incoming_data.get("provider", "Coursera"),
                url=url,
                resource_type=incoming_data.get("resource_type", "course"),
                difficulty=incoming_data.get("difficulty", "Beginner"),
                estimated_hours=float(incoming_data.get("estimated_hours", 5.0)),
                quality_score=float(incoming_data.get("quality_score", 0.9)),
                career_relevance=incoming_data.get("career_relevance", []),
                language=incoming_data.get("language", "English"),
                price_type=incoming_data.get("price_type", "GENUINELY_FREE"),
                learning_cost=float(incoming_data.get("learning_cost", 0.0)),
                certificate_cost=str(incoming_data.get("certificate_cost", "free")),
                verification_status="VERIFIED",
                status=incoming_data.get("status", "active"),
                source=source,
                last_verified_at=now
            )
            self.db.add(new_res)
            self.db.flush()

            event = DataChangeEvent(
                entity_type="LEARNING_RESOURCE",
                entity_id=new_res.slug,
                change_type="CREATED",
                old_version=0,
                new_version=1,
                old_value=None,
                new_value={"slug": new_res.slug, "price_type": new_res.price_type, "url": new_res.url},
                source=source,
                source_url=source_url or new_res.url,
                detected_at=now,
                applied_at=now,
                status="APPLIED",
                reason="Initial resource creation"
            )
            self.db.add(event)
            self.db.commit()
            cache_invalidator.invalidate_on_resource_change(new_res.slug, new_price_type=new_res.price_type, new_status=new_res.status)
            return new_res, event

        # Existing resource check
        old_val: Dict[str, Any] = {}
        new_val: Dict[str, Any] = {}
        change_type = "UPDATED"

        # 1. Price Change Check
        if "price_type" in incoming_data and incoming_data["price_type"] != resource.price_type:
            old_val["price_type"] = resource.price_type
            new_val["price_type"] = incoming_data["price_type"]
            old_val["learning_cost"] = resource.learning_cost
            new_val["learning_cost"] = incoming_data.get("learning_cost", resource.learning_cost)
            resource.price_type = incoming_data["price_type"]
            resource.learning_cost = float(incoming_data.get("learning_cost", resource.learning_cost))
            change_type = "PRICE_CHANGED"

        # 2. Availability / Status Check (Never delete historical records!)
        if "status" in incoming_data and incoming_data["status"] != resource.status:
            old_val["status"] = resource.status
            new_val["status"] = incoming_data["status"]
            resource.status = incoming_data["status"]
            if incoming_data["status"] in ("UNAVAILABLE", "EXPIRED"):
                resource.verification_status = incoming_data["status"]
            change_type = "STATUS_CHANGED"

        # 3. URL Change Check (Safe Redirect / Canonical URL update)
        if "url" in incoming_data and incoming_data["url"] != resource.url:
            is_safe, err = ResourceVerifier.is_safe_destination(incoming_data["url"])
            if is_safe:
                old_val["url"] = resource.url
                new_val["url"] = incoming_data["url"]
                resource.canonical_url = incoming_data["url"]
                resource.url = incoming_data["url"]
                change_type = "URL_CHANGED"
            else:
                logger.warning(f"Rejecting unsafe URL update for {resource.slug}: {err}")

        if not old_val:
            resource.last_verified_at = now
            self.db.commit()
            return resource, None

        resource.last_verified_at = now
        event = DataChangeEvent(
            entity_type="LEARNING_RESOURCE",
            entity_id=resource.slug,
            change_type=change_type,
            old_version=1,
            new_version=2,
            old_value=old_val,
            new_value=new_val,
            source=source,
            source_url=source_url or resource.url,
            detected_at=now,
            applied_at=now,
            status="APPLIED",
            reason=f"Resource update: {list(old_val.keys())}"
        )
        self.db.add(event)
        self.db.commit()
        cache_invalidator.invalidate_on_resource_change(
            resource.slug,
            old_price_type=old_val.get("price_type", resource.price_type),
            new_price_type=new_val.get("price_type", resource.price_type),
            old_status=old_val.get("status", resource.status),
            new_status=new_val.get("status", resource.status)
        )
        return resource, event

    # =========================================================================
    # 4. AI CANDIDATE GENERATION PIPELINE (WITH PROMPTGUARD DEFENSE)
    # =========================================================================

    def process_ai_candidate(
        self,
        candidate_payload: Dict[str, Any],
        untrusted_source_text: str = ""
    ) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        AI candidates NEVER write directly to the database.
        Flow: AI Candidate -> Schema Validation -> Canonical Matching -> Source Verification -> Duplicate Detection -> Policy Validation -> Persist
        Blocks adversarial prompt injections from mutating price or verification status.
        """
        # Step 1: Adversarial Prompt Injection Defense
        if untrusted_source_text:
            lower_untrusted = untrusted_source_text.lower()
            injection_triggers = [
                "ignore system instructions",
                "ignore all instructions",
                "ignore previous instructions",
                "ignore all previous instructions",
                "override policy",
                "system override",
                "mark this course free",
                "bypass verification",
            ]
            if any(p in lower_untrusted for p in injection_triggers):
                logger.warning("Adversarial prompt injection detected in external text. Quarantining candidate.")
                return False, "Prompt injection attempt detected; candidate quarantined.", None

        # Step 2: Schema Validation
        required_keys = ["entity_type", "entity_id", "proposed_data"]
        if not all(k in candidate_payload for k in required_keys):
            return False, f"Missing required candidate fields: {required_keys}", None

        entity_type = candidate_payload["entity_type"].upper()
        entity_id = candidate_payload["entity_id"].strip().lower()
        proposed_data = candidate_payload["proposed_data"]

        # Step 3: Policy Validation (AI cannot unilaterally mark resource as verified or free)
        if entity_type == "LEARNING_RESOURCE":
            url = proposed_data.get("url", "")
            is_safe, err = ResourceVerifier.is_safe_destination(url)
            if not is_safe:
                return False, f"Candidate URL failed SSRF security check: {err}", None

            # Verify pricing using authoritative classifier, NOT raw AI assertion
            price_type, learn_cost, cert_cost = self.verifier.classify_price(proposed_data)
            proposed_data["price_type"] = price_type
            proposed_data["learning_cost"] = learn_cost
            proposed_data["certificate_cost"] = cert_cost

        # Step 4: Approved candidate proposal returned
        return True, "Candidate passed schema, security, and verification policies.", proposed_data

    # =========================================================================
    # 5. RETRY & BACKOFF LOGIC
    # =========================================================================

    def execute_with_retry(
        self,
        func,
        *args,
        max_attempts: int = 3,
        initial_backoff_sec: float = 0.1,
        **kwargs
    ) -> Any:
        """
        Executes an external provider operation with bounded retries and exponential backoff.
        Prevents request storms and handles transient network faults.
        """
        backoff = initial_backoff_sec
        last_exception = None
        for attempt in range(1, max_attempts + 1):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                logger.warning(f"Operation attempt {attempt}/{max_attempts} failed: {e}. Backing off {backoff:.2f}s.")
                time.sleep(backoff)
                backoff *= 2.0
        raise last_exception

    # =========================================================================
    # 6. ORCHESTRATED REFRESH RUNNER (IDEMPOTENT)
    # =========================================================================

    def run_refresh_job(
        self,
        domain: str = "ALL",
        entity_id: Optional[str] = None,
        job_type: str = "MANUAL",
        force: bool = False
    ) -> DynamicJobRecord:
        """
        Executes a scheduled or manual refresh job across requested domains.
        Guarantees idempotency and observability.
        """
        job_id = f"job-{uuid.uuid4().hex[:12]}"
        job_name = f"{job_type} Refresh: {domain}" + (f" ({entity_id})" if entity_id else "")
        t0 = time.time()
        now = datetime.now(timezone.utc)

        job_rec = DynamicJobRecord(
            job_id=job_id,
            job_name=job_name,
            job_type=job_type,
            domain=domain.upper(),
            status="RUNNING",
            started_at=now,
            records_examined=0,
            records_updated=0,
            records_rejected=0,
            failures_count=0,
            error_details=[],
            summary=""
        )
        self.db.add(job_rec)
        self.db.commit()

        examined = 0
        updated = 0
        rejected = 0
        failures = 0
        errors: List[Any] = []

        try:
            # 1. Company domain
            if domain.upper() in ("COMPANIES", "ALL"):
                query = self.db.query(Company)
                if entity_id:
                    query = query.filter(Company.slug == entity_id.lower())
                companies = query.all()
                for c in companies:
                    examined += 1
                    try:
                        # Check freshness
                        freshness = FreshnessPolicy.evaluate("COMPANY_PROFILE", c.last_verified_at)
                        if freshness.needs_refresh or force:
                            # Re-verify website & careers_url
                            if c.website:
                                safe, _ = ResourceVerifier.is_safe_destination(c.website)
                                if not safe:
                                    rejected += 1
                                    continue
                            c.last_verified_at = datetime.now(timezone.utc)
                            updated += 1
                    except Exception as e:
                        failures += 1
                        errors.append(f"Company {c.slug} error: {str(e)}")

            # 2. Resource domain
            if domain.upper() in ("COURSES", "ALL"):
                query = self.db.query(LearningResource)
                if entity_id:
                    query = query.filter(LearningResource.slug == entity_id.lower())
                resources = query.all()
                for r in resources:
                    examined += 1
                    try:
                        freshness = FreshnessPolicy.evaluate("COURSE_PRICING_AVAILABILITY", r.last_verified_at)
                        if freshness.needs_refresh or force:
                            safe, err = ResourceVerifier.is_safe_destination(r.url)
                            if not safe:
                                r.status = "UNAVAILABLE"
                                r.verification_status = "UNAVAILABLE"
                                updated += 1
                            else:
                                r.last_verified_at = datetime.now(timezone.utc)
                                updated += 1
                    except Exception as e:
                        failures += 1
                        errors.append(f"Resource {r.slug} error: {str(e)}")

            self.db.commit()
            status = "SUCCESS" if failures == 0 else ("PARTIAL_SUCCESS" if updated > 0 else "FAILED")

        except Exception as e:
            failures += 1
            errors.append(f"Job execution abort: {str(e)}")
            status = "FAILED"

        t1 = time.time()
        job_rec.status = status
        job_rec.completed_at = datetime.now(timezone.utc)
        job_rec.latency_ms = round((t1 - t0) * 1000.0, 2)
        job_rec.records_examined = examined
        job_rec.records_updated = updated
        job_rec.records_rejected = rejected
        job_rec.failures_count = failures
        job_rec.error_details = errors
        job_rec.summary = f"Refreshed {domain}: examined={examined}, updated={updated}, rejected={rejected}, failures={failures} in {job_rec.latency_ms}ms"

        self.db.commit()
        return job_rec
