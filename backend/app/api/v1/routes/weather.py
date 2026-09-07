import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from app.schemas.weather import PointWeather, CorridorWeatherReport
from services.weather_service import weather_service
from services.map_service import map_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Weather Intelligence"])


class WeatherPostRequest(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    checkpoints: Optional[List[Dict[str, Any]]] = None


@router.get(
    "",
    summary="Get weather information for a location or coordinate",
    response_model=PointWeather
)
async def get_weather(
    location: Optional[str] = Query(None, description="City or location name (e.g. Guwahati)"),
    lat: Optional[float] = Query(None, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, description="Longitude coordinate")
):
    """
    Fetch real-time weather metrics and deterministic risk score for a location or lat/lon pair.
    """
    try:
        if lat is not None and lon is not None:
            return await weather_service.get_point_weather(lat, lon, location)
        elif location:
            # Geocode city name to lat/lon
            glat, glon, display_name = await map_service.geocode(location)
            return await weather_service.get_point_weather(glat, glon, display_name)
        else:
            # Default to Guwahati (NER regional center)
            return await weather_service.get_point_weather(26.1445, 91.7362, "Guwahati")
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error fetching weather: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "",
    summary="Query weather by location or batch route checkpoints",
)
async def query_weather(req: WeatherPostRequest):
    """
    Accepts coordinates, location name, or multiple route checkpoints to return weather intelligence.
    """
    try:
        if req.checkpoints and len(req.checkpoints) > 0:
            return await weather_service.get_corridor_weather(req.checkpoints)

        if req.latitude is not None and req.longitude is not None:
            return await weather_service.get_point_weather(req.latitude, req.longitude, req.location)

        if req.location:
            glat, glon, display_name = await map_service.geocode(req.location)
            return await weather_service.get_point_weather(glat, glon, display_name)

        # Default to Guwahati
        return await weather_service.get_point_weather(26.1445, 91.7362, "Guwahati")
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error processing weather POST: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
