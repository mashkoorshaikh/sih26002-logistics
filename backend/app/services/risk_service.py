"""
Re-export risk_service from backend.services
"""
from services.risk_service import risk_service, RiskService

__all__ = ["risk_service", "RiskService"]
