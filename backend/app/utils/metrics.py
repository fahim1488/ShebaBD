"""
metrics.py - Application performance and request timing metrics collector.
"""
import time
from typing import Dict, Any

class RequestMetrics:
    """Helper for tracking API request latency and execution timestamps."""
    def __init__(self):
        self._start_time = time.perf_counter()

    def elapsed_ms(self) -> float:
        """Return elapsed milliseconds since initialized."""
        return round((time.perf_counter() - self._start_time) * 1000, 2)

    def summary(self) -> Dict[str, Any]:
        """Return timing dictionary."""
        return {"duration_ms": self.elapsed_ms()}
