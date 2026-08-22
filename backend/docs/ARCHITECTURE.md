# ShebaBD Backend Architecture & System Design

## Architecture Stack
- **Framework**: FastAPI (Async ASGI)
- **ORM**: SQLAlchemy 2.0 with `asyncpg` / `aiosqlite`
- **Scheduler**: APScheduler (AsyncIOScheduler)
- **Auth**: JWT (RS256/HS256) + bcrypt password hashing
- **Email Engine**: Python `smtplib` with RFC multipart fallback and background dispatch

## Key Layers
1. `app/api`: Request handlers & route controllers
2. `app/models`: Database schema & entity definitions
3. `app/schemas`: Pydantic input/output serialization
4. `app/services`: Business logic, email, AI advisors, and background schedulers
