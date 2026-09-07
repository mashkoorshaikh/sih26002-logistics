"""
Vehicle Service
===============
Phase 7: Vehicle-Aware Routing & Suitability Intelligence.

Manages vehicle dimension profiles (weight, height, width, length) and
evaluates route suitability against road restrictions and bridge weight limits.

IMPORTANT DISCLAIMER:
In compliance with project safety guidelines, road restrictions and bridge
weight limits in this module are clearly marked DEMO DATA (is_demo_data = True).
They simulate realistic physical bottlenecks (e.g. heritage bridges, low railway
underpasses, narrow mountain passes) until verified GIS / NHAI RAMS datasets
are integrated.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Standard Vehicle Profiles
# Weight in kg, Height / Width / Length in meters
VEHICLE_PROFILES: Dict[str, Dict[str, Any]] = {
    "heavy_truck": {
        "vehicle_type": "heavy_truck",
        "display_name": "Multi-Axle Heavy Truck",
        "weight": 17000,       # kg (17 tonnes)
        "height": 3.8,         # meters
        "width": 2.5,          # meters
        "length": 12.0,        # meters
        "category": "heavy_freight",
        "axles": 4,
        "description": "Multi-axle heavy haulage commercial vehicle (17t gross)"
    },
    "truck": {
        "vehicle_type": "truck",
        "display_name": "Standard Truck",
        "weight": 10000,       # kg (10 tonnes)
        "height": 3.4,         # meters
        "width": 2.4,          # meters
        "length": 8.5,         # meters
        "category": "freight",
        "axles": 2,
        "description": "Standard medium freight carrier (10t gross)"
    },
    "mini_truck": {
        "vehicle_type": "mini_truck",
        "display_name": "Mini Truck",
        "weight": 3500,        # kg (3.5 tonnes)
        "height": 2.4,         # meters
        "width": 1.8,          # meters
        "length": 4.8,         # meters
        "category": "light_freight",
        "axles": 2,
        "description": "Last-mile compact cargo vehicle (3.5t gross)"
    },
    "car": {
        "vehicle_type": "car",
        "display_name": "Passenger Car / Inspection Van",
        "weight": 1500,        # kg (1.5 tonnes)
        "height": 1.6,         # meters
        "width": 1.8,          # meters
        "length": 4.2,         # meters
        "category": "light_vehicle",
        "axles": 2,
        "description": "Standard light vehicle / passenger utility car"
    },
    "semi_trailer": {
        "vehicle_type": "semi_trailer",
        "display_name": "Semi-Trailer / Articulated",
        "weight": 28000,       # kg (28 tonnes)
        "height": 4.2,         # meters
        "width": 2.6,          # meters
        "length": 16.5,        # meters
        "category": "heavy_freight",
        "axles": 5,
        "description": "Long-haul heavy articulated semi-trailer (28t gross)"
    },
    "tanker": {
        "vehicle_type": "tanker",
        "display_name": "Fuel / Liquid Tanker",
        "weight": 24000,       # kg (24 tonnes)
        "height": 3.6,         # meters
        "width": 2.5,          # meters
        "length": 11.0,        # meters
        "category": "hazmat_liquid",
        "axles": 3,
        "description": "Liquid fuel / chemical tanker vehicle (24t gross)"
    },
    "light_commercial_vehicle": {
        "vehicle_type": "light_commercial_vehicle",
        "display_name": "Light Commercial Vehicle (LCV)",
        "weight": 5000,        # kg (5 tonnes)
        "height": 2.8,         # meters
        "width": 2.1,          # meters
        "length": 6.0,         # meters
        "category": "light_freight",
        "axles": 2,
        "description": "Intermediate delivery truck / LCV (5t gross)"
    },
    "tipper": {
        "vehicle_type": "tipper",
        "display_name": "Tipper / Construction Dumper",
        "weight": 21000,       # kg (21 tonnes)
        "height": 3.5,         # meters
        "width": 2.5,          # meters
        "length": 8.8,         # meters
        "category": "construction",
        "axles": 3,
        "description": "Heavy construction aggregate and earthwork dumper (21t gross)"
    }
}

# Aliases to map frontend string selections into normalized profile keys
VEHICLE_TYPE_ALIASES = {
    "heavy truck": "heavy_truck",
    "heavy_truck": "heavy_truck",
    "multi-axle heavy truck": "heavy_truck",
    "multiaxle heavy truck": "heavy_truck",
    "truck": "truck",
    "standard truck": "truck",
    "mini truck": "mini_truck",
    "mini_truck": "mini_truck",
    "pickup": "mini_truck",
    "car": "car",
    "passenger car": "car",
    "semi-trailer": "semi_trailer",
    "semi_trailer": "semi_trailer",
    "trailer": "semi_trailer",
    "tanker": "tanker",
    "fuel tanker": "tanker",
    "light commercial vehicle (lcv)": "light_commercial_vehicle",
    "light commercial vehicle": "light_commercial_vehicle",
    "lcv": "light_commercial_vehicle",
    "tipper / dumper": "tipper",
    "tipper": "tipper",
    "dumper": "tipper"
}


# ==============================================================================
# DEMO ROAD RESTRICTIONS & BRIDGE WEIGHT LIMITS DATABASE
# ==============================================================================
# All records are clearly tagged is_demo_data = True.
# In a future phase, this will be replaced with verified GIS layers from
# NHAI RAMS, MoRTH, and State PWD road asset databases.
DEMO_ROAD_RESTRICTIONS: List[Dict[str, Any]] = [
    {
        "restriction_id": "DEMO-RESTRICT-01",
        "name": "Umiam Heritage Bypass Bridge (Old Alignment)",
        "location": "Old Barapani Spillway Road, Meghalaya",
        "corridors": ["guwahati-shillong", "shillong-guwahati"],
        "applies_to_routes": ["alt-1", "alternate", "secondary"],  # Active on the secondary bypass route
        "restriction_type": "bridge_weight_limit",
        "max_weight_kg": 12000,  # 12 tonnes limit on older bridge structure
        "max_height_m": None,
        "max_width_m": 2.8,
        "max_length_m": 12.5,
        "description": "Structural load rating restriction on heritage single-lane arch bridge across Umiam gorge.",
        "is_demo_data": True,
        "authority": "Meghalaya PWD (Simulated Demo Asset)"
    },
    {
        "restriction_id": "DEMO-RESTRICT-02",
        "name": "Nongpoh Valley Rail Underpass",
        "location": "Nongpoh Old Town Crossing, Meghalaya",
        "corridors": ["guwahati-shillong", "shillong-guwahati"],
        "applies_to_routes": ["alt-1", "alternate", "old_town"],
        "restriction_type": "overhead_clearance",
        "max_weight_kg": None,
        "max_height_m": 3.5,     # Vehicles > 3.5m cannot pass
        "max_width_m": None,
        "max_length_m": None,
        "description": "Low clearance railway bridge overpass with overhead height barrier.",
        "is_demo_data": True,
        "authority": "NF Railway (Simulated Demo Asset)"
    },
    {
        "restriction_id": "DEMO-RESTRICT-03",
        "name": "Cherrapunji - Mawsmai Narrow Hill Pass",
        "location": "Sohra Scenic Escarpment Cut, Meghalaya",
        "corridors": ["shillong-cherrapunji", "cherrapunji-shillong"],
        "applies_to_routes": ["all"],
        "restriction_type": "geometric_restriction",
        "max_weight_kg": 15000,
        "max_height_m": 3.6,
        "max_width_m": 2.3,      # Width limit for tight hairpin turns
        "max_length_m": 7.5,      # Length limit for hairpin turning radius
        "description": "Severe hairpin turns and single-lane cliff cut unable to accommodate long wheelbases.",
        "is_demo_data": True,
        "authority": "Meghalaya State Highway Dept (Simulated Demo Asset)"
    },
    {
        "restriction_id": "DEMO-RESTRICT-04",
        "name": "Jorabat Urban Service Road Flyover",
        "location": "Jorabat Inter-state Border Node, Assam-Meghalaya",
        "corridors": ["guwahati-shillong", "shillong-guwahati"],
        "applies_to_routes": ["alt-1", "service_road"],
        "restriction_type": "overhead_clearance",
        "max_weight_kg": None,
        "max_height_m": 3.2,
        "max_width_m": None,
        "max_length_m": None,
        "description": "Urban underpass service lane with restrictive 3.2m gantry.",
        "is_demo_data": True,
        "authority": "Guwahati Metropolitan Development Authority (Simulated Demo Asset)"
    },
    {
        "restriction_id": "DEMO-RESTRICT-05",
        "name": "Haflong Hill Cut Suspension Crossing",
        "location": "Dima Hasao Corridor, Assam",
        "corridors": ["silchar-guwahati", "guwahati-silchar"],
        "applies_to_routes": ["alt-1", "alternate"],
        "restriction_type": "bridge_weight_limit",
        "max_weight_kg": 14000,
        "max_height_m": None,
        "max_width_m": 2.4,
        "max_length_m": 10.0,
        "description": "Steel truss bridge with 14t maximum gross axle load rating.",
        "is_demo_data": True,
        "authority": "Assam PWD Hills (Simulated Demo Asset)"
    }
]


class VehicleService:
    """
    Vehicle Profile and Route Suitability Service.
    Evaluates vehicle dimensions against physical road & bridge restrictions.
    """

    def __init__(self):
        self.profiles = VEHICLE_PROFILES
        self.aliases = VEHICLE_TYPE_ALIASES
        self.restrictions = DEMO_ROAD_RESTRICTIONS

    def get_vehicle_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Return all supported vehicle profiles."""
        return self.profiles

    def normalize_vehicle_type(self, vehicle_type: str) -> str:
        """Map any vehicle type label or alias to a canonical key."""
        clean = (vehicle_type or "truck").strip().lower()
        return self.aliases.get(clean, "truck")

    def resolve_vehicle_specs(
        self,
        vehicle_type: Optional[str] = None,
        weight: Optional[float] = None,
        height: Optional[float] = None,
        width: Optional[float] = None,
        length: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Resolves vehicle specifications from a profile and optional overrides.
        Weight can be provided in kg or tonnes (if <= 100, treated as tonnes and converted to kg).
        """
        canonical_type = self.normalize_vehicle_type(vehicle_type or "truck")
        profile = self.profiles.get(canonical_type, self.profiles["truck"]).copy()

        # Handle weight normalization (accept both kg and tonnes)
        resolved_weight = profile["weight"]
        if weight is not None and weight > 0:
            if weight <= 100:
                # Value provided in tonnes (e.g. 17.0 t -> 17000 kg)
                resolved_weight = float(weight) * 1000.0
            else:
                # Value provided in kg (e.g. 17000 kg)
                resolved_weight = float(weight)

        resolved_height = float(height) if height is not None and height > 0 else profile["height"]
        resolved_width = float(width) if width is not None and width > 0 else profile["width"]
        resolved_length = float(length) if length is not None and length > 0 else profile["length"]

        return {
            "vehicle_type": canonical_type,
            "display_name": profile.get("display_name", canonical_type.title()),
            "weight": round(resolved_weight, 1),
            "weight_tonnes": round(resolved_weight / 1000.0, 2),
            "height": round(resolved_height, 2),
            "width": round(resolved_width, 2),
            "length": round(resolved_length, 2),
            "category": profile.get("category", "freight"),
            "axles": profile.get("axles", 2),
            "description": profile.get("description", "")
        }

    def evaluate_route_suitability(
        self,
        vehicle_specs: Dict[str, Any],
        route_id: Optional[str] = None,
        source: Optional[str] = None,
        destination: Optional[str] = None,
        route_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates route suitability for a vehicle with given dimensions.

        Parameters:
        - vehicle_specs: Resolved vehicle dictionary (weight, height, width, length).
        - route_id: 'primary' or alternative id (e.g. 'alt-1').
        - source: Origin location name.
        - destination: Terminal location name.
        - route_name: Descriptive name of route or corridor.

        Returns:
        Dict containing:
        - status: "SUITABLE" | "NOT SUITABLE"
        - is_suitable: bool
        - reasons: List[str]
        - violations: List[Dict]
        - vehicle_profile: Dict
        - restrictions_checked: int
        - is_demo_data: bool (True)
        - disclaimer: str
        """
        # Ensure vehicle specs are fully resolved
        resolved = self.resolve_vehicle_specs(
            vehicle_type=vehicle_specs.get("vehicle_type"),
            weight=vehicle_specs.get("weight"),
            height=vehicle_specs.get("height"),
            width=vehicle_specs.get("width"),
            length=vehicle_specs.get("length")
        )

        v_weight = resolved["weight"]
        v_height = resolved["height"]
        v_width = resolved["width"]
        v_length = resolved["length"]

        violations: List[Dict[str, Any]] = []
        reasons: List[str] = []

        # Construct corridor key (e.g. 'guwahati-shillong')
        src_clean = (source or "").strip().lower()
        dst_clean = (destination or "").strip().lower()
        corridor_key = f"{src_clean}-{dst_clean}"
        reverse_corridor = f"{dst_clean}-{src_clean}"
        is_alt_route = route_id is not None and route_id != "primary"

        matched_restrictions = []

        for r in self.restrictions:
            # Check corridor match
            r_corridors = r.get("corridors", [])
            corridor_matches = (
                corridor_key in r_corridors or
                reverse_corridor in r_corridors or
                "all" in r_corridors or
                (not r_corridors)
            )

            if not corridor_matches:
                continue

            # Check route type match
            applies_to = r.get("applies_to_routes", ["all"])
            route_matches = False
            if "all" in applies_to:
                route_matches = True
            elif is_alt_route and ("alt-1" in applies_to or "alternate" in applies_to or "secondary" in applies_to):
                route_matches = True
            elif (not is_alt_route) and ("primary" in applies_to or "main" in applies_to):
                route_matches = True

            if not route_matches:
                continue

            matched_restrictions.append(r)

            # 1. Bridge Weight Limit Check
            max_weight = r.get("max_weight_kg")
            if max_weight is not None and v_weight > max_weight:
                excess_kg = round(v_weight - max_weight, 1)
                reason_msg = (
                    f"Vehicle weight ({v_weight:,.0f} kg / {v_weight/1000.0:.1f}t) exceeds bridge weight limit "
                    f"of {max_weight:,.0f} kg ({max_weight/1000.0:.1f}t) at {r['name']} by {excess_kg:,.0f} kg."
                )
                reasons.append(reason_msg)
                violations.append({
                    "restriction_id": r["restriction_id"],
                    "restriction_name": r["name"],
                    "location": r["location"],
                    "violation_type": "bridge_weight_limit",
                    "limit_value": max_weight,
                    "vehicle_value": v_weight,
                    "unit": "kg",
                    "excess": excess_kg,
                    "description": r["description"],
                    "message": reason_msg
                })

            # 2. Overhead Clearance (Height) Check
            max_height = r.get("max_height_m")
            if max_height is not None and v_height > max_height:
                excess_m = round(v_height - max_height, 2)
                reason_msg = (
                    f"Vehicle height ({v_height:.2f}m) exceeds overhead clearance limit of {max_height:.2f}m "
                    f"at {r['name']} by {excess_m:.2f}m."
                )
                reasons.append(reason_msg)
                violations.append({
                    "restriction_id": r["restriction_id"],
                    "restriction_name": r["name"],
                    "location": r["location"],
                    "violation_type": "overhead_clearance",
                    "limit_value": max_height,
                    "vehicle_value": v_height,
                    "unit": "meters",
                    "excess": excess_m,
                    "description": r["description"],
                    "message": reason_msg
                })

            # 3. Road Width Check
            max_width = r.get("max_width_m")
            if max_width is not None and v_width > max_width:
                excess_w = round(v_width - max_width, 2)
                reason_msg = (
                    f"Vehicle width ({v_width:.2f}m) exceeds road width restriction of {max_width:.2f}m "
                    f"at {r['name']} by {excess_w:.2f}m."
                )
                reasons.append(reason_msg)
                violations.append({
                    "restriction_id": r["restriction_id"],
                    "restriction_name": r["name"],
                    "location": r["location"],
                    "violation_type": "road_width_limit",
                    "limit_value": max_width,
                    "vehicle_value": v_width,
                    "unit": "meters",
                    "excess": excess_w,
                    "description": r["description"],
                    "message": reason_msg
                })

            # 4. Vehicle Length / Wheelbase Check
            max_length = r.get("max_length_m")
            if max_length is not None and v_length > max_length:
                excess_l = round(v_length - max_length, 2)
                reason_msg = (
                    f"Vehicle length ({v_length:.2f}m) exceeds maximum turning clearance limit of {max_length:.2f}m "
                    f"at {r['name']} by {excess_l:.2f}m."
                )
                reasons.append(reason_msg)
                violations.append({
                    "restriction_id": r["restriction_id"],
                    "restriction_name": r["name"],
                    "location": r["location"],
                    "violation_type": "vehicle_length_limit",
                    "limit_value": max_length,
                    "vehicle_value": v_length,
                    "unit": "meters",
                    "excess": excess_l,
                    "description": r["description"],
                    "message": reason_msg
                })

        is_suitable = len(violations) == 0
        status_text = "SUITABLE" if is_suitable else "NOT SUITABLE"

        return {
            "status": status_text,
            "is_suitable": is_suitable,
            "reasons": reasons,
            "violations": violations,
            "vehicle_profile": resolved,
            "restrictions_checked_count": len(matched_restrictions),
            "is_demo_data": True,
            "disclaimer": "Demo road restriction dataset for evaluation purposes. Never used as verified real-world navigation restrictions."
        }


# Global singleton instance
vehicle_service = VehicleService()
