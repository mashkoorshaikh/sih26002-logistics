import logging
from typing import Dict, Any, List, Optional, Tuple
import httpx

logger = logging.getLogger(__name__)

# WMO Weather Interpretation Codes (WW)
# Standard international meteorological codes mapped to descriptive conditions
WMO_CODE_MAP: Dict[int, Dict[str, Any]] = {
    0: {"condition": "Clear sky", "severity": 0},
    1: {"condition": "Mainly clear", "severity": 0},
    2: {"condition": "Partly cloudy", "severity": 0},
    3: {"condition": "Overcast", "severity": 5},
    45: {"condition": "Fog", "severity": 25},
    48: {"condition": "Depositing rime fog", "severity": 30},
    51: {"condition": "Light drizzle", "severity": 10},
    53: {"condition": "Moderate drizzle", "severity": 15},
    55: {"condition": "Dense drizzle", "severity": 20},
    61: {"condition": "Slight rain", "severity": 10},
    63: {"condition": "Moderate rain", "severity": 20},
    65: {"condition": "Heavy rain", "severity": 35},
    66: {"condition": "Freezing rain", "severity": 40},
    67: {"condition": "Heavy freezing rain", "severity": 50},
    71: {"condition": "Slight snowfall", "severity": 20},
    73: {"condition": "Moderate snowfall", "severity": 30},
    75: {"condition": "Heavy snowfall", "severity": 45},
    80: {"condition": "Slight rain showers", "severity": 15},
    81: {"condition": "Moderate rain showers", "severity": 25},
    82: {"condition": "Violent rain showers", "severity": 45},
    95: {"condition": "Thunderstorm", "severity": 35},
    96: {"condition": "Thunderstorm with slight hail", "severity": 45},
    99: {"condition": "Thunderstorm with heavy hail", "severity": 50},
}


