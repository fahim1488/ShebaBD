"""
health_check.py - Automated deployment liveness probe script.
"""
import urllib.request
import json
import sys

def check_backend_health(url: str = "http://127.0.0.1:8000/docs") -> bool:
    """Verify backend server is accepting HTTP connections."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == "__main__":
    is_healthy = check_backend_health()
    sys.exit(0 if is_healthy else 1)
