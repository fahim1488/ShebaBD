# ShebaBD Production Deployment Runbook

## Requirements
- Python 3.11+
- PostgreSQL 15+ (Production)
- Reverse proxy (Nginx or Caddy) with SSL certificate

## Environment Setup
```bash
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET_KEY, and SMTP credentials
```

## Running with Gunicorn + Uvicorn Workers
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```
