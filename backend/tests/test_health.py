import pytest


def test_health_check(client):
    """Test health endpoint returns status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "gemini_configured" in data
    assert "github_configured" in data
    assert "available_analyses" in data


def test_health_returns_analysis_types(client):
    """Test health endpoint includes all analysis types."""
    response = client.get("/api/health")
    data = response.json()
    expected_types = [
        "code_explain",
        "bug_detection",
        "readme_improve",
        "architecture",
        "documentation",
        "refactoring",
        "security",
    ]
    for analysis_type in expected_types:
        assert analysis_type in data["available_analyses"]
