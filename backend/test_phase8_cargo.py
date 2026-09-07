"""
Test Suite for Phase 8: Cargo-Aware Routing & Multi-Objective Optimization
==========================================================================
Tests:
1. Cargo profile definitions & weight normalization (sum = 1.0)
2. Differential prioritization across cargo types:
   - Perishable goods (travel time + risk priority)
   - Medicine (terrain risk + hospital access priority)
   - Heavy equipment (bridge limits + structural safety priority)
   - Vegetables & Fruits (transit duration + road smoothness priority)
   - General goods (fuel cost economic priority)
3. Structural suitability penalty for Heavy Equipment on restricted bridges
4. API Endpoints (/api/cargo/profiles, /api/cargo/weights, /api/cargo/evaluate)
5. Full route calculation integration (/api/routes/calculate)
"""

import sys
import os

os.environ["PYTHONUNBUFFERED"] = "1"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from services.optimization_weights import optimization_weights_service, DEFAULT_CARGO_PROFILES

client = TestClient(app)


def test_cargo_profiles_and_weight_sums():
    print("\n--- Test 1: Cargo Profiles & Weight Normalization ---")
    profiles = optimization_weights_service.get_cargo_profiles()
    expected_cargos = ["general_goods", "vegetables", "fruits", "medicine", "heavy_equipment", "perishable_goods"]

    for cargo in expected_cargos:
        assert cargo in profiles, f"Missing cargo profile: {cargo}"
        weights = profiles[cargo]["weights"]
        total_weight = round(sum(weights.values()), 3)
        assert abs(total_weight - 1.0) < 0.001, f"Weights for {cargo} must sum to 1.0, got {total_weight}"
        print(f"  [PASS] Profile '{cargo}': {profiles[cargo]['priority_summary']} (Sum: {total_weight})")


def test_perishable_goods_prioritization():
    print("\n--- Test 2: Perishable Goods Prioritization (Speed & Risk) ---")
    weights = optimization_weights_service.get_cargo_weights("perishable_goods")
    assert weights["travel_time"] >= 0.40, f"Perishable goods must prioritize travel_time (got {weights['travel_time']})"
    assert weights["risk_score"] >= 0.30, f"Perishable goods must prioritize risk (got {weights['risk_score']})"

    # Fast route vs Slow route
    fast_metrics = {"duration_hours": 2.0, "risk_score": 20.0, "fuel_cost": 2200.0, "is_suitable": True}
    slow_metrics = {"duration_hours": 4.5, "risk_score": 20.0, "fuel_cost": 1500.0, "is_suitable": True}

    score_fast = optimization_weights_service.score_route_for_cargo("perishable_goods", fast_metrics, min_duration_hours=2.0, min_fuel_cost=1500.0)
    score_slow = optimization_weights_service.score_route_for_cargo("perishable_goods", slow_metrics, min_duration_hours=2.0, min_fuel_cost=1500.0)

    assert score_fast["composite_score"] > score_slow["composite_score"], "Fast route should score higher for perishable goods"
    print(f"  [PASS] Fast Route Score: {score_fast['composite_score']} > Slow Route Score: {score_slow['composite_score']}")


def test_medicine_prioritization():
    print("\n--- Test 3: Medicine Prioritization (Ultra-Low Risk & Hospital Access) ---")
    weights = optimization_weights_service.get_cargo_weights("medicine")
    assert weights["risk_score"] >= 0.35, "Medicine must have high risk_score weight"
    assert weights["hospital_accessibility"] >= 0.20, "Medicine must prioritize hospital access"

    safe_hospital_route = {
        "duration_hours": 2.2, "risk_score": 15.0, "fuel_cost": 2000.0,
        "is_suitable": True, "hospital_access_score": 95.0
    }
    risky_route = {
        "duration_hours": 2.0, "risk_score": 65.0, "fuel_cost": 1800.0,
        "is_suitable": True, "hospital_access_score": 50.0
    }

    score_safe = optimization_weights_service.score_route_for_cargo("medicine", safe_hospital_route, min_duration_hours=2.0, min_fuel_cost=1800.0)
    score_risky = optimization_weights_service.score_route_for_cargo("medicine", risky_route, min_duration_hours=2.0, min_fuel_cost=1800.0)

    assert score_safe["composite_score"] > score_risky["composite_score"], "Safe hospital corridor must score higher for medicine"
    print(f"  [PASS] Safe Corridor: {score_safe['composite_score']} vs Risky Shortcut: {score_risky['composite_score']}")


