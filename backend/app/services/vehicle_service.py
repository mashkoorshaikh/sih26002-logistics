"""
Re-export vehicle_service from backend.services
"""
from services.vehicle_service import (
    vehicle_service,
    VehicleService,
    VEHICLE_PROFILES,
    DEMO_ROAD_RESTRICTIONS
)

__all__ = [
    "vehicle_service",
    "VehicleService",
    "VEHICLE_PROFILES",
    "DEMO_ROAD_RESTRICTIONS"
]
