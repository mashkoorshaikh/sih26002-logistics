import logging
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Analytics"])


@router.get(
    "/overview",
    summary="Get high-level executive KPI overview",
    description="Returns aggregate KPI summaries tailored for logistics operators, government administrators, transport planners, or emergency management teams."
)
async def get_analytics_overview(
    time_range: str = Query("30d", regex="^(7d|30d|90d|1y)$", description="Time window for historical aggregation"),
    persona: str = Query("all", regex="^(all|logistics_operator|government_admin|transport_planner|emergency_management)$", description="Stakeholder persona focus")
):
    try:
        return analytics_service.get_overview_kpis(time_range=time_range, persona=persona)
    except Exception as e:
        logger.error(f"Error fetching analytics overview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not compute analytics overview: {str(e)}"
        )


@router.get(
    "/metrics",
    summary="Get all 7 required analytics dimensions",
    description="Returns complete structured datasets for transportation cost, route risk, travel time, fuel consumption, high-risk routes, route usage, and estimated savings."
)
async def get_all_analytics_metrics(
    time_range: str = Query("30d", regex="^(7d|30d|90d|1y)$", description="Time window")
):
    try:
        return analytics_service.get_all_metrics(time_range=time_range)
    except Exception as e:
        logger.error(f"Error fetching analytics metrics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not compute analytics metrics: {str(e)}"
        )


@router.get("/transportation-cost", summary="1. Average transportation cost metrics")
async def get_transportation_cost():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_transportation_cost_metrics()
    }


@router.get("/route-risk", summary="2. Route risk and seasonal monsoon metrics")
async def get_route_risk():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_route_risk_metrics()
    }


@router.get("/travel-time", summary="3. Travel time and mountain delay metrics")
async def get_travel_time():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_travel_time_metrics()
    }


@router.get("/fuel-consumption", summary="4. Fuel consumption and terrain surge metrics")
async def get_fuel_consumption():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_fuel_consumption_metrics()
    }


@router.get("/high-risk-routes", summary="5. Number of high-risk routes & surveillance")
async def get_high_risk_routes():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_high_risk_routes_metrics()
    }


@router.get("/route-usage", summary="6. Route usage and freight volume distribution")
async def get_route_usage():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_route_usage_metrics()
    }


@router.get("/estimated-savings", summary="7. Estimated savings via AI optimization")
async def get_estimated_savings():
    return {
        "status": "success",
        "provenance": analytics_service.data_provenance,
        "data": analytics_service._get_estimated_savings_metrics()
    }
