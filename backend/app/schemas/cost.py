"""
Pydantic Schemas for Logistics Cost Calculation API
"""

from typing import Optional, Union, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class CostCalculationRequest(BaseModel):
    """
    Request schema for POST /api/cost/calculate.
    """
    distance: float = Field(
        ...,
        ge=0.0,
        description="Total transit distance in kilometers"
    )
    vehicle_type: Optional[str] = Field(
        default="truck",
        description="Vehicle classification preset (e.g. 'truck', 'mini truck', 'car')"
    )
    vehicle_mileage: Optional[float] = Field(
        default=None,
        gt=0.0,
        description="Optional custom mileage in km/l (overrides vehicle default preset)"
    )
    fuel_price: Optional[float] = Field(
        default=None,
        gt=0.0,
        description="Optional fuel price in INR/Liter (overrides default regional fuel price)"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "distance": 100,
                "vehicle_type": "truck",
                "vehicle_mileage": 5,
                "fuel_price": 92
            }
        }
    )


class CostCalculationResponse(BaseModel):
    """
    Response schema for POST /api/cost/calculate.
    """
    distance: Union[int, float] = Field(..., description="Route distance in km")
    fuel_required: Union[int, float] = Field(..., description="Total fuel consumption in Liters")
    fuel_price: Union[int, float] = Field(..., description="Fuel price per Liter (INR)")
    fuel_cost: Union[int, float] = Field(..., description="Estimated total fuel cost in INR")
    vehicle_type: Optional[str] = Field(default="Truck", description="Evaluated vehicle model")
    mileage_km_per_liter: Optional[float] = Field(default=None, description="Applied mileage in km/l")
    currency: Optional[str] = Field(default="INR", description="Currency symbol/code")
    currency_symbol: Optional[str] = Field(default="Rs", description="Display currency glyph")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "distance": 100,
                "fuel_required": 20,
                "fuel_price": 92,
                "fuel_cost": 1840
            }
        }
    )
