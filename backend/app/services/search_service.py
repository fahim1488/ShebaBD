"""
search_service.py — Unified search service for ShebaBD platform.

Supports searching across:
- Blood donors (by group, district, availability)
- Organizations (by name, category, district)
- Events (by title, location, category)
- Forum threads (by title, body, category)
"""
import logging
from dataclasses import dataclass
from typing import Any

from sqlalchemy import or_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import BloodDonor, Event, ForumThread, Organization

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """A single unified search result."""
    id:       int
    type:     str    # donor | organization | event | forum
    title:    str
    subtitle: str
    url:      str

    def to_dict(self) -> dict:
        return {
            "id":       self.id,
            "type":     self.type,
            "title":    self.title,
            "subtitle": self.subtitle,
            "url":      self.url,
        }


async def search_donors(db: AsyncSession, query: str, limit: int = 10) -> list[SearchResult]:
    """Search blood donors by name or district."""
    term = f"%{query.lower()}%"
    result = await db.execute(
        select(BloodDonor)
        .where(
            or_(
                func.lower(BloodDonor.name).like(term),
                func.lower(BloodDonor.district).like(term),
                BloodDonor.blood_group.like(f"%{query.upper()}%"),
            )
        )
        .limit(limit)
    )
    donors = result.scalars().all()
    return [
        SearchResult(
            id=d.id, type="donor",
            title=f"{d.name} ({d.blood_group})",
            subtitle=f"{d.district} — {'Available' if d.is_available else 'Unavailable'}",
            url=f"/blood-donation?donor={d.id}",
        )
        for d in donors
    ]


async def search_organizations(db: AsyncSession, query: str, limit: int = 10) -> list[SearchResult]:
    """Search organizations by name, description or category."""
    term = f"%{query.lower()}%"
    result = await db.execute(
        select(Organization)
        .where(
            Organization.is_active == True,
            or_(
                func.lower(Organization.name).like(term),
                func.lower(Organization.description).like(term),
                func.lower(Organization.category).like(term),
            ),
        )
        .limit(limit)
    )
    orgs = result.scalars().all()
    return [
        SearchResult(
            id=o.id, type="organization",
            title=o.name,
            subtitle=f"{o.category.title()} — {o.district}",
            url=f"/organizations?id={o.id}",
        )
        for o in orgs
    ]


async def search_events(db: AsyncSession, query: str, limit: int = 10) -> list[SearchResult]:
    """Search events by title or location."""
    term = f"%{query.lower()}%"
    result = await db.execute(
        select(Event)
        .where(
            Event.is_active == True,
            or_(
                func.lower(Event.title).like(term),
                func.lower(Event.location).like(term),
            ),
        )
        .limit(limit)
    )
    events = result.scalars().all()
    return [
        SearchResult(
            id=e.id, type="event",
            title=e.title,
            subtitle=f"{e.date} — {e.location}",
            url=f"/events?id={e.id}",
        )
        for e in events
    ]


async def global_search(db: AsyncSession, query: str) -> dict[str, list[dict]]:
    """
    Run a unified search across all content types.
    Returns grouped results by type.
    """
    if not query or len(query.strip()) < 2:
        return {"donors": [], "organizations": [], "events": []}

    donors = await search_donors(db, query, limit=5)
    orgs   = await search_organizations(db, query, limit=5)
    events = await search_events(db, query, limit=5)

    return {
        "donors":        [d.to_dict() for d in donors],
        "organizations": [o.to_dict() for o in orgs],
        "events":        [e.to_dict() for e in events],
        "total":         len(donors) + len(orgs) + len(events),
    }
# Murad: Multi-entity search aggregation
