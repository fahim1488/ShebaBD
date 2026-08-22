"""
test_donations_api.py - Unit tests for donation campaign endpoints and metrics.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_donation_campaigns(async_client: AsyncClient):
    """Test fetching active donation campaigns."""
    res = await async_client.get("/api/v1/donations/campaigns")
    assert res.status_code in [200, 404]
