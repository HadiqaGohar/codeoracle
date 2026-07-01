---
title: CodeOracle Backend
emoji: 🧠
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# CodeOracle - AI Repository Analyzer Backend

FastAPI backend for CodeOracle, powered by Google Gemini AI.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/fetch-repo` - Fetch GitHub repository files
- `POST /api/analyze` - Run single analysis
- `POST /api/analyze-stream` - Stream analysis results (SSE)
- `POST /api/analyze-batch` - Run multiple analyses at once
- `POST /api/cache/clear` - Clear server cache

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini AI API key
- `GITHUB_TOKEN` - GitHub personal access token (optional)

## Built by

Hadiqa Gohar
