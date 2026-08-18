"""
validators.py — Common input validation helpers for ShebaBD.

Used across multiple API endpoints to validate user input.
"""
import re


BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}

BD_DISTRICTS = {
    "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
    "Barisal", "Mymensingh", "Rangpur", "Comilla", "Gazipur",
    "Narayanganj", "Cox's Bazar", "Jessore", "Bogura", "Noakhali",
}


def is_valid_phone(phone: str) -> bool:
    """Validate Bangladeshi phone number format."""
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(re.match(r"^(\+880|880|0)1[3-9]\d{8}$", cleaned))


def is_valid_email(email: str) -> bool:
    """Validate email address format."""
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email.strip()))


def is_valid_blood_group(blood_group: str) -> bool:
    """Check if blood group is one of the 8 valid types."""
    return blood_group.upper().strip() in BLOOD_GROUPS


def is_valid_district(district: str) -> bool:
    """Check if district is a recognized Bangladesh district."""
    return district.strip() in BD_DISTRICTS


def sanitize_string(value: str, max_length: int = 255) -> str:
    """Strip whitespace and truncate to max_length."""
    return value.strip()[:max_length]


def is_valid_nid(nid: str) -> bool:
    """Validate Bangladesh National ID (10 or 17 digits)."""
    digits = re.sub(r"\D", "", nid)
    return len(digits) in (10, 17)
