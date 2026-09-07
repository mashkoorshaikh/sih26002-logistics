"""
Route Optimization API Routes (Phase 9)
=======================================
Exposes endpoints for mathematical route scoring and multi-criteria optimization
using Google OR-Tools.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.optimizer import (
    RouteOptimizationRequest,
    RouteOptimizationResponse
)
from services.route_optimizer import route_optimizer_service

router = APIRouter(prefix="", tags=["Route Optimization (OR-Tools)"])


@router.get(
    "/weights",
    summary="Get multi-objective optimization weights and cargo modulations",
    description="Returns standard weights (distance, time, cost, risk, accessibility) and cargo-specific priority modulations."
)
async def get_optimizer_weights():
    return {
        "status": "success",
        "default_weights": route_optimizer_service.default_weights,
        "cargo_modulations": route_optimizer_service.cargo_modulations
    }


@router.post(
    "/optimize",
    response_model=RouteOptimizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimize and rank candidate routes using Google OR-Tools",
    description="Evaluates candidate routes, enforces hard vehicle restriction constraints, and solves for the route with the minimum valid score."
)
async def optimize_routes(request: RouteOptimizationRequest):
    try:
        # Convert candidate routes into dict format
        candidates_data = [r.dict() for r in request.routes]
        custom_w = request.custom_weights.dict() if request.custom_weights else None

        result = route_optimizer_service.optimize_routes(
            candidate_routes=candidates_data,
            cargo_type=request.cargo_type,
            custom_weights=custom_w
        )

        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("message", "Optimization failed")
            )

        recommended_id = result.get("recommended_route", {}).get("id") if result.get("recommended_route") else None

        return RouteOptimizationResponse(
            status="success",
            recommended_route_id=recommended_id,
            recommendation_reason=result.get("recommendation_reason", ""),
            weights_used=result.get("weights_used", {}),
            routes_scored=result.get("routes_scored", []),
            cargo_type_applied=result.get("cargo_type_applied", "standard"),
            solver_info=result.get("solver_info")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route optimization failed: {str(e)}"
        )
