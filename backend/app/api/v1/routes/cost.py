"""
Cost Calculation API Routes
===========================
Exposes endpoints to estimate fuel required and fuel cost for any route,
and inspect the vehicle configuration system.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.cost import CostCalculationRequest, CostCalculationResponse
from services.cost_service import cost_service

router = APIRouter(prefix="", tags=["Logistics Cost Calculation"])


@router.post(
    "/calculate",
    response_model=CostCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate fuel consumption and estimated fuel cost",
    description="Estimates fuel_required (Liters) and fuel_cost (INR) based on distance, vehicle type configuration, mileage (km/l), and fuel price."
)
async def calculate_cost(request: CostCalculationRequest):
    try:
        result = cost_service.calculate_fuel_cost(
            distance=request.distance,
            vehicle_type=request.vehicle_type,
            vehicle_mileage=request.vehicle_mileage,
            fuel_price=request.fuel_price
        )
        return CostCalculationResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fuel cost estimation failed: {str(e)}"
        )


@router.get(
    "/vehicles",
    summary="Get vehicle configuration presets and default mileages",
    description="Returns pre-calibrated vehicle profiles (Truck, Mini truck, Car, Trailer, Tanker) with mileages, fuel types, and regional fuel prices."
)
async def get_vehicle_configs():
    return {
        "status": "success",
        "vehicles": cost_service.get_vehicle_configs()
    }
