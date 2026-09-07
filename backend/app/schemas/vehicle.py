"""
Pydantic Schemas for Vehicle Profiles and Vehicle-Aware Suitability Checks (Phase 7)
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VehicleProfile(BaseModel):
    vehicle_type: str
    display_name: str
    weight: float = Field(..., description="Weight in kg")
    weight_tonnes: Optional[float] = Field(None, description="Weight in metric tonnes")
    height: float = Field(..., description="Height in meters")
    width: float = Field(..., description="Width in meters")
    length: float = Field(..., description="Length in meters")
    category: Optional[str] = "freight"
    axles: Optional[int] = 2
    description: Optional[str] = ""


class VehicleSuitabilityRequest(BaseModel):
    vehicle_type: Optional[str] = Field("heavy_truck", description="Vehicle type identifier (e.g. heavy_truck, truck, mini_truck, car)")
    weight: Optional[float] = Field(None, description="Gross vehicle weight in kg or tonnes (if <= 100, treated as tonnes)")
    height: Optional[float] = Field(None, description="Vehicle height in meters")
    width: Optional[float] = Field(None, description="Vehicle width in meters")
    length: Optional[float] = Field(None, description="Vehicle length in meters")
    route_id: Optional[str] = Field("primary", description="Route id (e.g. 'primary' or 'alt-1')")
    source: Optional[str] = Field("Guwahati", description="Origin city / hub")
    destination: Optional[str] = Field("Shillong", description="Destination city / terminal")
    route_name: Optional[str] = Field(None, description="Route or corridor label")


class RestrictionViolation(BaseModel):
    restriction_id: str
    restriction_name: str
    location: str
    violation_type: str
    limit_value: float
    vehicle_value: float
    unit: str
    excess: float
    description: Optional[str] = None
    message: str


class VehicleSuitabilityResponse(BaseModel):
    status: str = Field(..., description="'SUITABLE' or 'NOT SUITABLE'")
    is_suitable: bool
    reasons: List[str] = []
    violations: List[RestrictionViolation] = []
    vehicle_profile: Dict[str, Any]
    restrictions_checked_count: int
    is_demo_data: bool = True
    disclaimer: str
