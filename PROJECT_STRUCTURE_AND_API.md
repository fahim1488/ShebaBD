# ShebaBD - Project Structure & API Documentation

## 1. Executive Summary & Tech Stack

**ShebaBD** is an AI-powered social service platform for Bangladesh connecting donors, volunteers, non-governmental organizations (NGOs), and citizens needing emergency assistance, blood donation, disaster management, and NGO verification.

### Technology Stack

* **Frontend:**
  * **Framework:** React 18 with TypeScript & Vite
  * **Styling:** Tailwind CSS, Custom CSS Variables, Lucide React Icons
  * **State & Routing:** React Router v6, React Context API (`AuthContext`, `ThemeContext`, `LanguageContext`)
  * **HTTP Client:** Axios (for Auth API), Fetch API / SSE TextDecoder (for Chat Streaming)
* **Backend:**
  * **Framework:** Python 3.12 + FastAPI (Async ASGI application)
  * **Database & ORM:** PostgreSQL / SQLite fallback via SQLAlchemy 2.0 (Async Engine) & Alembic migrations
  * **Authentication:** PyJWT (Bearer Tokens), Bcrypt password hashing
  * **AI Service:** OpenAI API (GPT-4o model with agentic tool calling loop and Server-Sent Events SSE streaming)
  * **Validation & Config:** Pydantic v2 & Pydantic-Settings

---

## 2. Project Directory Structure

