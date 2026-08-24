"""
conftest.py - Pytest fixtures and shared configuration for backend testing.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from app.main import app

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
