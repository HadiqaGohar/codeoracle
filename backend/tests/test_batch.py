import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_batch_analyze_invalid_types(client):
    """Test batch analyze with invalid analysis types returns 400."""
    response = client.post(
        "/api/analyze-batch",
        json={
            "repo_url": "https://github.com/test/repo",
            "analysis_types": ["invalid_type", "code_explain"],
        },
    )
    assert response.status_code == 400
    assert "Invalid analysis types" in response.json()["detail"]


@pytest.mark.asyncio
async def test_batch_analyze_missing_types(client):
    """Test batch analyze with missing types returns 422."""
    response = client.post(
        "/api/analyze-batch",
        json={"repo_url": "https://github.com/test/repo"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_batch_analyze_success(client, mock_repo_data, mock_gemini_response):
    """Test batch analyze with multiple analysis types."""
    with patch("main.fetch_repository", new_callable=AsyncMock) as mock_fetch, \
         patch("main.analyze_code", new_callable=AsyncMock) as mock_analyze:
        mock_fetch.return_value = mock_repo_data
        mock_analyze.return_value = mock_gemini_response

        response = client.post(
            "/api/analyze-batch",
            json={
                "repo_url": "https://github.com/test-user/test-repo",
                "analysis_types": ["code_explain", "bug_detection"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["results"]) == 2
        assert data["repo_info"]["full_name"] == "test-user/test-repo"


@pytest.mark.asyncio
async def test_batch_analyze_empty_list(client, mock_repo_data):
    """Test batch analyze with empty list returns empty results."""
    with patch("main.get_cache") as mock_get_cache:
        mock_get_cache.return_value = mock_repo_data

        response = client.post(
            "/api/analyze-batch",
            json={
                "repo_url": "https://github.com/test-user/test-repo",
                "analysis_types": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["results"] == []
