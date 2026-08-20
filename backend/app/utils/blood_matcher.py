"""
blood_matcher.py — Blood group compatibility and donor matching logic.

Determines which donors can donate to a given blood group request
based on universal compatibility rules.
"""
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

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
    """
    Return list of blood groups that can donate to the recipient.
    
    Args:
        recipient_group: Blood group of the recipient (e.g., "A+", "O-")
        
    Returns:
        List of compatible donor blood groups
        
    Raises:
        ValueError: If blood group is invalid or not recognized
    """
    if not recipient_group or not isinstance(recipient_group, str):
        logger.error(f"Invalid recipient blood group: {recipient_group}")
        raise ValueError("Recipient blood group must be a non-empty string")
    
    normalized_group = recipient_group.strip().upper()
    
    if normalized_group not in BLOOD_COMPATIBILITY:
        logger.warning(f"Unknown blood group requested: {recipient_group}")
        raise ValueError(
            f"Invalid blood group '{recipient_group}'. "
            f"Must be one of: {', '.join(BLOOD_COMPATIBILITY.keys())}"
        )
    
    return BLOOD_COMPATIBILITY[normalized_group]


def can_donate(donor_group: str, recipient_group: str) -> bool:
    """
    Check if a donor with donor_group can donate to recipient_group.
    
    Args:
        donor_group: Blood group of the donor
        recipient_group: Blood group of the recipient
        
    Returns:
        True if donation is compatible, False otherwise
        
    Raises:
        ValueError: If either blood group is invalid
    """
    try:
        compatible = get_compatible_groups(recipient_group)
        normalized_donor = donor_group.strip().upper() if donor_group else ""
        
        if not normalized_donor:
            logger.error("Empty donor blood group provided")
            raise ValueError("Donor blood group cannot be empty")
            
        if normalized_donor not in BLOOD_COMPATIBILITY:
            logger.warning(f"Invalid donor blood group: {donor_group}")
            raise ValueError(
                f"Invalid donor blood group '{donor_group}'. "
                f"Must be one of: {', '.join(BLOOD_COMPATIBILITY.keys())}"
            )
        
        return normalized_donor in compatible
    except Exception as e:
        logger.error(f"Error checking blood compatibility: {e}")
        raise


def score_donor(donor_total: int, is_available: bool, last_donated_days: int) -> float:
    """
    Score a donor candidate (higher is better).
    Considers availability, experience, and recency of last donation.
    
    Args:
        donor_total: Total number of previous donations
        is_available: Whether the donor is currently available
        last_donated_days: Days since last donation
        
    Returns:
        Score from 0.0 to ~5.0 (higher is better)
        
    Raises:
        ValueError: If inputs are invalid
    """
    # Validate inputs
    if not isinstance(donor_total, (int, float)) or donor_total < 0:
        logger.error(f"Invalid donor_total: {donor_total}")
        raise ValueError("donor_total must be a non-negative number")
    
    if not isinstance(is_available, bool):
        logger.error(f"Invalid is_available type: {type(is_available)}")
        raise ValueError("is_available must be a boolean")
    
    if not isinstance(last_donated_days, (int, float)) or last_donated_days < 0:
        logger.error(f"Invalid last_donated_days: {last_donated_days}")
        raise ValueError("last_donated_days must be a non-negative number")
    
    if not is_available:
        return 0.0
    
    try:
        score = 1.0
        score += min(donor_total * 0.1, 2.0)          # Experience (max +2)
        score += min(last_donated_days / 100, 1.5)     # Longer ago is better (max +1.5)
        return round(score, 2)
    except Exception as e:
        logger.error(f"Error calculating donor score: {e}")
        return 1.0  # Return base score on error


def is_eligible_to_donate(age: int, weight_kg: int, last_donated_days: int) -> tuple[bool, str]:
    """
    Check if a donor meets eligibility requirements.
    Returns (is_eligible, reason_if_not).
    
    Args:
        age: Donor's age in years
        weight_kg: Donor's weight in kilograms
        last_donated_days: Days since last donation
        
    Returns:
        Tuple of (is_eligible, reason_message)
        
    Raises:
        ValueError: If inputs are invalid types
    """
    # Validate inputs
    try:
        age = int(age)
        weight_kg = int(weight_kg)
        last_donated_days = int(last_donated_days)
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid input types for eligibility check: {e}")
        raise ValueError("age, weight_kg, and last_donated_days must be numeric")
    
    if age < 0 or weight_kg < 0 or last_donated_days < 0:
        logger.error(f"Negative values provided: age={age}, weight={weight_kg}, days={last_donated_days}")
        raise ValueError("All values must be non-negative")
    
    # Eligibility checks
    if age < 18:
        return False, "Donor must be at least 18 years old."
    if age > 60:
        return False, "Donor must be 60 years old or younger."
    if weight_kg < 50:
        return False, "Donor must weigh at least 50 kg."
    if last_donated_days < 90:
        return False, f"Must wait at least 90 days between donations ({last_donated_days} days since last)."
    return True, ""
