"""
seed_events.py — Seed sample social events & campaigns in ShebaBD
"""
import sqlite3
from datetime import datetime, timezone, timedelta

conn = sqlite3.connect('shebabd.db')
cur = conn.cursor()

# Ensure table exists
cur.execute('''
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    registered_count INTEGER NOT NULL DEFAULT 0,
    tags VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

count = cur.execute('SELECT COUNT(*) FROM events').fetchone()[0]
print(f'Current event count: {count}')

now = datetime.now(timezone.utc)

SAMPLE_EVENTS = [
    {
        "title": "National Blood Donation Drive 2026",
        "category": "blood",
        "description": "Annual nationwide emergency blood collection drive organized in collaboration with Dhaka Medical College Hospital and Red Crescent Society. Free health checkups provided for all registered donors.",
        "date": (now + timedelta(days=3)).strftime("%b %d, %Y"),
        "time": "09:00 AM - 05:00 PM",
        "location": "Dhanmondi Lake Park, Sector 8, Dhaka",
        "organizer": "Bangladesh Red Crescent Society",
        "capacity": 500,
        "registered_count": 342,
        "tags": "Blood Donation, Healthcare, Emergency, Free Checkup",
        "is_featured": 1,
        "is_active": 1,
    },
    {
        "title": "Sylhet Flood Relief & Medical Camp",
        "category": "medical",
        "description": "Free medicine distribution, doctor consultations, and hygiene kit delivery for flood-affected families in Sunamganj and surrounding haor regions.",
        "date": (now + timedelta(days=6)).strftime("%b %d, %Y"),
        "time": "10:00 AM - 04:00 PM",
        "location": "Sunamganj Sadar Hospital Grounds, Sylhet",
        "organizer": "ShebaBD Medical Relief Unit",
        "capacity": 300,
        "registered_count": 215,
        "tags": "Medical Camp, Flood Relief, Free Medicine, Doctors",
        "is_featured": 0,
        "is_active": 1,
    },
    {
        "title": "Digital Literacy Workshop for Rural Youth",
        "category": "education",
        "description": "Hands-on computer training, coding fundamentals, and digital freelancing guidance for high school students in rural Chittagong districts.",
        "date": (now + timedelta(days=10)).strftime("%b %d, %Y"),
        "time": "11:00 AM - 03:30 PM",
        "location": "Chittagong University IT Auditorium, Chittagong",
        "organizer": "Youth Empowerment Bangladesh",
        "capacity": 150,
        "registered_count": 128,
        "tags": "Education, IT Skills, Youth, Coding",
        "is_featured": 0,
        "is_active": 1,
    },
    {
        "title": "Green Dhaka Tree Plantation Campaign",
        "category": "environment",
        "description": "Join 1,000 environmental volunteers to plant 10,000 native trees across Hatirjheel, Uttara, and Mirpur green corridors to combat urban heat islands.",
        "date": (now + timedelta(days=14)).strftime("%b %d, %Y"),
        "time": "07:30 AM - 12:00 PM",
        "location": "Hatirjheel Amphitheatre, Dhaka",
        "organizer": "Green Bangladesh Initiative",
        "capacity": 1000,
        "registered_count": 780,
        "tags": "Environment, Tree Plantation, Green Dhaka, Climate",
        "is_featured": 1,
        "is_active": 1,
    },
    {
        "title": "Winter Clothes & Warm Blanket Drive",
        "category": "fundraising",
        "description": "Collecting and distributing high quality winter jackets, sweaters, and blankets for cold-hit northern districts in Kurigram, Rangpur, and Panchagarh.",
        "date": (now + timedelta(days=18)).strftime("%b %d, %Y"),
        "time": "08:00 AM - 06:00 PM",
        "location": "Rangpur Town Hall Complex, Rangpur",
        "organizer": "Shishur Hashi Foundation",
        "capacity": 400,
        "registered_count": 290,
        "tags": "Winter Relief, Blankets, Northern Bangladesh, Warmth",
        "is_featured": 0,
        "is_active": 1,
    },
    {
        "title": "Mental Health & Wellness Awareness Camp",
        "category": "awareness",
        "description": "Certified counselors and psychiatrists offering confidential one-on-one sessions, stress management workshops, and youth wellness counseling.",
        "date": (now + timedelta(days=22)).strftime("%b %d, %Y"),
        "time": "02:00 PM - 07:00 PM",
        "location": "Rajshahi Medical College Auditorium, Rajshahi",
        "organizer": "MindCare Bangladesh",
        "capacity": 200,
        "registered_count": 145,
        "tags": "Mental Health, Awareness, Counseling, Youth",
        "is_featured": 0,
        "is_active": 1,
    },
]

if count == 0:
    for ev in SAMPLE_EVENTS:
        cur.execute('''
        INSERT INTO events (title, category, description, date, time, location, organizer, capacity, registered_count, tags, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            ev["title"], ev["category"], ev["description"], ev["date"], ev["time"],
            ev["location"], ev["organizer"], ev["capacity"], ev["registered_count"],
            ev["tags"], ev["is_featured"], ev["is_active"]
        ))
    conn.commit()
    print(f"Successfully seeded {len(SAMPLE_EVENTS)} sample events!")
else:
    print(f"Events table already has {count} rows.")

conn.close()
