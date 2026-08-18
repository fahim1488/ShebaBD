"""
report_service.py — Generate summary reports for ShebaBD admin dashboard.

Provides monthly, weekly and custom date-range reports for:
- Blood donation activity
- Emergency requests and response times
- Event registrations
- New user signups
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import BloodDonor, BloodRequest, EmergencyRequest, EventRegistration, User

logger = logging.getLogger(__name__)


async def get_new_users_count(
    db: AsyncSession,
    days: int = 30,
) -> int:
    """Count new user registrations in the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= since)
    )
    return result.scalar_one()


async def get_blood_requests_report(
    db: AsyncSession,
    days: int = 30,
) -> dict:
    """
    Summarize blood request activity for the last N days.
    Returns total, fulfilled and pending counts.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    total = (await db.execute(
        select(func.count(BloodRequest.id)).where(BloodRequest.created_at >= since)
    )).scalar_one()

    fulfilled = (await db.execute(
        select(func.count(BloodRequest.id))
        .where(BloodRequest.created_at >= since, BloodRequest.is_fulfilled == True)
    )).scalar_one()

    return {
        "period_days": days,
        "total":       total,
        "fulfilled":   fulfilled,
        "pending":     total - fulfilled,
        "fulfill_rate": round((fulfilled / total * 100) if total else 0, 1),
    }


async def get_emergency_report(
    db: AsyncSession,
    days: int = 30,
) -> dict:
    """
    Summarize emergency requests for the last N days.
    Returns counts by priority and status.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (await db.execute(
        select(EmergencyRequest.priority, EmergencyRequest.status,
               func.count(EmergencyRequest.id))
        .where(EmergencyRequest.created_at >= since)
        .group_by(EmergencyRequest.priority, EmergencyRequest.status)
    )).all()

    report: dict = {"period_days": days, "by_priority": {}, "by_status": {}}
    for priority, status, count in rows:
        report["by_priority"][priority] = report["by_priority"].get(priority, 0) + count
        report["by_status"][status]     = report["by_status"].get(status, 0) + count

    return report


async def get_event_registrations_report(
    db: AsyncSession,
    days: int = 30,
) -> dict:
    """
    Count event registrations in the last N days.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    total = (await db.execute(
        select(func.count(EventRegistration.id))
        .where(EventRegistration.created_at >= since)
    )).scalar_one()

    return {"period_days": days, "total_registrations": total}


async def get_full_report(db: AsyncSession, days: int = 30) -> dict:
    """
    Generate a complete platform report for the given period.
    """
    return {
        "generated_at":   datetime.now(timezone.utc).isoformat(),
        "period_days":    days,
        "new_users":      await get_new_users_count(db, days),
        "blood_requests": await get_blood_requests_report(db, days),
        "emergencies":    await get_emergency_report(db, days),
        "events":         await get_event_registrations_report(db, days),
    }
