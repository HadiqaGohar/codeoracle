import os
import hashlib
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List

from github_fetcher import fetch_repository, fetch_repo_timeline_data
from gemini_analyzer import analyze_code
from prompts import ANALYSIS_TYPES, ANALYSIS_PROMPTS
from cache import get_cache, set_cache, clear_cache, cache_key
from rate_limit import RateLimitMiddleware

load_dotenv()

app = FastAPI(
    title="AI Repository Analyzer API",
    description="Analyze GitHub repositories using AI via OpenRouter",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


class BatchAnalyzeRequest(BaseModel):
    repo_url: str
    analysis_types: List[str]


class ChatRequest(BaseModel):
    repo_url: str
    message: str
    history: List[dict] = []


class MigrationRequest(BaseModel):
    repo_url: str
    target_framework: str


class WebhookRequest(BaseModel):
    webhook_url: str
    repo_url: str
    analysis_type: str = "full"


class APIKeyRequest(BaseModel):
    owner: str


class WorkspaceRequest(BaseModel):
    name: str
    owner: str


class WorkspaceMemberRequest(BaseModel):
    workspace_id: str
    member: str


class WorkspaceAnalysisRequest(BaseModel):
    workspace_id: str
    repo_url: str
    analysis_type: str
    result: str
    author: str


def make_repo_key(repo_url: str) -> str:
    normalized = repo_url.strip().lower().rstrip("/")
    return cache_key("repo", hashlib.md5(normalized.encode()).hexdigest())


def make_analysis_key(repo_url: str, analysis_type: str) -> str:
    normalized = repo_url.strip().lower().rstrip("/")
    return cache_key("analysis", hashlib.md5(normalized.encode()).hexdigest(), analysis_type)


@app.get("/api/health")
async def health_check():
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    github_token = os.getenv("GITHUB_TOKEN", "")
    model_name = os.getenv("MODEL_NAME", "google/gemini-2.5-flash-preview")
    return {
        "status": "ok",
        "version": "1.3.0",
        "ai_configured": bool(openrouter_key),
        "model": model_name,
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


@app.post("/api/analyze-batch")
async def analyze_batch(request: BatchAnalyzeRequest):
    invalid = [t for t in request.analysis_types if t not in ANALYSIS_PROMPTS]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis types: {invalid}. Valid types: {list(ANALYSIS_PROMPTS.keys())}"
        )

    try:
        repo_key = make_repo_key(request.repo_url)
        repo_data = get_cache(repo_key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(repo_key, repo_data)

        async def run_one(analysis_type: str):
            a_key = make_analysis_key(request.repo_url, analysis_type)
            cached = get_cache(a_key)
            if cached:
                return cached

            result = await analyze_code(
                repo_name=repo_data["repo_info"]["full_name"],
                file_contents=repo_data["file_contents"],
                analysis_type=analysis_type
            )
            response = {
                "result": result,
                "type": analysis_type,
                "type_label": ANALYSIS_TYPES[analysis_type],
            }
            set_cache(a_key, response)
            return response

        CONCURRENCY = 3
        results = []
        for i in range(0, len(request.analysis_types), CONCURRENCY):
            batch = request.analysis_types[i:i + CONCURRENCY]
            batch_results = await asyncio.gather(*[run_one(t) for t in batch])
            results.extend(batch_results)

        return {
            "repo_info": repo_data["repo_info"],
            "results": results,
            "total": len(results),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")


@app.post("/api/analyze-stream")
async def analyze_stream(request: AnalyzeRequest):
    if request.analysis_type not in ANALYSIS_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type: {request.analysis_type}"
        )

    async def event_generator():
        import json

        repo_key = make_repo_key(request.repo_url)
        repo_data = get_cache(repo_key)
        if not repo_data:
            yield f"data: {json.dumps({'status': 'fetching_repo'})}\n\n"
            repo_data = await fetch_repository(request.repo_url)
            set_cache(repo_key, repo_data)

        yield f"data: {json.dumps({'status': 'analyzing', 'repo': repo_data['repo_info']['full_name']})}\n\n"

        from gemini_analyzer import get_openrouter_client, get_litellm_client, build_prompt, MODEL_NAME, LITELLM_MODEL, LITELLM_API_KEY
        from prompts import ANALYSIS_PROMPTS as prompts

        prompt = build_prompt(
            repo_data["repo_info"]["full_name"],
            repo_data["file_contents"],
            request.analysis_type
        )

        try:
            client = get_openrouter_client()
            stream = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=4096,
                stream=True,
            )
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'chunk': chunk.choices[0].delta.content})}\n\n"
            yield f"data: {json.dumps({'status': 'done'})}\n\n"
        except Exception as e:
            err_str = str(e).lower()
            if LITELLM_API_KEY and ("402" in err_str or "429" in err_str or "tokens" in err_str or "limit" in err_str or "quota" in err_str):
                try:
                    client = get_litellm_client()
                    stream = await client.chat.completions.create(
                        model=LITELLM_MODEL,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.3,
                        max_tokens=4096,
                        stream=True,
                    )
                    async for chunk in stream:
                        if chunk.choices and chunk.choices[0].delta.content:
                            yield f"data: {json.dumps({'chunk': chunk.choices[0].delta.content})}\n\n"
                    yield f"data: {json.dumps({'status': 'done'})}\n\n"
                except Exception as e2:
                    yield f"data: {json.dumps({'error': str(e2)})}\n\n"
            else:
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


