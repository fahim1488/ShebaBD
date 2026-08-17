"""
organizations.py — Organization directory API.

Routes
------
GET  /organizations              — list organizations (filter: category, district, search)
GET  /organizations/{id}         — single organization
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Organization
from app.schemas import OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    q = select(Organization).where(Organization.is_active == True)
    if category and category != "all":
        q = q.where(Organization.category == category)
    if district and district != "All Districts":
        q = q.where(Organization.district == district)
    if search:
        term = f"%{search.lower()}%"
        from sqlalchemy import or_
        q = q.where(or_(
            func.lower(Organization.name).like(term),
            func.lower(Organization.description).like(term),
        ))
    q = q.order_by(Organization.rating.desc(), Organization.review_count.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/count")
async def get_org_count(db: AsyncSession = Depends(get_db)):
    count = (await db.execute(
        select(func.count(Organization.id)).where(Organization.is_active == True)
    )).scalar_one()
    return {"count": count}


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(org_id: int, db: AsyncSession = Depends(get_db)):
    org = (await db.execute(
        select(Organization).where(Organization.id == org_id, Organization.is_active == True)
    )).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
