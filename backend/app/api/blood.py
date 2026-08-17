"""
blood.py — Blood Donation API endpoints.

Routes
------
GET  /blood/stats              — summary stats
GET  /blood/donors             — search donors (filter: group, district, available)
POST /blood/donors             — register as donor
GET  /blood/donors/me          — my donor profile
PUT  /blood/donors/me          — update my availability / last donation
GET  /blood/requests           — list active blood requests
POST /blood/requests           — create urgent blood request
PUT  /blood/requests/{id}/fulfill — mark request as fulfilled
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import BloodDonor, BloodRequest, User
from app.schemas import (
    BloodDonorRegister, BloodDonorUpdate, BloodDonorResponse,
    BloodRequestCreate, BloodRequestResponse, BloodStatsResponse,
)
from app.utils import get_current_user

router = APIRouter(prefix="/blood", tags=["blood"])

VALID_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
DISTRICTS = [
    "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
    "Barisal", "Mymensingh", "Rangpur", "Comilla", "Jessore",
    "Narayanganj", "Gazipur", "Bogra", "Dinajpur", "Feni",
]


# ── Stats ──────────────────────────────────────────────────────────────────────
@router.get("/stats", response_model=BloodStatsResponse)
async def get_blood_stats(db: AsyncSession = Depends(get_db)):
    total_donors = (await db.execute(select(func.count(BloodDonor.id)))).scalar_one()
    available_donors = (await db.execute(
        select(func.count(BloodDonor.id)).where(BloodDonor.is_available == True)
    )).scalar_one()
    total_requests = (await db.execute(select(func.count(BloodRequest.id)))).scalar_one()
    active_requests = (await db.execute(
        select(func.count(BloodRequest.id)).where(BloodRequest.is_fulfilled == False)
    )).scalar_one()

    # Donors by blood group
    group_rows = (await db.execute(
        select(BloodDonor.blood_group, func.count(BloodDonor.id))
        .where(BloodDonor.is_available == True)
        .group_by(BloodDonor.blood_group)
    )).all()
    donors_by_group = {row[0]: row[1] for row in group_rows}

    return BloodStatsResponse(
        total_donors=total_donors,
        available_donors=available_donors,
        total_requests=total_requests,
        active_requests=active_requests,
        donors_by_group=donors_by_group,
    )


# ── Donors ─────────────────────────────────────────────────────────────────────
@router.get("/donors", response_model=List[BloodDonorResponse])
async def search_donors(
    db: AsyncSession = Depends(get_db),
    blood_group: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    available_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    q = select(BloodDonor)
    if blood_group and blood_group in VALID_GROUPS:
        q = q.where(BloodDonor.blood_group == blood_group)
    if district and district != "All Districts":
        q = q.where(BloodDonor.district == district)
    if available_only:
        q = q.where(BloodDonor.is_available == True)
    q = q.order_by(BloodDonor.is_available.desc(), BloodDonor.total_donations.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/donors", response_model=BloodDonorResponse, status_code=201)
async def register_donor(
    data: BloodDonorRegister,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if this user already registered as donor
    existing = (await db.execute(
        select(BloodDonor).where(BloodDonor.user_id == current_user.id)
    )).scalar_one_or_none()

    if existing:
        # Update existing registration instead
        existing.name = data.name
        existing.phone = data.phone
        existing.blood_group = data.blood_group
        existing.district = data.district
        existing.area = data.area
        existing.age = data.age
        existing.weight_kg = data.weight_kg
        existing.is_available = True
        await db.commit()
        await db.refresh(existing)
        return existing

    donor = BloodDonor(
        user_id=current_user.id,
        name=data.name,
        phone=data.phone,
        blood_group=data.blood_group,
        district=data.district,
        area=data.area,
        age=data.age,
        weight_kg=data.weight_kg,
        is_available=True,
    )
    db.add(donor)
    await db.commit()
    await db.refresh(donor)
    return donor


@router.get("/donors/me", response_model=BloodDonorResponse)
async def get_my_donor_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    donor = (await db.execute(
        select(BloodDonor).where(BloodDonor.user_id == current_user.id)
    )).scalar_one_or_none()
    if not donor:
        raise HTTPException(status_code=404, detail="You are not registered as a donor")
    return donor


@router.put("/donors/me", response_model=BloodDonorResponse)
async def update_my_donor_profile(
    data: BloodDonorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    donor = (await db.execute(
        select(BloodDonor).where(BloodDonor.user_id == current_user.id)
    )).scalar_one_or_none()
    if not donor:
        raise HTTPException(status_code=404, detail="Not registered as a donor")

    if data.is_available is not None:
        donor.is_available = data.is_available
    if data.area is not None:
        donor.area = data.area
    if data.last_donated_at is not None:
        donor.last_donated_at = data.last_donated_at
        donor.total_donations += 1
        # Auto set unavailable for 56 days after donation
        donor.is_available = False

    await db.commit()
    await db.refresh(donor)
    return donor


# ── Blood Requests ─────────────────────────────────────────────────────────────
@router.get("/requests", response_model=List[BloodRequestResponse])
async def list_blood_requests(
    db: AsyncSession = Depends(get_db),
    blood_group: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
):
    q = select(BloodRequest)
    if active_only:
        q = q.where(BloodRequest.is_fulfilled == False)
    if blood_group and blood_group in VALID_GROUPS:
        q = q.where(BloodRequest.blood_group == blood_group)
    if district and district != "All Districts":
        q = q.where(BloodRequest.hospital_district == district)
    q = q.order_by(
        # critical first, then urgent, then normal
        BloodRequest.urgency.desc(),
        BloodRequest.created_at.desc()
    ).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/requests", response_model=BloodRequestResponse, status_code=201)
async def create_blood_request(
    data: BloodRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    # expires in 7 days by default
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    req = BloodRequest(
        patient_name=data.patient_name,
        contact_name=data.contact_name,
        contact_phone=data.contact_phone,
        blood_group=data.blood_group,
        units_needed=data.units_needed,
        hospital_name=data.hospital_name,
        hospital_district=data.hospital_district,
        hospital_address=data.hospital_address,
        urgency=data.urgency,
        notes=data.notes,
        expires_at=expires,
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return req


@router.put("/donors/me/availability", response_model=BloodDonorResponse)
async def toggle_my_availability(
    data: BloodDonorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle the current user's donor availability status."""
    donor = (await db.execute(
        select(BloodDonor).where(BloodDonor.user_id == current_user.id)
    )).scalar_one_or_none()
    if not donor:
        raise HTTPException(status_code=404, detail="Not registered as a donor")
    if data.is_available is not None:
        donor.is_available = data.is_available
    await db.commit()
    await db.refresh(donor)
    return donor


@router.put("/requests/{request_id}/fulfill", response_model=BloodRequestResponse)
async def fulfill_blood_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    req = (await db.execute(
        select(BloodRequest).where(BloodRequest.id == request_id)
    )).scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Blood request not found")
    req.is_fulfilled = True
    await db.commit()
    await db.refresh(req)
    return req
