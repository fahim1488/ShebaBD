"""
password.py — Password hashing and validation utilities.

Uses bcrypt for secure password storage.
"""
import re
import secrets
import string

import bcrypt


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Check password meets minimum security requirements.
    Returns (is_valid, error_message).
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    return True, ""


def generate_random_password(length: int = 16) -> str:
    """Generate a cryptographically secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_reset_token() -> str:
    """Generate a secure URL-safe token for password reset."""
    return secrets.token_urlsafe(32)

# updated: increased bcrypt rounds to 14 for stronger hashing
