"""
schemas.py — Pydantic v2 request/response schemas.

Keeps API contracts strict and auto-generates OpenAPI docs.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, field_validator


# ── Shared ────────────────────────────────────────────────────────────────────
class OKResponse(BaseModel):
    ok: bool = True
    message: str = "Success"


# ── Auth (JWT payload) ────────────────────────────────────────────────────────
class TokenPayload(BaseModel):
    sub: str                       # user_id
    exp: Optional[int] = None


# ── Chat request / response ───────────────────────────────────────────────────
class ChatRequest(BaseModel):
    """Body sent by the frontend for a non-streaming chat turn."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's message.",
    )
    conversation_id: Optional[uuid.UUID] = Field(
        default=None,
        description="Existing conversation to continue. Omit to start a new one.",
    )

    @field_validator("message")
    @classmethod
    def _strip_message(cls, v: str) -> str:
        return v.strip()


class ChatStreamRequest(ChatRequest):
    """Same as ChatRequest — streaming is handled at the route level."""
    pass


class MessageSchema(BaseModel):
    """A single message as returned in history responses."""

    model_config = {"from_attributes": True}

    id: int
    role: str
    content: Optional[str]
    tool_name: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    tool_result: Optional[Dict[str, Any]] = None
    tokens: Optional[int] = None
    created_at: datetime


