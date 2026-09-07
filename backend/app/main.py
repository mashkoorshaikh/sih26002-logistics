import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
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

# Rate Limiting & Anti-Abuse Protection
from app.core.rate_limit import InMemoryRateLimiter
app.add_middleware(InMemoryRateLimiter)

# CORS configuration: Allow all web origins (including Vercel preview and production URLs)
cors_kwargs = {
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
}
if "*" in settings.origins_list:
    cors_kwargs["allow_origin_regex"] = r"^https?://.*"
else:
    cors_kwargs["allow_origins"] = settings.origins_list

app.add_middleware(CORSMiddleware, **cors_kwargs)


from app.api.v1.routes import routing, weather, risk, cost, vehicle, cargo, optimizer, accessibility, assistant, alerts, analytics, admin

# Routers
app.include_router(api_router)
app.include_router(routing.router, prefix="/api/routes")
app.include_router(weather.router, prefix="/api/weather")
app.include_router(risk.router, prefix="/api/risk")
app.include_router(cost.router, prefix="/api/cost")
app.include_router(vehicle.router, prefix="/api/vehicles")
app.include_router(cargo.router, prefix="/api/cargo")
app.include_router(optimizer.router, prefix="/api/optimizer")
app.include_router(accessibility.router, prefix="/api/accessibility", tags=["Accessibility Intelligence"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Logistics Assistant"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Route Alerts & Monitoring"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Logistics Analytics & KPIs"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin & Government Authority"])



from fastapi import Request
from fastapi.responses import JSONResponse
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

