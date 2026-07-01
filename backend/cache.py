import time
from typing import Any, Optional

_cache: dict[str, tuple[float, Any]] = {}
DEFAULT_TTL = 3600


def get_cache(key: str, ttl: int = DEFAULT_TTL) -> Optional[Any]:
    if key in _cache:
        stored_time, value = _cache[key]
        if time.time() - stored_time < ttl:
            return value
        else:
            del _cache[key]
    return None


def set_cache(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


def clear_cache() -> int:
    count = len(_cache)
    _cache.clear()
    return count


def cache_key(*parts: str) -> str:
    return ":".join(parts)
