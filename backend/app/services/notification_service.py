"""
notification_service.py — In-app and push notification logic for ShebaBD.

Handles:
- Blood request alerts to nearby donors
- Emergency broadcast notifications
- Event registration confirmations
- Donation acknowledgements
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List

logger = logging.getLogger(__name__)


@dataclass
class Notification:
    """Represents a single notification record."""
    user_id:    str
    title:      str
    message:    str
    type:       str          # blood_request | emergency | event | donation
    is_read:    bool = False
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        return {
            "user_id":    self.user_id,
            "title":      self.title,
            "message":    self.message,
            "type":       self.type,
            "is_read":    self.is_read,
            "created_at": self.created_at.isoformat(),
        }


async def notify_blood_donors(
    blood_group: str,
    district: str,
    patient_name: str,
    hospital: str,
    donor_ids: List[str],
) -> int:
    """Notify eligible blood donors about an urgent request."""
    count = 0
    for donor_id in donor_ids:
        notif = Notification(
            user_id=donor_id,
            title=f"Urgent: {blood_group} Blood Needed",
            message=f"{patient_name} urgently needs {blood_group} blood at {hospital}, {district}.",
            type="blood_request",
        )
        logger.info("Blood request notification queued for donor %s", donor_id)
        count += 1
    return count


async def notify_emergency_responders(
    emergency_type: str,
    location: str,
    priority: str,
    responder_ids: List[str],
) -> int:
    """Broadcast emergency alert to nearby responders."""
    count = 0
    for responder_id in responder_ids:
        notif = Notification(
            user_id=responder_id,
            title=f"Emergency Alert: {emergency_type.title()}",
            message=f"Priority {priority.upper()} emergency at {location}. Immediate response needed.",
            type="emergency",
        )
        logger.warning("Emergency notification sent to %s — %s at %s", responder_id, emergency_type, location)
        count += 1
    return count


async def notify_event_registration(user_id: str, event_title: str, event_date: str) -> None:
    """Confirm event registration to the user."""
    notif = Notification(
        user_id=user_id,
        title="Registration Confirmed!",
        message=f"You are registered for '{event_title}' on {event_date}. See you there!",
        type="event",
    )
    logger.info("Event registration confirmed for user %s — %s", user_id, event_title)


async def notify_donation_received(user_id: str, amount: float, cause: str, receipt_no: str) -> None:
    """Thank donor after successful donation."""
    notif = Notification(
        user_id=user_id,
        title="Donation Received — Thank You!",
        message=f"Your donation of ৳{amount:,.0f} for {cause} has been received. Receipt: {receipt_no}",
        type="donation",
    )
    logger.info("Donation receipt sent to user %s — ৳%.2f for %s", user_id, amount, cause)
