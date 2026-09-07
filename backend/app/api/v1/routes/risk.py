"""
Risk Prediction API Routes
==========================
Exposes POST /api/risk/predict for single-point or corridor segment ML risk evaluation.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.risk import RiskPredictionRequest, RiskPredictionResponse
from services.risk_service import risk_service

router = APIRouter(prefix="", tags=["Risk Prediction"])


@router.post(
    "/predict",
    response_model=RiskPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict route segment risk using trained Random Forest model",
    description="Evaluates physical weather, terrain slope, road quality, and traffic inputs to output risk classification ('LOW', 'MEDIUM', 'HIGH') and model confidence."
)
async def predict_risk(request: RiskPredictionRequest):
    try:
        result = risk_service.predict(
            rainfall=request.rainfall,
            slope=request.slope,
            road_quality=request.road_quality,
            visibility=request.visibility,
            traffic=request.traffic,
            historical_incidents=request.historical_incidents,
            elevation=request.elevation,
            temperature=request.temperature,
            wind_speed=request.wind_speed,
            road_type=request.road_type or "national_highway"
        )
        return RiskPredictionResponse(
            risk=result["risk"],
            confidence=result["confidence"],
            estimated_risk_score=result.get("estimated_risk_score"),
            class_probabilities=result.get("class_probabilities")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk prediction evaluation failed: {str(e)}"
        )
