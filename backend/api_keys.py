import os
import hashlib
import time
from typing import Optional

_api_keys: dict[str, dict] = {}


def generate_api_key(owner: str) -> str:
    raw = f"co_{owner}_{time.time()}"
    key = "co_" + hashlib.sha256(raw.encode()).hexdigest()[:32]
    _api_keys[key] = {
        "owner": owner,
        "created_at": time.time(),
        "requests": 0,
        "last_used": None,
    }
    return key


def validate_api_key(key: str) -> Optional[dict]:
    if not key or not key.startswith("co_"):
        return None
    return _api_keys.get(key)


def track_api_usage(key: str):
    if key in _api_keys:
        _api_keys[key]["requests"] += 1
        _api_keys[key]["last_used"] = time.time()


def get_api_stats(key: str) -> Optional[dict]:
    info = _api_keys.get(key)
    if not info:
        return None
    return {
        "owner": info["owner"],
        "created_at": info["created_at"],
        "total_requests": info["requests"],
        "last_used": info["last_used"],
    }
