"""
seed.py — Create demo accounts and payment methods for local development.

Run: python seed.py

Accounts created:
  user@shebabd.org      / password123  (role: user)
  volunteer@shebabd.org / password123  (role: volunteer)
  ngo@shebabd.org       / password123  (role: ngo)
  admin@shebabd.org     / password123  (role: admin)

Payment Methods:
  bKash, Nagad, Bank Transfer
"""
import asyncio
import sys
import uuid
from decimal import Decimal

# Make sure we can import app modules
sys.path.insert(0, ".")

import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, create_tables
from app.models import User, PaymentMethod, PaymentProvider, BloodDonor

DEMO_ACCOUNTS = [
    {"name": "Demo User",      "email": "user@shebabd.org",      "role": "user"},
    {"name": "Demo Volunteer", "email": "volunteer@shebabd.org", "role": "volunteer"},
    {"name": "Demo NGO",       "email": "ngo@shebabd.org",       "role": "ngo"},
    {"name": "Demo Admin",     "email": "admin@shebabd.org",     "role": "admin"},
]

PAYMENT_METHODS = [
    {
        "provider": PaymentProvider.BKASH,
        "name": "bkash",
        "display_name": "bKash",
        "description": "Pay securely with your bKash account",
        "min_amount": Decimal("10.00"),
        "max_amount": Decimal("25000.00"),
        "config": {
            "app_key": "demo_app_key",
            "app_secret": "demo_app_secret", 
            "username": "demo_username",
            "password": "demo_password",
            "base_url": "https://checkout.pay.bka.sh/v1.2.0-beta",
            "intent": "donation",
        }
    },
    {
        "provider": PaymentProvider.NAGAD,
        "name": "nagad",
        "display_name": "Nagad", 
        "description": "Pay instantly with your Nagad wallet",
        "min_amount": Decimal("10.00"),
        "max_amount": Decimal("25000.00"),
        "config": {
            "merchant_id": "demo_merchant_id",
            "merchant_private_key": "demo_merchant_private_key",
            "base_url": "https://api.mynagad.com/api/dfs",
            "callback_url": "/api/v1/donations/callback/nagad",
        }
    },
    {
        "provider": PaymentProvider.BANK,
        "name": "bank_transfer",
        "display_name": "Bank Transfer",
        "description": "Direct bank transfer with account details",
        "min_amount": Decimal("50.00"),
        "max_amount": Decimal("100000.00"),
        "config": {
            "account_name": "ShebaBD Foundation",
            "account_number": "1234567890123456",
            "bank_name": "Dutch Bangla Bank Limited", 
            "branch_name": "Dhanmondi Branch",
            "routing_number": "090260323",
            "swift_code": "DBBLBDDH",
            "instructions": [
                "Transfer the exact donation amount to the provided account",
                "Use your phone number as reference",
                "Keep the transfer receipt for verification",
                "Verification may take 1-2 business days"
            ]
        }
    }
]

PASSWORD = "password123"


def _hash(plain: str) -> str:
    return bcrypt.hashpw(plain.encode()[:72], bcrypt.gensalt()).decode()


async def seed_users(db: AsyncSession) -> tuple[int, int]:
    """Seed demo user accounts."""
    created = 0
    skipped = 0

    for acc in DEMO_ACCOUNTS:
        result = await db.execute(select(User).where(User.email == acc["email"]))
        existing = result.scalars().first()

        if existing:
            print(f"  SKIP  {acc['email']} — already exists")
            skipped += 1
            continue

        user = User(
            id=str(uuid.uuid4()),
            name=acc["name"],
            email=acc["email"],
            hashed_password=_hash(PASSWORD),
            role=acc["role"],
            is_active=True,
        )
        db.add(user)
        created += 1
        print(f"  CREATE {acc['email']}  (role={acc['role']})")

    return created, skipped


