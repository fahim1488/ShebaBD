"""
events.py — Events & Campaigns API.

Routes
------
GET  /events              — list events (filter: category, search)
GET  /events/{id}         — single event
POST /events/{id}/register — register for event
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Event, EventRegistration
from app.schemas import EventResponse, EventRegistrationCreate, EventRegistrationResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
):
    q = select(Event).where(Event.is_active == True)
    if category and category != "all":
        q = q.where(Event.category == category)
    if search:
        term = f"%{search.lower()}%"
        from sqlalchemy import or_
        q = q.where(or_(
            func.lower(Event.title).like(term),
            func.lower(Event.location).like(term),
            func.lower(Event.organizer).like(term),
        ))
    q = q.order_by(Event.is_featured.desc(), Event.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/{event_id}/register", response_model=EventRegistrationResponse, status_code=201)
async def register_for_event(
    event_id: int,
    data: EventRegistrationCreate,
    db: AsyncSession = Depends(get_db),
):
    event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.registered_count >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is fully booked")

    reg = EventRegistration(
        event_id=event_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
    )
    db.add(reg)
    event.registered_count += 1
    await db.commit()
    await db.refresh(reg)
    return reg
