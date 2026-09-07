from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.accessibility import (
    RouteAccessibilityInfo,
    EvaluateAccessibilityRequest,
    NearbyFacilityItem
)
from services.accessibility_service import accessibility_service

router = APIRouter()


@router.get(
    "/facilities",
    response_model=List[NearbyFacilityItem],
    summary="List Registered North East Facilities",
    description="Returns verified public infrastructure across NER (hospitals, fuel stations, warehouses, logistics hubs, repair workshops, emergency stations) with optional category and city filtering."
)
async def list_facilities(
    category: Optional[str] = Query(None, description="Category filter (hospital, fuel_station, warehouse, logistics_hub, repair_center, emergency_service)"),
    city: Optional[str] = Query(None, description="City/Town filter (Guwahati, Nongpoh, Shillong, Jorabat, Umsning, etc.)")
):
    results = accessibility_service.get_all_facilities(category=category, city=city)
    # Adapt to schema
    output = []
    for f in results:
        output.append(NearbyFacilityItem(
            id=f["id"],
            name=f["name"],
            category=f["category"],
            type=f["type"],
            distance_km=0.0,
            latitude=f["latitude"],
            longitude=f["longitude"],
            city=f.get("city"),
            highway=f.get("highway"),
            data_source=f.get("data_source", "VERIFIED_PUBLIC_REGISTRY"),
            is_verified_real=f.get("is_verified_real", True)
        ))
    return output


@router.post(
    "/evaluate",
    response_model=RouteAccessibilityInfo,
    summary="Evaluate Route Corridor Accessibility",
    description="Calculates comprehensive accessibility intelligence, nearest critical facilities, and composite accessibility score along an arbitrary route polyline geometry."
)
async def evaluate_route_corridor(request: EvaluateAccessibilityRequest):
    if not request.polyline or len(request.polyline) < 2:
        raise HTTPException(status_code=400, detail="Polyline must contain at least 2 coordinate points.")

    # Try fetching real OSM data if available, fallback gracefully
    osm_amenities = await accessibility_service.fetch_osm_amenities_around_corridor(request.polyline)

    result = accessibility_service.evaluate_route_accessibility(
        polyline_coords=request.polyline,
        max_buffer_km=request.max_buffer_km or 12.0,
        additional_facilities=osm_amenities
    )
    return result
