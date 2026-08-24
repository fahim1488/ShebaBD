"""
memory.py — Conversation history management layer.

Responsibilities
----------------
- Create / fetch / delete conversations from PostgreSQL.
- Append messages (user, assistant, tool) to a conversation.
- Build the OpenAI messages list for a given conversation.
- Auto-generate a human-readable title from the first user message.
- Enforce a token-budget window so old messages are gracefully trimmed.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Conversation, Message

logger = logging.getLogger(__name__)

# Maximum number of messages (excluding system prompt) sent to OpenAI.
# Older messages are trimmed from the front when this is exceeded.
MAX_CONTEXT_MESSAGES = 40


# ── Conversation CRUD ─────────────────────────────────────────────────────────

async def create_conversation(
    db: AsyncSession,
    user_id: str,
    title: str = "New conversation",
) -> Conversation:
    """Insert a new conversation row and return it."""
    conv = Conversation(user_id=user_id, title=title)
    db.add(conv)
    await db.flush()   # populate conv.id without committing
    await db.refresh(conv)
    logger.debug("Created conversation %s for user %s", conv.id, user_id)
    return conv


async def get_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: str,
) -> Optional[Conversation]:
    """
    Fetch a conversation that belongs to user_id.
    Returns None if not found or owned by a different user.
    """
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
            Conversation.is_active == True,  # noqa: E712
        )
    )
    return result.scalars().first()


async def get_or_create_conversation(
    db: AsyncSession,
    user_id: str,
    conversation_id: Optional[uuid.UUID] = None,
    first_message: Optional[str] = None,
) -> tuple[Conversation, bool]:
    """
    Return (conversation, is_new).

    If conversation_id is provided, look it up.
    Otherwise create a new one, optionally titling it from first_message.
    """
    if conversation_id:
        conv = await get_conversation(db, conversation_id, user_id)
        if conv:
            return conv, False
        # conversation_id supplied but not found / not owned — create fresh
        logger.warning(
            "conversation_id %s not found for user %s — creating new",
            conversation_id,
            user_id,
        )

    title = _generate_title(first_message) if first_message else "New conversation"
    conv = await create_conversation(db, user_id, title)
    return conv, True


async def list_conversations(
    db: AsyncSession,
    user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> tuple[List[Conversation], int]:
    """Return (conversations, total_count) for user_id, newest first."""
    # Total count
    count_result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id, Conversation.is_active == True)  # noqa: E712
    )
    all_rows = count_result.scalars().all()
    total = len(all_rows)

    # Paged results
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id, Conversation.is_active == True)  # noqa: E712
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    conversations = list(result.scalars().all())
    return conversations, total


async def soft_delete_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: str,
) -> bool:
    """
    Mark a conversation inactive (soft delete).
    Returns True if a row was updated.
    """
    result = await db.execute(
        update(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .values(is_active=False, updated_at=datetime.now(timezone.utc))
        .returning(Conversation.id)
    )
    deleted = result.scalars().first()
    return deleted is not None


async def hard_delete_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: str,
) -> bool:
    """
    Permanently delete a conversation and all its messages.
    Returns True if a row was deleted.
    """
    result = await db.execute(
        delete(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .returning(Conversation.id)
    )
    deleted = result.scalars().first()
    return deleted is not None


# ── Message CRUD ──────────────────────────────────────────────────────────────

async def add_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    role: str,
    content: Optional[str] = None,
    tool_call_id: Optional[str] = None,
    tool_name: Optional[str] = None,
    tool_args: Optional[Dict[str, Any]] = None,
    tool_result: Optional[Dict[str, Any]] = None,
    tokens: Optional[int] = None,
) -> Message:
    """Persist a single message and update conversation.updated_at."""
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_call_id=tool_call_id,
        tool_name=tool_name,
        tool_args=tool_args,
        tool_result=tool_result,
        tokens=tokens,
    )
    db.add(msg)

    # Bump the conversation timestamp so list views stay sorted correctly
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(updated_at=datetime.now(timezone.utc))
    )

    await db.flush()
    await db.refresh(msg)
    return msg


async def get_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
) -> List[Message]:
    """Return all messages for a conversation in chronological order."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())


async def delete_all_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: str,
) -> int:
    """
    Delete all messages in a conversation that belongs to user_id.
    Returns the count of deleted rows.
    """
    # Verify ownership first
    conv = await get_conversation(db, conversation_id, user_id)
    if not conv:
        return 0

    result = await db.execute(
        delete(Message)
        .where(Message.conversation_id == conversation_id)
        .returning(Message.id)
    )
    deleted_ids = result.scalars().all()
    return len(deleted_ids)


# ── OpenAI message list builder ───────────────────────────────────────────────

def build_openai_messages(
    messages: List[Message],
) -> List[Dict[str, Any]]:
    """
    Convert ORM Message rows to the list format expected by the OpenAI
    chat completions API.

    Handles three roles:
      - user / assistant  → {"role": ..., "content": ...}
      - assistant with tool_calls → {"role": "assistant", "tool_calls": [...]}
      - tool (tool result) → {"role": "tool", "tool_call_id": ..., "content": ...}

    Applies a sliding window so we never send more than MAX_CONTEXT_MESSAGES.
    """
    openai_messages: List[Dict[str, Any]] = []

    for msg in messages:
        if msg.role == "user":
            openai_messages.append({"role": "user", "content": msg.content or ""})

        elif msg.role == "assistant":
            if msg.tool_name and msg.tool_args is not None:
                # This was an assistant turn that called a tool
                import json
                openai_messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [
                        {
                            "id": msg.tool_call_id or f"call_{msg.id}",
                            "type": "function",
                            "function": {
                                "name": msg.tool_name,
                                "arguments": json.dumps(msg.tool_args),
                            },
                        }
                    ],
                })
            else:
                openai_messages.append({
                    "role": "assistant",
                    "content": msg.content or "",
                })

        elif msg.role == "tool":
            import json
            openai_messages.append({
                "role": "tool",
                "tool_call_id": msg.tool_call_id or f"call_{msg.id}",
                "content": json.dumps(msg.tool_result) if msg.tool_result else (msg.content or ""),
            })

    # Trim to window — keep the most recent MAX_CONTEXT_MESSAGES messages
    if len(openai_messages) > MAX_CONTEXT_MESSAGES:
        openai_messages = openai_messages[-MAX_CONTEXT_MESSAGES:]

    return openai_messages


# ── Helpers ───────────────────────────────────────────────────────────────────

def _generate_title(first_message: str, max_length: int = 60) -> str:
    """
    Derive a short conversation title from the first user message.
    Truncates at the last word boundary before max_length.
    """
    text = first_message.strip()
    if len(text) <= max_length:
        return text
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    return (truncated[:last_space] if last_space > 0 else truncated) + "…"