async def seed_payment_methods(db: AsyncSession) -> tuple[int, int]:
    """Seed payment method configurations."""
    created = 0
    skipped = 0

    for method_data in PAYMENT_METHODS:
        result = await db.execute(
            select(PaymentMethod).where(PaymentMethod.provider == method_data["provider"])
        )
        existing = result.scalars().first()

        if existing:
            print(f"  SKIP  {method_data['display_name']} — already exists")
            skipped += 1
            continue

        method = PaymentMethod(
            **method_data,
            is_active=True
        )
        db.add(method)
        created += 1
        print(f"  CREATE {method_data['display_name']} (₹{method_data['min_amount']}-₹{method_data['max_amount']})")

    return created, skipped


# ── Community seed data ───────────────────────────────────────────────────────
async def seed_community(db: AsyncSession) -> int:
    """Seed community content. Returns number of items created."""
    from sqlalchemy import func
    from app.models import BlogPost, VolunteerStory, ForumThread, ForumReply, Announcement

    count = (await db.execute(select(func.count(BlogPost.id)))).scalar_one()
    if count > 0:
        print(f"  SKIP  Community already seeded ({count} blogs)")
        return 0

    created = 0

    blogs = [
        BlogPost(title="How Flood Relief Volunteers Changed 500 Lives in Sylhet",
                 excerpt="Last monsoon, a team of 47 volunteers from 6 NGOs coordinated one of the most effective flood responses Sylhet has seen.",
                 content="Full story about how ShebaBD coordinated flood relief volunteers across 6 NGOs, delivering aid to 500 families within 72 hours.",
                 category="Awareness", author_name="Fatema Akter", author_role="Volunteer, Dhaka",
                 image_initials="FL", color_hex="#3E7A8C", read_time="5 min read", likes_count=284),
        BlogPost(title="Why Bangladesh Needs 100,000 More Blood Donors",
                 excerpt="With only 3% of the eligible population donating blood, critical shortages continue to cost lives.",
                 content="Analysis of Bangladesh's blood donation crisis and how AI-powered matching improves response times from 4 hours to 40 minutes.",
                 category="Health", author_name="Dr. Kamal Hossain", author_role="Medical Volunteer, CRP",
                 image_initials="BL", color_hex="#D6472C", read_time="4 min read", likes_count=196),
        BlogPost(title="The Hidden Crisis: Child Malnutrition in Coastal Bangladesh",
                 excerpt="Despite economic progress, 26% of children under 5 in coastal areas remain chronically malnourished.",
                 content="Field research on child malnutrition in Barisal and Khulna, and the coalition of NGOs working to change it.",
                 category="Awareness", author_name="Nasrin Begum", author_role="Field Researcher",
                 image_initials="CM", color_hex="#E7A93B", read_time="7 min read", likes_count=341),
        BlogPost(title="Green Bangladesh: 1 Million Trees in 12 Months",
                 excerpt="Chittagong Green Force crossed a historic milestone — one million native trees planted across the Sundarbans buffer zone.",
                 content="How community volunteering through ShebaBD scaled a tree-planting drive from 200 to 2,000 volunteers.",
                 category="Environment", author_name="Rahim Uddin", author_role="Environment Volunteer",
                 image_initials="GT", color_hex="#4C8C6B", read_time="3 min read", likes_count=412),
        BlogPost(title="ShebaBD Smart Search Cuts Emergency Response to 40 Minutes",
                 excerpt="Natural language search for blood donors has cut average response time from 4 hours to under 40 minutes.",
                 content="Technical deep-dive into how ShebaBD Smart Search uses NLP to match blood donors and volunteers in real time.",
                 category="Technology", author_name="MD. Fahim Muntasir", author_role="ShebaBD Dev Team",
                 image_initials="SS", color_hex="#3E7A8C", read_time="6 min read", likes_count=228),
        BlogPost(title="From Refugee to Volunteer: Rohingya Youth Building Community",
                 excerpt="18-year-old Nur Alam arrived at Cox's Bazar in 2017. Today he leads 30 volunteers delivering literacy to 400 children.",
                 content="The story of Nur Alam and how ShebaBD helped him build a volunteer literacy programme serving 400 children.",
                 category="Stories", author_name="Sumaiya Islam", author_role="Community Organiser, Cox's Bazar",
                 image_initials="RV", color_hex="#E7A93B", read_time="8 min read", likes_count=567),
    ]
    for b in blogs:
        db.add(b)
    created += len(blogs)

    stories = [
        VolunteerStory(name="Md. Tariq Islam", role="Blood Donor, Khulna", avatar_initials="TI", color_hex="#D6472C",
                       story="I donated blood for the first time after ShebaBD matched me with a mother who needed O- urgently. Seeing her recover made every donation since feel like a life I helped write.",
                       cause="Blood Donation", blood_donations=15, volunteer_hours=0, likes_count=89),
        VolunteerStory(name="Dr. Fatema Akter", role="Medical Volunteer, Dhaka", avatar_initials="FA", color_hex="#E7A93B",
                       story="After the 2024 Sylhet floods, ShebaBD connected my medical team with three different relief orgs in 20 minutes. We treated 340 patients in 4 days.",
                       cause="Disaster Relief", blood_donations=0, volunteer_hours=140, likes_count=124),
        VolunteerStory(name="Nasrin Khanam", role="Education Volunteer, Sylhet", avatar_initials="NK", color_hex="#3E7A8C",
                       story="I teach 60 children in a flood-prone char island school. ShebaBD helped me find 8 additional volunteer teachers within a week.",
                       cause="Education", blood_donations=0, volunteer_hours=320, likes_count=201),
        VolunteerStory(name="Rahim Uddin", role="Environment Volunteer, Chittagong", avatar_initials="RU", color_hex="#4C8C6B",
                       story="Our tree-planting drive went from 200 to 2,000 volunteers after one ShebaBD campaign. That year we planted 84,000 trees. The coast looks greener now.",
                       cause="Environment", blood_donations=0, volunteer_hours=210, likes_count=178),
    ]
    for s in stories:
        db.add(s)
    created += len(stories)

    threads = [
        ForumThread(title="How can small NGOs access ShebaBD verification?",
                    body="We're a small NGO in Rangpur with 200 beneficiaries. What documents are required for verification?",
                    category="NGOs", author_name="Kamal_NGO", color_hex="#3E7A8C",
                    is_pinned=True, likes_count=41, replies_count=3),
        ForumThread(title="Best practices for multi-org disaster response",
                    body="After 3 flood responses, I see the same coordination failures. Looking for input from experienced coordinators.",
                    category="Emergency", author_name="Relief_Coordinator", color_hex="#D6472C",
                    is_pinned=True, likes_count=67, replies_count=5),
        ForumThread(title="Looking for medical volunteers in Rajshahi — urgent",
                    body="We need 4 doctors or nurses for a 3-day health camp. Travel and accommodation covered.",
                    category="Volunteers", author_name="RajshahiHealth", color_hex="#E7A93B",
                    is_pinned=False, likes_count=28, replies_count=2),
        ForumThread(title="Is the AI content generator good for Bengali posts?",
                    body="Has anyone got fully Bengali output? What prompts work best?",
                    category="Technology", author_name="NGO_Writer_BD", color_hex="#4C8C6B",
                    is_pinned=False, likes_count=34, replies_count=4),
        ForumThread(title="How does ShebaBD verify fund use after donation?",
                    body="As a donor I want to understand the verification pipeline. Is there an audit trail?",
                    category="Donations", author_name="DonorSylhet", color_hex="#E7A93B",
                    is_pinned=False, likes_count=52, replies_count=7),
        ForumThread(title="Share your volunteer experience this monsoon season",
                    body="Whether you helped with flood relief, blood drives, or cleanup — share what you did and learned.",
                    category="Stories", author_name="Community", color_hex="#3E7A8C",
                    is_pinned=False, likes_count=89, replies_count=12),
    ]
    for t in threads:
        db.add(t)
    created += len(threads)

    await db.flush()  # get IDs for replies

    thread_res = await db.execute(select(ForumThread).limit(2))
    thread_list = list(thread_res.scalars().all())
    if len(thread_list) >= 1:
        reply_data = [
            ForumReply(thread_id=thread_list[0].id, body="Key is having NGO Bureau registration cert. Tax exemption can follow later.", author_name="Nasrin_Helper"),
            ForumReply(thread_id=thread_list[0].id, body="Email verify@shebabd.org — there's a micro-NGO track for orgs under 1,000 beneficiaries.", author_name="ShebaBD_Support"),
        ]
        if len(thread_list) >= 2:
            reply_data += [
                ForumReply(thread_id=thread_list[1].id, body="Biggest improvement: one coordinator per org with decision-making authority.", author_name="Relief_Expert_BD"),
                ForumReply(thread_id=thread_list[1].id, body="Zone assignment before the disaster is crucial. Pre-assign upazilas to avoid duplication.", author_name="FloodTeam_Sylhet"),
            ]
        for r in reply_data:
            db.add(r)
        created += len(reply_data)

    announcements = [
        Announcement(title="Emergency Broadcast: Cyclone Preparedness Alert",
                     body="Category 3 cyclone tracking toward southeastern coast. All coastal NGOs activate emergency protocols.",
                     type="URGENT", color_hex="#D6472C"),
        Announcement(title="New Feature: AI Donation Advisor Now Live",
                     body="Calculate exact donation impact — meals, school days, trees — before you give.",
                     type="PLATFORM", color_hex="#3E7A8C"),
        Announcement(title="Milestone: 18,000 Active Volunteers Reached",
                     body="96% growth in 12 months. Thank you to every volunteer in the ShebaBD community.",
                     type="MILESTONE", color_hex="#22C55E"),
        Announcement(title="NGO Registration Drive: 500 New Organisations Needed",
                     body="Expanding to 8 underserved districts. Apply for free registration and AI-powered visibility.",
                     type="CAMPAIGN", color_hex="#E7A93B"),
    ]
    for a in announcements:
        db.add(a)
    created += len(announcements)

    print(f"  CREATE {created} community items (blogs, stories, threads, replies, announcements)")
    return created


