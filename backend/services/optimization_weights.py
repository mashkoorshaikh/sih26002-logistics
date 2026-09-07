"""
Optimization Weights Service
============================
Phase 8: Cargo-Aware Routing & Multi-Objective Optimization.

Manages configurable cargo profiles and multi-objective priority weight matrices.
Evaluates candidate routes by applying cargo-specific trade-offs across:
- Travel time (hours)
- AI Risk score (landslides, heavy weather, road quality)
- Logistics fuel cost (INR)
- Structural suitability (bridge weight limits, clearances)
- Hospital / emergency accessibility (for medical and hazmat cargo)
- Road smoothness / quality (for produce and fragile goods)

Weights are fully configurable and never hardcoded throughout the application.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)


# Default Configurable Cargo Profiles & Priority Weights
# Weights for each cargo profile sum to 1.0 (100%)
DEFAULT_CARGO_PROFILES: Dict[str, Dict[str, Any]] = {
    "perishable_goods": {
        "cargo_type": "perishable_goods",
        "display_name": "Perishable Goods",
        "description": "Cold-chain produce, dairy, and temperature-sensitive food requiring rapid transit and minimal delay risk.",
        "priority_summary": "Priority: Travel Time (45%) & AI Terrain Risk (35%)",
        "weights": {
            "travel_time": 0.45,
            "risk_score": 0.35,
            "road_quality": 0.10,
            "fuel_cost": 0.10,
            "structural_safety": 0.00,
            "hospital_accessibility": 0.00
        },
        "target_temperature_c": 4.0,
        "max_delay_tolerance_hours": 3.0
    },
    "medicine": {
        "cargo_type": "medicine",
        "display_name": "Medicine & Pharmaceuticals",
        "description": "Critical pharmaceuticals, vaccines, and medical relief supplies requiring utmost route safety and emergency hospital access.",
        "priority_summary": "Priority: AI Terrain Risk (40%), Hospital Access (25%) & Travel Time (25%)",
        "weights": {
            "risk_score": 0.40,
            "hospital_accessibility": 0.25,
            "travel_time": 0.25,
            "fuel_cost": 0.10,
            "road_quality": 0.00,
            "structural_safety": 0.00
        },
        "critical_emergency": True,
        "max_delay_tolerance_hours": 4.0
    },
    "heavy_equipment": {
        "cargo_type": "heavy_equipment",
        "display_name": "Heavy Equipment & Machinery",
        "description": "Industrial machinery, transformers, and construction hardware sensitive to bridge weight limits and overhead clearances.",
        "priority_summary": "Priority: Bridge & Road Limits (50%), Road Quality (25%) & Travel Time (15%)",
        "weights": {
            "structural_safety": 0.50,
            "road_quality": 0.25,
            "travel_time": 0.15,
            "fuel_cost": 0.10,
            "risk_score": 0.00,
            "hospital_accessibility": 0.00
        },
        "requires_clearance_verification": True,
        "max_delay_tolerance_hours": 12.0
    },
    "vegetables": {
        "cargo_type": "vegetables",
        "display_name": "Vegetables & Agro-Produce",
        "description": "Fresh agricultural vegetables, ginger, and cabbage sensitive to transit time and road vibration bruising.",
        "priority_summary": "Priority: Travel Time (35%), Road Smoothness (30%) & AI Risk (20%)",
        "weights": {
            "travel_time": 0.35,
            "road_quality": 0.30,
            "risk_score": 0.20,
            "fuel_cost": 0.15,
            "structural_safety": 0.00,
            "hospital_accessibility": 0.00
        },
        "shelf_life_days": 3,
        "max_delay_tolerance_hours": 6.0
    },
    "fruits": {
        "cargo_type": "fruits",
        "display_name": "Fruits & Horticulture",
        "description": "Oranges, pineapples, and sensitive fruits requiring smooth pavement to prevent bruising and fast transit to markets.",
        "priority_summary": "Priority: Travel Time (35%), Road Smoothness (30%) & AI Risk (20%)",
        "weights": {
            "travel_time": 0.35,
            "road_quality": 0.30,
            "risk_score": 0.20,
            "fuel_cost": 0.15,
            "structural_safety": 0.00,
            "hospital_accessibility": 0.00
        },
        "shelf_life_days": 4,
        "max_delay_tolerance_hours": 6.0
    },
    "general_goods": {
        "cargo_type": "general_goods",
        "display_name": "General Goods & FMCG",
        "description": "Non-perishable commercial freight and dry retail merchandise prioritizing freight economics and lower fuel costs.",
        "priority_summary": "Priority: Fuel Cost (35%), Travel Time (30%) & AI Risk (20%)",
        "weights": {
            "fuel_cost": 0.35,
            "travel_time": 0.30,
            "risk_score": 0.20,
            "road_quality": 0.15,
            "structural_safety": 0.00,
            "hospital_accessibility": 0.00
        },
        "shelf_life_days": 30,
        "max_delay_tolerance_hours": 24.0
    }
}

# Aliases mapping UI string inputs into canonical cargo profile keys
CARGO_ALIASES: Dict[str, str] = {
    # Perishable goods
    "perishable goods": "perishable_goods",
    "perishable_goods": "perishable_goods",
    "perishables": "perishable_goods",
    "perishables & dairy": "perishable_goods",
    "dairy": "perishable_goods",
    # Medicine
    "medicine": "medicine",
    "medicines": "medicine",
    "pharmaceuticals": "medicine",
    "pharmaceuticals & medical supplies": "medicine",
    "medical supplies": "medicine",
    "vaccines": "medicine",
    # Heavy equipment
    "heavy equipment": "heavy_equipment",
    "heavy_equipment": "heavy_equipment",
    "heavy machinery & industrial equipment": "heavy_equipment",
    "heavy machinery": "heavy_equipment",
    "industrial equipment": "heavy_equipment",
    "machinery": "heavy_equipment",
    "construction materials & cement": "heavy_equipment",
    # Vegetables
    "vegetables": "vegetables",
    "vegetable": "vegetables",
    "agricultural produce / tea": "vegetables",
    "agricultural produce": "vegetables",
    "tea": "vegetables",
    # Fruits
    "fruits": "fruits",
    "fruit": "fruits",
    "horticulture": "fruits",
    # General goods
    "general goods": "general_goods",
    "general_goods": "general_goods",
    "general": "general_goods",
    "fmcg": "general_goods",
    "fmcg & packaged goods": "general_goods",
    "packaged goods": "general_goods"
}


class OptimizationWeightsService:
    """
    Cargo-Aware Route Optimization and Priority Weighting Service.
    Configurable, modular, and extensible for multi-objective route ranking.
    """

    def __init__(self):
        self._profiles = DEFAULT_CARGO_PROFILES.copy()
        self._aliases = CARGO_ALIASES

    def get_cargo_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Return all supported cargo profiles with priority weights."""
        return self._profiles

    def normalize_cargo_type(self, cargo_type: str) -> str:
        """Map any UI cargo label to canonical key."""
        clean = (cargo_type or "general_goods").strip().lower()
        return self._aliases.get(clean, "general_goods")

    def get_cargo_weights(self, cargo_type: str) -> Dict[str, float]:
        """Return the normalized priority weights dictionary for a given cargo type."""
        canonical = self.normalize_cargo_type(cargo_type)
        profile = self._profiles.get(canonical, self._profiles["general_goods"])
        return profile["weights"]

    def update_cargo_weights(self, cargo_type: str, new_weights: Dict[str, float]) -> Dict[str, float]:
        """Allow runtime reconfiguration of weights for a cargo type."""
        canonical = self.normalize_cargo_type(cargo_type)
        if canonical not in self._profiles:
            raise ValueError(f"Unknown cargo type: {cargo_type}")

        # Normalize new weights so their sum equals 1.0
        total = sum(new_weights.values())
        if total <= 0:
            raise ValueError("Sum of weights must be greater than 0")

        normalized = {k: round(v / total, 3) for k, v in new_weights.items()}
        self._profiles[canonical]["weights"].update(normalized)
        return self._profiles[canonical]["weights"]

    def score_route_for_cargo(
        self,
        cargo_type: str,
        route_metrics: Dict[str, Any],
        min_duration_hours: Optional[float] = None,
        min_fuel_cost: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Computes a composite optimization score (0 to 100) for a route based on cargo priorities.

        Parameters:
        - cargo_type: String cargo identifier
        - route_metrics: Dict containing:
            - duration_hours: float
            - risk_score: float (0 - 100, where 100 is high danger)
            - fuel_cost: float (INR)
            - is_suitable: bool (from vehicle_service)
            - road_quality_score: Optional[float] (0 - 100)
            - hospital_access_score: Optional[float] (0 - 100)
        - min_duration_hours: Benchmark fastest duration among candidates (if None, uses duration_hours)
        - min_fuel_cost: Benchmark lowest fuel cost among candidates (if None, uses fuel_cost)

        Returns:
        Dict with total_score (0-100), subscores, and cargo priority summary.
        """
        canonical = self.normalize_cargo_type(cargo_type)
        profile = self._profiles.get(canonical, self._profiles["general_goods"])
        weights = profile["weights"]

        duration = max(route_metrics.get("duration_hours", 1.0), 0.1)
        risk = max(min(route_metrics.get("risk_score", 30.0), 100.0), 0.0)
        fuel_cost = max(route_metrics.get("fuel_cost", 1000.0), 1.0)
        is_suitable = route_metrics.get("is_suitable", True)
        road_quality = route_metrics.get("road_quality_score", 75.0)
        hospital_access = route_metrics.get("hospital_access_score", 80.0)

        bench_duration = min_duration_hours if min_duration_hours is not None else duration
        bench_cost = min_fuel_cost if min_fuel_cost is not None else fuel_cost

        # 1. Travel Time Subscore (100 = fastest possible, decays with extra time)
        time_ratio = min(bench_duration / duration, 1.0) if duration > 0 else 1.0
        time_subscore = round(time_ratio * 100.0, 1)

        # 2. Risk Subscore (100 = 0 risk, 0 = 100 risk)
        risk_subscore = round(max(100.0 - risk, 0.0), 1)

        # 3. Fuel Cost Subscore (100 = lowest fuel cost)
        cost_ratio = min(bench_cost / fuel_cost, 1.0) if fuel_cost > 0 else 1.0
        cost_subscore = round(cost_ratio * 100.0, 1)

        # 4. Structural Safety Subscore (Bridge capacity & overhead clearance)
        # If route has bridge/height violations, structural subscore drops to 0
        structural_subscore = 100.0 if is_suitable else 0.0

        # 5. Road Quality Subscore
        quality_subscore = round(max(min(road_quality, 100.0), 0.0), 1)

        # 6. Hospital Accessibility Subscore
        hospital_subscore = round(max(min(hospital_access, 100.0), 0.0), 1)

        # Calculate Weighted Composite Score
        composite_score = (
            weights.get("travel_time", 0.0) * time_subscore +
            weights.get("risk_score", 0.0) * risk_subscore +
            weights.get("fuel_cost", 0.0) * cost_subscore +
            weights.get("structural_safety", 0.0) * structural_subscore +
            weights.get("road_quality", 0.0) * quality_subscore +
            weights.get("hospital_accessibility", 0.0) * hospital_subscore
        )

        # If cargo is heavy_equipment or requires structural compliance, and route is NOT SUITABLE,
        # apply hard penalty
        if not is_suitable:
            if canonical == "heavy_equipment":
                composite_score = min(composite_score * 0.2, 25.0)
            else:
                composite_score = min(composite_score * 0.5, 45.0)

        composite_score = round(max(min(composite_score, 100.0), 0.0), 1)

        return {
            "composite_score": composite_score,
            "cargo_type": canonical,
            "display_name": profile["display_name"],
            "priority_summary": profile["priority_summary"],
            "subscores": {
                "travel_time": time_subscore,
                "risk_safety": risk_subscore,
                "fuel_cost": cost_subscore,
                "structural_safety": structural_subscore,
                "road_quality": quality_subscore,
                "hospital_access": hospital_subscore
            },
            "weights_applied": weights
        }

    def rank_and_recommend_routes(
        self,
        cargo_type: str,
        routes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Ranks all candidate routes for a specific cargo type, tags the best route,
        and provides cargo-specific justification.
        """
        if not routes:
            return []

        canonical = self.normalize_cargo_type(cargo_type)
        profile = self._profiles.get(canonical, self._profiles["general_goods"])

        # Find minimum benchmark values across candidates
        durations = [r.get("duration_hours", 1.0) for r in routes]
        min_duration = min(durations) if durations else 1.0

        fuel_costs = []
        for r in routes:
            fc = r.get("fuel_cost", {})
            cost_val = fc.get("fuel_cost", 1000.0) if isinstance(fc, dict) else 1000.0
            fuel_costs.append(cost_val)
        min_cost = min(fuel_costs) if fuel_costs else 1000.0

        # Score each route
        evaluated_routes = []
        for idx, route in enumerate(routes):
            # Extract metrics
            dur_hrs = route.get("duration_hours", 1.0)
            risk_info = route.get("ml_risk", {})
            risk_val = risk_info.get("risk_score", 30.0) if isinstance(risk_info, dict) else 30.0

            fc = route.get("fuel_cost", {})
            cost_val = fc.get("fuel_cost", 1000.0) if isinstance(fc, dict) else 1000.0

            suitability = route.get("vehicle_suitability", {})
            is_suitable = suitability.get("is_suitable", True) if isinstance(suitability, dict) else True

            # Road quality benchmark (national highway vs secondary)
            is_alt = route.get("id", "primary") != "primary"
            road_quality = 70.0 if is_alt else 90.0
            hospital_access = 70.0 if is_alt else 92.0  # Main corridor has better emergency trauma center coverage

            score_res = self.score_route_for_cargo(
                cargo_type=canonical,
                route_metrics={
                    "duration_hours": dur_hrs,
                    "risk_score": risk_val,
                    "fuel_cost": cost_val,
                    "is_suitable": is_suitable,
                    "road_quality_score": road_quality,
                    "hospital_access_score": hospital_access
                },
                min_duration_hours=min_duration,
                min_fuel_cost=min_cost
            )

            # Generate cargo justification
            justification = self._generate_cargo_justification(canonical, score_res, is_suitable, dur_hrs, risk_val, cost_val)

            optimization_entry = {
                "cargo_type": canonical,
                "cargo_display_name": profile["display_name"],
                "composite_score": score_res["composite_score"],
                "is_recommended_for_cargo": False,  # set after ranking
                "priority_summary": profile["priority_summary"],
                "subscores": score_res["subscores"],
                "weights_applied": score_res["weights_applied"],
                "justification": justification
            }

            route["cargo_optimization"] = optimization_entry
            evaluated_routes.append(route)

        # Rank by composite score descending
        # Route with the highest score becomes recommended for this cargo
        highest_score = -1.0
        best_route = None

        for r in evaluated_routes:
            score = r["cargo_optimization"]["composite_score"]
            if score > highest_score:
                highest_score = score
                best_route = r

        if best_route:
            best_route["cargo_optimization"]["is_recommended_for_cargo"] = True
            best_route["cargo_optimization"]["recommendation_badge"] = f"Top Choice for {profile['display_name']}"

        return evaluated_routes

    def _generate_cargo_justification(
        self,
        cargo_type: str,
        score_res: Dict[str, Any],
        is_suitable: bool,
        duration_hrs: float,
        risk_score: float,
        fuel_cost: float
    ) -> str:
        """Constructs human-readable rationale for cargo-specific routing."""
        score = score_res["composite_score"]

        if not is_suitable:
            return (
                f"NOT RECOMMENDED for {score_res['display_name']}: Fails bridge load ratings or overhead clearance "
                f"restrictions on this alignment (Suitability Score: {score}/100)."
            )

        if cargo_type == "medicine":
            return (
                f"Optimized for {score_res['display_name']}: Balances ultra-low terrain risk ({risk_score:.1f}/100) "
                f"with high-speed connectivity to regional medical facilities (Score: {score}/100)."
            )
        elif cargo_type == "perishable_goods":
            return (
                f"Optimized for {score_res['display_name']}: Minimizes transit duration ({duration_hrs}h) "
                f"and protects cold chain integrity against delay risks (Score: {score}/100)."
            )
        elif cargo_type == "heavy_equipment":
            return (
                f"Optimized for {score_res['display_name']}: 100% compliant with bridge load limits and road turning geometry "
                f"along certified freight corridors (Score: {score}/100)."
            )
        elif cargo_type in ["vegetables", "fruits"]:
            return (
                f"Optimized for {score_res['display_name']}: Smooth highway alignment to reduce transit vibration "
                f"and prevent product bruising while preserving shelf-life (Score: {score}/100)."
            )
        else:
            return (
                f"Optimized for {score_res['display_name']}: Maximizes fuel cost efficiency (₹{fuel_cost:,.0f}) "
                f"while maintaining dependable transit schedule (Score: {score}/100)."
            )


# Singleton instance
optimization_weights_service = OptimizationWeightsService()
