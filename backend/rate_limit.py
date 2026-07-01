import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests: int = RATE_LIMIT_REQUESTS, window: int = RATE_LIMIT_WINDOW):
        super().__init__(app)
        self.requests = requests
        self.window = window
        self.clients: dict[str, list[float]] = defaultdict(list)

    def get_client_id(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/health"):
            return await call_next(request)

        client_id = self.get_client_id(request)
        now = time.time()

        self.clients[client_id] = [
            t for t in self.clients[client_id]
            if now - t < self.window
        ]

        if len(self.clients[client_id]) >= self.requests:
            retry_after = int(self.window - (now - self.clients[client_id][0]))
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )

        self.clients[client_id].append(now)
        response = await call_next(request)
        remaining = self.requests - len(self.clients[client_id])
        response.headers["X-RateLimit-Limit"] = str(self.requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response
