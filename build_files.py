import os

files = {}

# 1. backend/app/core/config.py
files['backend/app/core/config.py'] = """from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PathFinder API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "pathfinder-super-secret-jwt-key-change-in-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    DATABASE_URL: str = "sqlite:///./pathfinder.db"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_MODEL_VERSION: str = "v1.0"
    EMBEDDING_DIM: int = 128
    RECOMMENDATION_ALGO_VERSION: str = "v1.2.0"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
"""

# 2. backend/app/core/security.py
files['backend/app/core/security.py'] = """import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
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

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
"""

# 3. backend/app/core/weights.py
files['backend/app/core/weights.py'] = """from typing import Dict

RECOMMENDATION_ALGO_VERSION = "v1.2.0"

RECOMMENDATION_WEIGHTS: Dict[str, float] = {
    "goal_relevance": 0.30,
    "skill_gap": 0.25,
    "prerequisite": 0.15,
    "difficulty": 0.10,
    "preference": 0.08,
    "time": 0.05,
    "engagement": 0.04,
    "diversity": 0.03
}

assert abs(sum(RECOMMENDATION_WEIGHTS.values()) - 1.0) < 1e-6, "Scoring weights must sum to exactly 1.0"
"""

# 4. backend/app/database.py
files['backend/app/database.py'] = """from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

db_url = settings.DATABASE_URL
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filepath}")
