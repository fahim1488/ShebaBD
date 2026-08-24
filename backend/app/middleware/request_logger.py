"""
request_logger.py — HTTP request/response logging middleware.

Logs method, path, status code, and duration for every request.
Skips logging for health check and static file endpoints.
"""
import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("shebabd.access")

SKIP_PATHS = {"/", "/health", "/favicon.ico", "/docs", "/redoc", "/openapi.json"}


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Log all inbound requests with timing and status."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip noisy paths
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        status = response.status_code

        log_fn = logger.warning if status >= 400 else logger.info
        log_fn(
            "[%s] %s %s → %d (%.1fms)",
            request_id,
            request.method,
            request.url.path,
            status,
            duration_ms,
        )

        response.headers["X-Request-ID"]   = request_id
        response.headers["X-Process-Time"] = f"{duration_ms:.1f}ms"
        return response
