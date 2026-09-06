import pytest
import re
import logging
from fastapi.testclient import TestClient
from pydantic import ValidationError
from backend.app.main import app
from backend.app.core.config import Settings
from backend.app.core.logger import sanitize_log_message, SensitiveDataFilter
from backend.app.schemas.auth import UserCreate
from backend.app.dsa.dsa_priority_service import DSAPriorityService, CANONICAL_DSA_PRIORITY_WEIGHTS
from backend.app.database import get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db():
    db_gen = get_db()
    db_sess = next(db_gen)
    try:
        yield db_sess
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


# ==============================================================================
# LOGIC-002: DSA Canonical Priority Weights and Decision Trace Consistency
# ==============================================================================

def test_logic_002_canonical_weights_defined():
    """Verifies that canonical weights are normalized between 0.0 and 1.0."""
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["VERY_HIGH"] == 1.0
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["HIGH"] == 0.8
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["MEDIUM"] == 0.5
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["LOW"] == 0.3
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["MINIMAL"] == 0.1
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["NOT_APPLICABLE"] == 0.0
    assert CANONICAL_DSA_PRIORITY_WEIGHTS["UNKNOWN"] == 0.0

    # Class helper method
    assert DSAPriorityService.get_canonical_weight("VERY_HIGH") == 1.0
    assert DSAPriorityService.get_canonical_weight("medium") == 0.5
    assert DSAPriorityService.get_canonical_weight("invalid") == 0.0


def test_logic_002_factors_use_canonical_weights(db):
    """Verifies that decision trace factors accurately reflect the canonical weight table."""
    # Software Engineer -> VERY_HIGH
    swe = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Software Engineer")
    factors = swe["decision_trace"]["factors"]
    relevance_factor = next(f for f in factors if f["name"] == "Role DSA Relevance")
    assert relevance_factor["weight"] == 0.6
    assert relevance_factor["raw_score"] == 1.0
    assert relevance_factor["contribution"] == 0.6

    # Frontend Engineer -> MEDIUM
    fe = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Frontend Engineer")
    factors_fe = fe["decision_trace"]["factors"]
    rel_fe = next(f for f in factors_fe if f["name"] == "Role DSA Relevance")
    assert rel_fe["raw_score"] == 0.5
    assert rel_fe["contribution"] == 0.3

    # DevOps Engineer -> LOW
    devops = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="DevOps Engineer")
    factors_devops = devops["decision_trace"]["factors"]
    rel_devops = next(f for f in factors_devops if f["name"] == "Role DSA Relevance")
    assert rel_devops["raw_score"] == 0.3
    assert rel_devops["contribution"] == 0.18


def test_logic_002_non_software_zero_relevance(db):
    """Verifies non-software roles return NOT_APPLICABLE with 0.0 contribution."""
    designer = DSAPriorityService.get_role_dsa_priority(db, canonical_role_name="Graphic Designer")
    factors = designer["decision_trace"]["factors"]
    domain_factor = next(f for f in factors if f["name"] == "Domain Classification")
    assert domain_factor["raw_score"] == 0.0
    assert domain_factor["contribution"] == 0.0


# ==============================================================================
# SEC-007: Production CORS Hardening
# ==============================================================================

def test_sec_007_cors_wildcard_rejection_with_credentials():
    """Verifies that Settings strictly rejects wildcard '*' origin when credentials are enabled."""
    with pytest.raises(ValidationError) as exc:
        Settings(SECRET_KEY="abcdefghijklmnopqrstuvwxyz123456", CORS_ORIGINS=["*"])
    assert "Wildcard origin '*' is strictly prohibited" in str(exc.value)


def test_sec_007_cors_comma_separated_env_parsing():
    """Verifies that comma-separated environment string is cleanly parsed into allowed origins."""
    s = Settings(
        SECRET_KEY="abcdefghijklmnopqrstuvwxyz123456",
        CORS_ORIGINS="https://app.pathfinder.io, https://staging.pathfinder.io/"
    )
    assert s.CORS_ORIGINS == ["https://app.pathfinder.io", "https://staging.pathfinder.io"]


