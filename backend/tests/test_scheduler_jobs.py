"""
test_scheduler_jobs.py - Unit tests for background reminder interval logic.
"""
from datetime import datetime, timedelta, timezone

def test_reminder_window_calculation():
    """Test reminder threshold calculation within 24h window."""
    event_start = datetime.now(timezone.utc) + timedelta(hours=20)
    reminder_threshold = event_start - timedelta(minutes=1440)
    assert reminder_threshold <= datetime.now(timezone.utc)
