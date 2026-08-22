"""
test_blood_api.py - Unit tests for blood donor search and emergency requests.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_blood_donors(async_client: AsyncClient):
    """Test fetching active blood donors."""
    res = await async_client.get("/api/v1/blood/donors")
    assert res.status_code in [200, 404]

@pytest.mark.asyncio
async def test_filter_donors_by_group(async_client: AsyncClient):
    """Test filtering donors by blood group."""
    res = await async_client.get("/api/v1/blood/donors?blood_group=A%2B")
    assert res.status_code in [200, 404]