async def seed() -> None:
    print("Creating tables if they don't exist...")
    await create_tables()

    async with AsyncSessionLocal() as db:
        print("\nCreating demo users...")
        users_created, users_skipped = await seed_users(db)

        print("\nCreating payment methods...")
        methods_created, methods_skipped = await seed_payment_methods(db)

        print("\nCreating community content...")
        comm_created = await seed_community(db)

        print("\nCreating blood donors...")
        blood_created = await seed_blood_donors(db)

        print("\nCreating events...")
        events_created = await seed_events(db)

        print("\nCreating organizations...")
        orgs_created = await seed_organizations(db)

        await db.commit()

    print(f"\nDone!")
    print(f"   Users: {users_created} created, {users_skipped} skipped")
    print(f"   Payment Methods: {methods_created} created, {methods_skipped} skipped")
    print(f"   Community items: {comm_created} created")
    print(f"   Blood donors: {blood_created} created")
    print(f"   Events: {events_created} created")
    print(f"   Organizations: {orgs_created} created")
    print("\nLogin password for all accounts: password123")


async def seed_events(db: AsyncSession) -> int:
    from sqlalchemy import func
    from app.models import Event
    count = (await db.execute(select(func.count(Event.id)))).scalar_one()
    if count > 0:
        print(f"  SKIP  Events already seeded ({count} events)")
        return 0

    events = [
        Event(title="National Blood Donation Day 2026", category="blood",
              date="July 14, 2026", time="9:00 AM – 4:00 PM",
              location="Dhaka University Campus, Dhaka",
              organizer="Bangladesh Red Crescent", capacity=500, registered_count=423,
              description="Annual blood donation drive targeting 1,000 units across all districts. Free health screening included.",
              tags="Blood,Health,Free", is_featured=True),
        Event(title="Free Medical Camp — Char Areas", category="medical",
              date="July 18, 2026", time="8:00 AM – 2:00 PM",
              location="Sirajganj Char, Rajshahi",
              organizer="CRP Bangladesh", capacity=200, registered_count=87,
              description="Free consultation, medicines, and health check-ups for flood-affected char communities.",
              tags="Medical,Free,Rural", is_featured=False),
        Event(title="Climate Action Youth Summit", category="environment",
              date="August 2, 2026", time="10:00 AM – 5:00 PM",
              location="BUET Auditorium, Dhaka",
              organizer="Chittagong Green Force", capacity=300, registered_count=210,
              description="Youth-led discussions on climate change, mangrove restoration, and sustainable futures for Bangladesh.",
              tags="Climate,Youth,Networking", is_featured=True),
        Event(title="Digital Literacy for Rural Women", category="education",
              date="August 10, 2026", time="9:00 AM – 1:00 PM",
              location="Gazipur Community Center",
              organizer="Dhaka Ahsania Mission", capacity=80, registered_count=64,
              description="Hands-on smartphone and internet literacy training for rural women. Stipend provided for participants.",
              tags="Education,Women,Digital", is_featured=False),
        Event(title="Fundraising Gala — Poverty Relief 2026", category="fundraising",
              date="August 22, 2026", time="6:00 PM – 10:00 PM",
              location="Radisson Blu, Dhaka",
              organizer="Grameen Bank", capacity=250, registered_count=190,
              description="Annual fundraising event featuring performances, auction, and dinner. Proceeds go to rural poverty relief.",
              tags="Fundraising,Gala,Networking", is_featured=False),
        Event(title="Cyclone Preparedness Workshop", category="awareness",
              date="September 5, 2026", time="10:00 AM – 3:00 PM",
              location="Cox's Bazar District Hall",
              organizer="Khulna Disaster Response", capacity=150, registered_count=42,
              description="Community training on cyclone preparedness, evacuation routes, and emergency response for coastal areas.",
              tags="Disaster,Awareness,Free", is_featured=False),
    ]
    for e in events:
        db.add(e)
    print(f"  CREATE {len(events)} events")
    return len(events)


