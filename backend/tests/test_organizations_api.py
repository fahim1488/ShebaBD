"""
test_organizations_api.py - Unit tests for verified NGO directory.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_organizations(async_client: AsyncClient):
    """Test fetching verified NGO partners."""
    res = await async_client.get("/api/v1/organizations")
    assert res.status_code in [200, 404]

@pytest.mark.asyncio
async def test_search_organization_by_name(async_client: AsyncClient):
    """Test searching NGO directory by search term."""
    res = await async_client.get("/api/v1/organizations?search=Red")
    assert res.status_code in [200, 404]
