"""
pagination_helpers.py - Reusable pagination calculators.
"""
from typing import Dict, Any

def paginate_metadata(total_count: int, skip: int, limit: int) -> Dict[str, Any]:
    """Calculate pagination metadata including page numbers and total pages."""
    current_page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 1
    return {
        "total_items": total_count,
        "current_page": current_page,
        "total_pages": total_pages,
        "has_next": current_page < total_pages,
        "has_prev": current_page > 1
    }
