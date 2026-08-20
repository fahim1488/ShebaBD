"""
email_service.py — Email sending service for ShebaBD.

Handles password reset, welcome emails, donation receipts, and notifications.
Includes exponential backoff retry logic for transient SMTP failures.
Configure SMTP settings in .env file.
"""
import asyncio
import logging
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0   # seconds — doubles each attempt (1s, 2s, 4s)

# SMTP settings from environment
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM", "noreply@shebabd.org")


def _build_message(to_email: str, subject: str, body: str, html: bool) -> MIMEMultipart:
    """Build a MIME email message."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = SMTP_FROM
    msg["To"]      = to_email
    part = MIMEText(body, "html" if html else "plain", "utf-8")
    msg.attach(part)
    return msg


def _send_via_smtp(msg: MIMEMultipart, to_email: str) -> None:
    """
    Send a message via SMTP (synchronous).
    Raises smtplib.SMTPException on failure.
    """
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html: bool = False,
    retries: int = MAX_RETRIES,
) -> bool:
    """
    Send an email with exponential backoff retry logic.

    In development (no SMTP_USER configured) the email content is logged
    instead of sent so the app works without SMTP setup.

    Args:
        to_email: Recipient email address
        subject:  Email subject line
        body:     Email body (plain text or HTML)
        html:     True if body is HTML
        retries:  Number of retry attempts on transient failure

    Returns:
        True on success, False after all retries exhausted
    """
    if not to_email or "@" not in to_email:
        logger.error("Invalid recipient email address: %r", to_email)
        return False

    msg = _build_message(to_email, subject, body, html)

    # Development mode: log instead of sending
    if not SMTP_USER:
        logger.info(
            "[DEV] Email NOT sent — SMTP_USER not configured.\n"
            "  To: %s\n  Subject: %s\n  Body preview: %.200s",
            to_email, subject, body,
        )
        return True

    # Production: try with exponential backoff
    last_error: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            # Run blocking SMTP call in a thread pool to stay async-safe
            await asyncio.get_event_loop().run_in_executor(
                None, _send_via_smtp, msg, to_email
            )
            logger.info(
                "Email sent successfully | to=%s subject=%r attempt=%d",
                to_email, subject, attempt,
            )
            return True
        except smtplib.SMTPAuthenticationError as e:
            # Auth errors are not retryable
            logger.error("SMTP authentication failed — check SMTP_USER/SMTP_PASSWORD: %s", e)
            return False
        except smtplib.SMTPRecipientsRefused as e:
            # Bad recipient — not retryable
            logger.error("SMTP recipient refused for %s: %s", to_email, e)
            return False
        except (smtplib.SMTPException, OSError, ConnectionError) as e:
            last_error = e
            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))  # 1s, 2s, 4s
            logger.warning(
                "Email send failed (attempt %d/%d) | to=%s error=%s | retrying in %.1fs",
                attempt, retries, to_email, e, delay,
            )
            if attempt < retries:
                await asyncio.sleep(delay)

    logger.error(
        "Email delivery failed after %d attempts | to=%s subject=%r last_error=%s",
        retries, to_email, subject, last_error,
    )
    return False


async def send_welcome_email(name: str, email: str) -> bool:
    """Send welcome email to a new user."""
    body = f"""
    <h2>Welcome to ShebaBD, {name}!</h2>
    <p>Thank you for joining Bangladesh's social good platform.</p>
    <p>You can now donate, volunteer, request blood, and connect with NGOs.</p>
    <p><a href="https://shebabd.org">Visit ShebaBD</a></p>
    """
    return await send_email(email, "Welcome to ShebaBD!", body, html=True)


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    """Send password reset link to user. Link expires in 1 hour."""
    reset_url = f"https://shebabd.org/reset-password?token={reset_token}"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="{reset_url}">Reset Password</a></p>
    <p>If you did not request this, please ignore this email.</p>
    """
    return await send_email(email, "ShebaBD Password Reset", body, html=True)


async def send_donation_receipt(
    email: str,
    donor_name: str,
    amount: float,
    cause: str,
    receipt_no: str,
) -> bool:
    """Send donation receipt to donor."""
    body = f"""
    <h2>Donation Receipt — ShebaBD</h2>
    <p>Dear {donor_name},</p>
    <p>Thank you for your generous donation!</p>
    <table>
      <tr><td><strong>Receipt No:</strong></td><td>{receipt_no}</td></tr>
      <tr><td><strong>Amount:</strong></td><td>৳{amount:,.2f} BDT</td></tr>
      <tr><td><strong>Cause:</strong></td><td>{cause.title()}</td></tr>
    </table>
    <p>Your contribution makes a real difference. 🙏</p>
    """
    return await send_email(email, f"Donation Receipt #{receipt_no}", body, html=True)


async def send_blood_request_notification(
    email: str,
    donor_name: str,
    patient_name: str,
    blood_group: str,
    hospital: str,
    district: str,
    contact_phone: str,
) -> bool:
    """Notify a blood donor about a matching request in their district."""
    body = f"""
    <h2>Urgent Blood Request — ShebaBD</h2>
    <p>Dear {donor_name},</p>
    <p>A patient in your district needs blood urgently.</p>
    <table>
      <tr><td><strong>Patient:</strong></td><td>{patient_name}</td></tr>
      <tr><td><strong>Blood Group:</strong></td><td>{blood_group}</td></tr>
      <tr><td><strong>Hospital:</strong></td><td>{hospital}</td></tr>
      <tr><td><strong>District:</strong></td><td>{district}</td></tr>
      <tr><td><strong>Contact:</strong></td><td>{contact_phone}</td></tr>
    </table>
    <p>If you are available to donate, please contact the number above as soon as possible.</p>
    <p>Thank you for being a hero. 🩸</p>
    """
    return await send_email(
        email,
        f"[URGENT] Blood Request — {blood_group} needed in {district}",
        body,
        html=True,
    )