```
ShebaBD123/
├── backend/                        # FastAPI Backend Application
│   ├── alembic/                    # Database Migration Scripts
│   │   ├── versions/               # Individual database migration files
│   │   ├── env.py                  # Migration environment configuration
│   │   └── script.py.mjs           # Migration template script
│   ├── app/                        # Main Backend Application Package
│   │   ├── api/                    # API Router Controllers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Auth API routes (/api/v1/auth/*)
│   │   │   └── chat.py             # Chat & Health API routes (/api/v1/chat/* & /api/v1/health)
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic Settings & environment vars
│   │   ├── database.py             # SQLAlchemy Async Engine & session maker
│   │   ├── main.py                 # FastAPI App creation, Middleware & Error Handlers
│   │   ├── models.py               # SQLAlchemy Database Models (User, Conversation, Message)
│   │   ├── schemas.py              # Pydantic Schemas for Requests & Responses
│   │   ├── utils.py                # JWT Auth helpers & Logging setup
│   │   └── services/               # Core Business Logic Services
│   │       ├── __init__.py
│   │       ├── memory.py           # Database CRUD for chat memory & conversation history
│   │       ├── openai_service.py   # OpenAI GPT-4o service & SSE streaming generator
│   │       └── tools.py            # Live tool definitions for GPT-4o (search, org lookup, emergency)
│   ├── .env                        # Active Backend Environment Variables
│   ├── .env.example                # Template for Backend Environment Variables
│   ├── alembic.ini                 # Alembic configuration
│   ├── requirements.txt            # Python dependencies
│   ├── shebabd.db                  # Local SQLite database instance
│   └── test_chat.py                # Standalone chat service testing script
│
├── public/                         # Static Assets (Logos, Favicons, Images)
├── src/                            # React Frontend Source Code
│   ├── assets/                     # Media & Static Image Assets
│   ├── components/                 # Reusable UI Components
│   │   ├── common/                 # Common components (Header, Footer, Cards)
│   │   ├── forms/                  # Form inputs, selectors, and controls
│   │   ├── layout/                 # Page containers, Navbars, Sidebars
│   │   └── ui/                     # Basic UI Atoms (Buttons, Badges, Modals, Inputs)
│   ├── constants/                  # System constants & configuration data
│   ├── context/                    # React Contexts (AuthContext, ThemeContext, i18n)
│   ├── data/                       # Static mock dataset for NGOs, volunteers, disaster alerts
│   ├── hooks/                      # Custom React Hooks
│   ├── i18n/                       # Translation dictionaries (English / Bengali)
│   ├── layouts/                    # Application Layout Templates
│   ├── lib/                        # Utility libraries & helper configurations
│   ├── pages/                      # Page View Components
│   │   ├── About.tsx               # About ShebaBD page
│   │   ├── AiAnalytics.tsx         # AI Insights & Analytics dashboard
│   │   ├── AiContentGenerator.tsx  # AI Content Generation utility page
│   │   ├── AiDisasterIntelligence.tsx # Emergency disaster response & mapping
│   │   ├── AiDonationAdvisor.tsx   # Smart donation recommendation assistant
│   │   ├── AiFakeNgoDetection.tsx  # NGO authenticity verifier page
│   │   ├── AiFakeReviewDetection.tsx# Review credibility checker
│   │   ├── AiOrgRecommendation.tsx # NGO Matching Engine
│   │   ├── AiOrgTrustScore.tsx     # Trust score analyzer
│   │   ├── AiSmartSearch.tsx       # AI Semantic Search page
│   │   ├── AiVolunteerRecommendation.tsx # Volunteer opportunity matchmaker
│   │   ├── BloodDonation.tsx       # Blood donation locator & donor matching
│   │   ├── Community.tsx           # Community updates & forum
│   │   ├── Donate.tsx              # Donation portal
│   │   ├── Emergency.tsx           # Emergency contact directory & SOS response
│   │   ├── Events.tsx              # Social events & campaigns page
│   │   ├── Home.tsx                # Landing Homepage
│   │   ├── Organizations.tsx      # NGO Directory
│   │   ├── SignIn.tsx              # Account sign in page
│   │   ├── SignUp.tsx              # Account registration page
│   │   └── Volunteers.tsx         # Volunteer program dashboard
│   ├── routes/                     # Application Routes & Route Guards
│   ├── services/                   # Frontend API Client Integration
│   │   ├── api.ts                  # Axios base client with JWT interceptors
│   │   ├── authApi.ts              # Authentication API service layer
│   │   └── chatApi.ts              # Chat API service layer (Fetch + SSE)
│   ├── styles/                     # Global CSS & Tailwind imports
│   ├── types/                      # TypeScript Interfaces & Types definitions
│   ├── utils/                      # Helper utility functions
│   ├── App.tsx                     # Main App component & routing tree
│   ├── main.tsx                    # React DOM Entrypoint
│   └── vite-env.d.ts               # Vite environment type declaration
│
├── .env                            # Active Frontend Environment Variables
├── .env.example                    # Template for Frontend Environment Variables
├── eslint.config.js                # ESLint Configuration
├── index.html                      # HTML Entry point
├── package.json                    # Node dependencies and scripts
├── postcss.config.js               # PostCSS plugin configuration
├── tailwind.config.ts              # Tailwind CSS configuration & theme extension
├── tsconfig.json                   # TypeScript root config
├── tsconfig.app.json               # TypeScript frontend config
└── vite.config.ts                  # Vite build setup & alias configuration
```

---

## 3. Complete API Endpoints Listing

Base URL (Local): `http://localhost:8000/api/v1`

### 🔑 3.1. Authentication APIs (`/api/v1/auth`)

| Endpoint | Method | Auth Required | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | ❌ No | Create a new user account | `RegisterRequest` | `AuthResponse` (JWT + User) |
| `/api/v1/auth/login` | `POST` | ❌ No | Authenticate user with credentials | `LoginRequest` | `AuthResponse` (JWT + User) |
| `/api/v1/auth/social` | `POST` | ❌ No | Sign in / register via Social Provider (Google/Facebook) | `SocialLoginRequest` | `AuthResponse` (JWT + User) |
| `/api/v1/auth/forgot-password` | `POST` | ❌ No | Request password reset instructions | `ForgotPasswordRequest` | `{"ok": true, "message": "..."}` |
| `/api/v1/auth/logout` | `POST` | ❌ No | Logout user (stateless token discard) | None | `{"ok": true, "message": "..."}` |
| `/api/v1/auth/me` | `GET` | 🔒 Yes (Bearer) | Get current authenticated user details | None | `UserOut` |

