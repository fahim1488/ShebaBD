"""
blood_matcher.py — Blood group compatibility and donor matching logic.

Determines which donors can donate to a given blood group request
based on universal compatibility rules.
"""
from typing import List

# Compatibility map: recipient → list of compatible donor groups
BLOOD_COMPATIBILITY: dict[str, list[str]] = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # Universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],  # Universal donor
}

# Urgency weight for sorting (higher = more urgent)
URGENCY_WEIGHT = {"critical": 3, "urgent": 2, "normal": 1}


def get_compatible_groups(recipient_group: str) -> List[str]:
    """Return list of blood groups that can donate to the recipient."""
    return BLOOD_COMPATIBILITY.get(recipient_group.upper(), [])


def can_donate(donor_group: str, recipient_group: str) -> bool:
    """Check if a donor with donor_group can donate to recipient_group."""
    compatible = get_compatible_groups(recipient_group)
    return donor_group.upper() in compatible


def score_donor(donor_total: int, is_available: bool, last_donated_days: int) -> float:
    """
    Score a donor candidate (higher is better).
    Considers availability, experience, and recency of last donation.
    """
    if not is_available:
        return 0.0
    score = 1.0
    score += min(donor_total * 0.1, 2.0)          # Experience (max +2)
    score += min(last_donated_days / 100, 1.5)     # Longer ago is better (max +1.5)
    return round(score, 2)


def is_eligible_to_donate(age: int, weight_kg: int, last_donated_days: int) -> tuple[bool, str]:
    """
    Check if a donor meets eligibility requirements.
    Returns (is_eligible, reason_if_not).
    """
    if age < 18:
        return False, "Donor must be at least 18 years old."
    if age > 60:
        return False, "Donor must be 60 years old or younger."
    if weight_kg < 50:
        return False, "Donor must weigh at least 50 kg."
    if last_donated_days < 90:
        return False, f"Must wait at least 90 days between donations ({last_donated_days} days since last)."
    return True, ""
