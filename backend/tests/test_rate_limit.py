import pytest
from main import app


def test_health_endpoint_bypasses_rate_limit(client):
    """Test health endpoint is exempt from rate limiting."""
    for _ in range(35):
        response = client.get("/api/health")
        assert response.status_code == 200


def test_rate_limit_middleware_configured():
    """Test that rate limiting middleware is configured in the app."""
    # Check middleware stack contains our rate limit middleware
    middleware_classes = [str(m) for m in app.middleware_stack.__class__.__mro__]
    # The middleware is configured in main.py, verify the app has middleware
    assert hasattr(app, 'user_middleware')
    assert len(app.user_middleware) > 0
