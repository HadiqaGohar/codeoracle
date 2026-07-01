import httpx
import os
import asyncio
from typing import Optional

GITHUB_API = "https://api.github.com"

IGNORED_DIRS = {
    "node_modules", ".git", "__pycache__", ".next", "dist", "build",
    ".venv", "venv", ".env", ".idea", ".vscode", "coverage",
    ".cache", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".DS_Store", "Thumbs.db"
}

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
    ".ttf", ".eot", ".mp4", ".mp3", ".zip", ".tar", ".gz", ".pdf",
    ".lock", ".min.js", ".min.css"
}

MAX_FILE_SIZE = 100_000
MAX_TOTAL_CHARS = 60_000


def get_headers() -> dict:
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    return headers


def parse_repo_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    url = url.replace("https://github.com/", "").replace("http://github.com/", "")
    url = url.replace("www.github.com/", "")
    if url.endswith(".git"):
        url = url[:-4]
    parts = url.split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL. Expected format: https://github.com/owner/repo")
    return parts[0], parts[1]


def should_include_file(path: str) -> bool:
    parts = path.split("/")
    for part in parts:
        if part in IGNORED_DIRS:
            return False
    ext = "." + path.rsplit(".", 1)[-1] if "." in path else ""
    if ext.lower() in IGNORED_EXTENSIONS:
        return False
    return True


async def fetch_repo_tree(owner: str, repo: str, branch: str = "main") -> list[dict]:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}",
            params={"recursive": "1"},
            headers=get_headers()
        )
        if resp.status_code == 404:
            resp = await client.get(
                f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/master",
                params={"recursive": "1"},
                headers=get_headers()
            )
        resp.raise_for_status()
        data = resp.json()
        return [item for item in data.get("tree", []) if item["type"] == "blob"]


async def fetch_file_content(owner: str, repo: str, path: str) -> Optional[str]:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers=get_headers()
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("encoding") == "base64":
            import base64
            try:
                return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
            except Exception:
                return None
        return None


async def fetch_repo_info(owner: str, repo: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=get_headers()
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "name": data.get("name", ""),
            "full_name": data.get("full_name", ""),
            "description": data.get("description", ""),
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "language": data.get("language", ""),
            "default_branch": data.get("default_branch", "main"),
            "topics": data.get("topics", []),
            "license": data.get("license", {}).get("name", "") if data.get("license") else "",
            "created_at": data.get("created_at", ""),
            "updated_at": data.get("updated_at", ""),
        }


async def fetch_file_content_shared(client: httpx.AsyncClient, owner: str, repo: str, path: str) -> Optional[str]:
    try:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers=get_headers()
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("encoding") == "base64":
            import base64
            try:
                return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
            except Exception:
                return None
        return None
    except Exception:
        return None


async def fetch_repository(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)

    repo_info = await fetch_repo_info(owner, repo)
    branch = repo_info["default_branch"]

    tree = await fetch_repo_tree(owner, repo, branch)

    filtered_files = [
        item for item in tree
        if should_include_file(item["path"])
    ]

    filtered_files.sort(key=lambda x: x.get("size", 0), reverse=True)

    files_to_fetch = filtered_files[:30]

    semaphore = asyncio.Semaphore(10)

    async def fetch_with_semaphore(client: httpx.AsyncClient, file_item: dict) -> tuple[str, Optional[str]]:
        path = file_item["path"]
        async with semaphore:
            content = await fetch_file_content_shared(client, owner, repo, path)
            return path, content

    file_contents = {}
    total_chars = 0
    async with httpx.AsyncClient(timeout=30) as client:
        tasks = [fetch_with_semaphore(client, fi) for fi in files_to_fetch]
        results = await asyncio.gather(*tasks)
        for path, content in results:
            if content and len(content) < MAX_FILE_SIZE:
                if total_chars + len(content) > MAX_TOTAL_CHARS:
                    break
                file_contents[path] = content
                total_chars += len(content)

    file_tree = []
    for item in filtered_files:
        file_tree.append({
            "path": item["path"],
            "type": "file",
            "size": item.get("size", 0)
        })

    return {
        "repo_info": repo_info,
        "file_tree": file_tree,
        "file_contents": file_contents,
        "total_files": len(filtered_files),
        "fetched_files": len(file_contents)
    }
