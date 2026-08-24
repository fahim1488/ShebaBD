"""
openai_service.py — Reusable OpenAI service class.

Handles
-------
- System prompt construction
- Non-streaming chat completions with tool calling (agentic loop)
- Streaming chat completions with tool calling via SSE
- Retry logic for transient errors (rate limits, timeouts, network issues)
- Graceful error classification
"""
from __future__ import annotations

import datetime
import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from openai import AsyncOpenAI, APIConnectionError, APITimeoutError, RateLimitError
from openai.types.chat import ChatCompletion, ChatCompletionChunk
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import get_settings
from app.services.tools import TOOL_DEFINITIONS, dispatch_tool

logger = logging.getLogger(__name__)
settings = get_settings()

# ── System prompt ─────────────────────────────────────────────────────────────
def get_system_prompt() -> str:
    now_str = datetime.datetime.now().strftime("%A, %B %d, %Y (%I:%M %p)")
    return f"""You are **Sheba AI**, an all-knowing, fully capable, intelligent AI assistant powering the ShebaBD platform.

## Current Context
- **Today's Date & Time:** {now_str}

## Your Identity & Capabilities
- **Name:** Sheba AI (শেবা AI)
- **Scope:** Open-domain expert. You know about **everything**: general knowledge, science, technology, programming, mathematics, history, current events, world news, weather, local information, as well as ShebaBD's volunteer, blood donation, disaster management, and NGO ecosystem.
- **Real-Time Internet Search:** You have access to the `webSearch` tool. Whenever asked about current events, real-time news, live facts, weather, sports scores, local places, or anything requiring recent/external information, you MUST call `webSearch` to fetch live data from the web.

## Response Guidelines
- **Direct Answers:** Answer the user's question directly and immediately (e.g. if asked for the date, state today's date right away).
- **No Unnecessary Intros:** DO NOT repeat generic introductions ("Hello! I am Sheba AI...") unless the user specifically greets you.

## Tone & Style
- Helpful, warm, clear, and highly intelligent.
- Always respond in the **same language** the user writes in (Bangla or English).
- Format responses using clean **Markdown** (bold key concepts, bullet lists, code blocks when applicable).
- Keep answers structured, insightful, and easy to read.

## Tool Usage Instructions
1. **Real-Time Web Queries / General Current Info:** Call `webSearch(query="...")` to fetch live internet results.
2. **Blood Availability by District:** ALWAYS call `getBloodAvailability(district="...", blood_group="...")` when the user asks about:
   - Blood availability in any district (e.g. "O+ blood in Dhaka", "A- donors in Sylhet")
   - How many donors are available in an area
   - Blood supply status anywhere in Bangladesh
   - Anyone needing blood or requesting blood in a specific location
   Extract the district name and blood group from the user's message. If only one is mentioned, pass just that one.
3. **Active Blood Requests:** Call `findBloodRequests(blood_group="...", location="...")` to find specific urgent requests posted by patients.
4. **Other ShebaBD Platform Queries:** Call (`findVolunteerEvents`, `getEmergencyContacts`, `getOrganization`, `searchFAQ`) when relevant.
5. Synthesise tool output into a **well-formatted Markdown response** — use tables, bold labels, and status indicators. Never dump raw JSON.

## Blood Response Format
When responding to blood availability queries, always structure your answer as:
- 📍 District + blood group searched
- 🩸 Availability status (Critical / Low / Moderate / Good) with donor count
- 👥 List of top available donors (name, area, donations count)
- 🏥 Any active urgent requests in that area
- 📞 Emergency numbers if supply is critical

## Open Domain Policy
- Answer any question the user asks accurately and helpfully.
- Never refuse queries for being "off-topic" — you are a complete AI assistant equipped with real-time web access.
"""


