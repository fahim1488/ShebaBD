"""
hash_helpers.py - Cryptographic and checksum utilities for receipt tracking.
"""
import hashlib

def generate_receipt_checksum(donation_id: str, amount: float, timestamp: str) -> str:
    """Generate SHA256 verification hash for donation receipts."""
    payload = f"{donation_id}:{amount}:{timestamp}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16].upper()
