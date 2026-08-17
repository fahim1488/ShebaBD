"""
seed_community.py — Populate community tables with realistic Bangladeshi data.
Run: python seed_community.py
"""
import asyncio
from datetime import datetime, timedelta, timezone

from app.database import AsyncSessionLocal, create_tables
from app.models import BlogPost, VolunteerStory, ForumThread, ForumReply, Announcement


SKY     = "#3E7A8C"
DISC    = "#D6472C"
MARIGOLD= "#E7A93B"
LEAF    = "#4C8C6B"


BLOGS = [
    dict(title="How Flood Relief Volunteers Changed 500 Lives in Sylhet",
         excerpt="Last monsoon, a team of 47 volunteers from 6 NGOs coordinated one of the most effective flood responses Sylhet has seen in a decade.",
         content="Full blog content about flood relief coordination through ShebaBD platform...",
         category="Awareness", author_name="Fatema Akter", author_role="Volunteer, Dhaka",
         image_initials="FL", color_hex=SKY, read_time="5 min read", likes_count=284,
         created_at=datetime.now(timezone.utc) - timedelta(days=3)),
    dict(title="Why Bangladesh Needs 100,000 More Registered Blood Donors",
         excerpt="With only 3% of the eligible population donating blood, critical shortages continue to cost lives. AI-powered matching is closing the gap.",
         content="Detailed analysis of blood shortage crisis in Bangladesh...",
         category="Health", author_name="Dr. Kamal Hossain", author_role="Medical Volunteer, CRP",
         image_initials="BL", color_hex=DISC, read_time="4 min read", likes_count=196,
         created_at=datetime.now(timezone.utc) - timedelta(days=7)),
    dict(title="Green Bangladesh: 1 Million Trees in 12 Months",
         excerpt="Chittagong Green Force just crossed a historic milestone — one million native trees planted across the Sundarbans buffer zone.",
         content="Success story of environmental volunteering through community coordination...",
         category="Environment", author_name="Rahim Uddin", author_role="Environment Volunteer",
         image_initials="GT", color_hex=LEAF, read_time="3 min read", likes_count=412,
         created_at=datetime.now(timezone.utc) - timedelta(days=10)),
]

STORIES = [
    dict(name="Md. Tariq Islam", role="Blood Donor, Khulna", avatar_initials="TI", color_hex=DISC,
         story="I donated blood for the first time after ShebaBD matched me with a mother who needed O- urgently after childbirth complications. Seeing her recover made every donation since feel like a life I helped write.",
         cause="Blood Donation", blood_donations=15, volunteer_hours=0, likes_count=89),
    dict(name="Dr. Fatema Akter", role="Medical Volunteer, Dhaka", avatar_initials="FA", color_hex=MARIGOLD,
         story="After the 2024 Sylhet floods, ShebaBD connected my medical team with three different relief orgs in 20 minutes flat. We treated 340 patients in 4 days.",
         cause="Disaster Relief", blood_donations=0, volunteer_hours=140, likes_count=124),
    dict(name="Nasrin Khanam", role="Education Volunteer, Sylhet", avatar_initials="NK", color_hex=SKY,
         story="I teach 60 children in a flood-prone char island school. ShebaBD helped me find 8 additional volunteer teachers within a week.",
         cause="Education", blood_donations=0, volunteer_hours=320, likes_count=201),
]

THREADS = [
    dict(title="How can small NGOs access ShebaBD verification?",
         body="We are a small NGO operating in Rangpur with about 200 beneficiaries. What documents are actually required?",
         category="NGOs", author_name="Kamal_NGO", color_hex=SKY, is_pinned=True,
         likes_count=41, replies_count=3),
    dict(title="Best practices for coordinating multi-org disaster response",
         body="After working through three flood responses this year, I've noticed the same coordination failures repeating. Looking for input from experienced coordinators.",
         category="Emergency", author_name="Relief_Coordinator", color_hex=DISC, is_pinned=True,
         likes_count=67, replies_count=5),
    dict(title="Looking for medical volunteers in Rajshahi — urgent",
         body="We need 4 more doctors or nurses for a 3-day health camp next weekend. Travel and accommodation covered.",
         category="Volunteers", author_name="RajshahiHealth", color_hex=MARIGOLD, is_pinned=False,
         likes_count=28, replies_count=2),
]

ANNOUNCEMENTS = [
    dict(title="ShebaBD Emergency Broadcast: Cyclone Preparedness Alert",
         body="A Category 3 cyclone is tracking toward the southeastern coast. All coastal NGOs should activate emergency protocols.",
         type="URGENT", color_hex=DISC, is_active=True),
    dict(title="New Feature: AI Donation Advisor Now Live",
         body="Calculate the exact impact of your donation — meals provided, school days funded, trees planted — before you give.",
         type="PLATFORM", color_hex=SKY, is_active=True),
    dict(title="Volunteer Milestone: 18,000 Active Volunteers Reached",
         body="We crossed 18,000 registered volunteers this week — a 96% growth in 12 months.",
         type="MILESTONE", color_hex="#22C55E", is_active=True),
]


async def seed():
    await create_tables()
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count(BlogPost.id)))).scalar_one()
        if count > 0:
            print(f"Community already seeded ({count} blogs exist). Skipping.")
            return

        print("Seeding community data...")

        # Add blogs
        for blog_data in BLOGS:
            blog = BlogPost(**blog_data)
            db.add(blog)

        # Add stories
        for story_data in STORIES:
            story = VolunteerStory(**story_data)
            db.add(story)

        # Add forum threads
        for thread_data in THREADS:
            thread = ForumThread(**thread_data)
            db.add(thread)

        # Add sample replies
        await db.flush()  # Get thread IDs
        thread_result = await db.execute(select(ForumThread))
        threads = list(thread_result.scalars().all())
        
        if threads:
            # Add a few replies to first thread
            replies = [
                ForumReply(thread_id=threads[0].id, body="We registered as a small org last year. The key is having your NGO Bureau registration certificate.", author_name="Nasrin_Helper"),
                ForumReply(thread_id=threads[0].id, body="Email verify@shebabd.org with your NGO Bureau cert and we'll guide you through the rest.", author_name="ShebaBD_Support"),
            ]
            for reply in replies:
                db.add(reply)

        # Add announcements
        for announcement_data in ANNOUNCEMENTS:
            announcement = Announcement(**announcement_data)
            db.add(announcement)

        await db.commit()
        print("[OK] Community data seeded successfully")
        print("  - 3 blog posts")
        print("  - 3 volunteer stories")
        print("  - 3 forum threads with replies")
        print("  - 3 announcements")


if __name__ == "__main__":
    asyncio.run(seed())