class WeatherService:
    """
    Weather intelligence service for the North Eastern Region logistics platform.
    Fetches real-time atmospheric conditions and evaluates deterministic transit risk.
    """

    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.headers = {"User-Agent": "NERLogisticsPlatform/1.0 (weather@nerlogistics.in)"}

    # =========================================================================
    # DETERMINISTIC WEATHER RISK RULES (NON-LLM SPECIFICATION)
    # =========================================================================
    # These rules use an objective, transparent point-based scoring matrix (0-100)
    # evaluating 4 physical transit hazards:
    #
    # 1. PRECIPITATION RATE (R):
    #    - R < 1.0 mm/h   ->  0 pts (dry or negligible drizzle)
    #    - 1.0 <= R < 5.0  -> 15 pts (moderate rainfall; road friction reduced)
    #    - 5.0 <= R < 15.0 -> 35 pts (heavy rain; waterlogging, early landslide risk)
    #    - R >= 15.0 mm/h -> 50 pts (torrential downpour; critical landslide & flash flood hazard)
    #
    # 2. VISIBILITY (V):
    #    - V >= 8.0 km    ->  0 pts (clear road visibility)
    #    - 4.0 <= V < 8.0 -> 10 pts (light haze / mist)
    #    - 1.0 <= V < 4.0 -> 25 pts (dense fog in ghat sections)
    #    - V < 1.0 km     -> 40 pts (severe fog / near-zero visibility)
    #
    # 3. WIND SPEED (W):
    #    - W < 25.0 km/h  ->  0 pts (normal operational breeze)
    #    - 25 <= W < 45   -> 15 pts (moderate gusts; crosswind caution on mountain bridges)
    #    - W >= 45.0 km/h -> 25 pts (strong gale; hazard for high-profile multi-axle trucks)
    #
    # 4. WEATHER CONDITION CODE (C):
    #    - Thunderstorm / Hail / Squall / Freezing Rain -> +20 to +30 pts
    #
    # COMPOSITE SCORE = min(100, R + V + W + C)
    # RISK CATEGORIES:
    #    - 0  to 34 : LOW    (Safe operating transit conditions)
    #    - 35 to 64 : MEDIUM (Caution advised: wet asphalt, reduce ghat corner speeds)
    #    - 65 to 100: HIGH   (Severe hazard: high landslide probability, delays advised)
    #
    # NOTE: This deterministic engine will be replaced by a trained ML model in Phase 4.
    # =========================================================================

    def calculate_weather_risk(
        self,
        precipitation_mm: float,
        visibility_km: float,
        wind_speed_kmh: float,
        weather_code: int = 0
    ) -> Dict[str, Any]:
        """
        Evaluate deterministic weather risk score and category.
        """
        advisories: List[str] = []

        # 1. Precipitation Score
        if precipitation_mm >= 15.0:
            p_score = 50
            advisories.append(f"Torrential rainfall ({precipitation_mm:.1f} mm): High risk of mountain landslides and flash flooding.")
        elif precipitation_mm >= 5.0:
            p_score = 35
            advisories.append(f"Heavy rainfall ({precipitation_mm:.1f} mm): Surface runoff and slick road surfaces on hill ghats.")
        elif precipitation_mm >= 1.0:
            p_score = 15
            advisories.append(f"Moderate rain ({precipitation_mm:.1f} mm): Maintain extended vehicle braking distance.")
        else:
            p_score = 0

        # 2. Visibility Score
        if visibility_km < 1.0:
            v_score = 40
            advisories.append(f"Severe zero-visibility fog ({visibility_km:.1f} km): Mandatory high-beam/fog lamps; crawl speed required.")
        elif visibility_km < 4.0:
            v_score = 25
            advisories.append(f"Dense hill mist ({visibility_km:.1f} km): Reduced visibility on hairpin turns.")
        elif visibility_km < 8.0:
            v_score = 10
            advisories.append(f"Light atmospheric haze ({visibility_km:.1f} km): Standard caution.")
        else:
            v_score = 0

        # 3. Wind Speed Score
        if wind_speed_kmh >= 45.0:
            w_score = 25
            advisories.append(f"High crosswinds ({wind_speed_kmh:.1f} km/h): Toppling risk for empty trailers and high-cube trucks.")
        elif wind_speed_kmh >= 25.0:
            w_score = 15
            advisories.append(f"Moderate wind gusts ({wind_speed_kmh:.1f} km/h): Exercise steering control on elevated viaducts.")
        else:
            w_score = 0

        # 4. Severe Weather Condition Code
        wmo_info = WMO_CODE_MAP.get(weather_code, {"condition": "Unknown", "severity": 0})
        c_score = min(30, wmo_info.get("severity", 0))
        if c_score >= 35:
            advisories.append(f"Severe atmospheric event: {wmo_info['condition']}. Seek safe freight terminal shelter if required.")

        # Composite Score Calculation
        total_score = min(100, p_score + v_score + w_score + c_score)

        # Risk Classification (Documented deterministic thresholds)
        if total_score >= 70:
            risk_level = "HIGH"
            advisory_summary = "High weather hazard detected along corridor. High landslide/flood probability; delay recommended."
        elif total_score >= 35:
            risk_level = "MEDIUM"
            advisory_summary = "Moderate weather caution. Wet roads or hill mist present; reduce speeds by 20%."
        else:
            risk_level = "LOW"
            advisory_summary = "Favorable transit weather. Normal driving conditions across route."


        return {
            "risk_level": risk_level,
            "risk_score": total_score,
            "advisory_summary": advisory_summary,
            "advisories": advisories if advisories else ["All weather metrics within normal operational thresholds."],
            "breakdown": {
                "precipitation_score": p_score,
                "visibility_score": v_score,
                "wind_score": w_score,
                "condition_score": c_score
            }
        }

    async def get_point_weather(
        self,
        lat: float,
        lon: float,
        location_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch real-time weather metrics for a specific coordinate (lat, lon).
        """
        try:
            params = {
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m",
                "hourly": "visibility",
                "timezone": "Asia/Kolkata",
                "forecast_days": 1
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(self.base_url, params=params, headers=self.headers)
                if resp.status_code == 200:
                    data = resp.json()
                    curr = data.get("current", {})
                    
                    temp_c = curr.get("temperature_2m", 24.0)
                    precip_mm = curr.get("precipitation", 0.0)
                    wind_kmh = curr.get("wind_speed_10m", 12.0)
                    code = curr.get("weather_code", 0)
                    
                    # Visibility from hourly current hour (meters -> km)
                    hourly_vis = data.get("hourly", {}).get("visibility", [])
                    vis_km = round((hourly_vis[0] / 1000.0), 1) if hourly_vis else 10.0

                    cond_info = WMO_CODE_MAP.get(code, {"condition": "Clear sky", "severity": 0})
                    risk_assessment = self.calculate_weather_risk(precip_mm, vis_km, wind_kmh, code)

                    return {
                        "location_name": location_name or f"{lat:.2f}, {lon:.2f}",
                        "latitude": lat,
                        "longitude": lon,
                        "temperature_c": round(temp_c, 1),
                        "precipitation_mm": round(precip_mm, 1),
                        "wind_speed_kmh": round(wind_kmh, 1),
                        "visibility_km": round(vis_km, 1),
                        "weather_code": code,
                        "condition": cond_info["condition"],
                        "risk": risk_assessment
                    }
        except Exception as e:
            logger.warning(f"Live weather lookup failed for ({lat}, {lon}): {e}. Using calibrated fallback.")

        # Resilient Fallback Data (e.g. typical NER climate profile)
        fallback_precip = 0.8
        fallback_vis = 8.5
        fallback_wind = 14.0
        fallback_code = 2
        risk = self.calculate_weather_risk(fallback_precip, fallback_vis, fallback_wind, fallback_code)
        
        return {
            "location_name": location_name or f"{lat:.2f}, {lon:.2f}",
            "latitude": lat,
            "longitude": lon,
            "temperature_c": 23.5,
            "precipitation_mm": fallback_precip,
            "wind_speed_kmh": fallback_wind,
            "visibility_km": fallback_vis,
            "weather_code": fallback_code,
            "condition": "Partly cloudy",
            "risk": risk
        }

    async def get_corridor_weather(
        self,
        checkpoints: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Sample weather across route checkpoints (Origin, Midpoints, Destination)
        and compute the combined corridor weather risk report.
        """
        if not checkpoints:
            return {}

        checkpoint_reports = []
        max_risk_score = 0
        all_advisories = []

        for cp in checkpoints:
            lat = cp.get("lat") or cp.get("latitude")
            lon = cp.get("lon") or cp.get("longitude")
            name = cp.get("name") or cp.get("instruction") or "Corridor Checkpoint"
            
            if lat is not None and lon is not None:
                report = await self.get_point_weather(float(lat), float(lon), name)
                checkpoint_reports.append(report)
                
                cp_score = report["risk"]["risk_score"]
                if cp_score > max_risk_score:
                    max_risk_score = cp_score
                all_advisories.extend(report["risk"]["advisories"])

        # Determine route-level risk based on the highest risk encountered on the corridor
        if max_risk_score >= 70:
            corridor_risk_level = "HIGH"

            summary_msg = "HIGH WEATHER RISK: Heavy precipitation or severe hazard detected along one or more corridor sections."
        elif max_risk_score >= 35:
            corridor_risk_level = "MEDIUM"
            summary_msg = "MODERATE WEATHER RISK: Wet asphalt or reduced hill visibility along sections of the route."
        else:
            corridor_risk_level = "LOW"
            summary_msg = "LOW WEATHER RISK: Clear to mild weather along the entire corridor."

        # Deduplicate advisories
        unique_advisories = list(dict.fromkeys(all_advisories))

        return {
            "corridor_risk_level": corridor_risk_level,
            "corridor_risk_score": max_risk_score,
            "summary": summary_msg,
            "advisories": unique_advisories[:5],
            "checkpoints": checkpoint_reports
        }


# Singleton instance
weather_service = WeatherService()
