"""
test_events_api.py - Unit tests for event registration and listing workflows.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_events_list(async_client: AsyncClient):
    """Test listing public events returns 200."""
    res = await async_client.get("/api/v1/events")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

@pytest.mark.asyncio
async def test_unauthenticated_registration_rejected(async_client: AsyncClient):
    """Test registering without token returns 401."""
    res = await async_client.post("/api/v1/events/1/register", json={
        "phone": "01700000000"
    })
    assert res.status_code in [401, 403]
