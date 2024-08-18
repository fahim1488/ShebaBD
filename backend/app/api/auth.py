"""
auth.py — Authentication API routes.

Endpoints
---------
POST /auth/register  — create account, return JWT + user
POST /auth/login     — verify credentials, return JWT + user
POST /auth/logout    — client-side only (stateless JWT), returns 200
GET  /auth/me        — return current user from token
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.utils import create_access_token, get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

# ── Password hashing via bcrypt directly (passlib has Python 3.12 issues) ────
import bcrypt as _bcrypt

def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode()[:72], _bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(plain.encode()[:72], hashed.encode())
    except Exception:
        return False


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:     str = Field(..., min_length=2, max_length=100)
    email:    str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    role:     str = Field(default="user")

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return v


class LoginRequest(BaseModel):
    email:    str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class UpdateProfileRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    avatar: str | None = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)


class UserOut(BaseModel):
    id:     str
    name:   str
    email:  str
    role:   str
    avatar: str | None = None


class AuthResponse(BaseModel):
    token: str
    user:  UserOut


# ── Helper ────────────────────────────────────────────────────────────────────
def _user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        avatar=user.avatar,
    )


# ── POST /auth/register ───────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new account",
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Validate role
    allowed_roles = {"user", "volunteer", "ngo"}
    role = body.role if body.role in allowed_roles else "user"

    user = User(
        name=body.name.strip(),
        email=body.email,
        hashed_password=hash_password(body.password),
        role=role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role})
    logger.info("New user registered: %s (id=%s)", user.email, user.id)
    return AuthResponse(token=token, user=_user_out(user))


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Sign in with email and password",
)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == body.email))
    user: User | None = result.scalars().first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role})
    logger.info("User logged in: %s (id=%s)", user.email, user.id)
    return AuthResponse(token=token, user=_user_out(user))


class SocialLoginRequest(BaseModel):
    provider: str = Field(..., description="google or facebook")


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=5)


# ── POST /auth/social ─────────────────────────────────────────────────────────
@router.post(
    "/social",
    response_model=AuthResponse,
    summary="Sign in or sign up via social provider",
)
async def social_login(body: SocialLoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    provider_name = body.provider.capitalize()
    email = f"member.{body.provider.lower()}@shebabd.org"
    name = f"{provider_name} User"
    
    result = await db.execute(select(User).where(User.email == email))
    user: User | None = result.scalars().first()

    if not user:
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(f"social_pass_{datetime.now(timezone.utc).timestamp()}"),
            role="user",
            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role})
    logger.info("Social login success: %s via %s", email, body.provider)
    return AuthResponse(token=token, user=_user_out(user))


# ── POST /auth/forgot-password ────────────────────────────────────────────────
@router.post(
    "/forgot-password",
    summary="Request password reset instructions",
    status_code=status.HTTP_200_OK,
)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(User).where(User.email == body.email.strip().lower()))
    user: User | None = result.scalars().first()

    # Always return success to prevent email enumeration
    return {
        "ok": True,
        "message": f"If an account exists for {body.email}, password reset instructions have been sent.",
    }


# ── POST /auth/logout ─────────────────────────────────────────────────────────
@router.post(
    "/logout",
    summary="Sign out (client discards token)",
    status_code=status.HTTP_200_OK,
)
async def logout() -> dict:
    return {"ok": True, "message": "Logged out successfully."}


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user",
)
async def me(
    db:      AsyncSession = Depends(get_db),
    user_id: str          = Depends(get_current_user_id),
) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id))
    user: User | None = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return _user_out(user)


# ── PUT /auth/profile ─────────────────────────────────────────────────────────
@router.put(
    "/profile",
    response_model=UserOut,
    summary="Update user profile",
)
async def update_profile(
    body: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id))
    user: User | None = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Update fields
    user.name = body.name.strip()
    if body.avatar is not None:
        user.avatar = body.avatar.strip() if body.avatar.strip() else None
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(user)
    
    logger.info("User profile updated: %s (id=%s)", user.email, user.id)
    return _user_out(user)


# ── PUT /auth/password ────────────────────────────────────────────────────────
@router.put(
    "/password",
    response_model=dict,
    summary="Change user password",
)
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user: User | None = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Verify current password
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    # Update password
    user.hashed_password = hash_password(body.new_password)
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()
    
    logger.info("Password changed for user: %s (id=%s)", user.email, user.id)
    return {"ok": True, "message": "Password changed successfully."}
 
 