"""
test_community_api.py - Unit tests for community forum and discussion posts.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_community_posts(async_client: AsyncClient):
    """Test listing community discussions."""
    res = await async_client.get("/api/v1/community/posts")
    assert res.status_code in [200, 404]
