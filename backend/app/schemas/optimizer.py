"""
Pydantic Schemas for AI-Assisted Route Optimization (Phase 9)
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class OptimizerWeights(BaseModel):
    distance_weight: float = Field(0.15, ge=0.0, le=1.0)
    time_weight: float = Field(0.25, ge=0.0, le=1.0)
    cost_weight: float = Field(0.20, ge=0.0, le=1.0)
    risk_weight: float = Field(0.25, ge=0.0, le=1.0)
    accessibility_weight: float = Field(0.15, ge=0.0, le=1.0)


class CandidateRouteInput(BaseModel):
    id: str
    name: str
    distance_km: float = Field(..., ge=0.1)
    duration_hours: float = Field(..., ge=0.05)
    fuel_cost: Optional[Dict[str, Any]] = None
    ml_risk: Optional[Dict[str, Any]] = None
    weather: Optional[Dict[str, Any]] = None
    vehicle_suitability: Optional[Dict[str, Any]] = None


class RouteOptimizationRequest(BaseModel):
    routes: List[CandidateRouteInput]
    cargo_type: Optional[str] = Field("General goods", description="Cargo type modulating optimization priorities")
    custom_weights: Optional[OptimizerWeights] = None


class NormalizedMetrics(BaseModel):
    distance: float
    time: float
    cost: float
    risk: float
    inaccessibility: float


class WeightedComponents(BaseModel):
    distance_component: float
    time_component: float
    cost_component: float
    risk_component: float
    accessibility_component: float


class ScoredRouteSummary(BaseModel):
    route_id: str
    name: str
    is_recommended: bool
    is_valid: bool
    final_score: float
    disqualified_reason: Optional[str] = None
    normalized_metrics: NormalizedMetrics
    weighted_components: WeightedComponents


class RouteOptimizationResponse(BaseModel):
    status: str = "success"
    recommended_route_id: Optional[str] = None
    recommendation_reason: str
    weights_used: Dict[str, float]
    routes_scored: List[ScoredRouteSummary]
    cargo_type_applied: str
    solver_info: Optional[Dict[str, Any]] = None
