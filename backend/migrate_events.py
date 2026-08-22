import sqlite3
from datetime import datetime, timezone, timedelta

con = sqlite3.connect('shebabd.db')
cur = con.cursor()

def add_col_if_missing(table, col, definition):
    existing = [r[1] for r in cur.execute(f'PRAGMA table_info({table})')]
    if col not in existing:
        cur.execute(f'ALTER TABLE {table} ADD COLUMN {col} {definition}')
        print(f'Added {col} to {table}')
    else:
        print(f'{col} already exists in {table}')

# Add columns to events
add_col_if_missing('events', 'datetime_start', 'TIMESTAMP')
add_col_if_missing('events', 'registration_deadline', 'TIMESTAMP')
add_col_if_missing('events', 'is_cancelled', 'BOOLEAN NOT NULL DEFAULT 0')
add_col_if_missing('events', 'reminder_minutes_before', 'INTEGER NOT NULL DEFAULT 1440')
add_col_if_missing('events', 'email_confirmation_enabled', 'BOOLEAN NOT NULL DEFAULT 1')
add_col_if_missing('events', 'reminder_enabled', 'BOOLEAN NOT NULL DEFAULT 1')

# Add columns to event_registrations
add_col_if_missing('event_registrations', 'user_id', 'VARCHAR(36)')
add_col_if_missing('event_registrations', 'status', 'VARCHAR(30) NOT NULL DEFAULT "confirmed"')
add_col_if_missing('event_registrations', 'confirmation_sent', 'BOOLEAN NOT NULL DEFAULT 0')
add_col_if_missing('event_registrations', 'confirmation_sent_at', 'TIMESTAMP')
add_col_if_missing('event_registrations', 'reminder_sent', 'BOOLEAN NOT NULL DEFAULT 0')
add_col_if_missing('event_registrations', 'reminder_sent_at', 'TIMESTAMP')

# Also populate sample datetime_start for existing events if null so the scheduler has realistic future dates
events = cur.execute('SELECT id, date, datetime_start FROM events').fetchall()
now = datetime.now(timezone.utc)
for idx, (eid, date_str, dt_start) in enumerate(events):
    if not dt_start:
        # Assign upcoming dates (e.g. tomorrow, 3 days, 7 days from now)
        future_date = (now + timedelta(days=idx + 1, hours=4)).isoformat()
        cur.execute('UPDATE events SET datetime_start = ? WHERE id = ?', (future_date, eid))
        print(f'Updated event {eid} datetime_start to {future_date}')

con.commit()
con.close()
print('Migration complete!')
