"""
test_chat_advisor.py - Unit tests for AI assistant message validation.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_chat_empty_message_rejected(async_client: AsyncClient):
    """Test sending empty message body returns 422 validation error."""
    res = await async_client.post("/api/v1/chat", json={
        "messages": []
    })
    assert res.status_code in [400, 422]
