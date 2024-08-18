"""
config.py — Centralised application settings loaded from environment variables.
Uses pydantic-settings v2 so every value is type-checked at startup.
"""
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "ShebaBD AI Backend"
    app_version: str = "1.0.0"
    debug: bool = True

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── Database ─────────────────────────────────────────────────────────────
    # Default: SQLite (no setup needed). Switch to PostgreSQL in .env:
    #   DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/shebabd
    database_url: str = Field(
        default="sqlite+aiosqlite:///./shebabd.db"
    )
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # ── OpenAI ───────────────────────────────────────────────────────────────
    openai_api_key: str = Field(default="")
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 1024
    openai_temperature: float = 0.7
    openai_timeout: int = 60          # seconds

    # ── JWT ──────────────────────────────────────────────────────────────────
    jwt_secret_key: str = Field(default="change-me")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080   # 7 days

    # ── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    # ── Rate limiting ────────────────────────────────────────────────────────
    rate_limit_per_minute: int = 30

    # ── SMTP Configuration ───────────────────────────────────────────────────
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "mdfahimuntasir1488.csenub@gmail.com"
    smtp_password: str = "encuselbefwkjhuh"
    smtp_from: str = "mdfahimuntasir1488.csenub@gmail.com"

    # ── Resend (preferred email transport) ───────────────────────────────────
    resend_api_key: str = Field(default="")
    # Use onboarding@resend.dev for testing; set a verified domain for prod
    resend_from_email: str = Field(default="ShebaBD <onboarding@resend.dev>")

    @property
    def use_resend(self) -> bool:
        """True when a Resend API key is configured."""
        return bool(self.resend_api_key)

    # ── ShebaBD internal API (used by tool calling) ──────────────────────────
    shebabd_api_base_url: str = "http://localhost:8000/api/v1"
    shebabd_api_key: str = "internal-service-key"

    # ── Derived helpers ──────────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @field_validator("openai_api_key")
    @classmethod
    def _check_openai_key(cls, v: str) -> str:
        if not v:
            import warnings
            warnings.warn(
                "OPENAI_API_KEY is not set. Chat endpoints will fail.",
                stacklevel=2,
            )
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
 