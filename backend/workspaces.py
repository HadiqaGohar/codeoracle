import time
import hashlib

_workspaces: dict[str, dict] = {}


def create_workspace(name: str, owner: str) -> dict:
    ws_id = hashlib.md5(f"{name}_{time.time()}".encode()).hexdigest()[:12]
    _workspaces[ws_id] = {
        "id": ws_id,
        "name": name,
        "owner": owner,
        "members": [owner],
        "analyses": [],
        "created_at": time.time(),
    }
    return _workspaces[ws_id]


def get_workspace(ws_id: str) -> dict | None:
    return _workspaces.get(ws_id)


def list_workspaces(owner: str) -> list[dict]:
    return [ws for ws in _workspaces.values() if owner in ws["members"]]


def add_member(ws_id: str, user: str) -> bool:
    ws = _workspaces.get(ws_id)
    if not ws:
        return False
    if user not in ws["members"]:
        ws["members"].append(user)
    return True


def add_analysis(ws_id: str, repo_url: str, analysis_type: str, result: str, author: str) -> bool:
    ws = _workspaces.get(ws_id)
    if not ws:
        return False
    ws["analyses"].append({
        "repo_url": repo_url,
        "analysis_type": analysis_type,
        "result": result,
        "author": author,
        "timestamp": time.time(),
    })
    return True


def get_analyses(ws_id: str) -> list[dict]:
    ws = _workspaces.get(ws_id)
    if not ws:
        return []
    return ws["analyses"]
