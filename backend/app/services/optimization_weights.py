"""
Re-export optimization_weights_service from backend.services
"""
from services.optimization_weights import (
    optimization_weights_service,
    OptimizationWeightsService,
    DEFAULT_CARGO_PROFILES,
    CARGO_ALIASES
)

__all__ = [
    "optimization_weights_service",
    "OptimizationWeightsService",
    "DEFAULT_CARGO_PROFILES",
    "CARGO_ALIASES"
]
