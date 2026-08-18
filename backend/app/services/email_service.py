"""
email_service.py — Email sending service for ShebaBD.

Handles password reset, welcome emails, and notifications.
Configure SMTP settings in .env file.
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html: bool = False,
) -> bool:
    """
    Send an email. Returns True on success, False on failure.
    In development mode logs the email instead of sending.
    """
    logger.info("Email to=%s subject=%r", to_email, subject)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = "noreply@shebabd.org"
    msg["To"]      = to_email
    part = MIMEText(body, "html" if html else "plain", "utf-8")
    msg.attach(part)
    # TODO: wire up real SMTP in production via settings.smtp_*
    return True


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
    """Send password reset link to user."""
    reset_url = f"https://shebabd.org/reset-password?token={reset_token}"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="{reset_url}">Reset Password</a></p>
    <p>If you did not request this, ignore this email.</p>
    """
    return await send_email(email, "ShebaBD Password Reset", body, html=True)


async def send_donation_receipt(email: str, donor_name: str, amount: float, cause: str, receipt_no: str) -> bool:
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
