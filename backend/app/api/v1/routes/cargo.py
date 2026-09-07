"""
Cargo Profiles & Optimization API Routes (Phase 8)
==================================================
Exposes endpoints for configurable cargo profiles, priority weights,
and multi-objective route evaluation.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.schemas.cargo import CargoEvaluationRequest, CargoEvaluationResponse
from services.optimization_weights import optimization_weights_service

router = APIRouter(prefix="", tags=["Cargo-Aware Routing"])


@router.get(
    "/profiles",
    summary="Get all configurable cargo profiles and priority weights",
    description="Returns pre-calibrated cargo profiles (Perishable goods, Medicine, Heavy equipment, Vegetables, Fruits, General goods) and multi-objective optimization weights."
)
async def get_cargo_profiles():
    return {
        "status": "success",
        "profiles": optimization_weights_service.get_cargo_profiles()
    }


@router.get(
    "/weights/{cargo_type}",
    summary="Get priority weights for a specific cargo type"
)
async def get_cargo_weights(cargo_type: str):
    try:
        weights = optimization_weights_service.get_cargo_weights(cargo_type)
        return {
            "status": "success",
            "cargo_type": cargo_type,
            "weights": weights
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cargo profile not found: {str(e)}"
        )


@router.post(
    "/evaluate",
    response_model=CargoEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate route metrics against cargo priorities",
    description="Calculates composite optimization score (0-100) and subscores based on cargo-specific trade-offs."
)
async def evaluate_cargo_route(request: CargoEvaluationRequest):
    try:
        result = optimization_weights_service.score_route_for_cargo(
            cargo_type=request.cargo_type,
            route_metrics={
                "duration_hours": request.duration_hours,
                "risk_score": request.risk_score,
                "fuel_cost": request.fuel_cost,
                "is_suitable": request.is_suitable,
                "road_quality_score": request.road_quality_score,
                "hospital_access_score": request.hospital_access_score
            }
        )
        return CargoEvaluationResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cargo route evaluation failed: {str(e)}"
        )
