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
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes (SEC-003 short-lived access token)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days for revocable refresh token
    COOKIE_SECURE: bool = False            # Set to True behind HTTPS in production
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

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    v = json.loads(v)
                except Exception:
                    v = [item.strip() for item in v[1:-1].split(",") if item.strip()]
            else:
                v = [item.strip() for item in v.split(",") if item.strip()]

        if not isinstance(v, list):
            raise ValueError("CORS_ORIGINS must be a list of origin strings or comma-separated string.")

        cleaned_origins = []
        for origin in v:
            origin_str = str(origin).strip().rstrip("/")
            if origin_str == "*":
                raise ValueError(
                    "CORS configuration error: Wildcard origin '*' is strictly prohibited "
                    "when allow_credentials=True (SEC-007). Specify explicit origin URLs."
                )
            if not (origin_str.startswith("http://") or origin_str.startswith("https://")):
                raise ValueError(f"Invalid CORS origin: '{origin_str}'. Must start with http:// or https://")
            cleaned_origins.append(origin_str)

        if not cleaned_origins:
            raise ValueError("CORS_ORIGINS cannot be empty.")
        return cleaned_origins

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

