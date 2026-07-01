# AI Repository Analyzer

AI-powered GitHub repository analyzer using Next.js 15 + FastAPI + Google Gemini AI.

## Features

- **Code Explanation** - Understand code structure and logic
- **Bug Detection** - Find potential bugs and issues
- **README Improvement** - Generate better documentation
- **Architecture Diagram** - Visual diagram of codebase (Mermaid)
- **Documentation** - Auto-generate docs
- **Refactoring** - Code improvement suggestions
- **Security Analysis** - Find security vulnerabilities

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Python FastAPI, Google Gemini AI
- **Docker**: Dockerfiles + docker-compose

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Add your API keys
cp .env.example .env
nano .env  # Add GEMINI_API_KEY

# Start server
uvicorn main:app --reload --port 8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GITHUB_TOKEN` | GitHub Personal Access Token (optional) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/fetch-repo` | POST | Fetch GitHub repo |
| `/api/analyze` | POST | Run single AI analysis |
| `/api/analyze-stream` | POST | Run analysis with SSE streaming |
| `/api/analyze-batch` | POST | Run multiple analyses concurrently |
| `/api/cache/clear` | POST | Clear server cache |

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pip install pytest pytest-asyncio
python -m pytest tests/ -v
```

## License

MIT