@app.post("/api/complexity")
async def complexity_analysis(request: RepoRequest):
    try:
        key = make_repo_key(request.repo_url)
        repo_data = get_cache(key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(key, repo_data)

        from complexity_scorer import analyze_repo_complexity
        result = analyze_repo_complexity(repo_data["file_contents"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Complexity analysis failed: {str(e)}")


@app.post("/api/chat")
async def chat_with_repo(request: ChatRequest):
    try:
        key = make_repo_key(request.repo_url)
        repo_data = get_cache(key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(key, repo_data)

        file_contents = repo_data["file_contents"]
        repo_name = repo_data["repo_info"]["full_name"]

        formatted_files = []
        for path, content in file_contents.items():
            if isinstance(content, str):
                formatted_files.append(f"\n--- FILE: {path} ---\n{content[:3000]}\n--- END FILE ---\n")
        files_text = "\n".join(formatted_files[:30])

        system_prompt = f"""You are CodeOracle AI, an expert code assistant. You have access to the repository "{repo_name}".

Here are the repository files:
{files_text}

Answer the user's questions about this codebase accurately. Reference specific files and line numbers when possible. Be concise and helpful."""

        messages = [{"role": "system", "content": system_prompt}]
        for msg in request.history[-10:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": request.message})

        from gemini_analyzer import get_openrouter_client, MODEL_NAME
        client = get_openrouter_client()
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.3,
            max_tokens=2048,
        )

        reply = response.choices[0].message.content if response.choices and response.choices[0].message.content else "No response generated."
        return {"response": reply}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/api/timeline")
async def repo_timeline(request: RepoRequest):
    try:
        result = await fetch_repo_timeline_data(request.repo_url)
        from github_fetcher import calculate_bus_factor
        result["bus_factor"] = calculate_bus_factor(result.get("contributors", []))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline fetch failed: {str(e)}")


@app.post("/api/migrate")
async def migrate_code(request: MigrationRequest):
    try:
        key = make_repo_key(request.repo_url)
        repo_data = get_cache(key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(key, repo_data)

        from gemini_analyzer import build_prompt, call_openrouter
        from prompts import ANALYSIS_PROMPTS

        formatted_files = []
        for path, content in repo_data["file_contents"].items():
            if isinstance(content, str):
                formatted_files.append(f"\n--- FILE: {path} ---\n{content}\n--- END FILE ---\n")
        files_text = "\n".join(formatted_files)

        prompt = ANALYSIS_PROMPTS["migration"].format(
            repo_name=repo_data["repo_info"]["full_name"],
            file_contents=files_text,
            target_framework=request.target_framework,
        )

        result = await call_openrouter(prompt)
        return {"result": result, "target_framework": request.target_framework}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Migration analysis failed: {str(e)}")


@app.post("/api/test-gaps")
async def test_coverage_gaps(request: RepoRequest):
    try:
        key = make_repo_key(request.repo_url)
        repo_data = get_cache(key)
        if not repo_data:
            repo_data = await fetch_repository(request.repo_url)
            set_cache(key, repo_data)

        from gemini_analyzer import call_openrouter
        from prompts import ANALYSIS_PROMPTS

        formatted_files = []
        for path, content in repo_data["file_contents"].items():
            if isinstance(content, str):
                formatted_files.append(f"\n--- FILE: {path} ---\n{content}\n--- END FILE ---\n")
        files_text = "\n".join(formatted_files)

        prompt = ANALYSIS_PROMPTS["test_gaps"].format(
            repo_name=repo_data["repo_info"]["full_name"],
            file_contents=files_text,
        )

        result = await call_openrouter(prompt)
        return {"result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test gap analysis failed: {str(e)}")


@app.post("/api/webhook/register")
async def register_webhook(request: WebhookRequest):
    try:
        from webhooks import send_webhook
        await send_webhook(request.webhook_url, request.repo_url, "Test")
        return {"status": "ok", "message": "Webhook registered and test notification sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook registration failed: {str(e)}")


@app.post("/api/api-keys/generate")
async def generate_key(request: APIKeyRequest):
    from api_keys import generate_api_key
    key = generate_api_key(request.owner)
    return {"api_key": key, "owner": request.owner}


@app.get("/api/api-keys/stats/{key}")
async def key_stats(key: str):
    from api_keys import get_api_stats
    stats = get_api_stats(key)
    if not stats:
        raise HTTPException(status_code=404, detail="API key not found")
    return stats


@app.post("/api/workspaces/create")
async def create_ws(request: WorkspaceRequest):
    from workspaces import create_workspace
    ws = create_workspace(request.name, request.owner)
    return ws


@app.get("/api/workspaces/{owner}")
async def list_ws(owner: str):
    from workspaces import list_workspaces
    return list_workspaces(owner)


@app.get("/api/workspaces/{ws_id}/analyses")
async def ws_analyses(ws_id: str):
    from workspaces import get_analyses
    analyses = get_analyses(ws_id)
    if not analyses:
        raise HTTPException(status_code=404, detail="Workspace not found or empty")
    return {"analyses": analyses}


@app.post("/api/workspaces/add-member")
async def ws_add_member(request: WorkspaceMemberRequest):
    from workspaces import add_member
    ok = add_member(request.workspace_id, request.member)
    if not ok:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {"status": "ok"}


@app.post("/api/cache/clear")
async def clear_cache_endpoint():
    count = clear_cache()
    return {"cleared": count}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