async def seed_organizations(db: AsyncSession) -> int:
    from sqlalchemy import func
    from app.models import Organization
    count = (await db.execute(select(func.count(Organization.id)))).scalar_one()
    if count > 0:
        print(f"  SKIP  Organizations already seeded ({count} orgs)")
        return 0

    orgs = [
        Organization(name="BRAC Bangladesh", initial="B", category="education", district="Dhaka",
                     color_hex="#E7A93B", rating=4.9, review_count=1240, volunteer_count=3200, is_verified=True,
                     phone="+880 2-9881265", website="brac.net",
                     description="One of the largest development organisations in the world, focusing on poverty alleviation and social empowerment."),
        Organization(name="Grameen Bank", initial="G", category="poverty", district="Dhaka",
                     color_hex="#A9673A", rating=4.8, review_count=980, volunteer_count=1500, is_verified=True,
                     phone="+880 2-9005257", website="grameen.com",
                     description="Microfinance pioneer providing small loans to the rural poor, enabling long-term financial independence."),
        Organization(name="Dhaka Ahsania Mission", initial="D", category="education", district="Dhaka",
                     color_hex="#E7A93B", rating=4.7, review_count=756, volunteer_count=900, is_verified=True,
                     phone="+880 2-8116149", website="ahsaniamission.org",
                     description="Promotes education, health, and social development through grassroots programs across Bangladesh."),
        Organization(name="CRP Bangladesh", initial="C", category="healthcare", district="Dhaka",
                     color_hex="#3E7A8C", rating=4.9, review_count=634, volunteer_count=450, is_verified=True,
                     phone="+880 2-7791814", website="crp-bangladesh.org",
                     description="Centre for the Rehabilitation of the Paralysed — providing world-class rehabilitation services."),
        Organization(name="Bangladesh Red Crescent", initial="B", category="disaster", district="Dhaka",
                     color_hex="#D6472C", rating=4.8, review_count=1100, volunteer_count=5000, is_verified=True,
                     phone="+880 2-9330188", website="bdrcs.org",
                     description="Provides emergency relief, blood services, and disaster preparedness across all 64 districts."),
        Organization(name="Chittagong Green Force", initial="C", category="environment", district="Chittagong",
                     color_hex="#4C8C6B", rating=4.5, review_count=320, volunteer_count=780, is_verified=True,
                     phone="+880 31-614732", website="greenforce.bd",
                     description="Environmental organisation focused on coastal protection, tree plantation, and climate awareness."),
        Organization(name="Sylhet Blood Bank", initial="S", category="blood", district="Sylhet",
                     color_hex="#D6472C", rating=4.7, review_count=892, volunteer_count=1200, is_verified=True,
                     phone="+880 821-713456", website="sylhetblood.org",
                     description="Largest voluntary blood donation network in the Sylhet division — 24/7 emergency blood supply."),
        Organization(name="Rajshahi Education Trust", initial="R", category="education", district="Rajshahi",
                     color_hex="#E7A93B", rating=4.6, review_count=445, volunteer_count=320, is_verified=True,
                     phone="+880 721-775432", website="ret.org.bd",
                     description="Providing free primary education and skill development training to underprivileged children."),
        Organization(name="Khulna Disaster Response", initial="K", category="disaster", district="Khulna",
                     color_hex="#D6472C", rating=4.4, review_count=267, volunteer_count=650, is_verified=True,
                     phone="+880 41-723589", website="kdr.bd",
                     description="Specialised in cyclone preparedness, flood relief, and Sundarbans conservation in the south-west."),
    ]
    for o in orgs:
        db.add(o)
    print(f"  CREATE {len(orgs)} organizations")
    return len(orgs)


