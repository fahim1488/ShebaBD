"""
file_handler.py — File upload validation and processing for ShebaBD.

Handles profile avatar uploads, document verification files,
and ensures files meet size and type requirements.
"""
import os
import uuid
from pathlib import Path

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOC_TYPES   = {"application/pdf", "image/jpeg", "image/png"}
MAX_IMAGE_SIZE_MB   = 5
MAX_DOC_SIZE_MB     = 10
UPLOAD_DIR          = Path("uploads")


def validate_image(content_type: str, size_bytes: int) -> tuple[bool, str]:
    """
    Validate uploaded image file.
    Returns (is_valid, error_message).
    """
    if content_type not in ALLOWED_IMAGE_TYPES:
        return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
    max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        return False, f"File too large. Maximum size is {MAX_IMAGE_SIZE_MB}MB."
    return True, ""


def validate_document(content_type: str, size_bytes: int) -> tuple[bool, str]:
    """
    Validate uploaded document file.
    Returns (is_valid, error_message).
    """
    if content_type not in ALLOWED_DOC_TYPES:
        return False, f"Invalid file type. Allowed: PDF, JPEG, PNG."
    max_bytes = MAX_DOC_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        return False, f"File too large. Maximum size is {MAX_DOC_SIZE_MB}MB."
    return True, ""


def generate_filename(original_name: str, prefix: str = "") -> str:
    """
    Generate a unique filename preserving the original extension.
    Example: "avatar.jpg" -> "avatar_a3f9c12b.jpg"
    """
    ext = Path(original_name).suffix.lower()
    unique_id = uuid.uuid4().hex[:8]
    base = prefix or Path(original_name).stem
    safe_base = "".join(c for c in base if c.isalnum() or c == "_")[:20]
    return f"{safe_base}_{unique_id}{ext}"


def get_upload_path(subfolder: str, filename: str) -> Path:
    """
    Build and ensure the upload directory path exists.
    """
    path = UPLOAD_DIR / subfolder
    path.mkdir(parents=True, exist_ok=True)
    return path / filename


def get_file_size_mb(size_bytes: int) -> float:
    """Convert bytes to megabytes rounded to 2 decimal places."""
    return round(size_bytes / (1024 * 1024), 2)
