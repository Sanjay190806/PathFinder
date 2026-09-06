from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.app.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    create_refresh_token,
    hash_token,
)
from backend.app.core.csrf import generate_csrf_token, CSRF_COOKIE_NAME
from backend.app.models.user import User, RefreshToken
from backend.app.schemas.auth import UserCreate, UserLogin, UserOut, Token, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# Auth endpoints use a dedicated stricter limiter.
_auth_limiter = Limiter(key_func=get_remote_address)

# ---------------------------------------------------------------------------
# Cookie configuration (SEC-003 & SEC-006)
# ---------------------------------------------------------------------------
_COOKIE_NAME = "pathfinder_token"
_REFRESH_COOKIE_NAME = "pathfinder_refresh_token"


def _set_auth_cookie(response: Response, token: str, refresh_token: Optional[str] = None) -> None:
    """Writes access token, refresh token, and CSRF token into cookies."""
    # Access token cookie (short-lived, 15 mins)
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,       # Not accessible from JavaScript — blocks XSS token theft
        samesite="lax",      # Blocks CSRF from cross-site POST requests
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    if refresh_token:
        # Dedicated refresh token cookie (7 days)
        response.set_cookie(
            key=_REFRESH_COOKIE_NAME,
            value=refresh_token,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            httponly=True,
            samesite="lax",
            secure=settings.COOKIE_SECURE,
            path="/",
        )
    # Issue/renew CSRF token cookie (accessible by frontend JavaScript to populate X-CSRF-Token header)
    csrf_tok = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_tok,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False,      # JavaScript reads this to populate X-CSRF-Token header
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=_COOKIE_NAME, path="/")
    response.delete_cookie(key=_REFRESH_COOKIE_NAME, path="/")
    response.delete_cookie(key=CSRF_COOKIE_NAME, path="/")



# ---------------------------------------------------------------------------
# Dependency: resolve current user from cookie (primary) or Bearer header (fallback)
# ---------------------------------------------------------------------------
def get_current_user(
    request: Request,
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    # 1. Bearer header takes priority over cookie (explicit caller identity)
    token = token_header or request.cookies.get(_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_optional_current_user(
    request: Request,
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    token = token_header or request.cookies.get(_COOKIE_NAME)
    if not token:
        return None
    try:
        user_id = decode_access_token(token)
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Register — 5 attempts per minute per IP
# ---------------------------------------------------------------------------
@router.post("/register", response_model=Token)
@_auth_limiter.limit("5/minute")
def register_user(
    request: Request,
    response: Response,
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token(user.id)
    raw_refresh, token_hash, expires_at = create_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at))
    db.commit()
    _set_auth_cookie(response, access_token, raw_refresh)
    return Token(access_token=access_token, refresh_token=raw_refresh, user=UserOut.model_validate(user))


# ---------------------------------------------------------------------------
# Login — 10 attempts per minute per IP
# ---------------------------------------------------------------------------
@router.post("/login", response_model=Token)
@_auth_limiter.limit("10/minute")
def login_user(
    request: Request,
    response: Response,
    login_in: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token = create_access_token(user.id)
    raw_refresh, token_hash, expires_at = create_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at))
    db.commit()
    _set_auth_cookie(response, access_token, raw_refresh)
    return Token(access_token=access_token, refresh_token=raw_refresh, user=UserOut.model_validate(user))


# ---------------------------------------------------------------------------
# Refresh Token — 20 attempts per minute per IP (SEC-003)
# ---------------------------------------------------------------------------
@router.post("/refresh", response_model=Token)
@_auth_limiter.limit("20/minute")
def refresh_access_token(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    """
    SEC-003: Exchanges a valid, unrevoked refresh token for a new access token
    and rotates the refresh token. Detects replay attacks and invalidates sessions.
    """
    raw_token = (
        request.cookies.get(_REFRESH_COOKIE_NAME)
        or request.headers.get("X-Refresh-Token")
        or (payload.refresh_token if payload else None)
    )
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_h = hash_token(raw_token)
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_h).first()
    now = datetime.now(timezone.utc)

    if not rt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # REPLAY DETECTION: If a revoked token is reused, invalidate all user sessions
    if rt.revoked:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == rt.user_id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        db.commit()
        _clear_auth_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token already revoked (replay detected). All sessions invalidated. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Expiration check
    rt_exp = rt.expires_at if rt.expires_at.tzinfo else rt.expires_at.replace(tzinfo=timezone.utc)
    if rt_exp < now:
        rt.revoked = True
        db.commit()
        _clear_auth_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == rt.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # ROTATION: Invalidate old refresh token immediately
    rt.revoked = True

    # Issue new access token and new refresh token
    new_access_token = create_access_token(user.id)
    new_raw_refresh, new_token_hash, new_expires_at = create_refresh_token(user.id)
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=new_token_hash,
        expires_at=new_expires_at,
    )
    db.add(new_rt)
    db.commit()

    _set_auth_cookie(response, new_access_token, new_raw_refresh)
    return Token(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        user=UserOut.model_validate(user),
    )


# ---------------------------------------------------------------------------
# CSRF Token Endpoint (SEC-006)
# ---------------------------------------------------------------------------
@router.get("/csrf")
def get_csrf_token(response: Response):
    """Issues or refreshes CSRF token for browser clients (SEC-006)."""
    csrf_tok = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_tok,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return {"csrf_token": csrf_tok}


# ---------------------------------------------------------------------------
# Logout — clears cookies and invalidates refresh token server-side (SEC-003)
# ---------------------------------------------------------------------------
@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    raw_token = (
        (body.refresh_token if body else None)
        or request.cookies.get(_REFRESH_COOKIE_NAME)
        or request.headers.get("X-Refresh-Token")
    )
    if raw_token:
        token_h = hash_token(raw_token)
        rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_h).first()
        if rt:
            rt.revoked = True
            db.commit()
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully"}



# ---------------------------------------------------------------------------
# Me
# ---------------------------------------------------------------------------
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


# ---------------------------------------------------------------------------
# Optional auth — used by endpoints that work for both logged-in and anonymous users
# ---------------------------------------------------------------------------
def get_optional_current_user(
    request: Request,
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    token = request.cookies.get(_COOKIE_NAME) or token_header
    if not token:
        return None
    user_id = decode_access_token(token)
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()

