"""
cors_handler.py — CORS configuration and allowed origins helper for ShebaBD.

Manages dynamic CORS origin validation based on environment.
Supports localhost development, staging and production domains.
"""
import logging
import os
from typing import Sequence

logger = logging.getLogger(__name__)

# Default allowed origins
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

PRODUCTION_ORIGINS = [
    "https://shebabd.org",
    "https://www.shebabd.org",
    "https://app.shebabd.org",
]


def get_allowed_origins(env: str = "development") -> list[str]:
    """
    Return the list of allowed CORS origins for the given environment.
    Reads ALLOWED_ORIGINS env var if set, otherwise uses defaults.
    """
    env_origins = os.getenv("ALLOWED_ORIGINS", "")
    if env_origins:
        origins = [o.strip() for o in env_origins.split(",") if o.strip()]
        logger.info("CORS origins from env: %s", origins)
        return origins

    if env == "production":
        logger.info("CORS: using production origins")
        return PRODUCTION_ORIGINS

    logger.info("CORS: using development origins")
    return DEFAULT_ORIGINS + PRODUCTION_ORIGINS


def is_origin_allowed(origin: str, allowed: Sequence[str]) -> bool:
    """Check if a specific origin is in the allowed list."""
    return origin in allowed


def build_cors_config(env: str = "development") -> dict:
    """
    Build the complete CORS configuration dict for FastAPI CORSMiddleware.
    """
    origins = get_allowed_origins(env)
    return {
        "allow_origins":     origins,
        "allow_credentials": True,
        "allow_methods":     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers":     ["*"],
        "expose_headers":    ["X-Request-ID", "X-Process-Time"],
        "max_age":           600,
    }
