"""
pagination.py — Reusable pagination utilities for ShebaBD APIs.

Usage:
    items = await db.execute(select(Model).offset(skip).limit(limit))
    return paginate_response(items.scalars().all(), total, page, page_size)
"""
from typing import Generic, List, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated API response envelope."""
    items:       List[T]
    total:       int
    page:        int
    page_size:   int
    total_pages: int
    has_next:    bool
    has_prev:    bool


def paginate_response(
    items: List[T],
    total: int,
    page: int = 1,
    page_size: int = 20,
) -> PaginatedResponse[T]:
    """Build a PaginatedResponse from a list of items."""
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


def get_skip(page: int, page_size: int) -> int:
    """Calculate the SQL OFFSET value from page number and size."""
    return max(0, (page - 1) * page_size)
