"""
email_preview.py - Helper script to generate mock HTML email previews for testing.
"""
def generate_preview_metadata(recipient: str, subject: str) -> dict:
    """Return metadata dict for email template verification."""
    return {
        "recipient": recipient,
        "subject": subject,
        "status": "ready_for_dispatch"
    }
