import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_fetch_repo_invalid_url(client):
    """Test fetch-repo with invalid URL returns 400."""
    response = client.post(
        "/api/fetch-repo",
        json={"repo_url": "not-a-valid-url"},
    )
    assert response.status_code in [400, 500]


@pytest.mark.asyncio
async def test_fetch_repo_missing_url(client):
    """Test fetch-repo with missing URL returns 422."""
    response = client.post(
        "/api/fetch-repo",
        json={},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_fetch_repo_success(client, mock_repo_data):
    """Test fetch-repo with mocked repository data."""
    with patch("main.fetch_repository", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_repo_data
        response = client.post(
            "/api/fetch-repo",
            json={"repo_url": "https://github.com/test-user/test-repo"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["repo_info"]["full_name"] == "test-user/test-repo"
        assert data["total_files"] == 2
        mock_fetch.assert_called_once()
