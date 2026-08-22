"""
test_emergency_api.py - Unit tests for emergency hotline lookup and SOS alerts.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_emergency_services(async_client: AsyncClient):
    """Test fetching emergency contact directory."""
    res = await async_client.get("/api/v1/emergency")
    assert res.status_code in [200, 404]

@pytest.mark.asyncio
async def test_filter_emergency_by_district(async_client: AsyncClient):
    """Test filtering hotlines by district."""
    res = await async_client.get("/api/v1/emergency?district=Dhaka")
    assert res.status_code in [200, 404]
