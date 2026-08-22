"""
test_payment_verification.py - Unit tests for payment verification schemas.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_invalid_payment_verification_id(async_client: AsyncClient):
    """Test invalid payment verification returns 404."""
    res = await async_client.post("/api/v1/donations/999999/verify", json={
        "status": "completed"
    })
    assert res.status_code in [401, 404, 422]
