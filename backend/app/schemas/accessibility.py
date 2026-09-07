from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FacilityInfo(BaseModel):
    name: str
    type: str
    distance_km: float
    city: Optional[str] = None
    emergency_phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    data_source: str = "VERIFIED_PUBLIC_REGISTRY"
    is_verified_real: bool = True


class NearbyFacilityItem(BaseModel):
    id: str
    name: str
    category: str
    type: str
    distance_km: float
    latitude: float
    longitude: float
    city: Optional[str] = None
    highway: Optional[str] = None
    data_source: str = "VERIFIED_PUBLIC_REGISTRY"
    is_verified_real: bool = True


class FacilityCounts(BaseModel):
    hospitals: int = 0
    fuel_stations: int = 0
    warehouses: int = 0
    logistics_hubs: int = 0
    repair_centers: int = 0
    emergency_services: int = 0
    total_facilities_near_route: int = 0


class RouteAccessibilityInfo(BaseModel):
    accessibility_score: float = Field(..., ge=0.0, le=100.0, description="Composite accessibility rating (0-100)")
    accessibility_rating: str = Field(..., description="EXCELLENT, GOOD, MODERATE, LIMITED, or CRITICAL_LACK")
    rating_color: str = Field("#10b981", description="HEX color representing the rating tier")
    inaccessibility_penalty: float = Field(..., ge=0.0, le=1.0, description="Normalized penalty for OR-Tools MIP solver")
    counts: FacilityCounts
    nearest_hospital: Optional[FacilityInfo] = None
    nearest_fuel_station: Optional[FacilityInfo] = None
    nearest_logistics_hub: Optional[FacilityInfo] = None
    nearest_repair_center: Optional[FacilityInfo] = None
    nearest_emergency_service: Optional[FacilityInfo] = None
    nearby_facilities: List[NearbyFacilityItem] = []
    subscores: Optional[Dict[str, float]] = None


class EvaluateAccessibilityRequest(BaseModel):
    polyline: List[List[float]] = Field(..., description="Route coordinates [[lon, lat], ...]")
    max_buffer_km: Optional[float] = Field(12.0, ge=1.0, le=50.0, description="Corridor buffer distance in km")