def test_heavy_equipment_structural_penalty():
    print("\n--- Test 4: Heavy Equipment Structural Penalty on Restricted Routes ---")
    weights = optimization_weights_service.get_cargo_weights("heavy_equipment")
    assert weights["structural_safety"] >= 0.40, "Heavy equipment must have high structural_safety weight"

    compliant_route = {"duration_hours": 2.5, "risk_score": 25.0, "fuel_cost": 2500.0, "is_suitable": True}
    bridge_restricted_route = {"duration_hours": 2.1, "risk_score": 20.0, "fuel_cost": 2200.0, "is_suitable": False}

    score_compliant = optimization_weights_service.score_route_for_cargo("heavy_equipment", compliant_route, min_duration_hours=2.1, min_fuel_cost=2200.0)
    score_restricted = optimization_weights_service.score_route_for_cargo("heavy_equipment", bridge_restricted_route, min_duration_hours=2.1, min_fuel_cost=2200.0)

    assert score_restricted["composite_score"] <= 25.0, "Failing bridge capacity must heavily penalize heavy equipment"
    assert score_compliant["composite_score"] > score_restricted["composite_score"]
    print(f"  [PASS] Compliant Bridge Route: {score_compliant['composite_score']} >> Restricted Bridge Route: {score_restricted['composite_score']}")


def test_general_goods_fuel_efficiency():
    print("\n--- Test 5: General Goods Fuel Efficiency Priority ---")
    weights = optimization_weights_service.get_cargo_weights("general_goods")
    assert weights["fuel_cost"] >= 0.30, "General goods must prioritize fuel cost"

    cheap_fuel_route = {"duration_hours": 2.8, "risk_score": 30.0, "fuel_cost": 1400.0, "is_suitable": True}
    expensive_route = {"duration_hours": 2.4, "risk_score": 25.0, "fuel_cost": 2500.0, "is_suitable": True}

    score_cheap = optimization_weights_service.score_route_for_cargo("general_goods", cheap_fuel_route, min_duration_hours=2.4, min_fuel_cost=1400.0)
    score_exp = optimization_weights_service.score_route_for_cargo("general_goods", expensive_route, min_duration_hours=2.4, min_fuel_cost=1400.0)

    assert score_cheap["composite_score"] >= score_exp["composite_score"]
    print(f"  [PASS] Fuel-Efficient Route: {score_cheap['composite_score']} vs High-Fuel Route: {score_exp['composite_score']}")


def test_cargo_api_endpoints():
    print("\n--- Test 6: Cargo API Endpoints ---")
    # 1. GET /api/cargo/profiles
    resp = client.get("/api/cargo/profiles")
    assert resp.status_code == 200
    data = resp.json()
    assert "medicine" in data["profiles"]
    assert "perishable_goods" in data["profiles"]
    print("  [PASS] GET /api/cargo/profiles returned status 200 with all cargo types.")

    # 2. GET /api/cargo/weights/medicine
    resp_w = client.get("/api/cargo/weights/medicine")
    assert resp_w.status_code == 200
    w_data = resp_w.json()
    assert "risk_score" in w_data["weights"]
    print(f"  [PASS] GET /api/cargo/weights/medicine: {w_data['weights']}")

    # 3. POST /api/cargo/evaluate
    eval_payload = {
        "cargo_type": "Medicine",
        "duration_hours": 2.1,
        "risk_score": 18.0,
        "fuel_cost": 1600.0,
        "is_suitable": True
    }
    resp_eval = client.post("/api/cargo/evaluate", json=eval_payload)
    assert resp_eval.status_code == 200
    eval_data = resp_eval.json()
    assert eval_data["composite_score"] > 80.0
    print(f"  [PASS] POST /api/cargo/evaluate returned composite score: {eval_data['composite_score']}/100")


def test_route_calculation_cargo_awareness():
    print("\n--- Test 7: Full Route Calculation with Cargo Optimization ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Medicine",
        "cargo_weight": 3.0
    }
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Verify cargo optimization on primary route
    assert "cargo_optimization" in data, "Primary route must contain cargo_optimization"
    cargo_opt = data["cargo_optimization"]
    assert cargo_opt["cargo_type"] == "medicine"
    assert "composite_score" in cargo_opt
    assert "is_recommended_for_cargo" in cargo_opt
    assert "justification" in cargo_opt

    # Verify cargo optimization on alternative routes
    assert "alternatives" in data and len(data["alternatives"]) > 0
    alt_cargo_opt = data["alternatives"][0].get("cargo_optimization")
    assert alt_cargo_opt is not None
    assert alt_cargo_opt["cargo_type"] == "medicine"

    print("  [PASS] Route calculation successfully included Cargo-Aware Intelligence:")
    print(f"         Cargo Type:       {cargo_opt['cargo_display_name']}")
    print(f"         Composite Score:  {cargo_opt['composite_score']}/100 (Recommended: {cargo_opt['is_recommended_for_cargo']})")
    print(f"         Justification:    {cargo_opt['justification']}")


if __name__ == "__main__":
    print("========================================================================")
    print("       RUNNING PHASE 8: CARGO-AWARE ROUTING TEST SUITE")
    print("========================================================================")
    test_cargo_profiles_and_weight_sums()
    test_perishable_goods_prioritization()
    test_medicine_prioritization()
    test_heavy_equipment_structural_penalty()
    test_general_goods_fuel_efficiency()
    test_cargo_api_endpoints()
    test_route_calculation_cargo_awareness()
    print("\n========================================================================")
    print("       [ALL PHASE 8 BACKEND TESTS PASSED SUCCESSFULLY!]")
    print("========================================================================")
