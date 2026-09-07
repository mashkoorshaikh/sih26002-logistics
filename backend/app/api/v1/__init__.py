from fastapi import APIRouter
from app.api.v1.routes import auth, routing, weather, risk, cost, alerts

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(routing.router, prefix="/routes")
api_router.include_router(weather.router, prefix="/weather")
api_router.include_router(risk.router, prefix="/risk")
api_router.include_router(cost.router, prefix="/cost")
api_router.include_router(alerts.router, prefix="/alerts")


