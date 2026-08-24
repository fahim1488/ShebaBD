"""
email_service.py — Email sending service for ShebaBD.

Primary transport  : Resend API (fast, reliable, no SMTP config needed)
Fallback transport : SMTP with exponential-backoff retry (3 attempts)

Environment variables
---------------------
RESEND_API_KEY      — Resend API key (primary, required for production)
RESEND_FROM_EMAIL   — "Name <address>" used as From (default: onboarding@resend.dev)
SMTP_HOST/PORT/USER/PASSWORD/FROM — fallback SMTP credentials
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from typing import Optional

import resend

logger = logging.getLogger(__name__)

def _cfg():
    """Lazy import to avoid circular imports at module load time."""
    from app.config import get_settings
    return get_settings()

# ── Resend configuration (read at call time so tests can override) ────────────
def _resend_key()    -> str:  return _cfg().resend_api_key   or os.getenv("RESEND_API_KEY", "")
def _resend_from()   -> str:  return _cfg().resend_from_email or os.getenv("RESEND_FROM_EMAIL", "ShebaBD <onboarding@resend.dev>")

# ── SMTP fallback configuration ───────────────────────────────────────────────
def _smtp_host()     -> str:  return _cfg().smtp_host     or "smtp.gmail.com"
def _smtp_port()     -> int:  return _cfg().smtp_port     or 587
def _smtp_user()     -> str:  return _cfg().smtp_user     or ""
def _smtp_password() -> str:  return _cfg().smtp_password or ""
def _smtp_from()     -> str:  return _cfg().smtp_from     or _smtp_user()

# Retry config for SMTP fallback
MAX_RETRIES      = 3
RETRY_BASE_DELAY = 1.0   # 1 s, 2 s, 4 s


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_html(html: str) -> str:
    """Minimal HTML→plain-text conversion for multipart fallback."""
    clean = re.sub(r"<style[\s\S]*?</style>", "", html)
    clean = re.sub(r"<[^>]+>", " ", clean)
    return re.sub(r"\s+", " ", clean).strip()


def _build_mime(to_email: str, subject: str, body: str, html: bool) -> MIMEMultipart:
    """Build RFC-compliant MIME message."""
    msg               = MIMEMultipart("alternative")
    msg["Subject"]    = subject
    msg["From"]       = _resend_from()
    msg["To"]         = to_email
    msg["Date"]       = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="shebabd.org")
    if html:
        msg.attach(MIMEText(_strip_html(body), "plain", "utf-8"))
        msg.attach(MIMEText(body,              "html",  "utf-8"))
    else:
        msg.attach(MIMEText(body, "plain", "utf-8"))
    return msg


def _smtp_send_sync(to_email: str, msg: MIMEMultipart) -> None:
    """Synchronous SMTP send — run inside a thread executor."""
    host, port, user, password, from_addr = (
        _smtp_host(), _smtp_port(), _smtp_user(), _smtp_password(), _smtp_from()
    )
    with smtplib.SMTP(host, port, timeout=12) as server:
        server.ehlo(); server.starttls(); server.ehlo()
        if user and password:
            server.login(user, password)
        server.sendmail(from_addr or user, to_email, msg.as_string())


async def _send_via_smtp(to_email: str, subject: str, body: str, html: bool) -> bool:
    """SMTP with exponential-backoff retry — used when Resend is not configured."""
    msg = _build_mime(to_email, subject, body, html)
    last_err: Optional[Exception] = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _smtp_send_sync, to_email, msg)
            logger.info("SMTP sent | to=%s subject=%r attempt=%d", to_email, subject, attempt)
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error("SMTP auth failed: %s", e)
            return False
        except smtplib.SMTPRecipientsRefused as e:
            logger.error("SMTP recipient refused %s: %s", to_email, e)
            return False
        except (smtplib.SMTPException, OSError, ConnectionError) as e:
            last_err = e
            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
            logger.warning("SMTP attempt %d/%d failed (%s) — retry in %.0fs", attempt, MAX_RETRIES, e, delay)
            if attempt < MAX_RETRIES:
                await asyncio.sleep(delay)

    logger.error("SMTP delivery failed after %d attempts | to=%s | %s", MAX_RETRIES, to_email, last_err)
    return False


# ── Public send_email ─────────────────────────────────────────────────────────

async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html: bool = False,
) -> bool:
    """
    Send an email.

    Priority:
      1. Resend API  (if RESEND_API_KEY is set)
      2. SMTP        (if SMTP_USER is set)
      3. Dev log     (neither configured — logs to console, returns True)

    Returns True on success, False on failure.
    """
    if not to_email or "@" not in to_email:
        logger.error("Invalid email address: %r", to_email)
        return False

    # ── 1. Resend ─────────────────────────────────────────────────────────────
    api_key = _resend_key()
    if api_key:
        try:
            resend.api_key = api_key
            params: resend.Emails.SendParams = {
                "from":    _resend_from(),
                "to":      [to_email],
                "subject": subject,
                "html":    body if html else f"<pre>{body}</pre>",
                "text":    _strip_html(body) if html else body,
            }
            result = resend.Emails.send(params)
            logger.info("Resend sent | id=%s to=%s subject=%r", result.get("id"), to_email, subject)
            return True
        except Exception as exc:
            logger.error("Resend failed (%s) — trying SMTP fallback", exc)
            # Fall through to SMTP

    # ── 2. SMTP fallback ──────────────────────────────────────────────────────
    if _smtp_user():
        return await _send_via_smtp(to_email, subject, body, html)

    # ── 3. Dev log ────────────────────────────────────────────────────────────
    logger.info(
        "[DEV EMAIL — not sent]\n  To: %s\n  Subject: %s\n  Preview: %.300s",
        to_email, subject, body,
    )
    return True


# ── Individual email helpers ──────────────────────────────────────────────────

async def send_welcome_email(name: str, email: str) -> bool:
    body = f"""
    <!DOCTYPE html><html><body style="font-family:sans-serif;background:#f4f6f8;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:#0F3A2B;padding:28px 24px;text-align:center;">
        <h1 style="color:#E7A93B;margin:0 0 8px;">Welcome to ShebaBD! 🎉</h1>
        <p style="color:#F7F1E1;margin:0;">Bangladesh's Social Good Platform</p>
      </div>
      <div style="padding:28px 24px;">
        <p>Hello <strong>{name}</strong>,</p>
        <p>Thank you for joining ShebaBD. You can now:</p>
        <ul>
          <li>💰 Donate to verified causes</li>
          <li>🩸 Register as a blood donor or request blood</li>
          <li>🤝 Connect with NGOs and volunteers</li>
          <li>🤖 Use Sheba AI for social good guidance</li>
        </ul>
        <p style="margin-top:24px;">
          <a href="https://shebabd.org" style="background:#D6472C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Visit ShebaBD
          </a>
        </p>
      </div>
      <div style="text-align:center;padding:16px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
        ShebaBD · Bangladesh · support@shebabd.org
      </div>
    </div>
    </body></html>
    """
    return await send_email(email, "Welcome to ShebaBD!", body, html=True)


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    reset_url = f"https://shebabd.org/reset-password?token={reset_token}"
    body = f"""
    <!DOCTYPE html><html><body style="font-family:sans-serif;background:#f4f6f8;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:#0F3A2B;padding:28px 24px;text-align:center;">
        <h1 style="color:#E7A93B;margin:0;">Password Reset 🔐</h1>
      </div>
      <div style="padding:28px 24px;">
        <p>A password reset was requested for your account.</p>
        <p>Click below to reset your password. <strong>This link expires in 1 hour.</strong></p>
        <p style="margin-top:24px;">
          <a href="{reset_url}" style="background:#D6472C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p style="color:#94a3b8;font-size:13px;margin-top:20px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    </div>
    </body></html>
    """
    return await send_email(email, "ShebaBD Password Reset", body, html=True)


async def send_donation_receipt(
    email: str,
    donor_name: str,
    amount: float,
    cause: str,
    receipt_no: str,
) -> bool:
    body = f"""
    <!DOCTYPE html><html><body style="font-family:sans-serif;background:#f4f6f8;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:#0F3A2B;padding:28px 24px;text-align:center;">
        <h1 style="color:#E7A93B;margin:0;">Donation Receipt 🙏</h1>
      </div>
      <div style="padding:28px 24px;">
        <p>Dear <strong>{donor_name}</strong>,</p>
        <p>Thank you for your generous donation!</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;"><strong>Receipt No:</strong></td><td style="padding:10px;">{receipt_no}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;"><strong>Amount:</strong></td><td style="padding:10px;font-weight:bold;color:#0F3A2B;">৳{amount:,.2f} BDT</td></tr>
          <tr><td style="padding:10px;color:#64748b;"><strong>Cause:</strong></td><td style="padding:10px;">{cause.title()}</td></tr>
        </table>
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Your contribution makes a real difference. 🌟</p>
      </div>
      <div style="text-align:center;padding:16px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
        ShebaBD · Bangladesh · support@shebabd.org
      </div>
    </div>
    </body></html>
    """
    return await send_email(email, f"Donation Receipt #{receipt_no} — ShebaBD", body, html=True)


async def send_blood_request_notification(
    email: str,
    donor_name: str,
    patient_name: str,
    blood_group: str,
    hospital: str,
    district: str,
    contact_phone: str,
) -> bool:
    body = f"""
    <!DOCTYPE html><html><body style="font-family:sans-serif;background:#f4f6f8;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      <div style="background:#D6472C;padding:28px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;">🩸 Urgent Blood Request</h1>
      </div>
      <div style="padding:28px 24px;">
        <p>Dear <strong>{donor_name}</strong>,</p>
        <p>A patient in your district needs blood urgently. You may be able to help!</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;width:130px;"><strong>Patient:</strong></td><td style="padding:10px;">{patient_name}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;"><strong>Blood Group:</strong></td><td style="padding:10px;font-weight:bold;color:#D6472C;">{blood_group}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;"><strong>Hospital:</strong></td><td style="padding:10px;">{hospital}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;color:#64748b;"><strong>District:</strong></td><td style="padding:10px;">{district}</td></tr>
          <tr><td style="padding:10px;color:#64748b;"><strong>Contact:</strong></td><td style="padding:10px;font-weight:bold;">{contact_phone}</td></tr>
        </table>
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Please contact the number above if you are available to donate. Thank you for being a hero.</p>
      </div>
    </div>
    </body></html>
    """
    return await send_email(
        email,
        f"[URGENT] {blood_group} Blood Needed in {district} — ShebaBD",
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
    registration_id: int,
    organizer: str = "ShebaBD Community",
) -> bool:
    """
    Send event registration confirmation via Resend.
    Triggered immediately after a user registers for an event.
    """
    pass_code = f"SHEBA-{str(registration_id).zfill(6)}"
    body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f8;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">

        <!-- Header -->
        <div style="background:#0F3A2B;padding:32px 24px;text-align:center;">
          <h1 style="color:#E7A93B;margin:0 0 8px;font-size:24px;">Registration Confirmed! 🎉</h1>
          <p style="color:#F7F1E1;margin:0;font-size:14px;">You're officially registered</p>
          <div style="display:inline-block;margin-top:12px;background:rgba(231,169,59,0.15);border:1px solid #E7A93B;border-radius:20px;padding:4px 16px;">
            <span style="color:#E7A93B;font-size:12px;font-weight:bold;letter-spacing:1px;">CONFIRMED PASS</span>
          </div>
        </div>

        <!-- Content -->
        <div style="padding:32px 24px;">
          <p style="font-size:16px;margin:0 0 20px;">Hello <strong>{user_name}</strong>,</p>
          <p style="color:#475569;margin:0 0 24px;">Your spot is secured. Here are your event details:</p>

          <!-- Event details card -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 8px;color:#64748b;width:110px;"><strong>Event:</strong></td>
                <td style="padding:10px 8px;font-weight:700;color:#0f172a;">{event_title}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 8px;color:#64748b;"><strong>Date:</strong></td>
                <td style="padding:10px 8px;color:#0f172a;">{event_date}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 8px;color:#64748b;"><strong>Time:</strong></td>
                <td style="padding:10px 8px;color:#0f172a;">{event_time}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 8px;color:#64748b;"><strong>Location:</strong></td>
                <td style="padding:10px 8px;color:#0f172a;">{event_location}</td>
              </tr>
              <tr>
                <td style="padding:10px 8px;color:#64748b;"><strong>Organizer:</strong></td>
                <td style="padding:10px 8px;color:#0f172a;">{organizer}</td>
              </tr>
            </table>
          </div>

          <!-- Pass code -->
          <div style="background:#0F3A2B;border-radius:10px;padding:18px 24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:rgba(247,241,225,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Your Registration Pass</div>
            <div style="font-family:monospace;font-size:22px;font-weight:bold;color:#E7A93B;letter-spacing:3px;">{pass_code}</div>
          </div>

          <p style="font-size:13px;color:#64748b;margin:0;">
            ℹ️ You will receive an automated reminder 24 hours before the event.
            If you cannot attend, please cancel your registration from the ShebaBD portal.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:20px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;">ShebaBD Social Impact Platform · Bangladesh</p>
          <p style="margin:0;">Questions? Email <a href="mailto:support@shebabd.org" style="color:#3E7A8C;">support@shebabd.org</a></p>
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(
        email,
        f"Confirmed: {event_title} — ShebaBD",
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
    time_left_display: str = "tomorrow",
) -> bool:
    """
    Send 24-hour (or configurable) event reminder via Resend.
    Called by the background scheduler when reminder threshold is reached.
    """
    body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f8;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">

        <!-- Header -->
        <div style="background:#0F3A2B;padding:28px 24px;text-align:center;">
          <h1 style="color:#E7A93B;margin:0 0 8px;font-size:22px;">⏰ Event Reminder</h1>
          <p style="color:#F7F1E1;margin:0;font-size:14px;"><strong>{event_title}</strong> is {time_left_display}!</p>
        </div>

        <!-- Content -->
        <div style="padding:28px 24px;">
          <p style="font-size:16px;margin:0 0 16px;">Hello <strong>{user_name}</strong>,</p>
          <p style="color:#475569;margin:0 0 20px;">This is your reminder for an upcoming event you registered for on ShebaBD.</p>

          <!-- Event card — warm amber tint for urgency -->
          <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:10px;padding:18px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid rgba(180,130,0,0.15);">
                <td style="padding:9px 8px;color:#92400e;width:100px;"><strong>Event:</strong></td>
                <td style="padding:9px 8px;font-weight:700;color:#78350f;">{event_title}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(180,130,0,0.15);">
                <td style="padding:9px 8px;color:#92400e;"><strong>Date:</strong></td>
                <td style="padding:9px 8px;color:#78350f;">{event_date}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(180,130,0,0.15);">
                <td style="padding:9px 8px;color:#92400e;"><strong>Time:</strong></td>
                <td style="padding:9px 8px;color:#78350f;">{event_time}</td>
              </tr>
              <tr>
                <td style="padding:9px 8px;color:#92400e;"><strong>Location:</strong></td>
                <td style="padding:9px 8px;color:#78350f;">{event_location}</td>
              </tr>
            </table>
          </div>

          <p style="font-size:14px;color:#475569;margin:0;">
            Please arrive a few minutes early to check in. We look forward to seeing you there!
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:20px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;">ShebaBD Social Impact Platform · Bangladesh</p>
          <p style="margin:0;">Can't attend? <a href="https://shebabd.org/events" style="color:#3E7A8C;">Cancel your registration</a></p>
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(
        email,
        f"Reminder: {event_title} is {time_left_display} — ShebaBD",
        body,
        html=True,
    )
