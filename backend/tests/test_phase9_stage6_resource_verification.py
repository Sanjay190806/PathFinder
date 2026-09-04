import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.resources.resource_verifier import ResourceVerifier, VERIFICATION_STATES

client = TestClient(app)

def test_stage6_ssrf_and_protocol_protections():
    verifier = ResourceVerifier()

    # Supported safe public URLs
    assert verifier.is_safe_destination("https://nptel.ac.in/courses")[0] is True
    assert verifier.is_safe_destination("http://learn.microsoft.com/python")[0] is True

    # Blocked SSRF destinations
    assert verifier.is_safe_destination("http://localhost:8000/api")[0] is False
    assert verifier.is_safe_destination("http://127.0.0.1:8000/api")[0] is False
    assert verifier.is_safe_destination("http://10.0.0.1/admin")[0] is False
    assert verifier.is_safe_destination("http://192.168.1.1/router")[0] is False
    assert verifier.is_safe_destination("http://172.16.0.1/internal")[0] is False
    assert verifier.is_safe_destination("http://169.254.169.254/latest/meta-data")[0] is False
    assert verifier.is_safe_destination("http://[::1]/internal")[0] is False

    # Blocked non-HTTP protocols
    assert verifier.is_safe_destination("ftp://ftp.example.com/files")[0] is False
    assert verifier.is_safe_destination("file:///etc/passwd")[0] is False
    assert verifier.is_safe_destination("javascript:alert(1)")[0] is False

def test_stage6_price_classification_integrity():
    verifier = ResourceVerifier()

    # 1. Genuinely Free
    p_type, l_cost, c_cost = verifier.classify_price("FreeCodeCamp Relational Database 100% free")
    assert p_type == "GENUINELY_FREE"
    assert l_cost == 0.0

    # 2. Free to Enroll / Optional Paid Certificate
    p_type, l_cost, c_cost = verifier.classify_price("NPTEL Machine Learning optional exam fee for certificate")
    assert p_type == "FREE_TO_ENROLL_PAID_CERTIFICATE"
    assert l_cost == 0.0
    assert c_cost == "optional_paid"

    # 3. Subscription Required
    p_type, l_cost, c_cost = verifier.classify_price("Access with Coursera Plus monthly subscription required")
    assert p_type == "SUBSCRIPTION_REQUIRED"
    assert l_cost > 0.0

    # 4. Direct Paid
    p_type, l_cost, c_cost = verifier.classify_price("Purchase required price: ₹4,999")
    assert p_type == "PAID"
    assert l_cost > 0.0

    # 5. YouTube Free
    p_type, l_cost, c_cost = verifier.classify_price("https://www.youtube.com/watch?v=sample_video")
    assert p_type == "YOUTUBE_FREE_CONTENT"
    assert l_cost == 0.0

def test_stage6_stale_verification_expiry():
    verifier = ResourceVerifier(max_cache_hours=48)

    now = datetime.now(timezone.utc)
    fresh_ts = now - timedelta(hours=12)
    stale_ts = now - timedelta(hours=50)

    assert verifier.is_stale(fresh_ts) is False
    assert verifier.is_stale(stale_ts) is True
    assert verifier.is_stale(None) is True

def test_stage6_full_resource_audit():
    verifier = ResourceVerifier()

    # Audit NPTEL Course
    nptel_res = {
        "id": "res-ext-nptel-py",
        "title": "Programming in Python",
        "url": "https://nptel.ac.in/courses/106106182",
        "price_type": "FREE_TO_ENROLL_PAID_CERTIFICATE",
        "learning_cost": 0.0,
        "certificate_cost": "optional_paid"
    }
    audit = verifier.verify_resource(nptel_res)
    assert audit.verification_status == "VERIFIED"
    assert audit.price_classification == "FREE_TO_ENROLL_PAID_CERTIFICATE"
    assert audit.learning_cost == 0.0
    assert audit.certificate_cost == "optional_paid"
    assert audit.is_active is True
    assert len(audit.evidence_notes) > 0

    # Audit SSRF target (should fail verification)
    unsafe_res = {
        "id": "res-unsafe",
        "title": "Malicious Metadata Exfiltration",
        "url": "http://169.254.169.254/secret",
        "price_type": "UNKNOWN"
    }
    audit_unsafe = verifier.verify_resource(unsafe_res)
    assert audit_unsafe.verification_status in ("PRICE_UNKNOWN", "UNAVAILABLE")
    assert audit_unsafe.is_active is False
    assert "blocked" in audit_unsafe.evidence_notes.lower()

def test_stage6_on_demand_verification_api():
    login_res = client.post("/api/v1/demo/login")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify extended resource
    res = client.post("/api/v1/resources/res-ext-nptel-py/verify", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["resource_id"] == "res-ext-nptel-py"
    assert data["verification_status"] == "VERIFIED"
    assert data["price_classification"] == "FREE_TO_ENROLL_PAID_CERTIFICATE"
    assert data["is_active"] is True

    # 404 for nonexistent resource
    res_404 = client.post("/api/v1/resources/nonexistent-res-id/verify", headers=headers)
    assert res_404.status_code == 404

    # Unauthenticated is blocked
    res_unauth = client.post("/api/v1/resources/res-ext-nptel-py/verify")
    assert res_unauth.status_code == 401
