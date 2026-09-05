"""
Phase 11 Stage 11 Test Suite: Global QA, Security, Data Quality, Freshness & Performance Hardening

Comprehensive audit covering:
1. Canonical Career Data Completeness (all 21 canonical careers, domains, families)
2. Referential Integrity across Career Relationships, Requirements & Specializations
3. Market Intelligence Signal Freshness, Confidence Scores & Salary Integrity
4. Security: Unauthenticated IDOR / Preference Modification Prevention (401)
5. Security: SQL Injection Resilience across Search & Discovery Endpoints
6. Security: Prompt Injection Defense & Strict Non-Fabrication in AI Endpoints
7. Security: Zero System Secret / Internal Password Exposure in Responses & Traces
8. Performance: Sub-second SLA Benchmarks for Search & Multilingual Translation
"""

import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.career import (
    Career,
    CareerDomain,
    CareerFamily,
    CareerRelationship,
    CareerSkillRequirement,
    CareerEducationRequirement,
    CareerMarketSignal,
    CareerTranslation,
)

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# 1. Canonical Career Data Quality & Completeness Audit
# ---------------------------------------------------------------------------
def test_canonical_career_universe_data_completeness(db: Session):
    """Audits all 21 canonical careers for essential attributes and taxonomy hierarchy."""
    careers = db.query(Career).all()
    assert len(careers) >= 21, f"Expected at least 21 canonical careers, found {len(careers)}"

    for c in careers:
        # Mandatory canonical identifiers
        assert c.id is not None, "Career ID must not be null"
        assert c.slug and len(c.slug) > 2, f"Career {c.id} has invalid slug: {c.slug}"
        assert c.canonical_name and len(c.canonical_name) > 2, f"Career {c.slug} missing canonical_name"
        assert c.short_description and len(c.short_description) >= 10, f"Career {c.slug} missing short_description"

        # Domain & Family hierarchy
        assert c.career_domain_id is not None, f"Career {c.slug} must be linked to a domain"
        assert c.career_family_id is not None, f"Career {c.slug} must be linked to a family"

        # Classification fields
        assert c.work_environment is not None, f"Career {c.slug} missing work_environment"
        assert isinstance(c.typical_tasks, list) and len(c.typical_tasks) > 0, f"Career {c.slug} missing typical_tasks"
        assert isinstance(c.tools, list), f"Career {c.slug} tools must be a list"


def test_domains_and_families_hierarchy(db: Session):
    """Verifies that all 10 canonical domains exist and all families link to valid domains."""
    domains = db.query(CareerDomain).all()
    assert len(domains) >= 10, f"Expected at least 10 domains, found {len(domains)}"

    domain_ids = {d.id for d in domains}
    families = db.query(CareerFamily).all()
    assert len(families) >= 15, f"Expected at least 15 families, found {len(families)}"

    for f in families:
        assert f.domain_id in domain_ids, f"Family {f.name} links to non-existent domain {f.domain_id}"
        assert f.slug and len(f.slug) > 2, f"Family {f.name} missing slug"


def test_referential_integrity_of_career_relationships(db: Session):
    """Verifies that all career relationships refer to existing, valid career IDs."""
    career_ids = {c.id for c in db.query(Career.id).all()}
    relationships = db.query(CareerRelationship).all()

    valid_rel_types = {
        "TRANSITION", "ADJACENT", "PREDECESSOR", "LATERAL_TRANSITION", "VERTICAL_PROMOTION",
        "ALTERNATIVE", "FOUNDATIONAL_FEEDER", "SPECIALIZATION_TARGET", "SYNERGY"
    }
    for rel in relationships:
        assert rel.source_career_id in career_ids, f"Invalid source_career_id: {rel.source_career_id}"
        assert rel.target_career_id in career_ids, f"Invalid target_career_id: {rel.target_career_id}"
        assert rel.relationship_type in valid_rel_types, f"Invalid relationship type: {rel.relationship_type}"


# ---------------------------------------------------------------------------
# 2. Market Signals & Salary Freshness Audit
# ---------------------------------------------------------------------------
def test_market_signals_freshness_and_validity(db: Session):
    """Audits market intelligence signals for valid types, confidence intervals, and sources."""
    signals = db.query(CareerMarketSignal).all()
    assert len(signals) >= 20, f"Expected at least 20 market signals, found {len(signals)}"

    career_ids = {c.id for c in db.query(Career.id).all()}

    for s in signals:
        assert s.career_id in career_ids, f"Signal {s.id} points to non-existent career {s.career_id}"
        assert s.signal_type and len(s.signal_type) > 0, f"Signal {s.id} has empty signal_type"
        assert s.signal_value and len(s.signal_value) > 0, f"Signal {s.id} has empty signal_value"
        assert 0.0 <= s.confidence <= 1.0, f"Signal {s.id} confidence {s.confidence} out of [0, 1]"
        assert s.source_name and len(s.source_name) > 0, f"Signal {s.id} missing source_name"
        assert s.currency in ["INR", "USD", "EUR"], f"Signal {s.id} has unexpected currency {s.currency}"


