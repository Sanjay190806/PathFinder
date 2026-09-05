from typing import List, Optional
from pydantic import field_validator
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
    # No default — app crashes at startup if not set in .env or environment.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = "sqlite:///./pathfinder.db"
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    YOUTUBE_API_KEY: Optional[str] = None
    MARKET_INTELLIGENCE_CACHE_HOURS: int = 24
    RESOURCE_VERIFICATION_CACHE_HOURS: int = 48
    RESOURCE_VERIFICATION_TIMEOUT_SECONDS: int = 10
    AI_PROVIDER: str = "gemini"
    AI_REQUEST_TIMEOUT_SECONDS: int = 20
    AI_MAX_INPUT_CHARS: int = 4000
    AI_MAX_CONTEXT_ITEMS: int = 10
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_MODEL_VERSION: str = "v1.0"
    EMBEDDING_DIM: int = 128
    RECOMMENDATION_ALGO_VERSION: str = "v1.2.0"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError(
                "\n\n"
                "═══════════════════════════════════════════════════════════\n"
                "  SECURITY ERROR: SECRET_KEY is missing or too short.\n"
                "  Set a strong random key (≥32 chars) in your .env file:\n"
                "\n"
                "    SECRET_KEY=<your-random-32+-character-secret>\n"
                "\n"
                "  Generate one with:  python -c \"import secrets; print(secrets.token_hex(32))\"\n"
                "═══════════════════════════════════════════════════════════\n"
            )
        return v

settings = Settings()

