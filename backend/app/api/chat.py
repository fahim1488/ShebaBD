"""
chat.py — All chat-related API routes.

Endpoints
---------
POST   /chat              — Single-turn non-streaming response
POST   /chat/stream       — Streaming response via SSE
POST   /chat/new          — Create a blank conversation
GET    /chat/history      — List conversations (paginated)
GET    /chat/history/{id} — Full message history for one conversation
DELETE /chat/history/{id} — Delete a conversation + all its messages
GET    /health            — Health check (DB ping + config validation)
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.schemas import (
    ChatRequest,
    ChatResponse,
    ChatStreamRequest,
    ConversationDetailSchema,
    ConversationListResponse,
    ConversationSchema,
    HealthResponse,
    MessageSchema,
    NewConversationRequest,
    NewConversationResponse,
    OKResponse,
)
from app.services.memory import (
    add_message,
    build_openai_messages,
    delete_all_messages,
    get_conversation,
    get_messages,
    get_or_create_conversation,
    hard_delete_conversation,
    list_conversations,
    create_conversation,
)
from app.services.openai_service import get_openai_service
from app.utils import get_current_user_id

logger    = logging.getLogger(__name__)
router    = APIRouter(tags=["Chat"])
settings  = get_settings()


# ── POST /chat ────────────────────────────────────────────────────────────────
@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message and receive a full response",
    status_code=status.HTTP_200_OK,
)
async def chat(
    body:    ChatRequest,
    request: Request,
    db:      AsyncSession = Depends(get_db),
    user_id: str          = Depends(get_current_user_id),
) -> ChatResponse:
    """
    Non-streaming chat endpoint.

    1. Persist the user message.
    2. Load conversation history and build the OpenAI message list.
    3. Run the agentic tool-call loop.
    4. Persist the assistant reply (and any tool metadata).
    5. Return the reply.
    """
    # ── 1. Resolve / create conversation ─────────────────────────────────────
    conv, is_new = await get_or_create_conversation(
        db,
        user_id=user_id,
        conversation_id=body.conversation_id,
        first_message=body.message,
    )

    # ── 2. Save user message ──────────────────────────────────────────────────
    await add_message(db, conv.id, role="user", content=body.message)

    # ── 3. Build OpenAI message list ──────────────────────────────────────────
    db_messages  = await get_messages(db, conv.id)
    oai_messages = build_openai_messages(db_messages)

    # ── 4. Call OpenAI (with agentic tool loop) ───────────────────────────────
    service = get_openai_service()
    try:
        reply_text, total_tokens, tool_calls_log = await service.chat(oai_messages)
    except Exception as exc:
        logger.exception("OpenAI call failed for conversation %s", conv.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {exc}",
        )

    # ── 5. Persist tool calls then assistant reply ────────────────────────────
    for tc in tool_calls_log:
        # Save the assistant's decision to call the tool
        await add_message(
            db,
            conv.id,
            role="assistant",
            content=None,
            tool_name=tc["name"],
            tool_args=json.loads(tc["args"]) if isinstance(tc["args"], str) else tc["args"],
        )
        # Save the tool result
        await add_message(
            db,
            conv.id,
            role="tool",
            content=None,
            tool_name=tc["name"],
            tool_result=tc["result"],
        )

    # Save the final assistant message
    assistant_msg = await add_message(
        db,
        conv.id,
        role="assistant",
        content=reply_text,
        tokens=total_tokens,
    )

    return ChatResponse(
        conversation_id=conv.id,
        message=MessageSchema.model_validate(assistant_msg),
        is_new_conversation=is_new,
    )


# ── POST /chat/stream ─────────────────────────────────────────────────────────
@router.post(
    "/chat/stream",
    summary="Send a message and receive a streaming SSE response",
    response_class=StreamingResponse,
)
async def chat_stream(
    body:    ChatStreamRequest,
    request: Request,
    db:      AsyncSession = Depends(get_db),
    user_id: str          = Depends(get_current_user_id),
) -> StreamingResponse:
    """
    Streaming chat endpoint (Server-Sent Events).

    SSE event format:
      data: {"type": "token",  "content": "..."}
      data: {"type": "tool",   "name": "...", "status": "calling|done"}
      data: {"type": "meta",   "conversation_id": "..."}
      data: {"type": "error",  "message": "..."}
      data: {"type": "done",   "tokens": 123}
      data: [DONE]
    """
    # ── Resolve conversation ──────────────────────────────────────────────────
    conv, is_new = await get_or_create_conversation(
        db,
        user_id=user_id,
        conversation_id=body.conversation_id,
        first_message=body.message,
    )

    # ── Save user message ─────────────────────────────────────────────────────
    await add_message(db, conv.id, role="user", content=body.message)
    await db.commit()  # commit early so the message is visible immediately

    # ── Build message list ────────────────────────────────────────────────────
    db_messages  = await get_messages(db, conv.id)
    oai_messages = build_openai_messages(db_messages)

    service = get_openai_service()

    # ── Stream generator wrapper ──────────────────────────────────────────────
    async def event_generator():
        # Send conversation_id as first event so the client can link the stream
        yield f"data: {json.dumps({'type': 'meta', 'conversation_id': str(conv.id), 'is_new': is_new})}\n\n"

        full_response = ""
        total_tokens  = 0

        async for sse_line in service.stream_chat(oai_messages):
            yield sse_line

            # Track content so we can persist after stream ends
            if sse_line.startswith("data: ") and not sse_line.startswith("data: [DONE]"):
                try:
                    payload = json.loads(sse_line[6:])
                    if payload.get("type") == "token":
                        full_response += payload.get("content", "")
                    if payload.get("type") == "done":
                        total_tokens = payload.get("tokens", 0)
                except (json.JSONDecodeError, KeyError):
                    pass

        # Persist the assembled assistant reply after streaming finishes
        try:
            async with db.begin_nested():
                await add_message(
                    db,
                    conv.id,
                    role="assistant",
                    content=full_response,
                    tokens=total_tokens,
                )
            await db.commit()
        except Exception:
            logger.exception("Failed to persist streamed reply for conversation %s", conv.id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "X-Accel-Buffering": "no",          # disable nginx buffering
            "Connection":        "keep-alive",
        },
    )


# ── POST /chat/new ────────────────────────────────────────────────────────────
@router.post(
    "/chat/new",
    response_model=NewConversationResponse,
    summary="Create a new blank conversation",
    status_code=status.HTTP_201_CREATED,
)
async def new_conversation(
    body:    NewConversationRequest = NewConversationRequest(),
    db:      AsyncSession           = Depends(get_db),
    user_id: str                    = Depends(get_current_user_id),
) -> NewConversationResponse:
    conv = await create_conversation(db, user_id=user_id, title=body.title)
    return NewConversationResponse(
        conversation_id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
    )


# ── GET /chat/history ─────────────────────────────────────────────────────────
@router.get(
    "/chat/history",
    response_model=ConversationListResponse,
    summary="List all conversations for the current user",
)
async def list_history(
    limit:   int           = Query(default=20, ge=1, le=100),
    offset:  int           = Query(default=0,  ge=0),
    db:      AsyncSession  = Depends(get_db),
    user_id: str           = Depends(get_current_user_id),
) -> ConversationListResponse:
    conversations, total = await list_conversations(db, user_id, limit=limit, offset=offset)
    return ConversationListResponse(
        conversations=[ConversationSchema.model_validate(c) for c in conversations],
        total=total,
    )


# ── GET /chat/history/{conversation_id} ──────────────────────────────────────
@router.get(
    "/chat/history/{conversation_id}",
    response_model=ConversationDetailSchema,
    summary="Get full message history for a conversation",
)
async def get_history(
    conversation_id: uuid.UUID,
    db:      AsyncSession = Depends(get_db),
    user_id: str          = Depends(get_current_user_id),
) -> ConversationDetailSchema:
    conv = await get_conversation(db, conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    messages = await get_messages(db, conv.id)
    return ConversationDetailSchema(
        id=conv.id,
        title=conv.title,
        is_active=conv.is_active,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[MessageSchema.model_validate(m) for m in messages],
    )


# ── DELETE /chat/history/{conversation_id} ────────────────────────────────────
@router.delete(
    "/chat/history/{conversation_id}",
    response_model=OKResponse,
    summary="Delete a conversation and all its messages",
)
async def delete_history(
    conversation_id: uuid.UUID,
    hard:    bool         = Query(default=False, description="Permanently delete (default: soft delete)"),
    db:      AsyncSession = Depends(get_db),
    user_id: str          = Depends(get_current_user_id),
) -> OKResponse:
    if hard:
        deleted = await hard_delete_conversation(db, conversation_id, user_id)
    else:
        from app.services.memory import soft_delete_conversation
        deleted = await soft_delete_conversation(db, conversation_id, user_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    return OKResponse(message="Conversation deleted successfully.")


# ── GET /health ───────────────────────────────────────────────────────────────
@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check — DB ping and config validation",
    tags=["System"],
)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    # Ping the database
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Database health check failed")
        db_status = "disconnected"

    # Check OpenAI key is configured
    oai_status = "configured" if settings.openai_api_key else "missing_key"

    overall = "ok" if db_status == "connected" and oai_status == "configured" else "degraded"

    return HealthResponse(
        status=overall,
        version=settings.app_version,
        environment=settings.app_env,
        database=db_status,
        openai=oai_status,
    )
/* Fahim: AI chat enhancements */ 
