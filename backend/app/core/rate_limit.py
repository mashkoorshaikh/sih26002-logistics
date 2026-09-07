"""
In-Memory Rate Limiting Middleware for FastAPI
==============================================
Provides sliding-window rate limiting per client IP address without external dependencies.
Protects against brute-force attacks, API abuse, and DoS on expensive endpoints.
"""

import time
import asyncio
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitConfig:
    # Path prefix -> (max_requests, window_seconds)
    ROUTE_LIMITS: List[Tuple[str, int, int]] = [
        # Strict limits for authentication routes (prevent credential brute-forcing)
        ("/auth/login", 10, 60),
        ("/auth/register", 10, 60),
        ("/api/v1/auth/login", 10, 60),
        ("/api/v1/auth/register", 10, 60),
        # Limits for AI assistant (protect OpenAI token usage & resource exhaustion)
        ("/api/assistant", 25, 60),
        # Limits for computationally heavy routing optimization
        ("/api/routes/calculate", 60, 60),
        ("/api/optimizer", 60, 60),
        # General API default limit
        ("/api", 150, 60),
    ]
    DEFAULT_LIMIT = (200, 60)  # 200 requests per minute


class InMemoryRateLimiter(BaseHTTPMiddleware):
    """
    Middleware that tracks request timestamps per client IP and path category.
    Cleans up expired entries periodically to prevent memory leaks.
    """

    def __init__(self, app):
        super().__init__(app)
        # key: (client_ip, path_prefix) -> list of timestamp floats
        self._records: Dict[Tuple[str, str], List[float]] = defaultdict(list)
        self._lock = asyncio.Lock()
        self._last_cleanup = time.time()

    def _get_client_ip(self, request: Request) -> str:
        # Check standard reverse proxy headers
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "127.0.0.1"

    def _get_limit_for_path(self, path: str) -> Tuple[str, int, int]:
        for prefix, max_reqs, window in RateLimitConfig.ROUTE_LIMITS:
            if path.startswith(prefix):
                return prefix, max_reqs, window
        return "default", RateLimitConfig.DEFAULT_LIMIT[0], RateLimitConfig.DEFAULT_LIMIT[1]

    async def _cleanup_old_records(self, now: float):
        # Run cleanup at most once every 60 seconds
        if now - self._last_cleanup < 60:
            return
        self._last_cleanup = now
        stale_keys = []
        for key, timestamps in self._records.items():
            valid = [ts for ts in timestamps if now - ts < 120]
            if not valid:
                stale_keys.append(key)
            else:
                self._records[key] = valid
        for k in stale_keys:
            del self._records[k]

    async def dispatch(self, request: Request, call_next) -> Response:
        # Bypass health check endpoints and OPTIONS pre-flight
        if request.method == "OPTIONS" or request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        path = request.url.path
        prefix, max_reqs, window = self._get_limit_for_path(path)
        key = (client_ip, prefix)
        now = time.time()

        async with self._lock:
            await self._cleanup_old_records(now)

            # Filter timestamps within current window
            window_start = now - window
            self._records[key] = [ts for ts in self._records[key] if ts > window_start]

            if len(self._records[key]) >= max_reqs:
                oldest_in_window = self._records[key][0]
                retry_after = max(1, int(window - (now - oldest_in_window)))
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "status": "error",
                        "code": "RATE_LIMIT_EXCEEDED",
                        "detail": "Too many requests. Rate limit exceeded for this endpoint.",
                        "retry_after_seconds": retry_after
                    },
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(max_reqs),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(int(oldest_in_window + window))
                    }
                )

            # Record this request
            self._records[key].append(now)
            remaining = max_reqs - len(self._records[key])

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_reqs)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response
