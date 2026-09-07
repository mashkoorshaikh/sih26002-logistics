"""
Pydantic Schemas for Phase 12: Real-time Route Alerts and Demo Simulation
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RouteRiskComparison(BaseModel):
    route_id: str
    route_name: str
    risk_level: str = Field(..., description="Risk classification: LOW, MEDIUM, HIGH, CRITICAL")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="0-100 continuous risk score")
    distance_km: float
    duration_text: str
    key_factors: List[str] = Field(default_factory=list, description="Top positive or negative safety factors")
    weather_summary: Optional[Dict[str, Any]] = None
    is_recommended: bool = False


class AlertMonitorRequest(BaseModel):
    source: str = Field("Guwahati", description="Origin city/hub")
    destination: str = Field("Shillong", description="Destination city/hub")
    active_route_id: Optional[str] = Field("primary", description="Currently selected route ID")
    vehicle_type: Optional[str] = Field("Truck", description="Vehicle type classification")
    vehicle_weight: Optional[float] = Field(10.0, description="Vehicle weight in tonnes")
    cargo_type: Optional[str] = Field("General goods", description="Cargo classification")
    current_rainfall_rate: Optional[float] = Field(None, ge=0.0, description="Current precipitation mm/h")
    route_data: Optional[Dict[str, Any]] = Field(None, description="Precalculated route payload from /api/routes/calculate")


class SimulationTriggerRequest(BaseModel):
    event_type: str = Field(
        "heavy_rainfall",
        description="Demo simulation event: 'heavy_rainfall', 'landslide_closure', 'severe_weather'"
    )
    source: Optional[str] = Field("Guwahati", description="Origin city")
    destination: Optional[str] = Field("Shillong", description="Destination city")
    route_data: Optional[Dict[str, Any]] = Field(None, description="Active route payload")


class RouteAlertResponse(BaseModel):
    alert_id: str
    has_alert: bool = True
    severity: str = Field("HIGH", description="CRITICAL, HIGH, WARNING, INFO")
    alert_title: str
    alert_message: str = Field(..., description="e.g. 'Route risk increased from LOW to HIGH.'")
    trigger_cause: str
    timestamp: str
    current_route: RouteRiskComparison
    alternative_route: RouteRiskComparison
    all_alternatives: List[RouteRiskComparison] = Field(default_factory=list)
    action_prompt: str = "Switch to safer route"
    is_simulation: bool = False
    simulation_label: Optional[str] = None
