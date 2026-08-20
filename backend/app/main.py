"""
main.py — FastAPI application factory and lifecycle management.

Responsibilities
----------------
- Create the FastAPI app instance
- Register startup / shutdown event handlers
- Mount CORS, request-ID, and logging middleware
- Include all API routers
- Global exception handlers (validation errors, unhandled exceptions)
"""
from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.chat import router as chat_router
from app.api.auth import router as auth_router
from app.api.donations import router as donations_router
from app.api.community import router as community_router
from app.api.blood import router as blood_router
from app.api.events import router as events_router
from app.api.emergency import router as emergency_router
from app.api.organizations import router as organizations_router
from app.config import get_settings
from app.database import create_tables, dispose_engine
from app.services.tools import close_http_client
from app.utils import configure_logging

# ── Bootstrap logging before anything else ────────────────────────────────────
settings = get_settings()
configure_logging("DEBUG" if settings.debug else "INFO")
logger = logging.getLogger(__name__)


# ── Application factory ───────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "ShebaBD AI backend — powers the Sheba AI chatbot with OpenAI GPT-4o, "
            "PostgreSQL conversation memory, and live tool calling."
        ),
        docs_url="/docs"     if not settings.is_production else None,
        redoc_url="/redoc"   if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("━━ ShebaBD AI Backend starting up (%s) ━━", settings.app_env)
        await create_tables()
        logger.info("✓ Database tables ready")

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        logger.info("━━ ShebaBD AI Backend shutting down ━━")
        await close_http_client()
        await dispose_engine()
        logger.info("✓ Resources released")

    # ── Middleware ────────────────────────────────────────────────────────────
    _register_middleware(app)

    # ── Exception handlers ────────────────────────────────────────────────────
    _register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(donations_router, prefix="/api/v1")
    app.include_router(community_router, prefix="/api/v1")
    app.include_router(blood_router, prefix="/api/v1")
    app.include_router(events_router, prefix="/api/v1")
    app.include_router(emergency_router, prefix="/api/v1")
    app.include_router(organizations_router, prefix="/api/v1")

    # Root ping (no auth required)
    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "status":  "running",
            "docs":    "/docs",
        }

    return app


# ── Middleware registration ───────────────────────────────────────────────────
def _register_middleware(app: FastAPI) -> None:

    # 1. GZip compression — compress responses > 1KB ──────────────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1024)

    # 2. CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )

    # 3. Request ID + timing ───────────────────────────────────────────────────
    class RequestContextMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            # Use client-provided request ID or generate a new short one
            request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
            request.state.request_id = request_id
            start = time.perf_counter()

            # Log incoming request with client IP
            client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
            logger.info(
                "→ %s %s | ip=%s | req=%s",
                request.method,
                request.url.path,
                client_ip,
                request_id,
            )

            try:
                response = await call_next(request)
            except Exception:
                logger.exception(
                    "Unhandled error | request_id=%s path=%s",
                    request_id,
                    request.url.path,
                )
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={"detail": "Internal server error.", "request_id": request_id},
                )

            elapsed_ms = (time.perf_counter() - start) * 1000
            response.headers["X-Request-ID"]    = request_id
            response.headers["X-Process-Time"]  = f"{elapsed_ms:.2f}ms"

            # Structured response log with status class indicator
            status_class = f"{response.status_code // 100}xx"
            logger.info(
                "← %s %s | %d (%s) | %.1fms | req=%s",
                request.method,
                request.url.path,
                response.status_code,
                status_class,
                elapsed_ms,
                request_id,
            )
            return response

    app.add_middleware(RequestContextMiddleware)


# ── Exception handlers ────────────────────────────────────────────────────────
def _register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        """Return structured 422 with field-level error messages."""
        errors = []
        for error in exc.errors():
            field = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
            errors.append({"field": field or "body", "message": error["msg"]})
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail":     "Validation error.",
                "errors":     errors,
                "request_id": getattr(request.state, "request_id", None),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Catch-all — never leak stack traces to the client."""
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        logger.exception("Unhandled exception | request_id=%s", request_id)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail":     "An internal error occurred. Please try again.",
                "request_id": request_id,
            },
        )


# ── App instance (imported by uvicorn) ───────────────────────────────────────
app = create_app()
