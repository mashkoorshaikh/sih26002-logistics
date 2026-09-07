"""
Re-export cost_service from backend.services
"""
from services.cost_service import cost_service, CostService, VEHICLE_CONFIGURATIONS

__all__ = ["cost_service", "CostService", "VEHICLE_CONFIGURATIONS"]