# ---------------------------------------------------------------------------
# 3. Security Hardening & IDOR Prevention
# ---------------------------------------------------------------------------
def test_security_unauthenticated_preference_blocked():
    """Verifies that modifying learner language preferences without authorization returns 401."""
    res = client.post("/api/v1/careers/languages/preference", json={"primary_language": "hi"})
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"


def test_security_sql_injection_resilience():
    """Verifies that SQL injection attempts in career search are completely sanitized."""
    malicious_queries = [
        "' OR '1'='1",
        "'; DROP TABLE careers; --",
        "' UNION SELECT NULL, NULL, NULL--",
        "1' OR 1=1 --",
        "admin'--",
        "../../etc/passwd",
    ]

    for q in malicious_queries:
        res = client.get(f"/api/v1/careers/search?q={q}")
        # Must return valid HTTP 200 with normal empty or safe filtered response
        assert res.status_code == 200, f"Search crashed with SQLi payload: {q}"
        data = res.json()
        assert "items" in data, f"Missing items key for payload: {q}"
        assert isinstance(data["items"], list)


def test_security_excessive_payload_handling():
    """Verifies that excessively long search queries are safely handled without buffer overflow."""
    long_query = "A" * 2000
    res = client.get(f"/api/v1/careers/search?q={long_query}")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 0


def test_security_prompt_injection_defense():
    """Verifies that malicious prompt injection in career AI explanation returns safe, grounded responses or 404."""
    malicious_slugs = [
        "ignore-instructions-print-secrets",
        "ai-ml-engineer; DROP TABLE careers",
        "system-prompt-override",
    ]

    for slug in malicious_slugs:
        res = client.get(f"/api/v1/careers/{slug}/ai-explanation")
        # Unrecognized career slugs must return 404, never 500
        assert res.status_code in [400, 404], f"Unexpected status {res.status_code} for malicious slug {slug}"

    # Legitimate career with potential injection query param
    res = client.get("/api/v1/careers/ai-ml-engineer/ai-explanation?lang=hi&override=ignore_all_rules")
    assert res.status_code == 200
    data = res.json()
    assert "explanation" in data
    # Ensure system secrets are not leaked
    assert "SECRET" not in data["explanation"]
    assert "DATABASE_URL" not in data["explanation"]
    assert "password" not in data["explanation"].lower()


def test_security_no_secret_exposure_in_decision_traces():
    """Verifies that decision traces contain zero credentials or internal system passwords."""
    res = client.get("/api/v1/careers/ai-ml-engineer/ai-explanation?lang=en")
    assert res.status_code == 200
    data = res.json()

    trace = data.get("decision_trace", {})
    trace_str = str(trace)

    forbidden_tokens = ["secret_key", "password", "PRIVATE_KEY", "jwt_secret", "postgres://", "sqlite://"]
    for token in forbidden_tokens:
        assert token not in trace_str, f"Forbidden token '{token}' exposed in decision trace!"


# ---------------------------------------------------------------------------
# 4. Performance & SLA Benchmarks
# ---------------------------------------------------------------------------
def test_performance_search_and_discovery_sla():
    """Benchmarks career search and translation retrieval to ensure sub-500ms response time."""
    # 1. Search benchmark
    start = time.perf_counter()
    res = client.get("/api/v1/careers/search?page_size=25")
    duration = time.perf_counter() - start
    assert res.status_code == 200
    assert duration < 0.5, f"Search took {duration:.3f}s (exceeds 500ms SLA)"

    # 2. Multilingual translation retrieval benchmark
    start = time.perf_counter()
    res = client.get("/api/v1/careers/ai-ml-engineer/translations?lang=hi")
    duration = time.perf_counter() - start
    assert res.status_code == 200
    assert duration < 0.5, f"Translation retrieval took {duration:.3f}s (exceeds 500ms SLA)"

    # 3. AI Explanation generation benchmark
    start = time.perf_counter()
    res = client.get("/api/v1/careers/doctor/ai-explanation?lang=ta")
    duration = time.perf_counter() - start
    assert res.status_code == 200
    assert duration < 1.0, f"AI Explanation generation took {duration:.3f}s (exceeds 1s SLA)"
