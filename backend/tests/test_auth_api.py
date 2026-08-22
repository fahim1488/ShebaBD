"""
test_auth_api.py - Unit tests for authentication and authorization endpoints.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient):
    """Test login with non-existent user returns 401."""
    res = await async_client.post("/api/v1/auth/login", json={
        "email": "nonexistent@shebabd.org",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    """Test registering with an existing email returns 409 or 400."""
    res = await async_client.post("/api/v1/auth/register", json={
        "name": "Admin",
        "email": "admin@shebabd.org",
        "password": "password123",
        "role": "member"
    })
    assert res.status_code in [400, 409]
