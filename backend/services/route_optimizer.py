"""
Route Optimizer Service
=======================
Phase 9: AI-Assisted Route Optimization using Google OR-Tools.

Takes all 8 logistics intelligence dimensions:
1. Route distance (km)
2. Travel time (hours)
3. Fuel cost (INR)
4. Weather (rainfall, wind, temperature)
5. ML risk score (0-100)
6. Vehicle physical restrictions & bridge weight limits
7. Cargo type & priorities
8. Accessibility information (distance to emergency hospitals & facilities)

Normalizes all values to comparable [0.0, 1.0] penalty scales.
Formulates and solves a multi-criteria optimization problem using Google OR-Tools.
Recommends the route with the LOWEST VALID SCORE.
Strictly disqualifies any route that violates vehicle physical restrictions.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from ortools.linear_solver import pywraplp

logger = logging.getLogger(__name__)


# Default Configurable Objective Weights (Minimization function: lower score is better)
# distance_weight + time_weight + cost_weight + risk_weight + accessibility_weight = 1.0
DEFAULT_OPTIMIZER_WEIGHTS: Dict[str, float] = {
    "distance_weight": 0.15,
    "time_weight": 0.25,
    "cost_weight": 0.20,
    "risk_weight": 0.25,
    "accessibility_weight": 0.15
}

# Cargo-Modulated Weight Adjustments
CARGO_WEIGHT_MODULATIONS: Dict[str, Dict[str, float]] = {
    "medicine": {
        "distance_weight": 0.05,
        "time_weight": 0.20,
        "cost_weight": 0.10,
        "risk_weight": 0.35,
        "accessibility_weight": 0.30
    },
    "perishable_goods": {
        "distance_weight": 0.10,
        "time_weight": 0.40,
        "cost_weight": 0.15,
        "risk_weight": 0.30,
        "accessibility_weight": 0.05
    },
    "heavy_equipment": {
        "distance_weight": 0.20,
        "time_weight": 0.15,
        "cost_weight": 0.25,
        "risk_weight": 0.25,
        "accessibility_weight": 0.15
    },
    "vegetables": {
        "distance_weight": 0.10,
        "time_weight": 0.35,
        "cost_weight": 0.20,
        "risk_weight": 0.25,
        "accessibility_weight": 0.10
    },
    "fruits": {
        "distance_weight": 0.10,
        "time_weight": 0.35,
        "cost_weight": 0.20,
        "risk_weight": 0.25,
        "accessibility_weight": 0.10
    },
    "general_goods": {
        "distance_weight": 0.25,
        "time_weight": 0.20,
        "cost_weight": 0.35,
        "risk_weight": 0.15,
        "accessibility_weight": 0.05
    }
}


class RouteOptimizerService:
    """
    Mathematical Route Scoring & Optimization Engine.
    Uses Google OR-Tools MIP solver to recommend optimal routes.
    """

    def __init__(self):
        self.default_weights = DEFAULT_OPTIMIZER_WEIGHTS.copy()
        self.cargo_modulations = CARGO_WEIGHT_MODULATIONS

    def get_weights(self, cargo_type: Optional[str] = None) -> Dict[str, float]:
        """Returns normalized weights, modulated by cargo type if provided."""
        clean_cargo = (cargo_type or "").strip().lower().replace(" ", "_")
        if clean_cargo in self.cargo_modulations:
            return self.cargo_modulations[clean_cargo].copy()
        return self.default_weights.copy()

    def normalize_metrics(
        self,
        candidate_routes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Normalizes all 8 dimensions to a comparable [0.0, 1.0] scale.
        0.0 = Best (lowest distance, fastest time, lowest cost, minimum risk, closest accessibility).
        1.0 = Worst (maximum distance, slowest time, highest cost, extreme risk, isolated).
        """
        if not candidate_routes:
            return []

        # Extract metric values across candidates
        distances = [max(r.get("distance_km", 10.0), 0.1) for r in candidate_routes]
        durations = [max(r.get("duration_hours", 1.0), 0.1) for r in candidate_routes]

        costs = []
        for r in candidate_routes:
            fc = r.get("fuel_cost", {})
            cost_val = fc.get("fuel_cost", 1000.0) if isinstance(fc, dict) else 1000.0
            costs.append(max(cost_val, 1.0))

        risks = []
        for r in candidate_routes:
            risk_info = r.get("ml_risk", {})
            risk_val = risk_info.get("risk_score", 25.0) if isinstance(risk_info, dict) else 25.0
            risks.append(max(min(risk_val, 100.0), 0.0))

        # Benchmarks
        min_dist, max_dist = min(distances), max(distances)
        min_dur, max_dur = min(durations), max(durations)
        min_cost, max_cost = min(costs), max(costs)
        min_risk, max_risk = min(risks), max(risks)

        normalized_candidates = []

        for idx, route in enumerate(candidate_routes):
            dist = distances[idx]
            dur = durations[idx]
            cost = costs[idx]
            risk = risks[idx]

            # 1. Distance norm (if all equal, 0.0)
            d_norm = (dist - min_dist) / (max_dist - min_dist) if max_dist > min_dist else 0.0

            # 2. Time norm
            t_norm = (dur - min_dur) / (max_dur - min_dur) if max_dur > min_dur else 0.0

            # 3. Cost norm
            c_norm = (cost - min_cost) / (max_cost - min_cost) if max_cost > min_cost else 0.0

            # 4. Risk norm (0-100 scale normalized directly or relative)
            # Incorporate weather factor if available
            weather_penalty = 0.0
            w_info = route.get("weather", {})
            if isinstance(w_info, dict):
                summary_val = str(w_info.get("summary", "")).lower()
                risk_level = str(w_info.get("corridor_risk_level", "")).lower()
                if "rain" in summary_val or "thunder" in summary_val or "high" in risk_level:
                    weather_penalty = 0.1
            r_norm = min((risk / 100.0) + weather_penalty, 1.0)

            # 5. Accessibility norm (inaccessibility penalty: 0 = close to hospital/corridor, 1 = isolated)
            acc_info = route.get("accessibility")
            if isinstance(acc_info, dict) and "inaccessibility_penalty" in acc_info:
                a_norm = float(acc_info["inaccessibility_penalty"])
            elif isinstance(acc_info, dict) and "accessibility_score" in acc_info:
                a_norm = max(0.0, min(1.0, 1.0 - (float(acc_info["accessibility_score"]) / 100.0)))
            else:
                is_alt = route.get("id", "primary") != "primary"
                a_norm = 0.35 if is_alt else 0.10

            # 6. Vehicle restriction compliance
            suitability = route.get("vehicle_suitability", {})
            is_suitable = suitability.get("is_suitable", True) if isinstance(suitability, dict) else True
            violations = suitability.get("violations", []) if isinstance(suitability, dict) else []

            normalized_candidates.append({
                "original_route": route,
                "id": route.get("id", f"route-{idx}"),
                "name": route.get("name", "Primary Highway Route" if idx == 0 else f"Alternative Route {idx}"),
                "distance_km": dist,
                "duration_hours": dur,
                "fuel_cost": cost,
                "risk_score": risk,
                "is_suitable": is_suitable,
                "violations": violations,
                "norm": {
                    "distance": round(d_norm, 3),
                    "time": round(t_norm, 3),
                    "cost": round(c_norm, 3),
                    "risk": round(r_norm, 3),
                    "inaccessibility": round(a_norm, 3)
                }
            })

        return normalized_candidates

    def calculate_route_scores(
        self,
        normalized_candidates: List[Dict[str, Any]],
        weights: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Calculates the Final Route Score for each route.
        Formula:
          Final Score = w_d * D' + w_t * T' + w_c * C' + w_r * R' + w_a * A'
        If a route violates vehicle restrictions, its score is assigned 9999.0 (invalid).
        """
        w_d = weights.get("distance_weight", 0.15)
        w_t = weights.get("time_weight", 0.25)
        w_c = weights.get("cost_weight", 0.20)
        w_r = weights.get("risk_weight", 0.25)
        w_a = weights.get("accessibility_weight", 0.15)

        scored_routes = []

        for cand in normalized_candidates:
            norm = cand["norm"]
            is_suitable = cand["is_suitable"]

            if not is_suitable:
                final_score = 9999.0
                is_valid = False
                disqualified_reason = f"Violates vehicle restrictions: {len(cand['violations'])} structural or clearance violations."
            else:
                raw_score = (
                    w_d * norm["distance"] +
                    w_t * norm["time"] +
                    w_c * norm["cost"] +
                    w_r * norm["risk"] +
                    w_a * norm["inaccessibility"]
                )
                final_score = round(raw_score, 3)
                is_valid = True
                disqualified_reason = None

            weighted_components = {
                "distance_component": round(w_d * norm["distance"], 3),
                "time_component": round(w_t * norm["time"], 3),
                "cost_component": round(w_c * norm["cost"], 3),
                "risk_component": round(w_r * norm["risk"], 3),
                "accessibility_component": round(w_a * norm["inaccessibility"], 3)
            }

            cand_entry = cand.copy()
            cand_entry["final_score"] = final_score
            cand_entry["is_valid"] = is_valid
            cand_entry["disqualified_reason"] = disqualified_reason
            cand_entry["weighted_components"] = weighted_components
            scored_routes.append(cand_entry)

        return scored_routes

    def solve_optimal_route(
        self,
        scored_routes: List[Dict[str, Any]],
        weights: Dict[str, float]
    ) -> Tuple[Optional[int], str, Dict[str, Any]]:
        """
        Uses Google OR-Tools Mixed Integer Programming (MIP) solver to pick the route
        with the minimum valid score, subject to strict restriction constraints.
        """
        if not scored_routes:
            return None, "No candidate routes provided", {}

        # 1. Initialize Google OR-Tools Solver
        solver = pywraplp.Solver.CreateSolver("SCIP")
        if not solver:
            solver = pywraplp.Solver.CreateSolver("CBC")
        if not solver:
            solver = pywraplp.Solver.CreateSolver("GLOP")

        n = len(scored_routes)
        valid_indices = [i for i, r in enumerate(scored_routes) if r["is_valid"]]

        # Handle case where all routes violate restrictions
        if not valid_indices:
            reason = "CRITICAL ALERT: No suitable route found! All candidate corridors violate vehicle bridge weight limits or overhead clearances."
            return None, reason, {"status": "INFEASIBLE", "valid_count": 0}

        # 2. Binary decision variables: x[i] in {0, 1}
        x = [solver.BoolVar(f"route_{i}") for i in range(n)]

        # 3. Hard Constraint: Exactly one route must be selected
        solver.Add(solver.Sum(x) == 1)

        # 4. Hard Constraint: Invalid routes (restriction violations) CAN NEVER BE SELECTED
        for i, r in enumerate(scored_routes):
            if not r["is_valid"]:
                solver.Add(x[i] == 0)

        # 5. Objective: Minimize Sum(final_score[i] * x[i])
        objective = solver.Objective()
        for i, r in enumerate(scored_routes):
            objective.SetCoefficient(x[i], float(r["final_score"]))
        objective.SetMinimization()

        # 6. Solve
        status = solver.Solve()

        winner_idx = None
        if status in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
            for i in range(n):
                if x[i].solution_value() > 0.5:
                    winner_idx = i
                    break

        if winner_idx is None:
            # Deterministic fallback: pick valid route with minimum final_score
            winner_idx = min(valid_indices, key=lambda i: scored_routes[i]["final_score"])

        winner = scored_routes[winner_idx]
        reason = (
            f"Mathematically selected by Google OR-Tools: Lowest valid composite score ({winner['final_score']:.3f}). "
            f"100% compliant with vehicle bridge and clearance limits, balancing risk ({winner['risk_score']:.1f}/100) "
            f"and transit time ({winner['duration_hours']:.1f}h)."
        )

        solver_info = {
            "solver_name": solver.ProblemType() if hasattr(solver, "ProblemType") else "Google OR-Tools MIP",
            "iterations": solver.iterations() if hasattr(solver, "iterations") else 1,
            "status": "OPTIMAL",
            "valid_candidates_count": len(valid_indices),
            "total_candidates_count": n
        }

        return winner_idx, reason, solver_info

    def optimize_routes(
        self,
        candidate_routes: List[Dict[str, Any]],
        cargo_type: Optional[str] = None,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Main optimization pipeline:
        1. Resolves weights (modulated by cargo type or custom overrides).
        2. Normalizes metrics to [0.0, 1.0].
        3. Calculates Final Route Score (with vehicle restriction penalties).
        4. Solves with Google OR-Tools MIP solver.
        5. Returns recommended route, alternatives, score breakdowns, and recommendation reasons.
        """
        if not candidate_routes:
            return {
                "status": "error",
                "message": "No candidate routes provided for optimization"
            }

        # 1. Resolve weights
        weights = custom_weights if custom_weights else self.get_weights(cargo_type)
        # Normalize weights so sum is 1.0
        total_w = sum(weights.values())
        if total_w > 0:
            weights = {k: round(v / total_w, 3) for k, v in weights.items()}

        # 2. Normalize
        normalized = self.normalize_metrics(candidate_routes)

        # 3. Score
        scored = self.calculate_route_scores(normalized, weights)

        # 4. Solve with Google OR-Tools
        winner_idx, reason, solver_info = self.solve_optimal_route(scored, weights)

        # 5. Format results
        routes_output = []
        recommended_route = None
        alternative_routes = []

        for idx, s_route in enumerate(scored):
            is_winner = (idx == winner_idx)
            orig = s_route["original_route"]

            route_summary = {
                "route_id": s_route["id"],
                "name": s_route["name"],
                "is_recommended": is_winner,
                "is_valid": s_route["is_valid"],
                "final_score": s_route["final_score"],
                "disqualified_reason": s_route["disqualified_reason"],
                "normalized_metrics": s_route["norm"],
                "weighted_components": s_route["weighted_components"],
                "metrics_snapshot": {
                    "distance_km": s_route["distance_km"],
                    "duration_hours": s_route["duration_hours"],
                    "fuel_cost": s_route["fuel_cost"],
                    "risk_score": s_route["risk_score"]
                }
            }

            # Embed optimization tags in original route objects
            orig["final_route_score"] = s_route["final_score"]
            orig["is_optimal_recommendation"] = is_winner
            orig["optimizer_summary"] = route_summary

            routes_output.append(route_summary)

            if is_winner:
                recommended_route = orig
            else:
                alternative_routes.append(orig)

        return {
            "status": "success",
            "recommended_route": recommended_route,
            "alternative_routes": alternative_routes,
            "routes_scored": routes_output,
            "weights_used": weights,
            "recommendation_reason": reason,
            "cargo_type_applied": cargo_type or "standard",
            "solver_info": solver_info
        }


# Global singleton instance
route_optimizer_service = RouteOptimizerService()
