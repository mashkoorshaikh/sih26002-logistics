"""
Pydantic Schemas for Risk Prediction API
"""

from typing import Optional, Dict
from pydantic import BaseModel, Field, ConfigDict


class RiskPredictionRequest(BaseModel):
    """
    Input schema for POST /api/risk/predict.
    Validates physical parameters and operational bounds.
    """
    rainfall: float = Field(
        ...,
        ge=0.0,
        le=500.0,
        description="Hourly precipitation rate in mm/h (must be >= 0)"
    )
    slope: float = Field(
        ...,
        ge=0.0,
        le=90.0,
        description="Road slope / incline in degrees (0 to 90)"
    )
    road_quality: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Road surface quality rating (1.0 = severely damaged/broken, 5.0 = pristine)"
    )
    visibility: float = Field(
        ...,
        ge=0.0,
        le=50.0,
        description="Atmospheric visibility in kilometers (must be >= 0)"
    )
    traffic: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Traffic index (0.0 - 1.0 or 0 - 100%)"
    )
    historical_incidents: int = Field(
        ...,
        ge=0,
        le=100,
        description="Historical incident count along corridor segment (must be >= 0)"
    )
    elevation: float = Field(
        ...,
        ge=-500.0,
        le=9000.0,
        description="Elevation in meters (-500 to 9000)"
    )
    temperature: float = Field(
        ...,
        ge=-60.0,
        le=60.0,
        description="Ambient temperature in Celsius (-60 to 60)"
    )
    wind_speed: float = Field(
        ...,
        ge=0.0,
        le=300.0,
        description="Wind speed in km/h (must be >= 0)"
    )
    road_type: Optional[str] = Field(
        default="national_highway",
        description="Optional road classification: 'national_highway', 'state_highway', 'rural_hill_road'"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "rainfall": 100,
                "slope": 30,
                "road_quality": 2,
                "visibility": 4,
                "traffic": 60,
                "historical_incidents": 5,
                "elevation": 1200,
                "temperature": 22,
                "wind_speed": 15
            }
        }
    )


class RiskPredictionResponse(BaseModel):
    """
    Response schema for POST /api/risk/predict.
    """
    risk: str = Field(..., description="Predicted risk category: 'LOW', 'MEDIUM', 'HIGH'")
    confidence: float = Field(..., description="Model prediction confidence score (0.0 to 1.0)")
    estimated_risk_score: Optional[float] = Field(default=None, description="Continuous risk gauge (0 to 100)")
    class_probabilities: Optional[Dict[str, float]] = Field(default=None, description="Per-class probability distribution")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "risk": "HIGH",
                "confidence": 0.89
            }
        }
    )
