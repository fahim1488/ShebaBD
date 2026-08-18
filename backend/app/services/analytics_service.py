"""
analytics_service.py — Platform analytics and reporting for ShebaBD dashboard.

Provides aggregated stats for:
- Total donations and amounts
- Blood donation activity
- Volunteer engagement
- Emergency response metrics
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    BloodDonor, BloodRequest, Donation, EmergencyRequest,
    EventRegistration, Organization, User,
)

logger = logging.getLogger(__name__)


async def get_platform_stats(db: AsyncSession) -> dict:
    """Return high-level platform statistics for the dashboard."""
    try:
        total_users = (await db.execute(
            select(func.count(User.id)).where(User.is_active == True)
        )).scalar_one()

        total_donors = (await db.execute(
            select(func.count(BloodDonor.id))
        )).scalar_one()

        total_orgs = (await db.execute(
            select(func.count(Organization.id)).where(Organization.is_active == True)
        )).scalar_one()

        total_emergencies = (await db.execute(
            select(func.count(EmergencyRequest.id))
        )).scalar_one()

        resolved_emergencies = (await db.execute(
            select(func.count(EmergencyRequest.id))
            .where(EmergencyRequest.status == "resolved")
        )).scalar_one()

        return {
            "total_users":            total_users,
            "total_blood_donors":     total_donors,
            "total_organizations":    total_orgs,
            "total_emergencies":      total_emergencies,
            "resolved_emergencies":   resolved_emergencies,
            "response_rate_pct":      round(
                (resolved_emergencies / total_emergencies * 100) if total_emergencies else 0, 1
            ),
        }
    except Exception as e:
        logger.error("Error fetching platform stats: %s", e)
        return {}


async def get_donation_summary(db: AsyncSession) -> dict:
    """Return donation totals grouped by cause."""
    try:
        result = await db.execute(
            select(Donation.cause, func.sum(Donation.amount), func.count(Donation.id))
            .where(Donation.status == "completed")
            .group_by(Donation.cause)
        )
        rows = result.all()
        return {
            row[0].value: {"total_amount": float(row[1] or 0), "count": row[2]}
            for row in rows
        }
    except Exception as e:
        logger.error("Error fetching donation summary: %s", e)
        return {}


async def get_blood_activity(db: AsyncSession) -> dict:
    """Return blood donation and request activity stats."""
    try:
        available_donors = (await db.execute(
            select(func.count(BloodDonor.id)).where(BloodDonor.is_available == True)
        )).scalar_one()

        pending_requests = (await db.execute(
            select(func.count(BloodRequest.id)).where(BloodRequest.is_fulfilled == False)
        )).scalar_one()

        fulfilled_requests = (await db.execute(
            select(func.count(BloodRequest.id)).where(BloodRequest.is_fulfilled == True)
        )).scalar_one()

        return {
            "available_donors":   available_donors,
            "pending_requests":   pending_requests,
            "fulfilled_requests": fulfilled_requests,
        }
    except Exception as e:
        logger.error("Error fetching blood activity: %s", e)
        return {}
