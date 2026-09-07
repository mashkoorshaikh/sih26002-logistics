import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.route import RouteCalculateRequest, RouteResponse
from services.map_service import map_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Routing"])


@router.post(
    "/calculate",
    response_model=RouteResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate route between source and destination"
)
async def calculate_route(request: RouteCalculateRequest):
    """
    Calculate logistics route considering vehicle weight, cargo load, and NER terrain.
    Returns route distance, duration, GeoJSON line geometry, and alternative routes.
    """
    try:
        result = await map_service.calculate_route(
            source=request.source,
            destination=request.destination,
            vehicle_type=request.vehicle_type,
            vehicle_weight=request.vehicle_weight,
            cargo_type=request.cargo_type,
            cargo_weight=request.cargo_weight,
            vehicle_height=request.vehicle_height,
            vehicle_width=request.vehicle_width,
            vehicle_length=request.vehicle_length,
            vehicle_weight_kg=request.vehicle_weight_kg,
            fuel_price=request.fuel_price,
        )
        return result
    except ValueError as ve:
        logger.warning(f"Validation/Geocoding error in calculate_route: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error calculating route: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while computing the route. Please verify waypoint coordinates or try again."
        )
