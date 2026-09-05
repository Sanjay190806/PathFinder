from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.app.database import get_db
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.models.user import User
from backend.app.schemas.auth import UserCreate, UserLogin, UserOut, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# Auth endpoints use a dedicated stricter limiter.
_auth_limiter = Limiter(key_func=get_remote_address)

# ---------------------------------------------------------------------------
# Cookie configuration
# ---------------------------------------------------------------------------
_COOKIE_NAME = "pathfinder_token"
_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days, matching ACCESS_TOKEN_EXPIRE_MINUTES


def _set_auth_cookie(response: Response, token: str) -> None:
    """Write the JWT into an httpOnly, SameSite=Lax cookie."""
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,       # Not accessible from JavaScript — blocks XSS token theft
        samesite="lax",      # Blocks CSRF from cross-site POST requests
        secure=False,        # Set to True in production behind HTTPS
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=_COOKIE_NAME, path="/")


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
    token = create_access_token(user.id)
    _set_auth_cookie(response, token)
    return Token(access_token=token, user=UserOut.model_validate(user))


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
    token = create_access_token(user.id)
    _set_auth_cookie(response, token)
    return Token(access_token=token, user=UserOut.model_validate(user))


# ---------------------------------------------------------------------------
# Logout — clears the httpOnly cookie
# ---------------------------------------------------------------------------
@router.post("/logout")
def logout(response: Response):
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

