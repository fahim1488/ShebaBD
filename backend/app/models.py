"""
models.py — SQLAlchemy ORM models.

Tables
------
users          — registered accounts
conversations  — one chat session per user
messages       — one turn per conversation
donations      — donation records
payment_methods— supported payment methods (bKash, Nagad, Bank)
transactions   — payment transaction records
"""
import uuid as _uuid
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
    Numeric,
    Enum as SQLEnum,
)
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── UUID that works on both PostgreSQL and SQLite ────────────────────────────
class UUID(TypeDecorator):
    """Platform-independent UUID type stored as CHAR(36)."""
    impl = CHAR
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return _uuid.UUID(str(value))


# ── Enums ─────────────────────────────────────────────────────────────────────
class DonationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentProvider(str, Enum):
    BKASH = "bkash"
    NAGAD = "nagad"
    BANK = "bank"


class TransactionStatus(str, Enum):
    INITIATED = "initiated"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DonationCause(str, Enum):
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    DISASTER = "disaster"
    ENVIRONMENT = "environment"
    POVERTY = "poverty"


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    """Registered user account."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(_uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(),
        onupdate=_utcnow, default=_utcnow
    )

    # Relationships
    donations: Mapped[list["Donation"]] = relationship("Donation", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"


# ── Conversation ──────────────────────────────────────────────────────────────
class Conversation(Base):
    """
    A single conversation thread.

    user_id is the JWT subject — a string so we stay decoupled from any
    particular user-table implementation.
    """

    __tablename__ = "conversations"

    id: Mapped[_uuid.UUID] = mapped_column(
        UUID(),
        primary_key=True,
        default=_uuid.uuid4,
    )
    user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="New conversation",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=_utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=_utcnow,
        default=_utcnow,
    )

    # Relationships
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
        lazy="selectin",
    )

    # ── Composite indexes for common query patterns ────────────────────────────
    __table_args__ = (
        Index("ix_conversations_user_active", "user_id", "is_active"),
        Index("ix_conversations_user_updated", "user_id", "updated_at"),
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} user_id={self.user_id!r}>"


# ── Message ───────────────────────────────────────────────────────────────────
class Message(Base):
    """
    A single message within a conversation.

    role       — "user" | "assistant" | "tool" | "system"
    content    — plain text or Markdown
    tool_name  — populated when role == "tool"
    tool_args  — JSON dict of arguments passed to the tool
    tool_result— JSON dict returned by the tool
    tokens     — approximate token count (for cost tracking)
    """

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[_uuid.UUID] = mapped_column(
        UUID(),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)

    tool_call_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tool_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tool_args: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    tool_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Usage tracking
    tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=_utcnow,
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="messages",
    )

    def __repr__(self) -> str:
        snippet = (self.content or "")[:40]
        return f"<Message id={self.id} role={self.role!r} content={snippet!r}>"


# ── Donation ──────────────────────────────────────────────────────────────────
class Donation(Base):
    """Donation record with cause, amount, and payment details."""

    __tablename__ = "donations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(_uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    
    # Donation details
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="BDT")
    cause: Mapped[DonationCause] = mapped_column(
        SQLEnum(DonationCause), nullable=False, index=True
    )
    
    # Donor information (can be different from user account)
    donor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    donor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    donor_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Optional message from donor
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Payment and status
    payment_provider: Mapped[PaymentProvider] = mapped_column(
        SQLEnum(PaymentProvider), nullable=False
    )
    status: Mapped[DonationStatus] = mapped_column(
        SQLEnum(DonationStatus), nullable=False, default=DonationStatus.PENDING, index=True
    )
    
    # Tracking
    receipt_number: Mapped[str | None] = mapped_column(String(50), nullable=True, unique=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # Extra data
    extra_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(),
        onupdate=_utcnow, default=_utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="donations")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="donation", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Donation id={self.id} amount={self.amount} cause={self.cause}>"


# ── PaymentMethod ─────────────────────────────────────────────────────────────
class PaymentMethod(Base):
    """Available payment methods and their configuration."""

    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[PaymentProvider] = mapped_column(
        SQLEnum(PaymentProvider), nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Configuration
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    min_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=10)
    max_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=100000)
    
    # Provider-specific configuration
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow
    )

    def __repr__(self) -> str:
        return f"<PaymentMethod provider={self.provider} name={self.name}>"


# ── Transaction ───────────────────────────────────────────────────────────────
class Transaction(Base):
    """Payment transaction records for tracking."""

    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(_uuid.uuid4())
    )
    donation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("donations.id"), nullable=False, index=True
    )
    
    # Transaction details
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="BDT")
    
    # Payment provider details
    provider: Mapped[PaymentProvider] = mapped_column(
        SQLEnum(PaymentProvider), nullable=False
    )
    provider_transaction_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Status and tracking
    status: Mapped[TransactionStatus] = mapped_column(
        SQLEnum(TransactionStatus), nullable=False, default=TransactionStatus.INITIATED, index=True
    )
    
    # Provider response data
    provider_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    initiated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow
    )

    # Relationships
    donation: Mapped["Donation"] = relationship("Donation", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} donation_id={self.donation_id} status={self.status}>"


# ── Community Models ──────────────────────────────────────────────────────────

class BlogPost(Base):
    """Awareness blog articles."""
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    author_role: Mapped[str] = mapped_column(String(255), nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    image_initials: Mapped[str] = mapped_column(String(4), nullable=False, default="BL")
    color_hex: Mapped[str] = mapped_column(String(20), nullable=False, default="#3E7A8C")
    read_time: Mapped[str] = mapped_column(String(30), nullable=False, default="5 min read")
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=_utcnow, default=_utcnow)

    likes: Mapped[list["PostLike"]] = relationship("PostLike", foreign_keys="PostLike.blog_post_id", back_populates="blog_post", cascade="all, delete-orphan")


class VolunteerStory(Base):
    """Community volunteer impact stories."""
    __tablename__ = "volunteer_stories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_initials: Mapped[str] = mapped_column(String(4), nullable=False, default="VL")
    color_hex: Mapped[str] = mapped_column(String(20), nullable=False, default="#D6472C")
    story: Mapped[str] = mapped_column(Text, nullable=False)
    cause: Mapped[str] = mapped_column(String(100), nullable=False)
    blood_donations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    volunteer_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    author_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)

    likes: Mapped[list["PostLike"]] = relationship("PostLike", foreign_keys="PostLike.story_id", back_populates="story", cascade="all, delete-orphan")


class ForumThread(Base):
    """Community discussion forum threads."""
    __tablename__ = "forum_threads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    color_hex: Mapped[str] = mapped_column(String(20), nullable=False, default="#3E7A8C")
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    replies_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=_utcnow, default=_utcnow)

    replies: Mapped[list["ForumReply"]] = relationship("ForumReply", back_populates="thread", cascade="all, delete-orphan", order_by="ForumReply.created_at", lazy="selectin")
    likes: Mapped[list["PostLike"]] = relationship("PostLike", foreign_keys="PostLike.thread_id", back_populates="thread", cascade="all, delete-orphan", lazy="selectin")


class ForumReply(Base):
    """Replies to a forum thread."""
    __tablename__ = "forum_replies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    thread_id: Mapped[int] = mapped_column(Integer, ForeignKey("forum_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)

    thread: Mapped["ForumThread"] = relationship("ForumThread", back_populates="replies")


class Announcement(Base):
    """Platform announcements."""
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="PLATFORM")  # URGENT, PLATFORM, MILESTONE, CAMPAIGN
    color_hex: Mapped[str] = mapped_column(String(20), nullable=False, default="#3E7A8C")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)


class PostLike(Base):
    """Tracks user likes on blogs, stories, threads (one per user per item)."""
    __tablename__ = "post_likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    # Only one of these will be set
    blog_post_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=True)
    story_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("volunteer_stories.id", ondelete="CASCADE"), nullable=True)
    thread_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("forum_threads.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)

    blog_post: Mapped["BlogPost | None"] = relationship("BlogPost", foreign_keys=[blog_post_id], back_populates="likes")
    story: Mapped["VolunteerStory | None"] = relationship("VolunteerStory", foreign_keys=[story_id], back_populates="likes")
    thread: Mapped["ForumThread | None"] = relationship("ForumThread", foreign_keys=[thread_id], back_populates="likes")


# ── Blood Donation Models ─────────────────────────────────────────────────────

class BloodDonor(Base):
    """Registered blood donor."""
    __tablename__ = "blood_donors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(5), nullable=False, index=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    area: Mapped[str | None] = mapped_column(String(255), nullable=True)  # more specific location
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    total_donations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_donated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    weight_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)  # must be >= 50
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    medical_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=_utcnow, default=_utcnow)

    # Composite index: district + blood_group is the most common query pattern
    __table_args__ = (
        Index("ix_blood_donors_district_group", "district", "blood_group"),
        Index("ix_blood_donors_district_available", "district", "is_available"),
        Index("ix_blood_donors_group_available", "blood_group", "is_available"),
    )


class BloodRequest(Base):
    """Urgent blood request from a patient/family."""
    __tablename__ = "blood_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    requester_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    patient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(5), nullable=False, index=True)
    units_needed: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    hospital_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hospital_district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hospital_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    urgency: Mapped[str] = mapped_column(String(20), nullable=False, default="normal")  # normal, urgent, critical
    is_fulfilled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=_utcnow, default=_utcnow)

    # Composite index: district + blood_group + urgency for fast emergency lookups
    __table_args__ = (
        Index("ix_blood_requests_district_group", "hospital_district", "blood_group"),
        Index("ix_blood_requests_group_fulfilled", "blood_group", "is_fulfilled"),
        Index("ix_blood_requests_district_urgency", "hospital_district", "urgency"),
    )


# ── Events ────────────────────────────────────────────────────────────────────

class Event(Base):
    """Social event or campaign."""
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(String(100), nullable=False)
    time: Mapped[str] = mapped_column(String(100), nullable=False)
    datetime_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    registration_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    location: Mapped[str] = mapped_column(String(500), nullable=False)
    organizer: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    registered_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)   # comma-separated
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_cancelled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    reminder_minutes_before: Mapped[int] = mapped_column(Integer, nullable=False, default=1440)  # Default 24h
    email_confirmation_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)

    # Relationships
    registrations: Mapped[list["EventRegistration"]] = relationship(
        "EventRegistration",
        back_populates="event",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class EventRegistration(Base):
    """User registration for an event."""
    __tablename__ = "event_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="confirmed")  # confirmed, cancelled
    confirmation_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    confirmation_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)

    # Relationships
    event: Mapped["Event"] = relationship("Event", back_populates="registrations")
    user: Mapped[Optional["User"]] = relationship("User")

    __table_args__ = (
        Index("ix_event_reg_event_email", "event_id", "email"),
        Index("ix_event_reg_event_user", "event_id", "user_id"),
    )


# ── Emergency Requests ────────────────────────────────────────────────────────

class EmergencyRequest(Base):
    """User-submitted emergency help request."""
    __tablename__ = "emergency_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(500), nullable=False)
    emergency_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")  # pending, responding, resolved
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)


# ── Organizations ─────────────────────────────────────────────────────────────

class Organization(Base):
    """Verified NGO / charity / social group."""
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    initial: Mapped[str] = mapped_column(String(4), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False, default=4.5)
    review_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    volunteer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    color_hex: Mapped[str] = mapped_column(String(20), nullable=False, default="#3E7A8C")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=_utcnow)
 
      
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