async def seed_blood_donors(db: AsyncSession) -> int:
    """Seed demo blood donors."""
    from sqlalchemy import func
    count = (await db.execute(select(func.count(BloodDonor.id)))).scalar_one()
    if count > 0:
        print(f"  SKIP  Blood donors already seeded ({count} donors)")
        return 0

    from datetime import datetime, timedelta, timezone
    donors = [
        BloodDonor(name="Md. Karim Hossain",   phone="+8801711000001", blood_group="O+",  district="Dhaka",       area="Mirpur",        is_available=True,  total_donations=8,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=90),  age=32, weight_kg=72),
        BloodDonor(name="Sharmin Akter",        phone="+8801811000002", blood_group="A+",  district="Chittagong",  area="Agrabad",       is_available=True,  total_donations=5,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=60),  age=28, weight_kg=58),
        BloodDonor(name="Jamal Hossain",        phone="+8801911000003", blood_group="B+",  district="Dhaka",       area="Uttara",        is_available=True,  total_donations=12, last_donated_at=datetime.now(timezone.utc)-timedelta(days=150), age=35, weight_kg=80),
        BloodDonor(name="Rupa Begum",           phone="+8801611000004", blood_group="AB+", district="Sylhet",      area="Zindabazar",    is_available=False, total_donations=3,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=30),  age=25, weight_kg=55),
        BloodDonor(name="Tariq Islam",          phone="+8801711000005", blood_group="O-",  district="Khulna",      area="Sonadanga",     is_available=True,  total_donations=15, last_donated_at=datetime.now(timezone.utc)-timedelta(days=180), age=40, weight_kg=75),
        BloodDonor(name="Nasreen Khanam",       phone="+8801811000006", blood_group="A-",  district="Rajshahi",    area="Rajpara",       is_available=True,  total_donations=7,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=120), age=30, weight_kg=60),
        BloodDonor(name="Rafiq Uddin",          phone="+8801611000007", blood_group="B-",  district="Dhaka",       area="Dhanmondi",     is_available=True,  total_donations=4,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=70),  age=27, weight_kg=68),
        BloodDonor(name="Mitu Roy",             phone="+8801511000008", blood_group="AB-", district="Mymensingh",  area="Town Hall",     is_available=False, total_donations=2,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=45),  age=23, weight_kg=52),
        BloodDonor(name="Rahim Chowdhury",      phone="+8801711000009", blood_group="O+",  district="Chittagong",  area="Nasirabad",     is_available=True,  total_donations=20, last_donated_at=datetime.now(timezone.utc)-timedelta(days=200), age=45, weight_kg=82),
        BloodDonor(name="Farida Begum",         phone="+8801911000010", blood_group="A+",  district="Dhaka",       area="Banani",        is_available=True,  total_donations=6,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=110), age=33, weight_kg=63),
        BloodDonor(name="Sumon Ahmed",          phone="+8801811000011", blood_group="B+",  district="Sylhet",      area="Amberkhana",    is_available=True,  total_donations=9,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=165), age=29, weight_kg=71),
        BloodDonor(name="Lovely Akter",         phone="+8801611000012", blood_group="O-",  district="Dhaka",       area="Mohammadpur",   is_available=True,  total_donations=3,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=95),  age=26, weight_kg=57),
        BloodDonor(name="Kamrul Hassan",        phone="+8801711000013", blood_group="AB+", district="Rajshahi",    area="Shaheb Bazar",  is_available=True,  total_donations=11, last_donated_at=datetime.now(timezone.utc)-timedelta(days=140), age=38, weight_kg=77),
        BloodDonor(name="Nusrat Jahan",         phone="+8801511000014", blood_group="A-",  district="Khulna",      area="Khalishpur",    is_available=False, total_donations=1,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=20),  age=22, weight_kg=51),
        BloodDonor(name="Aminul Islam",         phone="+8801911000015", blood_group="B-",  district="Barisal",     area="Natun Bazar",   is_available=True,  total_donations=5,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=130), age=31, weight_kg=66),
        BloodDonor(name="Tania Sultana",        phone="+8801711000016", blood_group="O+",  district="Mymensingh",  area="Ganginarpar",   is_available=True,  total_donations=4,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=100), age=27, weight_kg=59),
        BloodDonor(name="Nazmul Haque",         phone="+8801811000017", blood_group="A+",  district="Dhaka",       area="Gulshan",       is_available=True,  total_donations=17, last_donated_at=datetime.now(timezone.utc)-timedelta(days=250), age=42, weight_kg=85),
        BloodDonor(name="Sabrina Akter",        phone="+8801611000018", blood_group="AB-", district="Chittagong",  area="Patenga",       is_available=True,  total_donations=2,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=80),  age=24, weight_kg=54),
        BloodDonor(name="Rezaul Karim",         phone="+8801511000019", blood_group="B+",  district="Dhaka",       area="Badda",         is_available=True,  total_donations=8,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=175), age=36, weight_kg=74),
        BloodDonor(name="Hasina Khatun",        phone="+8801911000020", blood_group="O-",  district="Sylhet",      area="Subhanighat",   is_available=True,  total_donations=6,  last_donated_at=datetime.now(timezone.utc)-timedelta(days=155), age=34, weight_kg=61),
    ]
    for d in donors:
        d.is_verified = True
        db.add(d)

    print(f"  CREATE {len(donors)} blood donors")
    return len(donors)


if __name__ == "__main__":
    asyncio.run(seed())