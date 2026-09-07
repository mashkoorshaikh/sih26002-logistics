from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, model_validator


class RouteCalculateRequest(BaseModel):
    source: str = Field(..., min_length=2, max_length=120, description="Starting location (e.g. Guwahati)")
    destination: str = Field(..., min_length=2, max_length=120, description="Destination location (e.g. Shillong)")
    vehicle_type: str = Field(default="Truck", max_length=60, description="Vehicle type (Truck, Heavy Truck, Mini truck, Car, etc.)")
    vehicle_weight: float = Field(default=10.0, ge=0.1, le=100.0, description="Vehicle unladen weight in tonnes")
    cargo_type: str = Field(default="Vegetables", max_length=60, description="Cargo category (Vegetables, FMCG, etc.)")
    cargo_weight: float = Field(default=5.0, ge=0.0, le=100.0, description="Cargo payload weight in tonnes")
    # Phase 7: Physical dimensions (optional override)
    vehicle_height: Optional[float] = Field(None, ge=0.5, le=10.0, description="Vehicle height in meters")
    vehicle_width: Optional[float] = Field(None, ge=0.5, le=6.0, description="Vehicle width in meters")
    vehicle_length: Optional[float] = Field(None, ge=1.0, le=40.0, description="Vehicle length in meters")
    vehicle_weight_kg: Optional[float] = Field(None, ge=100.0, le=150000.0, description="Vehicle gross weight in kg")
    fuel_price: Optional[float] = Field(None, ge=10.0, le=500.0, description="Optional manual fuel price per liter in INR (e.g. 92.5)")

    @model_validator(mode="after")
    def validate_endpoints(self):
        if self.source.strip().lower() == self.destination.strip().lower():
            raise ValueError("Source and destination cannot be the same location.")
        return self


class LocationInfo(BaseModel):
    name: str
    latitude: float
    longitude: float


class VehiclePayloadInfo(BaseModel):
    vehicle_type: str
    vehicle_weight_tonnes: float
    cargo_type: str
    cargo_weight_tonnes: float
    gross_weight_tonnes: float


class RouteStep(BaseModel):
    instruction: str
    distance_km: float
    maneuver: Optional[str] = None


class GeoJSONGeometry(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]


class SegmentWeather(BaseModel):
    temperature_c: float
    rainfall_mm: float
    wind_speed_kmh: float
    visibility_km: float
    condition: str
    checkpoint_name: Optional[str] = None


class RouteSegment(BaseModel):
    segment_id: str
    name: str
    description: Optional[str] = None
    start_node: str
    end_node: str
    distance_km: float
    weather: SegmentWeather
    risk: str
    confidence: float
    risk_score: float
    color: str
    coordinates: List[List[float]]
    slope_degrees: Optional[float] = None
    elevation_m: Optional[float] = None
    road_quality: Optional[float] = None
    historical_incidents: Optional[int] = None


class HighestRiskSegment(BaseModel):
    segment_id: str
    name: str
    risk: str
    risk_score: float
    color: str
    reason: Optional[str] = None


class RouteRiskSummary(BaseModel):
    overall_risk: str
    highest_risk_segment: Optional[HighestRiskSegment] = None
    high_risk_segments_count: int
    average_risk_score: float
    overall_color: Optional[str] = "#22c55e"
    total_segments_evaluated: Optional[int] = 0


class AlternativeRoute(BaseModel):
    id: str
    name: str
    distance_km: float
    duration_hours: float
    duration_text: str
    difference_km: float
    geometry: GeoJSONGeometry
    ml_risk: Optional[Dict[str, Any]] = None
    segments: Optional[List[RouteSegment]] = None
    risk_summary: Optional[RouteRiskSummary] = None
    fuel_cost: Optional[Dict[str, Any]] = None
    vehicle_suitability: Optional[Dict[str, Any]] = None
    cargo_optimization: Optional[Dict[str, Any]] = None
    final_route_score: Optional[float] = None
    is_optimal_recommendation: Optional[bool] = None
    accessibility: Optional[Dict[str, Any]] = None


class RouteResponse(BaseModel):
    status: str = "success"
    source: LocationInfo
    destination: LocationInfo
    distance_km: float
    duration_hours: float
    duration_text: str
    summary: str
    vehicle_info: VehiclePayloadInfo
    geometry: GeoJSONGeometry
    steps: List[RouteStep] = []
    alternatives: List[AlternativeRoute] = []
    weather: Optional[Any] = None
    ml_risk: Optional[Dict[str, Any]] = None
    segments: List[RouteSegment] = []
    risk_summary: Optional[RouteRiskSummary] = None
    fuel_cost: Optional[Dict[str, Any]] = None
    vehicle_suitability: Optional[Dict[str, Any]] = None
    cargo_optimization: Optional[Dict[str, Any]] = None
    final_route_score: Optional[float] = None
    is_optimal_recommendation: Optional[bool] = None
    optimization_result: Optional[Dict[str, Any]] = None
    accessibility: Optional[Dict[str, Any]] = None
