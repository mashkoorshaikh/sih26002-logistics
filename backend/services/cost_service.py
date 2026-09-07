"""
LOGISTICS COST CALCULATION & VEHICLE CONFIGURATION SERVICE
=========================================================
Provides vehicle profile configuration, fuel consumption estimation,
and fuel cost calculations for logistics route planning.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("ner_logistics.cost_service")

# Modular Vehicle Configuration System
# Default regional fuel price (INR / Liter) in North East India:
# Diesel: ~Rs 92.00/L (standard commercial freight)
# Petrol: ~Rs 98.00/L (light transit / cars)
DEFAULT_DIESEL_PRICE = 92.0
DEFAULT_PETROL_PRICE = 98.0

VEHICLE_CONFIGURATIONS: Dict[str, Dict[str, Any]] = {
    "truck": {
        "id": "truck",
        "name": "Truck",
        "category": "Heavy Commercial Vehicle (HCV)",
        "mileage": 5.0,  # 5 km/l
        "fuel_type": "diesel",
        "default_fuel_price": DEFAULT_DIESEL_PRICE,
        "payload_capacity_tonnes": 16.0,
        "description": "Standard multi-axle heavy freight carrier"
    },
    "mini truck": {
        "id": "mini truck",
        "name": "Mini truck",
        "category": "Light Commercial Vehicle (LCV)",
        "mileage": 10.0,  # 10 km/l
        "fuel_type": "diesel",
        "default_fuel_price": DEFAULT_DIESEL_PRICE,
        "payload_capacity_tonnes": 3.5,
        "description": "Medium intra-state pickup & delivery truck"
    },
    "car": {
        "id": "car",
        "name": "Car",
        "category": "Passenger / Inspection Vehicle",
        "mileage": 15.0,  # 15 km/l
        "fuel_type": "petrol",
        "default_fuel_price": DEFAULT_PETROL_PRICE,
        "payload_capacity_tonnes": 0.6,
        "description": "Light transit / supervisor pilot vehicle"
    },
    # Additional common logistics presets
    "trailer": {
        "id": "trailer",
        "name": "Heavy Trailer",
        "category": "Articulated Freight Carrier",
        "mileage": 3.5,
        "fuel_type": "diesel",
        "default_fuel_price": DEFAULT_DIESEL_PRICE,
        "payload_capacity_tonnes": 28.0,
        "description": "Container semi-trailer freight transporter"
    },
    "tanker": {
        "id": "tanker",
        "name": "Liquid Tanker",
        "category": "Hazardous Liquid Transport",
        "mileage": 4.5,
        "fuel_type": "diesel",
        "default_fuel_price": DEFAULT_DIESEL_PRICE,
        "payload_capacity_tonnes": 20.0,
        "description": "Liquid fuel & bulk chemical tanker"
    }
}


class CostService:
    """
    Service to calculate transportation fuel costs and manage vehicle profiles.
    """

    def __init__(self, configs: Optional[Dict[str, Dict[str, Any]]] = None):
        self.vehicles = configs or VEHICLE_CONFIGURATIONS

    def get_vehicle_configs(self) -> Dict[str, Dict[str, Any]]:
        """
        Return the registry of available vehicle configurations.
        """
        return self.vehicles

    def get_vehicle_profile(self, vehicle_type: str) -> Dict[str, Any]:
        """
        Lookup vehicle profile by name/type, falling back to 'truck'.
        """
        key = str(vehicle_type).lower().strip()
        if key in self.vehicles:
            return self.vehicles[key]
        
        # Fuzzy match (e.g. 'heavy truck' -> 'truck', 'mini-truck' -> 'mini truck')
        clean_key = key.replace("-", " ")
        if clean_key in self.vehicles:
            return self.vehicles[clean_key]

        for k, profile in self.vehicles.items():
            if k in clean_key or clean_key in k:
                return profile

        logger.info(f"Vehicle type '{vehicle_type}' not found in registry. Defaulting to 'truck'.")
        return self.vehicles["truck"]

    def calculate_fuel_cost(
        self,
        distance: float,
        vehicle_type: Optional[str] = "truck",
        vehicle_mileage: Optional[float] = None,
        fuel_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculate fuel required and estimated fuel cost for a given distance.

        Inputs:
          - distance: Total distance in kilometers (>= 0)
          - vehicle_type: Vehicle classification name
          - vehicle_mileage: Optional custom mileage (km/l) override
          - fuel_price: Optional custom fuel price (Rs/l) override

        Returns:
          {
              "distance": 100,
              "fuel_required": 20,
              "fuel_price": 92,
              "fuel_cost": 1840
          }
        """
        if distance < 0:
            raise ValueError("Distance must be greater than or equal to 0.")

        profile = self.get_vehicle_profile(vehicle_type or "truck")

        # Determine mileage (use custom override if valid, else vehicle preset)
        if vehicle_mileage is not None and vehicle_mileage > 0:
            eff_mileage = float(vehicle_mileage)
        else:
            eff_mileage = float(profile["mileage"])

        if eff_mileage <= 0:
            raise ValueError("Vehicle mileage must be greater than 0.")

        # Determine fuel price (use custom override if valid, else vehicle preset)
        if fuel_price is not None and fuel_price > 0:
            eff_fuel_price = float(fuel_price)
        else:
            eff_fuel_price = float(profile["default_fuel_price"])

        # Calculate consumption and cost
        # fuel_required = distance / mileage
        # fuel_cost = fuel_required * fuel_price
        dist_val = float(distance)
        fuel_required = round(dist_val / eff_mileage, 2)
        fuel_cost = round(fuel_required * eff_fuel_price, 2)

        # Ensure exact int representation if numbers are whole
        if fuel_required.is_integer():
            fuel_required_out = int(fuel_required)
        else:
            fuel_required_out = fuel_required

        if fuel_cost.is_integer():
            fuel_cost_out = int(fuel_cost)
        else:
            fuel_cost_out = fuel_cost

        if eff_fuel_price.is_integer():
            fuel_price_out = int(eff_fuel_price)
        else:
            fuel_price_out = eff_fuel_price

        if dist_val.is_integer():
            distance_out = int(dist_val)
        else:
            distance_out = dist_val

        return {
            "distance": distance_out,
            "fuel_required": fuel_required_out,
            "fuel_price": fuel_price_out,
            "fuel_cost": fuel_cost_out,
            "vehicle_type": profile["name"],
            "mileage_km_per_liter": eff_mileage,
            "currency": "INR",
            "currency_symbol": "Rs"
        }


# Global singleton instance
cost_service = CostService()
