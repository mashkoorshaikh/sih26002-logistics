# Re-export MapService and map_service from backend.services.map_service
import sys
import os

# Ensure backend root is on sys.path if not already
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.map_service import MapService, map_service

__all__ = ["MapService", "map_service"]
