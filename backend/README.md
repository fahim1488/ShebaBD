# ShebaBD AI Backend

FastAPI + PostgreSQL + OpenAI GPT-4o backend powering the Sheba AI chatbot.

## Quick Start

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and fill in your secrets
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
# Then edit .env — set OPENAI_API_KEY and DATABASE_URL

# 4. Create the PostgreSQL database
# psql -U postgres -c "CREATE DATABASE shebabd;"

# 5. Run database migrations
alembic upgrade head

# 6. Start the dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive API docs.

## Project Structure

```
backend/
├── app/
│   ├── main.py              ← FastAPI app factory, middleware, lifecycle
│   ├── config.py            ← Settings (pydantic-settings v2)
│   ├── database.py          ← Async SQLAlchemy engine + session
│   ├── models.py            ← ORM models: Conversation, Message
│   ├── schemas.py           ← Pydantic request/response schemas
│   ├── utils.py             ← JWT, rate limiter, auth dependency
│   ├── api/
│   │   └── chat.py          ← All chat routes
│   └── services/
│       ├── openai_service.py← OpenAI agentic loop + SSE streaming
│       ├── memory.py        ← Conversation history CRUD
│       └── tools.py         ← Tool definitions + dispatcher
├── alembic/                 ← DB migrations
├── alembic.ini
├── requirements.txt
├── .env.example
└── .env                     ← Local secrets (git-ignored)
```

## API Endpoints

| Method   | Path                          | Description                        |
|----------|-------------------------------|------------------------------------|
| `POST`   | `/api/v1/chat`                | Single-turn chat (full response)   |
| `POST`   | `/api/v1/chat/stream`         | Streaming chat (SSE)               |
| `POST`   | `/api/v1/chat/new`            | Create blank conversation          |
| `GET`    | `/api/v1/chat/history`        | List conversations (paginated)     |
| `GET`    | `/api/v1/chat/history/{id}`   | Full message history               |
| `DELETE` | `/api/v1/chat/history/{id}`   | Delete a conversation              |
| `GET`    | `/api/v1/health`              | Health check                       |

## SSE Streaming Events

```
data: {"type": "meta",  "conversation_id": "...", "is_new": true}
data: {"type": "token", "content": "Hello"}
data: {"type": "tool",  "name": "findBloodRequests", "status": "calling"}
data: {"type": "tool",  "name": "findBloodRequests", "status": "done"}
data: {"type": "done",  "tokens": 312}
data: [DONE]
```

## Auth

In **development** (`DEBUG=true`) the auth dependency falls back to a stable
anonymous user ID so you can test without a real JWT.

In **production** send `Authorization: Bearer <jwt>` with every request.
Generate a token:

```python
from app.utils import create_access_token
token = create_access_token(subject="user-uuid-here")
```

## Tool Calling

The AI automatically calls these tools when live data is needed:

| Tool                   | Triggers when user asks about…          |
|------------------------|-----------------------------------------|
| `findVolunteerEvents`  | upcoming events, volunteer opportunities|
| `findBloodRequests`    | blood donation, blood group search      |
| `getEmergencyContacts` | emergency numbers, disaster contacts    |
| `searchFAQ`            | how-to questions, platform help         |
| `getOrganization`      | NGO details, verified organisations     |

Each tool calls your ShebaBD REST API (`SHEBABD_API_BASE_URL`) and falls
back to mock data if the internal API is unreachable.
     