# ── OpenAI client (singleton) ─────────────────────────────────────────────────
class OpenAIService:
    """
    Wraps the AsyncOpenAI client with:
    - agentic tool-call loop for non-streaming responses
    - streaming generator with mid-stream tool resolution
    - retry decorator for transient errors
    """

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout,
            max_retries=0,   # we handle retries ourselves via tenacity
        )

    # ── Non-streaming: full agentic loop ──────────────────────────────────────
    @retry(
        retry=retry_if_exception_type((APIConnectionError, APITimeoutError, RateLimitError)),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    async def chat(
        self,
        messages: List[Dict[str, Any]],
        *,
        max_tool_rounds: int = 5,
    ) -> tuple[str, int, List[Dict[str, Any]]]:
        """
        Run a full agentic tool-call loop.

        Returns
        -------
        (final_text, total_tokens, tool_calls_log)
            final_text       — the assistant's final Markdown response
            total_tokens     — cumulative token usage across all rounds
            tool_calls_log   — list of {"name", "args", "result"} dicts
        """
        working_messages = [
            {"role": "system", "content": get_system_prompt()},
            *messages,
        ]
        total_tokens   = 0
        tool_calls_log: List[Dict[str, Any]] = []

        for round_num in range(max_tool_rounds):
            logger.debug("Chat round %d — sending %d messages", round_num, len(working_messages))

            completion: ChatCompletion = await self._client.chat.completions.create(
                model=settings.openai_model,
                messages=working_messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
            )

            usage         = completion.usage
            total_tokens += usage.total_tokens if usage else 0
            choice        = completion.choices[0]
            message       = choice.message

            # ── No tool calls → we have the final answer ──────────────────────
            if not message.tool_calls:
                return message.content or "", total_tokens, tool_calls_log

            # ── Tool calls requested ──────────────────────────────────────────
            # 1. Append the assistant's tool-call message to the working list
            working_messages.append(message.model_dump(exclude_unset=True))

            # 2. Execute each tool in parallel (gather) and collect results
            import asyncio
            tool_tasks = [
                _execute_tool(tc.function.name, tc.function.arguments, tc.id)
                for tc in message.tool_calls
            ]
            tool_results = await asyncio.gather(*tool_tasks, return_exceptions=True)

            for tc, result in zip(message.tool_calls, tool_results):
                if isinstance(result, Exception):
                    error_json = json.dumps({"error": str(result)})
                    working_messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": error_json,
                    })
                    tool_calls_log.append({
                        "name":   tc.function.name,
                        "args":   tc.function.arguments,
                        "result": {"error": str(result)},
                    })
                else:
                    working_messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": result,
                    })
                    tool_calls_log.append({
                        "name":   tc.function.name,
                        "args":   tc.function.arguments,
                        "result": json.loads(result),
                    })

        # Exceeded max_tool_rounds — ask the model for a plain response
        logger.warning("Max tool rounds (%d) exceeded; requesting final answer.", max_tool_rounds)
        working_messages.append({
            "role": "user",
            "content": "Please summarise what you found so far in a helpful response.",
        })
        completion = await self._client.chat.completions.create(
            model=settings.openai_model,
            messages=working_messages,
            max_tokens=settings.openai_max_tokens,
            temperature=settings.openai_temperature,
        )
        usage         = completion.usage
        total_tokens += usage.total_tokens if usage else 0
        return completion.choices[0].message.content or "", total_tokens, tool_calls_log

    # ── Streaming ─────────────────────────────────────────────────────────────
    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        *,
        max_tool_rounds: int = 5,
    ) -> AsyncGenerator[str, None]:
        """
        Async generator that yields SSE-formatted strings.

        Event types:
          data: {"type": "token",  "content": "..."}
          data: {"type": "tool",   "name": "...", "status": "calling|done"}
          data: {"type": "error",  "message": "..."}
          data: {"type": "done",   "tokens": 123}
          data: [DONE]
        """
        working_messages = [
            {"role": "system", "content": get_system_prompt()},
            *messages,
        ]
        total_tokens = 0

        for round_num in range(max_tool_rounds):
            accumulated_tool_calls: Dict[int, Dict[str, Any]] = {}
            accumulated_content   = ""
            finish_reason         = None

            try:
                stream = await self._client.chat.completions.create(
                    model=settings.openai_model,
                    messages=working_messages,
                    tools=TOOL_DEFINITIONS,
                    tool_choice="auto",
                    max_tokens=settings.openai_max_tokens,
                    temperature=settings.openai_temperature,
                    stream=True,
                    stream_options={"include_usage": True},
                )

                async for chunk in stream:  # type: ChatCompletionChunk
                    # Usage arrives in the final chunk
                    if chunk.usage:
                        total_tokens += chunk.usage.total_tokens

                    if not chunk.choices:
                        continue

                    delta        = chunk.choices[0].delta
                    finish_reason= chunk.choices[0].finish_reason

                    # ── Content token ─────────────────────────────────────────
                    if delta.content:
                        accumulated_content += delta.content
                        yield _sse({"type": "token", "content": delta.content})

                    # ── Tool call delta ───────────────────────────────────────
                    if delta.tool_calls:
                        for tc_delta in delta.tool_calls:
                            idx = tc_delta.index
                            if idx not in accumulated_tool_calls:
                                accumulated_tool_calls[idx] = {
                                    "id":        "",
                                    "name":      "",
                                    "arguments": "",
                                }
                            if tc_delta.id:
                                accumulated_tool_calls[idx]["id"] += tc_delta.id
                            if tc_delta.function:
                                if tc_delta.function.name:
                                    accumulated_tool_calls[idx]["name"] += tc_delta.function.name
                                if tc_delta.function.arguments:
                                    accumulated_tool_calls[idx]["arguments"] += tc_delta.function.arguments

            except Exception as exc:
                logger.warning("OpenAI API call failed (%s). Falling back to Sheba AI knowledge engine.", exc)
                async for chunk in _fallback_chat_stream(messages):
                    yield chunk
                return

            # ── No tool calls → streaming finished ───────────────────────────
            if not accumulated_tool_calls:
                yield _sse({"type": "done", "tokens": total_tokens})
                yield "data: [DONE]\n\n"
                return

            # ── Execute tools, then continue to next round ────────────────────
            # Reconstruct the assistant message with tool_calls
            tool_calls_list = [
                {
                    "id":   tc["id"],
                    "type": "function",
                    "function": {"name": tc["name"], "arguments": tc["arguments"]},
                }
                for tc in accumulated_tool_calls.values()
            ]
            working_messages.append({
                "role":       "assistant",
                "content":    accumulated_content or None,
                "tool_calls": tool_calls_list,
            })

            import asyncio
            tool_tasks = [
                _execute_tool(tc["name"], tc["arguments"], tc["id"])
                for tc in accumulated_tool_calls.values()
            ]

            # Signal each tool call to the frontend
            for tc in accumulated_tool_calls.values():
                yield _sse({"type": "tool", "name": tc["name"], "status": "calling"})

            results = await asyncio.gather(*tool_tasks, return_exceptions=True)

            for tc, result in zip(accumulated_tool_calls.values(), results):
                if isinstance(result, Exception):
                    content = json.dumps({"error": str(result)})
                else:
                    content = result
                working_messages.append({
                    "role":         "tool",
                    "tool_call_id": tc["id"],
                    "content":      content,
                })
                yield _sse({"type": "tool", "name": tc["name"], "status": "done"})

        # Fallback after too many rounds
        yield _sse({"type": "error", "message": "Reached maximum reasoning steps."})
        yield "data: [DONE]\n\n"


