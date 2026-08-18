"""
responses.py — Standardized API response helpers for ShebaBD.

Ensures all endpoints return a consistent JSON structure.
"""
from typing import Any, Optional

from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
) -> JSONResponse:
    """Return a standardized success response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
        },
    )


def created_response(data: Any = None, message: str = "Created successfully") -> JSONResponse:
    """Return a 201 Created response."""
    return success_response(data=data, message=message, status_code=201)


def error_response(
    message: str,
    errors: Optional[list] = None,
    status_code: int = 400,
) -> JSONResponse:
    """Return a standardized error response."""
    content: dict = {"success": False, "message": message}
    if errors:
        content["errors"] = errors
    return JSONResponse(status_code=status_code, content=content)


def not_found_response(resource: str = "Resource") -> JSONResponse:
    """Return a 404 Not Found response."""
    return error_response(f"{resource} not found.", status_code=404)


def unauthorized_response(message: str = "Authentication required.") -> JSONResponse:
    """Return a 401 Unauthorized response."""
    return error_response(message, status_code=401)

# updated: added timestamp field to all responses
