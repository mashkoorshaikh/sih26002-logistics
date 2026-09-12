from fastapi import APIRouter
from app.api.v1.routes import (
    auth, routing, weather, risk, cost, alerts,
    vehicle, cargo, optimizer, accessibility,
    assistant, analytics, admin,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(routing.router, prefix="/routes")
api_router.include_router(weather.router, prefix="/weather")
api_router.include_router(risk.router, prefix="/risk")
api_router.include_router(cost.router, prefix="/cost")
api_router.include_router(alerts.router, prefix="/alerts")
api_router.include_router(vehicle.router, prefix="/vehicles")
api_router.include_router(cargo.router, prefix="/cargo")
api_router.include_router(optimizer.router, prefix="/optimizer")
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["Accessibility Intelligence"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Logistics Assistant"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Logistics Analytics & KPIs"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Government Authority"])
