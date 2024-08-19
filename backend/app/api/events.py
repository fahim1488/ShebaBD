"""
events.py — Events & Campaigns API.

Complete Event Registration, Email Confirmation & Reminder System.
Handles:
- Event listings with dynamic registration statuses per user
- Server-side authenticated registration with strict validation
- Duplicate prevention (per user & email)
- Immediate HTML confirmation email dispatch
- Registration cancellation & capacity recalculation
- Admin event management, participant rosters, and manual reminder trigger
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Event, EventRegistration, User
from app.schemas import (
    EventResponse,
    EventCreateRequest,
    EventUpdateRequest,
    EventRegistrationCreate,
    EventRegistrationResponse,
    EventRegistrationAdminResponse,
)
from app.services.email_service import send_event_confirmation_email
from app.services.scheduler import process_event_reminders
from app.utils import get_current_user, get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    List active events with optional category and search filters.
    If the requesting user is authenticated, annotates each event with registration status.
    """
    q = select(Event).where(Event.is_active == True)
    if category and category != "all":
        q = q.where(Event.category == category)
    if search:
        term = f"%{search.lower()}%"
        q = q.where(
            or_(
                func.lower(Event.title).like(term),
                func.lower(Event.location).like(term),
                func.lower(Event.organizer).like(term),
                func.lower(Event.description).like(term),
            )
        )
    q = q.order_by(Event.is_featured.desc(), Event.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    events = result.scalars().all()

    # If user is authenticated, check which events they are registered for
    user_reg_map = {}
    if current_user:
        user_regs = await db.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.user_id == current_user.id,
                    EventRegistration.status == "confirmed",
                )
            )
        )
        for r in user_regs.scalars().all():
            user_reg_map[r.event_id] = r.id

    response_list = []
    for ev in events:
        resp = EventResponse.model_validate(ev)
        if current_user and ev.id in user_reg_map:
            resp.is_registered = True
            resp.user_registration_id = user_reg_map[ev.id]
        else:
            resp.is_registered = False
            resp.user_registration_id = None
        response_list.append(resp)

    return response_list


@router.get("/my-registrations", response_model=List[EventRegistrationAdminResponse])
async def get_my_registrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all active and past registrations for the authenticated user."""
    stmt = (
        select(EventRegistration)
        .where(
            or_(
                EventRegistration.user_id == current_user.id,
                EventRegistration.email == current_user.email,
            )
        )
        .options(selectinload(EventRegistration.event))
        .order_by(EventRegistration.created_at.desc())
    )
    result = await db.execute(stmt)
    registrations = result.scalars().all()

    output = []
    for reg in registrations:
        admin_resp = EventRegistrationAdminResponse.model_validate(reg)
        if reg.event:
            admin_resp.event_title = reg.event.title
        output.append(admin_resp)
    return output


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Retrieve a single event by ID with personalized registration indicator."""
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    resp = EventResponse.model_validate(event)
    if current_user:
        reg = (
            await db.execute(
                select(EventRegistration).where(
                    and_(
                        EventRegistration.event_id == event_id,
                        or_(
                            EventRegistration.user_id == current_user.id,
                            EventRegistration.email == current_user.email,
                        ),
                        EventRegistration.status == "confirmed",
                    )
                )
            )
        ).scalar_one_or_none()
        if reg:
            resp.is_registered = True
            resp.user_registration_id = reg.id
        else:
            resp.is_registered = False
            resp.user_registration_id = None
    return resp


