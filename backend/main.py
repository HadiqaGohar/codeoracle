import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from github_fetcher import fetch_repository
from gemini_analyzer import analyze_code
from prompts import ANALYSIS_TYPES, ANALYSIS_PROMPTS

load_dotenv()

app = FastAPI(
    title="AI Repository Analyzer API",
    description="Analyze GitHub repositories using Google Gemini AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoRequest(BaseModel):
    repo_url: str


class AnalyzeRequest(BaseModel):
    repo_url: str
    analysis_type: str


@app.get("/api/health")
async def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    github_token = os.getenv("GITHUB_TOKEN", "")
    return {
        "status": "ok",
        "gemini_configured": bool(gemini_key and gemini_key != "your_gemini_api_key_here"),
        "github_configured": bool(github_token and github_token != "your_github_token_here"),
        "available_analyses": list(ANALYSIS_TYPES.keys())
    }


@app.post("/api/fetch-repo")
async def fetch_repo(request: RepoRequest):
    try:
        result = await fetch_repository(request.repo_url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch repository: {str(e)}")


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    if request.analysis_type not in ANALYSIS_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type: {request.analysis_type}. Valid types: {list(ANALYSIS_PROMPTS.keys())}"
        )

    try:
        repo_data = await fetch_repository(request.repo_url)
        result = await analyze_code(
            repo_name=repo_data["repo_info"]["full_name"],
            file_contents=repo_data["file_contents"],
            analysis_type=request.analysis_type
        )
        return {
            "result": result,
            "type": request.analysis_type,
            "type_label": ANALYSIS_TYPES[request.analysis_type],
            "repo_info": repo_data["repo_info"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
