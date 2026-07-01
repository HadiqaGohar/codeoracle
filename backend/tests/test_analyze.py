import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_analyze_invalid_type(client):
    """Test analyze with invalid analysis type returns 400."""
    response = client.post(
        "/api/analyze",
        json={"repo_url": "https://github.com/test/repo", "analysis_type": "invalid_type"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_analyze_missing_type(client):
    """Test analyze with missing analysis type returns 422."""
    response = client.post(
        "/api/analyze",
        json={"repo_url": "https://github.com/test/repo"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_analyze_success(client, mock_repo_data, mock_gemini_response):
    """Test analyze with mocked Gemini response."""
    with patch("main.fetch_repository", new_callable=AsyncMock) as mock_fetch, \
         patch("main.analyze_code", new_callable=AsyncMock) as mock_analyze:
        mock_fetch.return_value = mock_repo_data
        mock_analyze.return_value = mock_gemini_response

        response = client.post(
            "/api/analyze",
            json={"repo_url": "https://github.com/test-user/test-repo", "analysis_type": "code_explain"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == mock_gemini_response
        assert data["type"] == "code_explain"
        assert data["type_label"] == "Code Explanation"


@pytest.mark.asyncio
async def test_analyze_uses_cache(client, mock_repo_data, mock_gemini_response):
    """Test analyze uses cached results when available."""
    with patch("main.get_cache") as mock_get_cache, \
         patch("main.set_cache") as mock_set_cache:
        mock_get_cache.return_value = {
            "result": mock_gemini_response,
            "type": "code_explain",
            "type_label": "Code Explanation",
        }

        response = client.post(
            "/api/analyze",
            json={"repo_url": "https://github.com/test-user/test-repo", "analysis_type": "code_explain"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == mock_gemini_response