def test_sec_007_cors_invalid_scheme_rejection():
    """Verifies that non-http(s) origins are rejected."""
    with pytest.raises(ValidationError) as exc:
        Settings(SECRET_KEY="abcdefghijklmnopqrstuvwxyz123456", CORS_ORIGINS=["javascript:alert(1)"])
    assert "Must start with http:// or https://" in str(exc.value)


def test_sec_007_cors_preflight_validation(client):
    """Verifies OPTIONS preflight returns proper CORS headers for allowed origin."""
    res = client.options(
        "/api/v1/auth/me",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization, X-CSRF-Token"
        }
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert res.headers.get("access-control-allow-credentials") == "true"


def test_sec_007_cors_disallowed_origin_no_header(client):
    """Verifies that an unlisted origin does not receive access-control-allow-origin header."""
    res = client.get(
        "/api/v1/dsa/domains",
        headers={"Origin": "http://malicious-site.example.com"}
    )
    assert res.headers.get("access-control-allow-origin") is None


# ==============================================================================
# SEC-009: Password Strength Policy
# ==============================================================================

def test_sec_009_password_minimum_length():
    """Verifies rejection of passwords shorter than 8 characters."""
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="short@example.com", password="1234567", full_name="Short User")
    assert "at least 8 characters long" in str(exc.value)


def test_sec_009_password_whitespace_rejection():
    """Verifies rejection of passwords that are purely whitespace or contain leading/trailing whitespace."""
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="spaces@example.com", password="        ", full_name="Space User")
    assert "whitespace" in str(exc.value).lower()

    with pytest.raises(ValidationError) as exc2:
        UserCreate(email="trim@example.com", password=" Password123! ", full_name="Trim User")
    assert "leading or trailing whitespace" in str(exc2.value)


def test_sec_009_password_maximum_length():
    """Verifies rejection of excessively long passwords (>128 chars) to protect hashing resources."""
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="long@example.com", password="A" * 129, full_name="Long User")
    assert "not exceed 128 characters" in str(exc.value)


def test_sec_009_valid_passwords_accepted():
    """Verifies that standard complex passwords (and existing test passwords) are accepted."""
    valid_passwords = [
        "Password123!",
        "SecurePassword123!",
        "my-super-secret-passphrase-2026",
    ]
    for pw in valid_passwords:
        u = UserCreate(email="valid@example.com", password=pw, full_name="Valid User")
        assert u.password == pw


# ==============================================================================
# SEC-010: Sensitive Logging Sanitization
# ==============================================================================

def test_sec_010_bearer_token_redaction():
    """Verifies that JWT Bearer tokens are redacted in logs."""
    msg = "Request header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakMe"
    sanitized = sanitize_log_message(msg)
    assert "Bearer [REDACTED]" in sanitized
    assert "doNotLeakMe" not in sanitized


def test_sec_010_password_field_redaction():
    """Verifies that password fields in log strings are redacted."""
    raw_log = 'User registration failed for alex@example.com with password="MySecretP@ssword!" and email=alex@example.com'
    sanitized = sanitize_log_message(raw_log)
    assert 'password="[REDACTED]"' in sanitized or 'password=[REDACTED]' in sanitized
    assert "MySecretP@ssword!" not in sanitized


def test_sec_010_cookie_redaction():
    """Verifies that cookies containing tokens are redacted."""
    msg = "Incoming request with Cookie: access_token=secret_jwt_token_here; other=value"
    sanitized = sanitize_log_message(msg)
    assert "Cookie: [REDACTED]" in sanitized
    assert "secret_jwt_token_here" not in sanitized


def test_sec_010_filter_redacts_record_args():
    """Verifies that SensitiveDataFilter intercepts both record.msg and record.args."""
    filt = SensitiveDataFilter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="Login attempt with token: %s",
        args=("secret_jwt_token_value",),
        exc_info=None
    )
    filt.filter(record)
    assert "secret_jwt_token_value" not in str(record.args)
