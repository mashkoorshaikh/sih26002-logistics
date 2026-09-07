import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.weather_service import WeatherService, weather_service

__all__ = ["WeatherService", "weather_service"]
