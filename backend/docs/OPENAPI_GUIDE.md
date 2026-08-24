# ShebaBD REST API Reference & OpenAPI Guide

## Overview
ShebaBD provides a RESTful API powered by FastAPI with automatic OpenAPI 3.0 documentation.

### Base URLs
- **Development**: `http://localhost:8000/api/v1`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

### Authentication
Endpoints requiring authentication expect a standard Bearer token:
```http
Authorization: Bearer <jwt_access_token>
```
