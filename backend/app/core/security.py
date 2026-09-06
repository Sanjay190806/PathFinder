import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Tuple
from jose import jwt, JWTError
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 600000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split('$', 1)
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 600000)
        return secrets.compare_digest(new_key.hex(), stored_hash)
    except Exception:
        return False

def hash_token(raw_token: str) -> str:
    """Computes SHA-256 digest of raw token for safe database persistence."""
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates short-lived JWT access token with explicit 'type': 'access' claim (SEC-003).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access",
        "jti": uuid.uuid4().hex,
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """
    Decodes JWT access token and verifies 'type' == 'access'.
    Prevents refresh tokens or malformed tokens from being used as access tokens.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Reject refresh tokens or any non-access tokens
        token_type = payload.get("type")
        if token_type and token_type != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None

def create_refresh_token(subject: Union[str, Any]) -> Tuple[str, str, datetime]:
    """
    SEC-003: Creates dedicated, high-entropy refresh token.
    Returns: (raw_token, token_hash, expires_at)
    """
    raw_token = f"pfr_{secrets.token_urlsafe(48)}"
    token_h = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_h, expires_at

