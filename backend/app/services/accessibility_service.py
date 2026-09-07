"""
Re-export accessibility service for app.services module resolution.
"""
from services.accessibility_service import (
    accessibility_service,
    AccessibilityService,
    VERIFIED_NER_FACILITIES,
    haversine_distance,
    point_to_polyline_distance
)

__all__ = [
    "accessibility_service",
    "AccessibilityService",
    "VERIFIED_NER_FACILITIES",
    "haversine_distance",
    "point_to_polyline_distance"
]
