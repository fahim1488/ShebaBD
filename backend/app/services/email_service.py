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
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

import re
from email.utils import formatdate, make_msgid
from app.config import get_settings

# Retry configuration
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0   # seconds — doubles each attempt (1s, 2s, 4s)


def _strip_html(html_str: str) -> str:
    """Strip HTML tags for plaintext email fallback."""
    clean = re.sub(r"<style[\s\S]*?</style>", "", html_str)
    clean = re.sub(r"<[^>]+>", " ", clean)
    return re.sub(r"\s+", " ", clean).strip()


def _build_message(to_email: str, subject: str, body: str, html: bool) -> MIMEMultipart:
    """Build a standard-compliant RFC MIME email message with high inbox deliverability."""
    settings = get_settings()
    from_addr = settings.smtp_from or settings.smtp_user or "mdfahimuntasir1488.csenub@gmail.com"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"ShebaBD Support <{from_addr}>"
    msg["To"]      = to_email
    msg["Date"]    = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="shebabd.org")

    if html:
        # Attach plain text version first (fallback for spam filters & accessibility)
        plain_text = _strip_html(body)
        part_text = MIMEText(plain_text, "plain", "utf-8")
        msg.attach(part_text)
        # Attach HTML version second (preferred rendering in modern clients)
        part_html = MIMEText(body, "html", "utf-8")
        msg.attach(part_html)
    else:
        part_text = MIMEText(body, "plain", "utf-8")
        msg.attach(part_text)

    return msg


def _send_via_smtp(msg: MIMEMultipart, to_email: str) -> None:
    """
    Send a message via SMTP (synchronous).
    Raises smtplib.SMTPException on failure.
    """
    settings = get_settings()
    host = settings.smtp_host or "smtp.gmail.com"
    port = settings.smtp_port or 587
    user = settings.smtp_user or "mdfahimuntasir1488.csenub@gmail.com"
    password = settings.smtp_password or "encuselbefwkjhuh"
    from_addr = settings.smtp_from or user

    with smtplib.SMTP(host, port, timeout=12) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        if user and password:
            server.login(user, password)
        server.sendmail(user or from_addr, to_email, msg.as_string())


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html: bool = False,
    retries: int = MAX_RETRIES,
) -> bool:
    """
    Send an email with exponential backoff retry logic.

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

    settings = get_settings()
    msg = _build_message(to_email, subject, body, html)

    # If no SMTP configured in dev
    if not settings.smtp_user and not os.getenv("SMTP_USER"):
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


async def send_event_confirmation_email(
    email: str,
    user_name: str,
    event_title: str,
    event_date: str,
    event_time: str,
    event_location: str,
    registration_id: str,
    organizer: str = "ShebaBD Community",
) -> bool:
    """Send a structured event registration confirmation email to the user."""
    short_reg_id = str(registration_id)[:8].upper()
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
        .header {{ background: #0F3A2B; color: #F7F1E1; padding: 30px 24px; text-align: center; }}
        .header h1 {{ margin: 0 0 8px; font-size: 24px; color: #E7A93B; }}
        .header p {{ margin: 0; font-size: 14px; opacity: 0.9; }}
        .badge {{ display: inline-block; background: rgba(231,169,59,0.18); color: #E7A93B; border: 1px solid #E7A93B; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }}
        .content {{ padding: 30px 24px; }}
        .greeting {{ font-size: 16px; margin-bottom: 20px; }}
        .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px; }}
        .detail-row {{ display: flex; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }}
        .detail-row:last-child {{ border-bottom: none; }}
        .detail-label {{ width: 120px; font-weight: 600; color: #64748b; }}
        .detail-value {{ flex: 1; color: #0f172a; font-weight: 500; }}
        .ticket {{ background: #0F3A2B; color: #F7F1E1; border-radius: 8px; padding: 14px 20px; text-align: center; margin: 20px 0; }}
        .ticket-code {{ font-family: monospace; font-size: 20px; font-weight: bold; color: #E7A93B; letter-spacing: 2px; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Confirmed! 🎉</h1>
          <p>You are officially registered for the event</p>
          <span class="badge">CONFIRMED PASS</span>
        </div>
        <div class="content">
          <p class="greeting">Hello <strong>{user_name}</strong>,</p>
          <p>Thank you for registering! Here are your event and registration details:</p>
          
          <div class="card">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
              <tr><td style="color: #64748b; width: 110px;"><strong>Event:</strong></td><td style="color: #0f172a; font-weight: bold;">{event_title}</td></tr>
              <tr><td style="color: #64748b;"><strong>Date:</strong></td><td>{event_date}</td></tr>
              <tr><td style="color: #64748b;"><strong>Time:</strong></td><td>{event_time}</td></tr>
              <tr><td style="color: #64748b;"><strong>Location:</strong></td><td>{event_location}</td></tr>
              <tr><td style="color: #64748b;"><strong>Organizer:</strong></td><td>{organizer}</td></tr>
            </table>
          </div>

          <div class="ticket">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(247,241,225,0.7);">Registration Pass Code</div>
            <div class="ticket-code">SHEBA-{short_reg_id}</div>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
            ℹ️ We'll send you an automated reminder before the event begins. If you cannot attend, please cancel your registration from the ShebaBD portal so others can take part.
          </p>
        </div>
        <div class="footer">
          <p>ShebaBD Social Impact Platform · Bangladesh</p>
          <p>This is an automated message. For questions, reach out to support@shebabd.org</p>
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(
        email,
        f"Registration Confirmed: {event_title} — ShebaBD",
        body,
        html=True,
    )


async def send_event_reminder_email(
    email: str,
    user_name: str,
    event_title: str,
    event_date: str,
    event_time: str,
    event_location: str,
    time_left_display: str = "soon",
) -> bool:
    """Send an automated reminder email for an upcoming event."""
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
        .header {{ background: #0F3A2B; color: #F7F1E1; padding: 26px 24px; text-align: center; }}
        .header h1 {{ margin: 0 0 8px; font-size: 22px; color: #E7A93B; }}
        .header p {{ margin: 0; font-size: 14px; color: #F7F1E1; }}
        .content {{ padding: 28px 24px; }}
        .greeting {{ font-size: 16px; margin-bottom: 16px; }}
        .card {{ background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 18px; margin-bottom: 20px; }}
        .cta {{ display: block; text-align: center; background: #D6472C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 24px; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Upcoming Event Reminder</h1>
          <p>{event_title} starts {time_left_display}!</p>
        </div>
        <div class="content">
          <p class="greeting">Hello <strong>{user_name}</strong>,</p>
          <p>This is a quick reminder that you are registered for an upcoming event on ShebaBD.</p>
          
          <div class="card">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
              <tr><td style="color: #92400e; width: 100px;"><strong>Event:</strong></td><td style="color: #78350f; font-weight: bold;">{event_title}</td></tr>
              <tr><td style="color: #92400e;"><strong>Date:</strong></td><td style="color: #78350f;">{event_date}</td></tr>
              <tr><td style="color: #92400e;"><strong>Time:</strong></td><td style="color: #78350f;">{event_time}</td></tr>
              <tr><td style="color: #92400e;"><strong>Location:</strong></td><td style="color: #78350f;">{event_location}</td></tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569;">
            We look forward to seeing you there. Please arrive a few minutes early to check in smoothly.
          </p>
        </div>
        <div class="footer">
          <p>ShebaBD Social Impact Platform · Bangladesh</p>
          <p>If you have questions or can no longer attend, please visit ShebaBD.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(
        email,
        f"Reminder: {event_title} is coming up! — ShebaBD",
        body,
        html=True,
    )

