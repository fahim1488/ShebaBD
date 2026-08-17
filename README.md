# ShebaBD — AI-Powered Social Service Platform

An AI-powered social service, volunteer management, and emergency response platform for Bangladesh connecting citizens, volunteers, NGOs, and responders with live AI chat, tool calling, and disaster intelligence.

---

## 🏗️ Project Architecture & Directory Structure

```
ShebaBD123/
├── backend/                        # FastAPI Backend Application (Python 3.12)
│   ├── alembic/                    # Database Migration System
│   │   ├── versions/               # Schema Migration Scripts
│   │   └── env.py                  # Migration Environment Config
│   ├── app/                        # Main Application Package
│   │   ├── api/                    # API Route Controllers
│   │   │   ├── auth.py             # Authentication endpoints (/api/v1/auth/*)
│   │   │   └── chat.py             # Chat & Health endpoints (/api/v1/chat/* & /api/v1/health)
│   │   ├── config.py               # Application Settings & Pydantic Config
│   │   ├── database.py             # SQLAlchemy Async Engine & Session Manager
│   │   ├── main.py                 # FastAPI Application Factory, CORS & Middlewares
│   │   ├── models.py               # ORM Models (User, Conversation, Message)
│   │   ├── schemas.py              # Pydantic Validation & Serialization Schemas
│   │   ├── utils.py                # Security, JWT tokens, and logging helpers
│   │   └── services/               # Core Services
│   │       ├── memory.py           # Database CRUD for chat history & memory
│   │       ├── openai_service.py   # GPT-4o Service & SSE Streaming Generator
│   │       └── tools.py            # Agentic Tool Definitions (Search, Org lookup, Emergency)
│   ├── alembic.ini                 # Alembic configuration
│   ├── requirements.txt            # Python Dependencies
│   └── shebabd.db                  # Local SQLite Database Fallback
│
├── public/                         # Public Assets
├── src/                            # React 18 + Vite + TypeScript Frontend
│   ├── assets/                     # Media & Static Image Assets
│   ├── components/                 # Reusable UI Components
│   │   ├── common/                 # Headers, Footers, Modals, Cards
│   │   ├── forms/                  # Input fields, selectors, form controls
│   │   ├── layout/                 # Main containers, Navbars, Sidebars
│   │   └── ui/                     # UI Primitives & Atoms
│   ├── constants/                  # System constants & app config
│   ├── context/                    # React Contexts (AuthContext, ThemeContext, LanguageContext)
│   ├── data/                       # Datasets for NGOs, volunteers, disaster alerts
│   ├── hooks/                      # Custom React Hooks
│   ├── i18n/                       # Translation Dictionaries (English / Bengali)
│   ├── layouts/                    # Layout wrappers
│   ├── pages/                      # Page Views & Dashboards
│   │   ├── About.tsx               # About ShebaBD
│   │   ├── AiAnalytics.tsx         # AI Insights & Impact Analytics
│   │   ├── AiContentGenerator.tsx  # AI Content Generation tool
│   │   ├── AiDisasterIntelligence.tsx # Emergency disaster management & alert system
│   │   ├── AiDonationAdvisor.tsx   # Smart donation advisor
│   │   ├── AiFakeNgoDetection.tsx  # NGO authenticity detection engine
│   │   ├── AiFakeReviewDetection.tsx# Review credibility checker
│   │   ├── AiOrgRecommendation.tsx # NGO matching engine
│   │   ├── AiOrgTrustScore.tsx     # Trust score analyzer
│   │   ├── AiSmartSearch.tsx       # Semantic AI search
│   │   ├── AiVolunteerRecommendation.tsx # Volunteer opportunity matchmaker
│   │   ├── BloodDonation.tsx       # Blood donation locator & donor finder
│   │   ├── Community.tsx           # Community forums & stories
│   │   ├── Donate.tsx              # Donation portal
│   │   ├── Emergency.tsx           # Emergency contacts & SOS alert directory
│   │   ├── Events.tsx              # Campaigns & events manager
│   │   ├── Home.tsx                # Landing Homepage
│   │   ├── Organizations.tsx      # Verified NGO Directory
│   │   ├── SignIn.tsx              # User Authentication (Login)
│   │   ├── SignUp.tsx              # User Account Registration
│   │   └── Volunteers.tsx         # Volunteer Directory & Opportunities
│   ├── routes/                     # Application Routes & Guards
│   ├── services/                   # Frontend API Client Layer
│   │   ├── api.ts                  # Axios base client with Bearer Token Interceptor
│   │   ├── authApi.ts              # Authentication API Service
│   │   └── chatApi.ts              # Chat API Service (Fetch API + SSE Streaming)
│   ├── styles/                     # Global CSS & Tailwind imports
│   ├── types/                      # TypeScript Interfaces & Type Declarations
│   ├── App.tsx                     # Application Root & Routing Setup
│   └── main.tsx                    # React DOM Mounting Entrypoint
│
├── package.json                    # Node dependencies & package scripts
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build configuration
```

