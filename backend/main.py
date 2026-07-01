import os
import hashlib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from github_fetcher import fetch_repository
from gemini_analyzer import analyze_code
from prompts import ANALYSIS_TYPES, ANALYSIS_PROMPTS
from cache import get_cache, set_cache, clear_cache, cache_key
from rate_limit import RateLimitMiddleware

load_dotenv()

app = FastAPI(
    title="AI Repository Analyzer API",
    description="Analyze GitHub repositories using Google Gemini AI",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware, requests=30, window=60)


class RepoRequest(BaseModel):
    repo_url: str


class AnalyzeRequest(BaseModel):
    repo_url: str
    analysis_type: str


def make_repo_key(repo_url: str) -> str:
    normalized = repo_url.strip().lower().rstrip("/")
    return cache_key("repo", hashlib.md5(normalized.encode()).hexdigest())


def make_analysis_key(repo_url: str, analysis_type: str) -> str:
    normalized = repo_url.strip().lower().rstrip("/")
    return cache_key("analysis", hashlib.md5(normalized.encode()).hexdigest(), analysis_type)


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
        key = make_repo_key(request.repo_url)
        cached = get_cache(key)
        if cached:
            return cached

        result = await fetch_repository(request.repo_url)
        set_cache(key, result)
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
        a_key = make_analysis_key(request.repo_url, request.analysis_type)
        cached = get_cache(a_key)
        if cached:
            return cached

        repo_key = make_repo_key(request.repo_url)
        repo_data = get_cache(repo_key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(repo_key, repo_data)

        result = await analyze_code(
            repo_name=repo_data["repo_info"]["full_name"],
            file_contents=repo_data["file_contents"],
            analysis_type=request.analysis_type
        )
        response = {
            "result": result,
            "type": request.analysis_type,
            "type_label": ANALYSIS_TYPES[request.analysis_type],
            "repo_info": repo_data["repo_info"]
        }
        set_cache(a_key, response)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/analyze-stream")
async def analyze_stream(request: AnalyzeRequest):
    if request.analysis_type not in ANALYSIS_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type: {request.analysis_type}"
        )

    async def event_generator():
        import asyncio
        import json

        repo_key = make_repo_key(request.repo_url)
        repo_data = get_cache(repo_key)
        if not repo_data:
            yield f"data: {json.dumps({'status': 'fetching_repo'})}\n\n"
            repo_data = await fetch_repository(request.repo_url)
            set_cache(repo_key, repo_data)

        yield f"data: {json.dumps({'status': 'analyzing', 'repo': repo_data['repo_info']['full_name']})}\n\n"

        from gemini_analyzer import configure_gemini, format_file_contents
        from prompts import ANALYSIS_PROMPTS as prompts
        import google.generativeai as genai

        configure_gemini()
        prompt_template = prompts[request.analysis_type]
        formatted_files = format_file_contents(repo_data["file_contents"])
        readme_content = repo_data["file_contents"].get("README.md", "No README found.")

        if request.analysis_type == "readme_improve":
            prompt = prompt_template.format(
                repo_name=repo_data["repo_info"]["full_name"],
                readme_content=readme_content,
                file_contents=formatted_files
            )
        else:
            prompt = prompt_template.format(
                repo_name=repo_data["repo_info"]["full_name"],
                file_contents=formatted_files
            )

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config=genai.GenerationConfig(temperature=0.3, max_output_tokens=8192)
        )

        try:
            async for chunk in model.generate_content_async(prompt, stream=True):
                if chunk.text:
                    yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
            yield f"data: {json.dumps({'status': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.post("/api/cache/clear")
async def clear_cache_endpoint():
    count = clear_cache()
    return {"cleared": count}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
