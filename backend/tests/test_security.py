import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import Settings
import pydantic

client = TestClient(app)

def test_security_headers_present():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("x-content-type-options") == "nosniff"
    assert res.headers.get("x-frame-options") == "DENY"
    assert res.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert res.headers.get("x-xss-protection") == "1; mode=block"

def test_cors_restriction():
    # Whitelisted origin
    res = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
    
    # Non-whitelisted origin
    res_malicious = client.get("/health", headers={"Origin": "http://evil-attacker.com"})
    assert res_malicious.headers.get("access-control-allow-origin") is None

def test_auth_cookie_flow():
    # Demo login sets httpOnly cookie
    res = client.post("/api/v1/demo/login")
    assert res.status_code == 200
    assert "pathfinder_token" in res.cookies
    
    # Logout clears the cookie
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
    # Cookie should be deleted/expired in response
    cookie_header = logout_res.headers.get("set-cookie", "")
    assert "pathfinder_token=" in cookie_header

def test_secret_key_validation_enforced():
    # Missing / empty SECRET_KEY must fail validation
    with pytest.raises(pydantic.ValidationError):
        Settings(SECRET_KEY="")

    # Too short SECRET_KEY (< 32 chars) must fail validation
    with pytest.raises(pydantic.ValidationError):
        Settings(SECRET_KEY="short-key-12345")

    # Valid 32+ char key succeeds
    valid_settings = Settings(SECRET_KEY="a"*32)
    assert valid_settings.SECRET_KEY == "a"*32
