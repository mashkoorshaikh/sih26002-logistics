"""
Test Suite for Phase 9: AI-Assisted Route Optimization (Google OR-Tools)
========================================================================
Tests:
1. Metric normalization into comparable [0.0, 1.0] penalty scales
2. Final Route Score calculation with configurable weights
3. Google OR-Tools MIP solver selecting the route with the LOWEST VALID SCORE
4. Strict enforcement of vehicle restrictions (routes with violations can NEVER be selected)
5. Infeasible detection when all routes violate restrictions
6. Cargo-modulated objective weights
7. Optimizer API Endpoints (/api/optimizer/weights, /api/optimizer/optimize)
8. End-to-end route calculation integration (/api/routes/calculate)
"""

import sys
import os

os.environ["PYTHONUNBUFFERED"] = "1"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from services.route_optimizer import route_optimizer_service, DEFAULT_OPTIMIZER_WEIGHTS

client = TestClient(app)


def test_metric_normalization():
    print("\n--- Test 1: Metric Normalization into [0.0, 1.0] Penalty Scales ---")
    candidates = [
        {"id": "r1", "distance_km": 100.0, "duration_hours": 2.0, "fuel_cost": {"fuel_cost": 1500.0}, "ml_risk": {"risk_score": 10.0}, "vehicle_suitability": {"is_suitable": True}},
        {"id": "r2", "distance_km": 120.0, "duration_hours": 2.5, "fuel_cost": {"fuel_cost": 1800.0}, "ml_risk": {"risk_score": 50.0}, "vehicle_suitability": {"is_suitable": True}},
        {"id": "r3", "distance_km": 150.0, "duration_hours": 3.2, "fuel_cost": {"fuel_cost": 2200.0}, "ml_risk": {"risk_score": 70.0}, "vehicle_suitability": {"is_suitable": True}},
    ]
    norm = route_optimizer_service.normalize_metrics(candidates)
    assert len(norm) == 3

    # Best distance route should have distance norm 0.0, worst should have 1.0
    assert norm[0]["norm"]["distance"] == 0.0
    assert norm[2]["norm"]["distance"] == 1.0

    # Best time route should have time norm 0.0, worst should have 1.0
    assert norm[0]["norm"]["time"] == 0.0
    assert norm[2]["norm"]["time"] == 1.0

    print("  [PASS] All metrics normalized to comparable [0.0, 1.0] scale.")


def test_ortools_lowest_score_recommendation():
    print("\n--- Test 2: Google OR-Tools Lowest Score Minimization ---")
    # Candidate A: Faster and lower risk -> Lower score (Best)
    # Candidate B: Slower, more expensive, higher risk -> Higher score
    candidates = [
        {
            "id": "route_best",
            "name": "Primary National Highway",
            "distance_km": 100.0,
            "duration_hours": 2.1,
            "fuel_cost": {"fuel_cost": 1840.0},
            "ml_risk": {"risk_score": 15.0},
            "vehicle_suitability": {"is_suitable": True}
        },
        {
            "id": "route_worse",
            "name": "Secondary Deteriorated Pass",
            "distance_km": 130.0,
            "duration_hours": 3.4,
            "fuel_cost": {"fuel_cost": 2400.0},
            "ml_risk": {"risk_score": 60.0},
            "vehicle_suitability": {"is_suitable": True}
        }
    ]

    opt_result = route_optimizer_service.optimize_routes(candidates, cargo_type="general_goods")
    assert opt_result["status"] == "success"
    assert opt_result["recommended_route"]["id"] == "route_best", "OR-Tools must select route with lowest score"

    scored = opt_result["routes_scored"]
    assert scored[0]["final_score"] < scored[1]["final_score"]
    print(f"  [PASS] Winner: {opt_result['recommended_route']['name']} with score {scored[0]['final_score']} < {scored[1]['final_score']}")


def test_vehicle_restriction_hard_enforcement():
    print("\n--- Test 3: Vehicle Restriction Hard Enforcement (Never Select Invalid Routes) ---")
    # Route 1: Direct shortcut (shorter and faster), BUT VIOLATES BRIDGE WEIGHT LIMIT (is_suitable: False)
    # Route 2: Longer bypass, BUT FULLY SUITABLE (is_suitable: True)
    candidates = [
        {
            "id": "route_shortcut_illegal",
            "name": "Old Heritage Bridge Shortcut (12t Limit Violated)",
            "distance_km": 80.0,
            "duration_hours": 1.5,
            "fuel_cost": {"fuel_cost": 1200.0},
            "ml_risk": {"risk_score": 10.0},
            "vehicle_suitability": {
                "is_suitable": False,
                "violations": [{"violation_type": "bridge_weight_limit", "message": "Exceeds 12t bridge"}]
            }
        },
        {
            "id": "route_long_compliant",
            "name": "Heavy Freight Approved Corridor",
            "distance_km": 115.0,
            "duration_hours": 2.4,
            "fuel_cost": {"fuel_cost": 2000.0},
            "ml_risk": {"risk_score": 25.0},
            "vehicle_suitability": {
                "is_suitable": True,
                "violations": []
            }
        }
    ]

    opt_result = route_optimizer_service.optimize_routes(candidates, cargo_type="heavy_equipment")
    assert opt_result["status"] == "success"

    # IMPORTANT: The illegal shortcut MUST NOT be selected despite being shorter/faster!
    recommended_id = opt_result["recommended_route"]["id"]
    assert recommended_id == "route_long_compliant", f"Expected compliant route, got: {recommended_id}"

    # Verify illegal route received disqualified penalty
    illegal_entry = next(r for r in opt_result["routes_scored"] if r["route_id"] == "route_shortcut_illegal")
    assert illegal_entry["is_valid"] is False
    assert illegal_entry["final_score"] >= 9999.0

    print("  [PASS] Google OR-Tools strictly disqualified route violating bridge limits (Score = 9999.0).")
    print(f"         Selected compliant route: {opt_result['recommended_route']['name']}")


