"""
Vehicle and Route Suitability API Routes (Phase 7)
==================================================
Exposes endpoints for vehicle profiles, road & bridge restrictions,
and vehicle-aware route suitability evaluations.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.vehicle import (
    VehicleSuitabilityRequest,
    VehicleSuitabilityResponse
)
from services.vehicle_service import vehicle_service

router = APIRouter(prefix="", tags=["Vehicle-Aware Routing"])


@router.get(
    "/profiles",
    summary="Get standard vehicle profiles and physical dimensions",
    description="Returns pre-calibrated vehicle profiles including gross weight (kg), height (m), width (m), length (m), and category."
)
async def get_vehicle_profiles():
    return {
        "status": "success",
        "profiles": vehicle_service.get_vehicle_profiles()
    }


@router.get(
    "/restrictions",
    summary="Get demo road restrictions and bridge weight limits",
    description="Returns active demo physical restrictions (bridges, tunnels, hairpins) in the NER corridor. All entries marked is_demo_data = True."
)
async def get_road_restrictions():
    return {
        "status": "success",
        "is_demo_data": True,
        "disclaimer": "Demo road restriction dataset for evaluation purposes. Never used as verified real-world restrictions.",
        "restrictions": vehicle_service.restrictions
    }


@router.post(
    "/check-suitability",
    response_model=VehicleSuitabilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Check vehicle suitability for a route or corridor",
    description="Evaluates whether a vehicle's dimensions (weight, height, width, length) satisfy bridge weight limits and road geometry constraints."
)
async def check_vehicle_suitability(request: VehicleSuitabilityRequest):
    try:
        result = vehicle_service.evaluate_route_suitability(
            vehicle_specs={
                "vehicle_type": request.vehicle_type,
                "weight": request.weight,
                "height": request.height,
                "width": request.width,
                "length": request.length
            },
            route_id=request.route_id,
            source=request.source,
            destination=request.destination,
            route_name=request.route_name
        )
        return VehicleSuitabilityResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Suitability evaluation failed: {str(e)}"
        )
