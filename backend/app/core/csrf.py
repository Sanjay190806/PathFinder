import hmac
import hashlib
import secrets
from typing import Optional
from fastapi import Request, HTTPException, status
from backend.app.core.config import settings

CSRF_COOKIE_NAME = "pathfinder_csrf_token"
CSRF_HEADER_NAME = "x-csrf-token"

def generate_csrf_token() -> str:
    """
    Generates a cryptographically strong, HMAC-signed CSRF token (SEC-006).
    """
    raw = secrets.token_hex(24)
    sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    return f"{raw}.{sig}"

def verify_csrf_token(token: str) -> bool:
    """
    Validates the cryptographic HMAC signature of a CSRF token.
    """
    if not token or "." not in token:
        return False
    parts = token.split(".", 1)
    if len(parts) != 2:
        return False
    raw, sig = parts
    expected = hmac.new(settings.SECRET_KEY.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    return secrets.compare_digest(sig, expected)

def validate_csrf_protection(request: Request) -> None:
    """
    SEC-006: Validates CSRF token for unsafe state-changing HTTP methods
    (POST, PUT, PATCH, DELETE) when ambient cookie authentication is used.
    
    If the request is explicitly authenticated via a Bearer token in the
    Authorization header, CSRF validation is bypassed (standard industry practice,
    since browsers cannot send custom Authorization headers cross-origin).
    Public authentication endpoints (login, register, refresh, logout) are exempt.
    """
    # Safe methods are read-only
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return

    # Check if request has an explicit Bearer token header
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        return

    # If no auth cookie is present, ambient cookie auth is not being used
    auth_cookie = request.cookies.get("pathfinder_token")
    if not auth_cookie:
        return

    # Exempt public endpoints that establish or clear authentication
    path = request.url.path
    if (
        path.endswith("/auth/login")
        or path.endswith("/auth/register")
        or path.endswith("/auth/refresh")
        or path.endswith("/auth/logout")
    ):
        return

    # Unsafe state-changing request with cookie auth: CSRF token is mandatory
    submitted_token = request.headers.get(CSRF_HEADER_NAME)
    cookie_token = request.cookies.get(CSRF_COOKIE_NAME)

    if not submitted_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing in X-CSRF-Token header.",
        )

    if not verify_csrf_token(submitted_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token.",
        )

    if cookie_token and not secrets.compare_digest(submitted_token, cookie_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token mismatch with cookie.",
        )