def test_infeasible_when_all_routes_violate_restrictions():
    print("\n--- Test 4: Infeasible Detection When All Routes Violate Restrictions ---")
    candidates = [
        {
            "id": "r1",
            "name": "Corridor A (Bridge Overload)",
            "distance_km": 100.0,
            "duration_hours": 2.0,
            "vehicle_suitability": {"is_suitable": False, "violations": ["bridge"]}
        },
        {
            "id": "r2",
            "name": "Corridor B (Low Height Underpass)",
            "distance_km": 110.0,
            "duration_hours": 2.2,
            "vehicle_suitability": {"is_suitable": False, "violations": ["clearance"]}
        }
    ]

    opt_result = route_optimizer_service.optimize_routes(candidates, cargo_type="heavy_equipment")
    assert opt_result["recommended_route"] is None, "Should not recommend any route when all violate restrictions"
    assert "No suitable route found" in opt_result["recommendation_reason"]
    print("  [PASS] Correctly flagged infeasible when all candidate routes violate restrictions.")


def test_cargo_modulated_weights():
    print("\n--- Test 5: Cargo-Modulated Weight Adjustments ---")
    w_med = route_optimizer_service.get_weights("medicine")
    w_perish = route_optimizer_service.get_weights("perishable_goods")
    w_gen = route_optimizer_service.get_weights("general_goods")

    assert w_med["risk_weight"] > w_gen["risk_weight"], "Medicine must have higher risk weight than general goods"
    assert w_med["accessibility_weight"] > w_perish["accessibility_weight"], "Medicine must have higher accessibility weight"
    assert w_perish["time_weight"] > w_gen["time_weight"], "Perishables must have higher time weight"
    print("  [PASS] Cargo profiles correctly modulate objective weights:")
    print(f"         Medicine:    Risk={w_med['risk_weight']}, Access={w_med['accessibility_weight']}")
    print(f"         Perishables: Time={w_perish['time_weight']}, Risk={w_perish['risk_weight']}")
    print(f"         General:     Cost={w_gen['cost_weight']}, Dist={w_gen['distance_weight']}")


def test_optimizer_api_endpoints():
    print("\n--- Test 6: Optimizer API Endpoints ---")
    # 1. GET /api/optimizer/weights
    resp_w = client.get("/api/optimizer/weights")
    assert resp_w.status_code == 200
    w_data = resp_w.json()
    assert "distance_weight" in w_data["default_weights"]
    print("  [PASS] GET /api/optimizer/weights returned status 200.")

    # 2. POST /api/optimizer/optimize
    payload = {
        "routes": [
            {
                "id": "r_opt_1",
                "name": "Direct Highway",
                "distance_km": 98.0,
                "duration_hours": 2.0,
                "fuel_cost": {"fuel_cost": 1800.0},
                "ml_risk": {"risk_score": 15.0},
                "vehicle_suitability": {"is_suitable": True}
            },
            {
                "id": "r_opt_2",
                "name": "Bypass Trail",
                "distance_km": 115.0,
                "duration_hours": 2.8,
                "fuel_cost": {"fuel_cost": 2100.0},
                "ml_risk": {"risk_score": 35.0},
                "vehicle_suitability": {"is_suitable": True}
            }
        ],
        "cargo_type": "Medicine"
    }
    resp_opt = client.post("/api/optimizer/optimize", json=payload)
    assert resp_opt.status_code == 200
    opt_data = resp_opt.json()
    assert opt_data["recommended_route_id"] == "r_opt_1"
    assert len(opt_data["routes_scored"]) == 2
    print(f"  [PASS] POST /api/optimizer/optimize selected {opt_data['recommended_route_id']} with solver info.")


def test_route_calculation_with_or_tools():
    print("\n--- Test 7: Full Route Calculation with OR-Tools (/api/routes/calculate) ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Perishable goods",
        "cargo_weight": 4.0
    }
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Verify Phase 9 optimization output
    assert "final_route_score" in data, "Primary route must have final_route_score"
    assert "optimization_result" in data, "Response must contain optimization_result"

    opt_res = data["optimization_result"]
    assert opt_res["status"] == "success"
    assert "routes_scored" in opt_res
    assert len(opt_res["routes_scored"]) >= 1

    primary_score = data["final_route_score"]
    assert primary_score is not None and primary_score < 9999.0

    print("  [PASS] Route Calculation successfully integrated Google OR-Tools:")
    print(f"         Recommended Route Score: {primary_score:.3f} (Lowest Valid Score)")
    print(f"         Recommendation Reason:   {opt_res['recommendation_reason']}")


if __name__ == "__main__":
    print("========================================================================")
    print("   RUNNING PHASE 9: AI-ASSISTED ROUTE OPTIMIZATION TEST SUITE")
    print("========================================================================")
    test_metric_normalization()
    test_ortools_lowest_score_recommendation()
    test_vehicle_restriction_hard_enforcement()
    test_infeasible_when_all_routes_violate_restrictions()
    test_cargo_modulated_weights()
    test_optimizer_api_endpoints()
    test_route_calculation_with_or_tools()
    print("\n========================================================================")
    print("   [ALL PHASE 9 BACKEND TESTS PASSED SUCCESSFULLY!]")
    print("========================================================================")
