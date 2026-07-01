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


async def fetch_repo_timeline(owner: str, repo: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        commit_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/stats/commit_activity",
            headers=get_headers()
        )
        commit_activity = commit_resp.json() if commit_resp.status_code == 200 else []

        contrib_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/stats/contributors",
            headers=get_headers()
        )
        contributors = []
        if contrib_resp.status_code == 200:
            raw_contribs = contrib_resp.json()
            if isinstance(raw_contribs, list):
                for c in raw_contribs[:15]:
                    contributors.append({
                        "login": c.get("author", {}).get("login", ""),
                        "avatar_url": c.get("author", {}).get("avatar_url", ""),
                        "total_commits": c.get("total", 0),
                        "weekly_commits": [w.get("c", 0) for w in c.get("weeks", [])[-12:]],
                    })

        participation_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/stats/participation",
            headers=get_headers()
        )
        participation = {}
        if participation_resp.status_code == 200:
            p_data = participation_resp.json()
            if "all" in p_data:
                participation = {
                    "weekly_all": p_data["all"][-12:],
                    "weekly_owner": p_data.get("owner", [])[-12:],
                }

        code_freq_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/stats/code_frequency",
            headers=get_headers()
        )
        code_frequency = []
        if code_freq_resp.status_code == 200:
            raw_freq = code_freq_resp.json()
            if isinstance(raw_freq, list):
                code_frequency = [{"week": f[0], "additions": f[1], "deletions": f[2]} for f in raw_freq[-12:]]

        return {
            "commit_activity": commit_activity[-52:] if isinstance(commit_activity, list) else [],
            "contributors": contributors,
            "participation": participation,
            "code_frequency": code_frequency,
        }


def calculate_bus_factor(contributors: list) -> dict:
    if not contributors:
        return {"bus_factor": 0, "risk_level": "unknown", "top_contributors": []}

    total_commits = sum(c["total_commits"] for c in contributors)
    if total_commits == 0:
        return {"bus_factor": 0, "risk_level": "unknown", "top_contributors": []}

    bus_factor = 0
    cumulative = 0
    for c in contributors:
        cumulative += c["total_commits"]
        bus_factor += 1
        if cumulative >= total_commits * 0.5:
            break

    if bus_factor <= 1:
        risk = "critical"
    elif bus_factor <= 2:
        risk = "high"
    elif bus_factor <= 3:
        risk = "medium"
    else:
        risk = "low"

    top = []
    for c in contributors[:5]:
        percentage = round(c["total_commits"] / total_commits * 100, 1) if total_commits > 0 else 0
        top.append({
            "login": c["login"],
            "avatar_url": c["avatar_url"],
            "total_commits": c["total_commits"],
            "percentage": percentage,
        })

    return {
        "bus_factor": bus_factor,
        "risk_level": risk,
        "total_commits": total_commits,
        "total_contributors": len(contributors),
        "top_contributors": top,
    }


async def fetch_repo_timeline_data(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)
    return await fetch_repo_timeline(owner, repo)