---

## 🔌 API Endpoint Documentation

Base API URL: `http://localhost:8000/api/v1`

### 1. Authentication APIs (`/api/v1/auth`)

| Endpoint | Method | Protected | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | ❌ No | Register a new user account | `RegisterRequest` | `AuthResponse` |
| `/api/v1/auth/login` | `POST` | ❌ No | Authenticate user with credentials | `LoginRequest` | `AuthResponse` |
| `/api/v1/auth/social` | `POST` | ❌ No | Sign in / register via Google or Facebook | `SocialLoginRequest` | `AuthResponse` |
| `/api/v1/auth/forgot-password` | `POST` | ❌ No | Send password reset instructions | `ForgotPasswordRequest` | `{ ok: true, message: string }` |
| `/api/v1/auth/logout` | `POST` | ❌ No | Logout user session | None | `{ ok: true, message: string }` |
| `/api/v1/auth/me` | `GET` | 🔒 Bearer | Get authenticated user profile | None | `UserOut` |

#### Request & Response Schemas:

* **`RegisterRequest`**: `{ name: string, email: string, password: string, role?: "user" | "volunteer" | "ngo" }`
* **`LoginRequest`**: `{ email: string, password: string }`
* **`AuthResponse`**: `{ token: string, user: { id: string, name: string, email: string, role: string, avatar: string | null } }`

---

### 2. AI Chat & Memory APIs (`/api/v1/chat`)

| Endpoint | Method | Protected | Description | Request / Query Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/chat` | `POST` | 🔒 Bearer | Single-turn message with automated agent tool-call execution loop | `ChatRequest` | `ChatResponse` |
| `/api/v1/chat/stream` | `POST` | 🔒 Bearer | Real-time streaming response using Server-Sent Events (SSE) | `ChatStreamRequest` | `text/event-stream` |
| `/api/v1/chat/new` | `POST` | 🔒 Bearer | Create a new conversation session | `NewConversationRequest` | `NewConversationResponse` |
| `/api/v1/chat/history` | `GET` | 🔒 Bearer | Get list of user conversations (paginated) | `?limit=20&offset=0` | `ConversationListResponse` |
| `/api/v1/chat/history/{id}` | `GET` | 🔒 Bearer | Fetch full chat message history | Path: `id` (UUID) | `ConversationDetailSchema` |
| `/api/v1/chat/history/{id}` | `DELETE` | 🔒 Bearer | Delete conversation and messages | Path: `id` (UUID)<br>`?hard=false` | `OKResponse` |

#### Server-Sent Events (SSE) Format (`POST /api/v1/chat/stream`):
* Meta Event: `data: {"type": "meta", "conversation_id": "...", "is_new": true}`
* Token Event: `data: {"type": "token", "content": "Hello"}`
* Tool Execution: `data: {"type": "tool", "name": "get_ngo_info", "status": "calling|done"}`
* Stream Completion: `data: {"type": "done", "tokens": 120}`
* Termination Sentinel: `data: [DONE]`

---

### 3. System Health APIs

| Endpoint | Method | Protected | Description | Response |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | ❌ No | Root server status | `{"service": "ShebaBD AI Backend", "version": "1.0.0", "status": "running"}` |
| `/api/v1/health` | `GET` | ❌ No | Health check for Database & OpenAI status | `HealthResponse` |

---

## 🛠️ Getting Started & Running Locally

### Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup (Vite + React)

```bash
# In the project root directory
npm install
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```env
APP_NAME="ShebaBD AI Backend"
APP_ENV=development
DEBUG=True
SECRET_KEY=your-secret-jwt-key
DATABASE_URL=sqlite+aiosqlite:///./shebabd.db
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
```
