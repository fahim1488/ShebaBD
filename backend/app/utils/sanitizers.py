"""
sanitizers.py - String and HTML input sanitization utilities.
"""
import re
import html

def sanitize_text(text: str) -> str:
    """Strip dangerous characters and trim whitespace."""
    if not text:
        return ""
    clean = html.escape(text.strip())
    return clean

def sanitize_phone(phone: str) -> str:
    """Format Bangladeshi phone numbers to standard format."""
    if not phone:
        return ""
    digits = re.sub(r"[^0-9+]", "", phone.strip())
    return digits
