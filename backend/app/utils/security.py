"""
security.py — JWT token creation and verification utilities.

Handles access tokens, refresh tokens, and password reset tokens.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

# --- Config (pulled from settings in production) -------------------------
SECRET_KEY     = "shebabd-secret-key-change-in-production"
ALGORITHM      = "HS256"
ACCESS_EXPIRE  = 60 * 24        # 24 hours  (minutes)
REFRESH_EXPIRE = 60 * 24 * 30   # 30 days   (minutes)


def create_access_token(user_id: str, role: str = "user") -> str:
    """Create a signed JWT access token."""
    payload = {
        "sub":  user_id,
        "role": role,
        "type": "access",
        "exp":  datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRE),
        "iat":  datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token."""
    payload = {
        "sub":  user_id,
        "type": "refresh",
        "exp":  datetime.now(timezone.utc) + timedelta(minutes=REFRESH_EXPIRE),
        "iat":  datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verify and decode a JWT token.
    Returns payload dict on success, None on failure.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None


def create_password_reset_token() -> str:
    """Generate a cryptographically secure password reset token."""
    return secrets.token_urlsafe(32)


def create_email_verify_token() -> str:
    """Generate a secure email verification token."""
    return secrets.token_hex(24)
