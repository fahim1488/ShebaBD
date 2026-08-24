"""
scheduler.py — Automated background scheduler for ShebaBD.

Manages periodic tasks completely independent of the frontend:
- Automated event reminder emails (runs every N minutes)
- Checks upcoming events and sends email reminders to confirmed attendees
- Updates database notification tracking states (reminder_sent, reminder_sent_at)
"""
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models import Event, EventRegistration
from app.services.email_service import send_event_reminder_email

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


def _format_time_left(delta: timedelta) -> str:
    """Format timedelta into human friendly string (e.g., 'in 2 hours', 'tomorrow')."""
    total_seconds = int(delta.total_seconds())
    if total_seconds <= 0:
        return "today"
    hours = total_seconds // 3600
    if hours >= 24:
        days = hours // 24
        return f"in {days} day{'s' if days > 1 else ''}"
    elif hours >= 1:
        return f"in {hours} hour{'s' if hours > 1 else ''}"
    else:
        minutes = max(1, total_seconds // 60)
        return f"in {minutes} minute{'s' if minutes > 1 else ''}"


async def process_event_reminders() -> dict:
    """
    Core reminder processor.
    Scans for events approaching their scheduled start time where reminders are due.
    Sends reminder emails to all confirmed registrants who haven't received one yet.
    """
    now = datetime.now(timezone.utc)
    reminders_sent = 0
    events_processed = 0

    async with AsyncSessionLocal() as db:
        try:
            # Query active, non-cancelled events with reminder enabled
            stmt = (
                select(Event)
                .where(
                    and_(
                        Event.is_active == True,
                        Event.is_cancelled == False,
                        Event.reminder_enabled == True,
                    )
                )
                .options(selectinload(Event.registrations))
            )
            result = await db.execute(stmt)
            events = result.scalars().all()

            for event in events:
                event_start = event.datetime_start
                if not event_start:
                    continue

                # Ensure timezone-aware comparison
                if event_start.tzinfo is None:
                    event_start = event_start.replace(tzinfo=timezone.utc)

                # Skip past events
                if event_start <= now:
                    continue

                # Calculate reminder threshold time
                reminder_threshold = event_start - timedelta(minutes=event.reminder_minutes_before)

                # If current time is past or at the reminder threshold, send reminders
                if now >= reminder_threshold:
                    time_left_str = _format_time_left(event_start - now)
                    events_processed += 1

                    # Find all confirmed registrations that haven't received a reminder
                    pending_registrations = [
                        r for r in event.registrations
                        if r.status == "confirmed" and not r.reminder_sent
                    ]

                    for reg in pending_registrations:
                        try:
                            success = await send_event_reminder_email(
                                email=reg.email,
                                user_name=reg.name,
                                event_title=event.title,
                                event_date=event.date,
                                event_time=event.time,
                                event_location=event.location,
                                time_left_display=time_left_str,
                            )
                            if success:
                                reg.reminder_sent = True
                                reg.reminder_sent_at = datetime.now(timezone.utc)
                                reminders_sent += 1
                                logger.info(
                                    "Event reminder email sent for event '%s' (id=%d) to %s",
                                    event.title, event.id, reg.email
                                )
                        except Exception as ex:
                            logger.error(
                                "Failed sending reminder to %s for event %d: %s",
                                reg.email, event.id, ex
                            )

            if reminders_sent > 0:
                await db.commit()
                logger.info(
                    "Reminder job completed: sent %d reminder(s) across %d event(s).",
                    reminders_sent, events_processed
                )

        except Exception as e:
            logger.error("Error in process_event_reminders job: %s", e)
            await db.rollback()

    return {
        "events_checked": events_processed,
        "reminders_sent": reminders_sent,
        "checked_at": now.isoformat(),
    }


def start_scheduler(check_interval_seconds: int = 120) -> AsyncIOScheduler:
    """Initialize and start the background scheduler."""
    global scheduler
    if scheduler and scheduler.running:
        logger.info("Scheduler already running.")
        return scheduler

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        process_event_reminders,
        "interval",
        seconds=check_interval_seconds,
        id="event_reminder_job",
        name="Check and send event reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "Event Reminder Background Scheduler started (interval: %d seconds).",
        check_interval_seconds
    )
    return scheduler


def stop_scheduler() -> None:
    """Gracefully shut down the scheduler."""
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Event Reminder Scheduler stopped.")
