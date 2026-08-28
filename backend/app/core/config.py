from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

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

settings = Settings()
