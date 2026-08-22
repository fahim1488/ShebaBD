"""
rate_limit_helpers.py - Client IP extraction and rate limit response headers.
"""
from typing import Dict

def get_rate_limit_headers(limit: int, remaining: int, reset_seconds: int) -> Dict[str, str]:
    """Build standard rate limiting HTTP headers."""
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(max(0, remaining)),
        "X-RateLimit-Reset": str(reset_seconds)
    }
