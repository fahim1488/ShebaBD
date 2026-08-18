"""
rate_limiter.py — Simple in-memory rate limiter middleware.

Limits each client IP to max_requests per window_seconds.
Returns HTTP 429 when the limit is exceeded.
"""
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import HTTPException, Request


class RateLimiter:
    """Track per-IP request counts in a sliding time window."""

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[datetime]] = defaultdict(list)

    async def __call__(self, request: Request) -> None:
        client_ip: str = request.client.host if request.client else "unknown"
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)

        # Remove timestamps outside the current window
        self._requests[client_ip] = [
            t for t in self._requests[client_ip] if t > window_start
        ]

        if len(self._requests[client_ip]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {self.max_requests} requests per {self.window_seconds}s.",
            )

        self._requests[client_ip].append(now)


# Pre-built instances for common use cases
default_limiter = RateLimiter(max_requests=100, window_seconds=60)
strict_limiter  = RateLimiter(max_requests=10,  window_seconds=60)
auth_limiter    = RateLimiter(max_requests=5,   window_seconds=60)