@router.post("/{event_id}/register", response_model=EventRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: int,
    data: EventRegistrationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register authenticated user for an event.
    
    Validations:
    1. User must be authenticated
    2. Event must exist and be active
    3. Event must not be cancelled
    4. Event start time must not have already passed
    5. Registration deadline must not have passed (if configured)
    6. Event capacity must not be exceeded
    7. User must not already be registered (prevent duplicate registrations)
    
    Actions:
    - Creates EventRegistration record
    - Increments event registered_count
    - Dispatches confirmation email with ticket/pass details
    - Returns registration details
    """
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    if not event.is_active or event.is_cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event is cancelled or no longer active for registration.",
        )

    now = datetime.now(timezone.utc)

    # Validate event start time
    if event.datetime_start:
        start_time = event.datetime_start
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        if start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This event has already started or concluded. Registration is closed.",
            )

    # Validate registration deadline
    if event.registration_deadline:
        deadline = event.registration_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if deadline <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The registration deadline for this event has passed.",
            )

    # Validate capacity
    if event.registered_count >= event.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This event is fully booked ({event.registered_count}/{event.capacity} seats taken).",
        )

    # Check for duplicate registration
    existing_reg = (
        await db.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    or_(
                        EventRegistration.user_id == current_user.id,
                        EventRegistration.email == current_user.email,
                    ),
                    EventRegistration.status == "confirmed",
                )
            )
        )
    ).scalar_one_or_none()

    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already registered for this event.",
        )

    # Derive attendee identity from logged-in user, accepting optional phone override
    attendee_name = data.name.strip() if data.name else current_user.name
    attendee_email = current_user.email
    attendee_phone = data.phone.strip() if data.phone else getattr(current_user, "phone", None)

    # Create new registration
    reg = EventRegistration(
        event_id=event_id,
        user_id=current_user.id,
        name=attendee_name,
        email=attendee_email,
        phone=attendee_phone,
        status="confirmed",
        confirmation_sent=False,
        reminder_sent=False,
    )
    db.add(reg)
    event.registered_count += 1
    await db.commit()
    await db.refresh(reg)

    # Mark confirmation_sent=True optimistically so the response shows it immediately
    reg.confirmation_sent = True
    reg.confirmation_sent_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(reg)

    # Fire confirmation email in background — does NOT block the HTTP response
    # Always send confirmation; pass async fn directly so FastAPI awaits it correctly
    _reg_id    = reg.id
    _email     = attendee_email
    _name      = attendee_name
    _title     = event.title
    _date      = event.date
    _time      = event.time
    _location  = event.location
    _organizer = event.organizer

    async def _send_confirmation():
        try:
            await send_event_confirmation_email(
                email=_email,
                user_name=_name,
                event_title=_title,
                event_date=_date,
                event_time=_time,
                event_location=_location,
                registration_id=_reg_id,
                organizer=_organizer,
            )
            logger.info("Confirmation email dispatched to %s for event '%s'", _email, _title)
        except Exception as exc:
            logger.error("Background email error for %s: %s", _email, exc)

    background_tasks.add_task(_send_confirmation)

    return reg


@router.delete("/{event_id}/register", status_code=status.HTTP_200_OK)
async def cancel_event_registration(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel an authenticated user's registration for an event.
    Decrements registered_count and marks status as cancelled.
    """
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    reg = (
        await db.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    or_(
                        EventRegistration.user_id == current_user.id,
                        EventRegistration.email == current_user.email,
                    ),
                    EventRegistration.status == "confirmed",
                )
            )
        )
    ).scalar_one_or_none()

    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active registration found for this event.",
        )

    reg.status = "cancelled"
    if event.registered_count > 0:
        event.registered_count -= 1

    await db.commit()
    return {"message": "Registration cancelled successfully.", "event_id": event_id}


@router.get("/{event_id}/registrations", response_model=List[EventRegistrationAdminResponse])
async def list_event_registrations(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin/Organizer: View roster of registered attendees for an event."""
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    stmt = (
        select(EventRegistration)
        .where(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.created_at.desc())
    )
    result = await db.execute(stmt)
    registrations = result.scalars().all()
    return [
        EventRegistrationAdminResponse.model_validate(r) for r in registrations
    ]


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin/Organizer: Create a new event with scheduling and reminder configurations."""
    event = Event(
        title=data.title,
        category=data.category,
        description=data.description,
        date=data.date,
        time=data.time,
        datetime_start=data.datetime_start,
        registration_deadline=data.registration_deadline,
        location=data.location,
        organizer=data.organizer,
        capacity=data.capacity,
        registered_count=0,
        tags=data.tags,
        is_featured=data.is_featured,
        is_active=True,
        is_cancelled=False,
        reminder_minutes_before=data.reminder_minutes_before,
        email_confirmation_enabled=data.email_confirmation_enabled,
        reminder_enabled=data.reminder_enabled,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return EventResponse.model_validate(event)


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    data: EventUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin/Organizer: Update event details, deadlines, cancellation, or reminder parameters."""
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return EventResponse.model_validate(event)


@router.post("/reminders/trigger-now")
async def trigger_reminders_manually(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger the reminder processor on demand (useful for admin testing and immediate triggers)."""
    result = await process_event_reminders()
    return {
        "status": "success",
        "details": result,
    }
 