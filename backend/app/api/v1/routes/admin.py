import logging
from typing import Optional
from fastapi import APIRouter, Query, Header, HTTPException, status
from services.admin_service import admin_service, ADMIN_ROUTES, LOGISTICS_HUBS, HIGH_RISK_AREAS, ACTIVE_GOV_ALERTS
from app.core.security import verify_admin_authorization

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin & Government Authority"])


@router.get(
    "/dashboard",
    summary="Get unified administrative dashboard data",
    description="Returns filtered data for government monitoring across routes, risk tiers, logistics hubs, hazard sectors, transport stats, and system usage."
)
async def get_admin_dashboard(
    authorization: Optional[str] = Header(None, description="Bearer token or government evaluation credential"),
    state: Optional[str] = Query("ALL", description="State filter (e.g. Assam, Meghalaya, Nagaland)"),
    district: Optional[str] = Query("ALL", description="District filter"),
    risk: Optional[str] = Query("ALL", description="Risk tier: ALL, LOW, MEDIUM, HIGH"),
    vehicle: Optional[str] = Query("ALL", description="Vehicle filter"),
    cargo: Optional[str] = Query("ALL", description="Cargo filter"),
    date_range: Optional[str] = Query("30d", description="Time window: 7d, 30d, 90d, 1y")
):
    # Enforce administrative authorization if authorization header is provided or in strict mode
    auth_state = verify_admin_authorization(authorization)
    if authorization and not auth_state.get("authorized"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired administrative credentials."
        )

    try:
        return admin_service.get_dashboard(
            state=state,
            district=district,
            risk=risk,
            vehicle=vehicle,
            cargo=cargo,
            date_range=date_range
        )
    except Exception as e:
        logger.error(f"Admin dashboard error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not load administrative dashboard data. Please verify filters or try again later."
        )


@router.get("/routes", summary="Get monitored arterial corridors")
async def get_admin_routes(risk: Optional[str] = Query(None)):
    routes = ADMIN_ROUTES
    if risk and risk.upper() != "ALL":
        routes = [r for r in routes if r["risk_tier"] == risk.upper()]
    return {"status": "success", "count": len(routes), "routes": routes}


@router.get("/hubs", summary="Get strategic logistics hubs")
async def get_logistics_hubs(state: Optional[str] = Query(None)):
    hubs = LOGISTICS_HUBS
    if state and state.lower() != "all":
        hubs = [h for h in hubs if h["state"].lower() == state.lower()]
    return {"status": "success", "count": len(hubs), "hubs": hubs}


@router.get("/hazards", summary="Get geological hazard hotspots")
async def get_high_risk_areas():
    return {"status": "success", "count": len(HIGH_RISK_AREAS), "hazards": HIGH_RISK_AREAS}


@router.get("/alerts", summary="Get active government regulatory alerts")
async def get_gov_alerts():
    return {"status": "success", "count": len(ACTIVE_GOV_ALERTS), "alerts": ACTIVE_GOV_ALERTS}


@router.get(
    "/ner/challenges",
    summary="Get 8 documented geographical & logistical challenges for NER",
    description="Returns detailed technical documentation of regional constraints: terrain, rainfall, landslides, flooding, connectivity, infrastructure, transit time, and accessibility."
)
async def get_ner_challenges():
    challenges = admin_service.get_ner_challenges()
    return {
        "status": "success",
        "count": len(challenges),
        "region": "North Eastern Region (NER) of India",
        "dataset_classification": "SIMULATED_DEMO_BENCHMARK",
        "challenges": challenges
    }


@router.get(
    "/ner/geojson",
    summary="Export NER logistics hubs, corridors, and hazard zones as standard GeoJSON",
    description="Returns standard RFC 7946 GeoJSON FeatureCollection with [lon, lat] coordinate layout for PM Gati Shakti / GIS interoperability."
)
async def get_ner_geojson(state: Optional[str] = Query(None, description="Filter by NER state (e.g. Assam, Meghalaya, Sikkim)")):
    try:
        return admin_service.to_geojson(state=state)
    except Exception as e:
        logger.error(f"GeoJSON export error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate GeoJSON dataset. Please try again later."
        )

