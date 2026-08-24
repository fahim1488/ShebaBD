"""
tools.py — OpenAI function/tool calling definitions and implementations.

Architecture
------------
1. TOOL_DEFINITIONS  — list of JSON schemas passed to the OpenAI API so the
                       model knows which tools exist and what arguments they take.
2. Individual async functions — the actual implementations that run when the
                       model decides to call a tool.
3. dispatch_tool()   — single entry-point that routes a tool call by name and
                       returns a JSON-serialisable result dict.

The functions below call your own ShebaBD REST API (via httpx) rather than
returning hard-coded data, so the AI always sees live platform data.
Fall-back mock data is included so the service works before the internal API
is wired up.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── HTTP client (reused across requests) ──────────────────────────────────────
_http_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            base_url=settings.shebabd_api_base_url,
            headers={"X-API-Key": settings.shebabd_api_key},
            timeout=10.0,
        )
    return _http_client


async def close_http_client() -> None:
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()


# ── OpenAI tool definitions ───────────────────────────────────────────────────
TOOL_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "webSearch",
            "description": (
                "Search the live internet for real-time information, current news, "
                "latest updates, general knowledge, weather, public records, coding solutions, "
                "or anything happening across the web."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query string.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of search results (default 5).",
                        "default": 5,
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "findVolunteerEvents",
            "description": (
                "Search for upcoming volunteer events on the ShebaBD platform. "
                "Returns a list of events matching the optional filters."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": (
                            "Event category to filter by, e.g. 'blood_donation', "
                            "'disaster_relief', 'education', 'environment', 'healthcare'."
                        ),
                    },
                    "location": {
                        "type": "string",
                        "description": "City or district name, e.g. 'Dhaka', 'Chittagong'.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default 5).",
                        "default": 5,
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "findBloodRequests",
            "description": (
                "Find active blood donation requests on the platform. "
                "Filter by blood group and/or location."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "blood_group": {
                        "type": "string",
                        "description": "Blood group, e.g. 'A+', 'O-', 'B+', 'AB+'.",
                    },
                    "location": {
                        "type": "string",
                        "description": "City or district name.",
                    },
                    "urgency": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Filter by urgency level.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (default 5).",
                        "default": 5,
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "getEmergencyContacts",
            "description": (
                "Retrieve emergency hotline numbers and contacts available "
                "in Bangladesh, optionally filtered by category."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": (
                            "Category of emergency service, e.g. 'fire', 'police', "
                            "'ambulance', 'flood', 'cyclone', 'general'."
                        ),
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "searchFAQ",
            "description": (
                "Search the ShebaBD FAQ knowledge base for answers to common "
                "questions about the platform, volunteering, donations, or NGOs."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The user's question or keywords to search for.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of FAQ items to return (default 3).",
                        "default": 3,
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "getOrganization",
            "description": (
                "Look up details about a registered NGO or organisation on "
                "the ShebaBD platform by name or ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Full or partial organisation name.",
                    },
                    "id": {
                        "type": "string",
                        "description": "Organisation ID (if known).",
                    },
                    "focus_area": {
                        "type": "string",
                        "description": (
                            "Filter by focus area, e.g. 'education', 'health', "
                            "'environment', 'disaster_relief'."
                        ),
                    },
                },
                "required": [],
            },
        },
    },
]


# ── Helper: safe API call with mock fallback ──────────────────────────────────
async def _api_get(path: str, params: Dict[str, Any]) -> Optional[Any]:
    """
    Call the internal ShebaBD API. Returns parsed JSON or None on failure.
    """
    client = get_http_client()
    try:
        response = await client.get(path, params={k: v for k, v in params.items() if v is not None})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("ShebaBD API %s returned %s", path, exc.response.status_code)
    except httpx.RequestError as exc:
        logger.warning("ShebaBD API request error for %s: %s", path, exc)
    return None


# ── Tool implementations ──────────────────────────────────────────────────────

async def findVolunteerEvents(
    category: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """Return upcoming volunteer events, calling the platform API."""
    data = await _api_get(
        "/events",
        {"category": category, "location": location, "limit": limit, "type": "volunteer"},
    )

    if data:
        return {"events": data.get("results", data), "source": "live"}

    # ── Mock fallback ──────────────────────────────────────────────────────────
    return {
        "source": "mock",
        "events": [
            {
                "id": "evt-001",
                "title": "Blood Donation Drive – Dhaka Medical",
                "date": "2026-08-15",
                "location": "Dhaka",
                "category": "blood_donation",
                "spots_available": 30,
            },
            {
                "id": "evt-002",
                "title": "Flood Relief Volunteer Camp – Sylhet",
                "date": "2026-08-20",
                "location": "Sylhet",
                "category": "disaster_relief",
                "spots_available": 50,
            },
            {
                "id": "evt-003",
                "title": "Free Health Checkup Camp – Chittagong",
                "date": "2026-08-22",
                "location": "Chittagong",
                "category": "healthcare",
                "spots_available": 20,
            },
        ],
    }


async def findBloodRequests(
    blood_group: Optional[str] = None,
    location: Optional[str] = None,
    urgency: Optional[str] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """Return active blood requests from the platform."""
    data = await _api_get(
        "/blood-requests",
        {"group": blood_group, "location": location, "urgency": urgency, "limit": limit},
    )

    if data:
        return {"requests": data.get("results", data), "source": "live"}

    return {
        "source": "mock",
        "requests": [
            {
                "id": "br-001",
                "blood_group": blood_group or "O+",
                "hospital": "Dhaka Medical College Hospital",
                "location": "Dhaka",
                "urgency": "high",
                "contact": "+880 1700-000001",
                "posted_at": "2026-08-06T08:00:00Z",
            },
            {
                "id": "br-002",
                "blood_group": blood_group or "A+",
                "hospital": "Square Hospital",
                "location": "Dhaka",
                "urgency": "medium",
                "contact": "+880 1700-000002",
                "posted_at": "2026-08-06T09:30:00Z",
            },
        ],
    }


async def getEmergencyContacts(
    category: Optional[str] = None,
) -> Dict[str, Any]:
    """Return Bangladesh emergency contacts, optionally filtered by category."""
    data = await _api_get("/emergency-contacts", {"category": category})

    if data:
        return {"contacts": data.get("results", data), "source": "live"}

    all_contacts = [
        {"name": "National Emergency",  "phone": "999",       "category": "general",   "available_24h": True},
        {"name": "Police",              "phone": "100",       "category": "police",    "available_24h": True},
        {"name": "Fire Service",        "phone": "199",       "category": "fire",      "available_24h": True},
        {"name": "Ambulance",           "phone": "199",       "category": "ambulance", "available_24h": True},
        {"name": "DGHS Hotline",        "phone": "16400",     "category": "health",    "available_24h": True},
        {"name": "DDM Disaster Mgmt",   "phone": "1090",      "category": "flood",     "available_24h": True},
        {"name": "BDRCS Red Crescent",  "phone": "01713-003001", "category": "general","available_24h": False},
    ]

    if category:
        filtered = [c for c in all_contacts if c["category"] == category]
        return {"source": "mock", "contacts": filtered or all_contacts}

    return {"source": "mock", "contacts": all_contacts}


async def searchFAQ(
    query: str,
    limit: int = 3,
) -> Dict[str, Any]:
    """Search the ShebaBD FAQ knowledge base."""
    data = await _api_get("/faqs/search", {"q": query, "limit": limit})

    if data:
        return {"faqs": data.get("results", data), "source": "live"}

    # Keyword-based mock fallback
    faqs = [
        {
            "question": "How do I register as a volunteer?",
            "answer": (
                "Go to **Sign Up**, choose 'Volunteer' as your role, complete "
                "your profile, and browse open events on the Volunteers page."
            ),
            "category": "volunteering",
        },
        {
            "question": "How do I donate to an NGO?",
            "answer": (
                "Visit the **Donate** page, select a verified NGO, choose an "
                "amount, and pay via bKash, Nagad, or card."
            ),
            "category": "donation",
        },
        {
            "question": "How are NGOs verified on ShebaBD?",
            "answer": (
                "NGOs submit registration documents. Our team reviews them within "
                "5 business days and displays a verified badge if approved."
            ),
            "category": "ngo",
        },
        {
            "question": "How do I post a blood donation request?",
            "answer": (
                "Go to **Blood Donation → Post Request**, fill in the blood group, "
                "hospital, and contact details, then submit."
            ),
            "category": "blood_donation",
        },
        {
            "question": "Is ShebaBD free to use?",
            "answer": "Yes, ShebaBD is completely free for volunteers, donors, and NGOs.",
            "category": "general",
        },
    ]

    q_lower = query.lower()
    scored = [
        f for f in faqs
        if any(word in f["question"].lower() or word in f["answer"].lower()
               for word in q_lower.split())
    ]
    return {"source": "mock", "faqs": (scored or faqs)[:limit]}


async def getOrganization(
    name: Optional[str] = None,
    id: Optional[str] = None,
    focus_area: Optional[str] = None,
) -> Dict[str, Any]:
    """Fetch organisation details from the platform."""
    data = await _api_get(
        f"/organizations/{id}" if id else "/organizations",
        {"name": name, "focus_area": focus_area},
    )

    if data:
        return {"organization": data, "source": "live"}

    return {
        "source": "mock",
        "organization": {
            "id":            id or "org-001",
            "name":          name or "BRAC Bangladesh",
            "type":          "NGO",
            "focus_area":    focus_area or "education, health, poverty",
            "location":      "Dhaka, Bangladesh",
            "verified":      True,
            "contact_email": "info@brac.net",
            "website":       "https://www.brac.net",
        },
    }


async def webSearch(
    query: str,
    limit: int = 5,
) -> Dict[str, Any]:
    """
    Search the live web using DuckDuckGo HTML / instant answer API with HTTP fallback.
    Returns real-time search snippets and titles from the internet.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    results = []
    
    # 1. Try DuckDuckGo HTML API
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.post("https://html.duckduckgo.com/html/", data={"q": query}, headers=headers)
            if resp.status_code == 200:
                import re
                titles = re.findall(r'<a[^>]*class="result__a"[^>]*>(.*?)</a>', resp.text, re.DOTALL)
                snippets = re.findall(r'<(?:a|div)[^>]*class="result__snippet"[^>]*>(.*?)</(?:a|div)>', resp.text, re.DOTALL)
                urls = re.findall(r'<a[^>]*class="result__url"[^>]*href="([^"]+)"', resp.text, re.DOTALL)
                
                clean_re = re.compile(r'<[^>]+>')
                for i in range(min(len(titles), limit)):
                    t = clean_re.sub('', titles[i]).strip()
                    s = clean_re.sub('', snippets[i]).strip() if i < len(snippets) else ""
                    u = urls[i].strip() if i < len(urls) else ""
                    if t:
                        results.append({"title": t, "snippet": s, "url": u})
    except Exception as e:
        logger.warning("DuckDuckGo HTML search failed: %s", e)

    # 2. Try DuckDuckGo JSON Instant Answer API if needed
    if not results:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(f"https://api.duckduckgo.com/?q={httpx.QueryParams({'q': query})['q']}&format=json", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("Abstract"):
                        results.append({
                            "title": data.get("Heading", query),
                            "snippet": data.get("Abstract"),
                            "url": data.get("AbstractURL", "")
                        })
                    for topic in data.get("RelatedTopics", []):
                        if isinstance(topic, dict) and "Text" in topic:
                            results.append({
                                "title": topic.get("Text", "")[:60],
                                "snippet": topic.get("Text", ""),
                                "url": topic.get("FirstURL", "")
                            })
                            if len(results) >= limit:
                                break
        except Exception as e:
            logger.warning("DuckDuckGo JSON search failed: %s", e)

    if results:
        return {"query": query, "source": "live_web", "results": results[:limit]}
    
    return {
        "query": query,
        "source": "web_search",
        "results": [
            {
                "title": f"Search topic: {query}",
                "snippet": f"No immediate live web snippets retrieved for '{query}'. Providing answer based on general knowledge.",
                "url": "https://duckduckgo.com/?q=" + query
            }
        ]
    }


# ── Dispatcher ────────────────────────────────────────────────────────────────
_TOOL_MAP = {
    "webSearch":            webSearch,
    "findVolunteerEvents": findVolunteerEvents,
    "findBloodRequests":   findBloodRequests,
    "getEmergencyContacts":getEmergencyContacts,
    "searchFAQ":           searchFAQ,
    "getOrganization":     getOrganization,
}


async def dispatch_tool(tool_name: str, arguments: str | Dict[str, Any]) -> str:
    """
    Parse arguments, call the matching tool function, and return
    the result as a JSON string (ready to pass back to OpenAI).

    Raises ValueError for unknown tool names.
    """
    if tool_name not in _TOOL_MAP:
        raise ValueError(f"Unknown tool: {tool_name!r}")

    if isinstance(arguments, str):
        try:
            args: Dict[str, Any] = json.loads(arguments)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON arguments for {tool_name}: {exc}") from exc
    else:
        args = arguments

    logger.info("Dispatching tool %r with args %s", tool_name, args)

    try:
        result = await _TOOL_MAP[tool_name](**args)
    except TypeError as exc:
        raise ValueError(f"Invalid arguments for tool {tool_name!r}: {exc}") from exc

    return json.dumps(result, ensure_ascii=False, default=str)
