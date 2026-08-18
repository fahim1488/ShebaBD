"""
database.py — Async SQLAlchemy engine, session factory, and Base declarative class.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    # pool_size / max_overflow only apply to non-SQLite engines
    **({
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
    } if not settings.database_url.startswith("sqlite") else {
        "connect_args": {"check_same_thread": False},
    }),
    pool_pre_ping=True,
    echo=settings.debug,
    future=True,
)

# ── Session factory ──────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ── Declarative base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── FastAPI dependency ────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session per request.
    Rolls back on exception, always closes the session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Startup / shutdown helpers ────────────────────────────────────────────────
async def create_tables() -> None:
    """Create all tables that don't yet exist (dev convenience)."""
    async with engine.begin() as conn:
        from app import models  # noqa: F401 — ensure models are imported
        await conn.run_sync(Base.metadata.create_all)


async def dispose_engine() -> None:
    """Release all pooled connections (call on app shutdown)."""
    await engine.dispose()
/* Fahim: Database query optimization */ 
