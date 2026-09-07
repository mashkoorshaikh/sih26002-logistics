from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class WeatherRiskBreakdown(BaseModel):
    precipitation_score: int
    visibility_score: int
    wind_score: int
    condition_score: int


class WeatherRiskAssessment(BaseModel):
    risk_level: str = Field(..., description="LOW, MEDIUM, or HIGH")
    risk_score: int = Field(..., ge=0, le=100, description="Deterministic risk score from 0 to 100")
    advisory_summary: str
    advisories: List[str] = []
    breakdown: Optional[WeatherRiskBreakdown] = None


class PointWeather(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    temperature_c: float
    precipitation_mm: float
    wind_speed_kmh: float
    visibility_km: float
    weather_code: int
    condition: str
    risk: WeatherRiskAssessment


class CorridorWeatherReport(BaseModel):
    corridor_risk_level: str
    corridor_risk_score: int
    summary: str
    advisories: List[str] = []
    checkpoints: List[PointWeather] = []


class WeatherQueryRequest(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
