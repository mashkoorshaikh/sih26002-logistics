"""
FastAPI Router for Phase 12: Route Alerts & Demo Monitoring
"""

import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status

from app.schemas.alert import (
    AlertMonitorRequest,
    SimulationTriggerRequest,
    RouteAlertResponse
)
from services.alert_service import alert_service

logger = logging.getLogger("ner_logistics.alerts_router")

router = APIRouter()


@router.get("/presets", tags=["Route Alerts"])
async def get_simulation_presets():
    """
    Return available hackathon demo simulation presets (Heavy Rainfall, Landslide).
    """
    return {
        "status": "success",
        "presets": alert_service.get_simulation_presets()
    }


@router.post("/monitor", tags=["Route Alerts"])
async def monitor_route_conditions(request: AlertMonitorRequest):
    """
    Monitor relevant conditions (heavy rainfall, predicted risk, severe weather)
    and return whether risk has escalated and whether alternatives are available.
    """
    try:
        res = alert_service.monitor_route(
            source=request.source,
            destination=request.destination,
            active_route_id=request.active_route_id or "primary",
            vehicle_type=request.vehicle_type or "Truck",
            vehicle_weight=request.vehicle_weight or 10.0,
            cargo_type=request.cargo_type or "General goods",
            current_rainfall_rate=request.current_rainfall_rate,
            route_data=request.route_data
        )
        return res
    except Exception as e:
        logger.error(f"Error in monitor_route_conditions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Route monitoring evaluation failed. Please try again."
        )


@router.post("/simulate", tags=["Route Alerts"])
async def trigger_demo_simulation(request: SimulationTriggerRequest):
    """
    Demo/Simulation trigger for hackathon evaluation.
    Simulates acute events like 'heavy_rainfall' or 'landslide_closure' and demonstrates
    the route risk escalating from LOW to HIGH with safe alternatives.
    """
    try:
        res = alert_service.trigger_simulation(
            event_type=request.event_type or "heavy_rainfall",
            source=request.source or "Guwahati",
            destination=request.destination or "Shillong",
            route_data=request.route_data
        )
        return res
    except Exception as e:
        logger.error(f"Error triggering demo simulation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation trigger error: {str(e)}"
        )


@router.post("/reset", tags=["Route Alerts"])
async def reset_demo_simulation(request: Dict[str, Any] = None):
    """
    Reset simulation mode back to live baseline conditions.
    """
    source = "Guwahati"
    destination = "Shillong"
    if request:
        source = request.get("source", "Guwahati")
        destination = request.get("destination", "Shillong")

    return alert_service.reset_simulation(source=source, destination=destination)
