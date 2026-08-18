"""
cache.py — Simple in-memory cache with TTL (Time To Live) support.

Used to cache frequently requested data like blood donor lists,
organization listings, and event counts to reduce DB load.
"""
import time
from typing import Any, Optional


class TTLCache:
    """Thread-safe in-memory key-value cache with TTL expiry."""

    def __init__(self, default_ttl: int = 300):
        """
        Args:
            default_ttl: Default time-to-live in seconds (default 5 min).
        """
        self._store: dict[str, tuple[Any, float]] = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or None if missing/expired."""
        if key not in self._store:
            return None
        value, expires_at = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store a value with an expiry time."""
        ttl = ttl if ttl is not None else self.default_ttl
        self._store[key] = (value, time.time() + ttl)

    def delete(self, key: str) -> None:
        """Remove a single key from cache."""
        self._store.pop(key, None)

    def clear(self) -> None:
        """Wipe the entire cache."""
        self._store.clear()

    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count removed."""
        now = time.time()
        expired = [k for k, (_, exp) in self._store.items() if now > exp]
        for k in expired:
            del self._store[k]
        return len(expired)

    def __len__(self) -> int:
        return len(self._store)


# Shared cache instances
blood_cache = TTLCache(default_ttl=120)   # 2 min — donor lists change often
org_cache   = TTLCache(default_ttl=600)   # 10 min — org listings are stable
event_cache = TTLCache(default_ttl=300)   # 5 min  — events
