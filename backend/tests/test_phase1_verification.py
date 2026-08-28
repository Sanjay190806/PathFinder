import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token

client = TestClient(app)

def test_phase1_config_and_secrets():
    assert settings.PROJECT_NAME == "PathFinder API"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.DATABASE_URL.startswith("sqlite") or settings.DATABASE_URL.startswith("postgresql")
    assert settings.RECOMMENDATION_ALGO_VERSION == "v1.2.0"
    assert len(settings.SECRET_KEY) >= 32

def test_phase1_password_hashing_and_verification():
    raw_password = "SecurePassword2026!"
    hashed = hash_password(raw_password)
    assert hashed != raw_password
    assert "$" in hashed  # salt$key format
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False

def test_phase1_jwt_creation_and_decoding():
    user_id = "test-user-id-12345"
    token = create_access_token(user_id)
    assert isinstance(token, str)
    decoded_sub = decode_access_token(token)
    assert decoded_sub == user_id

def test_phase1_health_and_root_endpoints():
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json() == {"status": "healthy"}

    res_root = client.get("/")
    assert res_root.status_code == 200
    data = res_root.json()
    assert data["name"] == "PathFinder API"
    assert data["status"] == "online"

def test_phase1_protected_endpoints_reject_unauthenticated():
    # 1. Profile protected endpoint
    res = client.get("/api/v1/profile")
    assert res.status_code == 401
    
    # 2. Learning path protected endpoint
    res2 = client.get("/api/v1/learning-path")
    assert res2.status_code == 401

    # 3. Invalid Bearer token
    res3 = client.get("/api/v1/profile", headers={"Authorization": "Bearer invalid_garbage_token"})
    assert res3.status_code == 401

def test_phase1_auth_flow_registration_login_protected_access():
    test_email = "phase1_test_user@example.com"
    test_password = "MyComplexPassword123!"
    test_name = "Phase1 Tester"

    # 1. Register new user
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_password,
        "full_name": test_name
    })
    assert reg_res.status_code in [200, 400]
    
    # 2. Login with valid credentials
    login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    
    # 3. Access protected profile endpoint with token
    headers = {"Authorization": f"Bearer {token}"}
    prof_res = client.get("/api/v1/profile", headers=headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["email"] == test_email

    # 4. Login with invalid credentials rejected
    bad_login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword123"
    })
    assert bad_login_res.status_code == 401
