"""
Pydantic Schemas for Cargo Profiles & Multi-Objective Optimization (Phase 8)
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class CargoProfile(BaseModel):
    cargo_type: str
    display_name: str
    description: str
    priority_summary: str
    weights: Dict[str, float]
    max_delay_tolerance_hours: Optional[float] = None
    target_temperature_c: Optional[float] = None
    critical_emergency: Optional[bool] = None


class CargoEvaluationRequest(BaseModel):
    cargo_type: str = Field("Medicine", description="Cargo type (Medicine, Perishable goods, Heavy equipment, Vegetables, Fruits, General goods)")
    duration_hours: float = Field(..., ge=0.1, description="Route duration in hours")
    risk_score: float = Field(default=25.0, ge=0.0, le=100.0, description="Route AI terrain risk score (0-100)")
    fuel_cost: float = Field(default=1500.0, ge=1.0, description="Estimated fuel cost in INR")
    is_suitable: bool = Field(default=True, description="Vehicle physical suitability (bridges/clearance)")
    road_quality_score: Optional[float] = Field(85.0, ge=0.0, le=100.0, description="Pavement quality score")
    hospital_access_score: Optional[float] = Field(90.0, ge=0.0, le=100.0, description="Emergency hospital access score")


class CargoSubscores(BaseModel):
    travel_time: float
    risk_safety: float
    fuel_cost: float
    structural_safety: float
    road_quality: float
    hospital_access: float


class CargoEvaluationResponse(BaseModel):
    composite_score: float
    cargo_type: str
    display_name: str
    priority_summary: str
    subscores: CargoSubscores
    weights_applied: Dict[str, float]
    justification: Optional[str] = None
