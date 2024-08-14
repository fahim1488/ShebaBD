"""
utils.py — Shared utility functions.

Contains
--------
- JWT creation and decoding
- FastAPI dependency: get_current_user_id (extracts user from Bearer token)
- Request ID middleware helper
- Simple in-memory rate limiter (per user_id, per minute)
- Logging configuration helper
"""
from __future__ import annotations

import logging
import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db

logger   = logging.getLogger(__name__)
settings = get_settings()

# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """
    Create a signed JWT.

    Parameters
    ----------
    subject      : The ``sub`` claim — typically user_id.
    expires_delta: Override default expiry from settings.
    extra_claims : Additional payload claims (e.g. {"role": "admin"}).
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    payload: dict = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),   # unique token ID for revocation support
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT.

    Raises
    ------
    HTTPException 401 on invalid or expired tokens.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── FastAPI auth dependency ───────────────────────────────────────────────────
_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """
    FastAPI dependency — extracts the user_id (JWT ``sub``) from the
    Authorization: Bearer <token> header.

    In development mode (DEBUG=True) with no token supplied, falls back to
    a stable anonymous ID so you can test without a real auth system.
    Returns a str user_id.
    """
    if credentials is None:
        if settings.debug:
            # Stable dev user — safe because DEBUG is False in production
            return "dev-user-00000000"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing subject claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> "User":
    """FastAPI dependency — retrieves current authenticated User model."""
    from app.models import User
    from sqlalchemy import select
    user_id = await get_current_user_id(request, credentials)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        if settings.debug:
            result2 = await db.execute(select(User).where(User.email == "user@shebabd.org"))
            fallback = result2.scalar_one_or_none()
            if fallback:
                return fallback
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ── In-memory rate limiter ────────────────────────────────────────────────────
# Structure: { user_id: [timestamp, timestamp, ...] }
_rate_limit_store: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(user_id: str, limit: Optional[int] = None) -> None:
    """
    Sliding-window rate limiter (per user, per 60 seconds).

    Raises HTTPException 429 when the user exceeds the configured limit.
    Uses an in-memory store — replace with Redis for multi-process deployments.
    """
    max_calls   = limit or settings.rate_limit_per_minute
    now         = time.monotonic()
    window_start= now - 60.0

    # Drop timestamps outside the current window
    calls = [t for t in _rate_limit_store[user_id] if t > window_start]
    calls.append(now)
    _rate_limit_store[user_id] = calls

    if len(calls) > max_calls:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {max_calls} requests per minute.",
            headers={"Retry-After": "60"},
        )


# ── Request ID helper ─────────────────────────────────────────────────────────

def get_request_id(request: Request) -> str:
    """
    Return the X-Request-ID header value, or generate a new UUID.
    Attach it to request.state so middleware can log it.
    """
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = req_id
    return req_id


# ── Logging setup ─────────────────────────────────────────────────────────────

def configure_logging(level: str = "INFO") -> None:
    """
    Configure root logger with a structured format.
    Call once from main.py before the app starts.

    Uses a UTF-8 StreamHandler explicitly to avoid UnicodeEncodeError on
    Windows where the default console encoding is cp1252. Without this, any
    log message containing unicode characters (e.g. emoji in SQL parameters)
    would crash the logging thread, which FastAPI middleware catches as a
    500 Internal Server Error.
    """
    import sys

    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Force UTF-8 on the stream handler so emoji / Bengali text never crashes
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(fmt)
    try:
        # Python 3.9+ supports reconfigure(); older versions may not.
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    root.handlers.clear()
    root.addHandler(handler)

    # Silence noisy third-party loggers
    for noisy in ("httpx", "httpcore", "openai._base_client"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> "Optional[User]":
    """Returns current user if authenticated, else None (no 401)."""
    if credentials is None:
        return None
    try:
        from app.models import User
        from sqlalchemy import select
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except Exception:
        return None
  