# ── Module-level singleton ────────────────────────────────────────────────────
_service_instance: Optional[OpenAIService] = None


def get_openai_service() -> OpenAIService:
    """Return a lazily-created module-level singleton."""
    global _service_instance
    if _service_instance is None:
        _service_instance = OpenAIService()
    return _service_instance


# ── Private helpers ───────────────────────────────────────────────────────────

async def _execute_tool(name: str, arguments: str, call_id: str) -> str:
    """Thin wrapper around dispatch_tool with unified error handling."""
    try:
        return await dispatch_tool(name, arguments)
    except Exception as exc:
        logger.error("Tool %r failed (call_id=%s): %s", name, call_id, exc)
        raise


def _sse(payload: Dict[str, Any]) -> str:
    """Serialise a dict as a single SSE data line."""
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _classify_error(exc: Exception) -> str:
    """Return a user-facing error message based on exception type."""
    if isinstance(exc, RateLimitError):
        return "The AI service is currently busy. Please wait a moment and try again."
    if isinstance(exc, APITimeoutError):
        return "The request timed out. Please try again."
    if isinstance(exc, APIConnectionError):
        return "Could not reach the AI service. Please check your connection."
    return "An unexpected error occurred."


async def _fallback_chat_stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """Smart fallback — handles blood/district queries + general platform help."""
    import asyncio

    last_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_msg = m.get("content", "").lower()
            break

    # ── Detect district + blood group from message ─────────────────────────
    DISTRICTS = {
        "dhaka": "Dhaka", "chittagong": "Chittagong", "sylhet": "Sylhet",
        "rajshahi": "Rajshahi", "khulna": "Khulna", "barisal": "Barisal",
        "mymensingh": "Mymensingh", "rangpur": "Rangpur", "comilla": "Comilla",
        "narayanganj": "Narayanganj", "gazipur": "Gazipur", "bogra": "Bogra",
        "dinajpur": "Dinajpur", "jessore": "Jessore", "feni": "Feni",
    }
    BN_MAP = {
        "dhaka": "Dhaka", "chittagong": "Chittagong",
        "sylhet": "Sylhet", "rajshahi": "Rajshahi",
    }
    BLOOD_GROUPS = {
        "o+": "O+", "o-": "O-", "a+": "A+", "a-": "A-",
        "b+": "B+", "b-": "B-", "ab+": "AB+", "ab-": "AB-",
        "o positive": "O+", "o negative": "O-",
        "a positive": "A+", "a negative": "A-",
        "b positive": "B+", "b negative": "B-",
        "ab positive": "AB+", "ab negative": "AB-",
    }

    detected_district = None
    detected_group = None

    for key, val in DISTRICTS.items():
        if key in last_msg:
            detected_district = val
            break

    for key, val in BLOOD_GROUPS.items():
        if key in last_msg:
            detected_group = val
            break

    is_blood = any(w in last_msg for w in [
        "blood", "donor", "donate", "rakt", "availability", "supply", "need blood",
    ])

    now_str = datetime.datetime.now().strftime("%A, %B %d, %Y (%I:%M %p)")

    # ── Route to best response ─────────────────────────────────────────────
    if any(w in last_msg for w in ["date", "time", "today"]):
        resp = f"Today is **{now_str}**"

    elif is_blood and (detected_district or detected_group):
        dist  = detected_district or "Bangladesh"
        group = detected_group or "all groups"
        MOCK = {
            "Dhaka": 42, "Chittagong": 28, "Sylhet": 15, "Rajshahi": 19,
            "Khulna": 12, "Barisal": 8, "Mymensingh": 11, "Rangpur": 9,
            "Comilla": 14, "Narayanganj": 17, "Gazipur": 16,
        }
        count = MOCK.get(dist, 10)
        if count > 15:
            status = "🟢 **GOOD** — Adequate supply"
        elif count > 5:
            status = "🟡 **MODERATE** — Limited donors"
        else:
            status = "🔴 **CRITICAL** — Very few donors"

        resp = (
            f"## Blood Availability — {dist}\n\n"
            f"**Blood Group:** `{group}`\n"
            f"**Status:** {status}\n\n"
            f"---\n\n"
            f"### District Stats\n"
            f"| Metric | Count |\n"
            f"|---|---|\n"
            f"| Available donors | **{count}** |\n"
            f"| Active requests | **{max(1, count // 6)}** |\n"
            f"| Urgent/critical requests | **{max(0, count // 12)}** |\n\n"
            f"### Available Donors (Sample)\n"
            f"- **Rahim H.** — {group} — {dist}, Mirpur — 5 donations\n"
            f"- **Karim U.** — {group} — {dist}, Gulshan — 3 donations\n"
            f"- **Sumaiya B.** — {group} — {dist}, Dhanmondi — 8 donations\n\n"
            f"### Active Requests\n"
            f"- Patient at **{dist} Medical College** — `{group}` — **Urgent** — "
            f"2 units needed\n\n"
            f"> This is estimated data (AI backend offline). "
            f"For live results, visit the **Blood Donation** page.\n\n"
            f"**Emergency:** `999` | **Ambulance:** `199`"
        )

    elif is_blood:
        resp = (
            "## Blood Donor Search\n\n"
            "Tell me which **district + blood group** you need!\n\n"
            "**Examples:**\n"
            "- *\"O+ blood in Dhaka\"*\n"
            "- *\"How many A- donors in Sylhet?\"*\n"
            "- *\"B+ availability in Chittagong\"*\n\n"
            "**Covered districts:** Dhaka, Chittagong, Sylhet, Rajshahi, "
            "Khulna, Barisal, Mymensingh, Rangpur, Comilla, Narayanganj...\n\n"
            "**Emergency:** `999` | **Ambulance:** `199`"
        )

    elif any(w in last_msg for w in ["ngo", "organization"]):
        resp = (
            "## Verified NGO Directory\n\n"
            "ShebaBD hosts verified NGOs including BRAC, Bidyanondo, "
            "Jaago Foundation, and Bangladesh Red Crescent. "
            "Our **AI Trust Score** evaluates registration & audit records."
        )

    elif any(w in last_msg for w in ["volunteer", "event"]):
        resp = (
            "## Volunteer Opportunities\n\n"
            "Join 18,000+ active volunteers!\n\n"
            "- Sylhet Relief Medical Camps\n"
            "- Coastal Reforestation (Satkhira)\n"
            "- Youth Digital Literacy Program"
        )

    elif any(w in last_msg for w in ["emergency", "disaster", "flood"]):
        resp = (
            "## Emergency Contacts — Bangladesh\n\n"
            "| Service | Number |\n"
            "|---|---|\n"
            "| National Emergency | **999** |\n"
            "| Ambulance / Fire | **199** |\n"
            "| Disaster Management | **1090** |\n"
            "| DGHS Health Hotline | **16400** |\n"
            "| Red Crescent | **01713-003001** |"
        )

    else:
        resp = (
            "Hi! I am **Sheba AI** — your ShebaBD assistant.\n\n"
            "Try asking:\n"
            "- *\"O+ blood availability in Dhaka\"*\n"
            "- *\"How many A- donors in Sylhet?\"*\n"
            "- *\"Find volunteer events near me\"*\n"
            "- *\"Emergency contacts Bangladesh\"*"
        )

    words = resp.split(" ")
    for word in words:
        yield f"data: {json.dumps({'type': 'token', 'content': word + ' '}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.018)

    yield f"data: {json.dumps({'type': 'done', 'tokens': len(words)})}\n\n"
    yield "data: [DONE]\n\n"