class ConversationSchema(BaseModel):
    """Conversation header (without messages) for list views."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ConversationDetailSchema(ConversationSchema):
    """Conversation with its full message list."""

    messages: List[MessageSchema] = []


class ChatResponse(BaseModel):
    """Response for a non-streaming chat call."""

    conversation_id: uuid.UUID
    message: MessageSchema
    is_new_conversation: bool = False


# ── New conversation ──────────────────────────────────────────────────────────
class NewConversationRequest(BaseModel):
    title: str = Field(default="New conversation", max_length=255)


class NewConversationResponse(BaseModel):
    conversation_id: uuid.UUID
    title: str
    created_at: datetime


# ── History ───────────────────────────────────────────────────────────────────
class HistoryResponse(BaseModel):
    conversation_id: uuid.UUID
    title: str
    messages: List[MessageSchema]
    total: int


class ConversationListResponse(BaseModel):
    conversations: List[ConversationSchema]
    total: int


# ── Tool results (internal, used by tools.py) ─────────────────────────────────
class VolunteerEvent(BaseModel):
    id: str
    title: str
    date: str
    location: str
    category: str
    spots_available: int


class BloodRequest(BaseModel):
    id: str
    blood_group: str
    hospital: str
    location: str
    urgency: Literal["low", "medium", "high", "critical"]
    contact: str
    posted_at: str


class EmergencyContact(BaseModel):
    name: str
    phone: str
    category: str
    available_24h: bool


class FAQItem(BaseModel):
    question: str
    answer: str
    category: str


class Organization(BaseModel):
    id: str
    name: str
    type: str
    focus_area: str
    location: str
    verified: bool
    contact_email: Optional[str] = None
    website: Optional[str] = None


# ── Health check ──────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "error"] = "ok"
    version: str
    environment: str
    database: Literal["connected", "disconnected"] = "connected"
    openai: Literal["configured", "missing_key"] = "configured"
    # Enhanced fields
    uptime_seconds: Optional[float] = None
    database_latency_ms: Optional[float] = None
    active_conversations: Optional[int] = None
    checks: Optional[Dict[str, str]] = None

# ── User schemas ──────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserResponse(UserBase):
    model_config = {"from_attributes": True}
    
    id: str
    role: str
    avatar: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ── Auth schemas ──────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── Donation schemas ──────────────────────────────────────────────────────────
from decimal import Decimal
from app.models import DonationStatus, PaymentProvider, TransactionStatus, DonationCause


class DonationCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Donation amount in BDT")
    cause: DonationCause
    donor_name: str = Field(..., min_length=1, max_length=255)
    donor_email: str
    donor_phone: Optional[str] = Field(None, max_length=20)
    message: Optional[str] = Field(None, max_length=1000)
    payment_provider: PaymentProvider
    is_anonymous: Optional[bool] = False


class DonationUpdate(BaseModel):
    status: Optional[DonationStatus] = None
    error_message: Optional[str] = None


class DonationResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    user_id: str
    amount: Decimal
    currency: str
    cause: DonationCause
    donor_name: str
    donor_email: str
    donor_phone: Optional[str]
    message: Optional[str]
    payment_provider: PaymentProvider
    status: DonationStatus
    receipt_number: Optional[str]
    is_anonymous: bool
    extra_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


# ── Payment Method schemas ────────────────────────────────────────────────────
class PaymentMethodResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: int
    provider: PaymentProvider
    name: str
    display_name: str
    description: Optional[str]
    is_active: bool
    min_amount: Decimal
    max_amount: Decimal
    config: Optional[Dict[str, Any]]


# ── Transaction schemas ───────────────────────────────────────────────────────
class TransactionResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    donation_id: str
    amount: Decimal
    currency: str
    provider: PaymentProvider
    provider_transaction_id: Optional[str]
    provider_reference: Optional[str]
    status: TransactionStatus
    provider_response: Optional[Dict[str, Any]]
    error_message: Optional[str]
    initiated_at: datetime
    completed_at: Optional[datetime]
    created_at: datetime


# ── Payment Integration schemas ───────────────────────────────────────────────
class PaymentInitiateRequest(BaseModel):
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None


class PaymentInitiateResponse(BaseModel):
    donation_id: str
    transaction_id: str
    provider: PaymentProvider
    provider_transaction_id: str
    payment_url: Optional[str] = None
    provider_response: Dict[str, Any]
    amount: float
    currency: str
    expires_at: float  # Unix timestamp


# ── Analytics schemas (for future admin features) ─────────────────────────────
class DonationStats(BaseModel):
    total_donations: int
    total_amount: Decimal
    total_by_cause: Dict[str, Decimal]
    total_by_provider: Dict[str, Decimal]
    recent_donations: List[DonationResponse]


class CauseStats(BaseModel):
    cause: DonationCause
    total_amount: Decimal
    total_donations: int
    goal_amount: Optional[Decimal] = None
    progress_percentage: Optional[float] = None


# ── Community schemas ─────────────────────────────────────────────────────────

class BlogPostResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    title: str
    excerpt: str
    content: str
    category: str
    author_name: str
    author_role: str
    image_initials: str
    color_hex: str
    read_time: str
    likes_count: int
    is_published: bool
    created_at: datetime


class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    excerpt: str = Field(..., min_length=10, max_length=500)
    content: str = Field(..., min_length=20)
    category: str = Field(..., min_length=2, max_length=100)
    read_time: Optional[str] = "5 min read"


class VolunteerStoryResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    role: str
    avatar_initials: str
    color_hex: str
    story: str
    cause: str
    blood_donations: int
    volunteer_hours: int
    likes_count: int
    is_approved: bool
    created_at: datetime


class VolunteerStoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(..., min_length=2, max_length=255)
    story: str = Field(..., min_length=20)
    cause: str = Field(..., min_length=2, max_length=100)
    blood_donations: Optional[int] = 0
    volunteer_hours: Optional[int] = 0


class ForumReplyResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    thread_id: int
    body: str
    author_name: str
    likes_count: int
    created_at: datetime


class ForumThreadResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    title: str
    body: str
    category: str
    author_name: str
    color_hex: str
    is_pinned: bool
    is_locked: bool
    likes_count: int
    replies_count: int
    created_at: datetime
    updated_at: datetime
    replies: List[ForumReplyResponse] = []


class ForumThreadCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    body: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=100)


class ForumReplyCreate(BaseModel):
    body: str = Field(..., min_length=2)


class AnnouncementResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    title: str
    body: str
    type: str
    color_hex: str
    is_active: bool
    created_at: datetime


class CommunityStatsResponse(BaseModel):
    blog_count: int
    story_count: int
    forum_post_count: int
    member_count: int


class LikeResponse(BaseModel):
    liked: bool
    likes_count: int


# ── Blood Donation schemas ─────────────────────────────────────────────────────

class BloodDonorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    blood_group: str = Field(..., pattern="^(A|B|AB|O)[+-]$")
    district: str = Field(..., min_length=2, max_length=100)
    area: Optional[str] = Field(None, max_length=255)
    age: Optional[int] = Field(None, ge=18, le=65)
    weight_kg: Optional[int] = Field(None, ge=50)


class BloodDonorUpdate(BaseModel):
    is_available: Optional[bool] = None
    area: Optional[str] = None
    last_donated_at: Optional[datetime] = None


class BloodDonorResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    phone: str
    blood_group: str
    district: str
    area: Optional[str]
    is_available: bool
    total_donations: int
    last_donated_at: Optional[datetime]
    is_verified: bool
    age: Optional[int]
    weight_kg: Optional[int]
    created_at: datetime


class BloodRequestCreate(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=255)
    contact_name: str = Field(..., min_length=2, max_length=255)
    contact_phone: str = Field(..., min_length=10, max_length=20)
    blood_group: str = Field(..., pattern="^(A|B|AB|O)[+-]$")
    units_needed: int = Field(1, ge=1, le=10)
    hospital_name: str = Field(..., min_length=2, max_length=255)
    hospital_district: str = Field(..., min_length=2, max_length=100)
    hospital_address: Optional[str] = None
    urgency: str = Field("normal", pattern="^(normal|urgent|critical)$")
    notes: Optional[str] = None


class BloodRequestResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    patient_name: str
    contact_name: str
    contact_phone: str
    blood_group: str
    units_needed: int
    hospital_name: str
    hospital_district: str
    hospital_address: Optional[str]
    urgency: str
    is_fulfilled: bool
    notes: Optional[str]
    created_at: datetime


class BloodStatsResponse(BaseModel):
    total_donors: int
    available_donors: int
    total_requests: int
    active_requests: int
    donors_by_group: Dict[str, int]


# ── Event schemas ─────────────────────────────────────────────────────────────

class EventResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    title: str
    category: str
    description: str
    date: str
    time: str
    datetime_start: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location: str
    organizer: str
    capacity: int
    registered_count: int
    tags: Optional[str] = None
    is_featured: bool
    is_active: bool
    is_cancelled: bool = False
    reminder_minutes_before: int = 1440
    email_confirmation_enabled: bool = True
    reminder_enabled: bool = True
    created_at: datetime
    is_registered: Optional[bool] = False
    user_registration_id: Optional[Union[int, str]] = None


class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    category: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10)
    date: str = Field(..., min_length=2, max_length=100)
    time: str = Field(..., min_length=2, max_length=100)
    datetime_start: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location: str = Field(..., min_length=3, max_length=500)
    organizer: str = Field(..., min_length=2, max_length=255)
    capacity: int = Field(100, ge=1, le=100000)
    tags: Optional[str] = None
    is_featured: bool = False
    reminder_minutes_before: int = Field(1440, ge=1)
    email_confirmation_enabled: bool = True
    reminder_enabled: bool = True


class EventUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=500)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, min_length=10)
    date: Optional[str] = None
    time: Optional[str] = None
    datetime_start: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location: Optional[str] = None
    organizer: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=100000)
    tags: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    is_cancelled: Optional[bool] = None
    reminder_minutes_before: Optional[int] = Field(None, ge=1)
    email_confirmation_enabled: Optional[bool] = None
    reminder_enabled: Optional[bool] = None


class EventRegistrationCreate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class EventRegistrationResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: Union[int, str]
    event_id: int
    user_id: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    status: str
    confirmation_sent: bool
    confirmation_sent_at: Optional[datetime] = None
    reminder_sent: bool
    reminder_sent_at: Optional[datetime] = None
    created_at: datetime


class EventRegistrationAdminResponse(EventRegistrationResponse):
    event_title: Optional[str] = None


# ── Emergency schemas ─────────────────────────────────────────────────────────

class EmergencyRequestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    location: str = Field(..., min_length=3, max_length=500)
    emergency_type: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=10)


class EmergencyRequestResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    phone: str
    location: str
    emergency_type: str
    description: str
    priority: str
    status: str
    created_at: datetime


# ── Organization schemas ──────────────────────────────────────────────────────

class OrganizationResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    initial: str
    category: str
    district: str
    description: str
    phone: Optional[str]
    website: Optional[str]
    rating: float
    review_count: int
    volunteer_count: int
    color_hex: str
    is_verified: bool
    created_at: datetime
# Murad: Schema validators
      
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
