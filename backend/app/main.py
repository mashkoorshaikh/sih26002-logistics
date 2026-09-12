import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router

# Import all models so SQLAlchemy knows about them before create_all
from app.models import user  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (graceful — won't crash if DB unreachable)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] Database tables created/verified")
    except Exception as e:
        print(f"[WARN] Could not connect to database at startup: {e}")
        print("       The server will still start — check your DATABASE_URL in .env")
    yield
    # Dispose engine on shutdown
    await engine.dispose()



app = FastAPI(
    title="NER Logistics Platform API",
    description="AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — single unified middleware (no duplicate custom handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting & Anti-Abuse Protection
from app.core.rate_limit import InMemoryRateLimiter
app.add_middleware(InMemoryRateLimiter)




# Routers — all routes served under /api/v1/* via the unified api_router
app.include_router(api_router)


from sqlalchemy import text
import logging

logging.basicConfig(
    level=logging.INFO if settings.is_production() else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ner_logistics.api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "detail": "An internal server error occurred. Please contact the administrator if this persists."
        }
    )

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "service": "NER Logistics Platform API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if not settings.is_production() else "disabled_in_prod"
    }


@app.get("/health", tags=["Health"])
async def health():
    db_status = "unknown"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        db_status = f"degraded: {str(e)[:50]}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT
    }

