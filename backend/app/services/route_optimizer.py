"""
Re-export route_optimizer_service from backend.services
"""
from services.route_optimizer import (
    route_optimizer_service,
    RouteOptimizerService,
    DEFAULT_OPTIMIZER_WEIGHTS,
    CARGO_WEIGHT_MODULATIONS
)

__all__ = [
    "route_optimizer_service",
    "RouteOptimizerService",
    "DEFAULT_OPTIMIZER_WEIGHTS",
    "CARGO_WEIGHT_MODULATIONS"
]