#### Payload Examples:

**1. Register Request (`POST /api/v1/auth/register`)**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecretPassword123",
  "role": "user" // "user" | "volunteer" | "ngo"
}
```

**2. Auth Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatar": null
  }
}
```

---

### 💬 3.2. AI Chat & Conversation APIs (`/api/v1/chat`)

| Endpoint | Method | Auth Required | Description | Request / Query | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/chat` | `POST` | 🔒 Yes (Bearer) | Single-turn non-streaming response with automated tool loop | `ChatRequest` | `ChatResponse` |
| `/api/v1/chat/stream` | `POST` | 🔒 Yes (Bearer) | Real-time streaming AI response via Server-Sent Events (SSE) | `ChatStreamRequest` | `text/event-stream` (SSE Events) |
| `/api/v1/chat/new` | `POST` | 🔒 Yes (Bearer) | Initialize a new blank conversation session | `NewConversationRequest` | `NewConversationResponse` |
| `/api/v1/chat/history` | `GET` | 🔒 Yes (Bearer) | List conversations for the logged-in user (paginated) | `?limit=20&offset=0` | `ConversationListResponse` |
| `/api/v1/chat/history/{conversation_id}` | `GET` | 🔒 Yes (Bearer) | Get complete message history for a conversation | Path Param: `conversation_id` | `ConversationDetailSchema` |
| `/api/v1/chat/history/{conversation_id}` | `DELETE` | 🔒 Yes (Bearer) | Delete a conversation and all attached messages | Path Param: `conversation_id`<br>`?hard=false` | `OKResponse` |

#### SSE Event Payload Formats (`POST /api/v1/chat/stream`):
* `meta`: `{"type": "meta", "conversation_id": "...", "is_new": true}`
* `token`: `{"type": "token", "content": "..."}`
* `tool`: `{"type": "tool", "name": "get_ngo_info", "status": "calling|done"}`
* `done`: `{"type": "done", "tokens": 150}`
* `error`: `{"type": "error", "message": "..."}`
* Termination line: `data: [DONE]`

---

### 🏥 3.3. System & Health Check APIs

| Endpoint | Method | Auth Required | Description | Response |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | ❌ No | Root server status check | `{"service": "ShebaBD AI Backend", "version": "1.0.0", "status": "running", "docs": "/docs"}` |
| `/api/v1/health` | `GET` | ❌ No | Health check for DB connection & OpenAI API key validation | `HealthResponse` |

#### Health Response Example:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected",
  "openai": "configured"
}
```

---

## 4. Database Models Schema Overview

* **`User` Table (`users`)**: Stores user accounts, hashed passwords, roles (`user`, `volunteer`, `ngo`, `admin`), profile details, and active status.
* **`Conversation` Table (`conversations`)**: Stores chat sessions per user, conversation titles, and active status flags.
* **`Message` Table (`messages`)**: Stores multi-role chat history (`user`, `assistant`, `system`, `tool`), content, token usage, tool invocation arguments, and tool execution outputs.

---

## 5. Architectural & Data Flow Highlights

1. **Agentic Tool Loop:** When a message is sent to `/api/v1/chat` or `/api/v1/chat/stream`, the backend passes available tools (`search_shebabd`, `get_ngo_info`, `get_emergency_contacts`) to OpenAI's GPT-4o model. If GPT-4o determines a tool call is needed, FastAPI executes the Python service function, logs the tool output in database memory, and resumes generation.
2. **Stateless JWT Security:** Requests to protected endpoints include the `Authorization: Bearer <token>` header. Token claims contain user ID and role, verified asynchronously on each request.
3. **Resilient Data Persistence:** Database interactions use SQLAlchemy 2.0 async sessions with automatic table creation on startup and Alembic database migration management.
