"""
emergency.py — Emergency Request API.

Routes
------
POST /emergency          — submit emergency request
GET  /emergency          — list recent requests (active feed)
"""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import EmergencyRequest
from app.schemas import EmergencyRequestCreate, EmergencyRequestResponse

router = APIRouter(prefix="/emergency", tags=["emergency"])

# Priority classifier — mirrors frontend logic, keeps AI branding
def _classify_priority(emergency_type: str, description: str) -> str:
    t = emergency_type.lower()
    d = description.lower()
    if t in ("flood", "fire") or "critical" in d:
        return "critical"
    if t in ("medical", "rescue") or "urgent" in d:
        return "high"
    if t == "shelter":
        return "medium"
    return "low"


@router.post("", response_model=EmergencyRequestResponse, status_code=201)
async def submit_emergency(
    data: EmergencyRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    priority = _classify_priority(data.emergency_type, data.description)
    req = EmergencyRequest(
        name=data.name,
        phone=data.phone,
        location=data.location,
        emergency_type=data.emergency_type,
        description=data.description,
        priority=priority,
        status="pending",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return req


@router.get("", response_model=List[EmergencyRequestResponse])
async def list_emergency_requests(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
    skip: int = Query(0, ge=0),
):
    result = await db.execute(
        select(EmergencyRequest)
        .where(EmergencyRequest.status != "resolved")
        .order_by(EmergencyRequest.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()
