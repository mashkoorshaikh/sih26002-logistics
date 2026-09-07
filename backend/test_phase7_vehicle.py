"""
Test Suite for Phase 7: Vehicle-Aware Routing & Suitability Engine
==================================================================
Tests:
1. Vehicle profiles integrity & physical dimensions
2. Specification resolution (kg, tonnes, custom dimensions)
3. Road restriction & bridge weight limit evaluation
4. Detection of 'NOT SUITABLE' routes with clear explanations
5. Demo data disclaimers (never claiming real navigation data)
6. FastAPI endpoints (/api/vehicles/profiles, /api/vehicles/check-suitability)
7. Full route planning integration (/api/routes/calculate)
"""

import sys
import os

# Set unbuffered output and UTF-8 safe prints for Windows terminals
os.environ["PYTHONUNBUFFERED"] = "1"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from services.vehicle_service import vehicle_service, VEHICLE_PROFILES, DEMO_ROAD_RESTRICTIONS

client = TestClient(app)


def test_vehicle_profiles():
    print("\n--- Test 1: Vehicle Profiles & Dimension Integrity ---")
    profiles = vehicle_service.get_vehicle_profiles()
    assert "heavy_truck" in profiles, "heavy_truck profile must exist"
    assert "truck" in profiles, "truck profile must exist"
    assert "mini_truck" in profiles, "mini_truck profile must exist"
    assert "car" in profiles, "car profile must exist"

    ht = profiles["heavy_truck"]
    assert ht["weight"] == 17000, f"Expected 17000kg for heavy_truck, got {ht['weight']}"
    assert ht["height"] == 3.8, f"Expected 3.8m height, got {ht['height']}"
    assert ht["width"] == 2.5, f"Expected 2.5m width, got {ht['width']}"
    assert ht["length"] == 12.0, f"Expected 12m length, got {ht['length']}"

    print(f"  [PASS] Profiles loaded: {len(profiles)} vehicle types configured.")
    print(f"         Heavy Truck: {ht['weight']}kg, H={ht['height']}m, W={ht['width']}m, L={ht['length']}m")


def test_spec_resolution():
    print("\n--- Test 2: Specification Resolution (kg, tonnes, overrides) ---")
    # Case A: Input weight in tonnes (e.g. 17.5 t -> 17500 kg)
    specs_tonnes = vehicle_service.resolve_vehicle_specs("heavy_truck", weight=17.5)
    assert specs_tonnes["weight"] == 17500.0
    assert specs_tonnes["weight_tonnes"] == 17.5

    # Case B: Input weight in kg (e.g. 17000 kg)
    specs_kg = vehicle_service.resolve_vehicle_specs("heavy_truck", weight=17000)
    assert specs_kg["weight"] == 17000.0

    # Case C: Dimension overrides
    specs_custom = vehicle_service.resolve_vehicle_specs(
        "mini_truck", weight=4000, height=2.9, width=2.0, length=5.2
    )
    assert specs_custom["height"] == 2.9
    assert specs_custom["width"] == 2.0
    assert specs_custom["length"] == 5.2

    print("  [PASS] Weight and dimension normalization works across units and custom overrides.")


def test_suitable_route_evaluation():
    print("\n--- Test 3: Suitable Vehicle Evaluation (Car / Light Vehicle) ---")
    car_specs = vehicle_service.resolve_vehicle_specs("car")
    eval_result = vehicle_service.evaluate_route_suitability(
        vehicle_specs=car_specs,
        route_id="primary",
        source="Guwahati",
        destination="Shillong",
        route_name="NH6 Freight Corridor"
    )

    assert eval_result["status"] == "SUITABLE", f"Expected SUITABLE, got {eval_result['status']}"
    assert eval_result["is_suitable"] is True
    assert len(eval_result["violations"]) == 0
    assert eval_result["is_demo_data"] is True
    print(f"  [PASS] Car on Guwahati-Shillong is marked: {eval_result['status']}")


def test_bridge_weight_violation():
    print("\n--- Test 4: Bridge Weight Limit Violation (Heavy Truck on Old Bypass) ---")
    # Heavy truck: 17,000 kg
    # Umiam Heritage Bypass Bridge limit: 12,000 kg
    heavy_truck_specs = vehicle_service.resolve_vehicle_specs("heavy_truck", weight=17000)
    eval_result = vehicle_service.evaluate_route_suitability(
        vehicle_specs=heavy_truck_specs,
        route_id="alt-1",  # Alternative bypass route where bridge restriction applies
        source="Guwahati",
        destination="Shillong",
        route_name="Alternate Bypass Route"
    )

    assert eval_result["status"] == "NOT SUITABLE", f"Expected NOT SUITABLE, got {eval_result['status']}"
    assert eval_result["is_suitable"] is False
    assert len(eval_result["violations"]) > 0

    # Verify bridge weight violation is captured with explanation
    bridge_violations = [v for v in eval_result["violations"] if v["violation_type"] == "bridge_weight_limit"]
    assert len(bridge_violations) > 0, "Should have flagged bridge_weight_limit"
    violation = bridge_violations[0]
    assert violation["limit_value"] == 12000
    assert violation["vehicle_value"] == 17000
    assert violation["excess"] == 5000

    print(f"  [PASS] Heavy Truck on Alternate Route marked: {eval_result['status']}")
    print(f"         Reason: {eval_result['reasons'][0]}")


def test_overhead_clearance_violation():
    print("\n--- Test 5: Overhead Clearance Violation ---")
    # Vehicle height: 3.8m, Low clearance underpass: 3.5m
    tall_truck_specs = vehicle_service.resolve_vehicle_specs("heavy_truck", height=3.8)
    eval_result = vehicle_service.evaluate_route_suitability(
        vehicle_specs=tall_truck_specs,
        route_id="alt-1",
        source="Guwahati",
        destination="Shillong"
    )

    height_violations = [v for v in eval_result["violations"] if v["violation_type"] == "overhead_clearance"]
    assert len(height_violations) > 0, "Should have flagged overhead_clearance"
    print(f"  [PASS] Tall Truck flagged with overhead clearance violation: {height_violations[0]['excess']}m excess")


def test_vehicle_api_endpoints():
    print("\n--- Test 6: Vehicle API Endpoints ---")
    # 1. GET /api/vehicles/profiles
    resp = client.get("/api/vehicles/profiles")
    assert resp.status_code == 200
    data = resp.json()
    assert "heavy_truck" in data["profiles"]
    print("  [PASS] GET /api/vehicles/profiles returned status 200 with vehicle profiles.")

    # 2. GET /api/vehicles/restrictions
    resp_restr = client.get("/api/vehicles/restrictions")
    assert resp_restr.status_code == 200
    restr_data = resp_restr.json()
    assert restr_data["is_demo_data"] is True
    print("  [PASS] GET /api/vehicles/restrictions returned demo restrictions with disclaimer.")

    # 3. POST /api/vehicles/check-suitability
    check_payload = {
        "vehicle_type": "heavy_truck",
        "weight": 17000,
        "height": 3.8,
        "width": 2.5,
        "length": 12.0,
        "route_id": "alt-1",
        "source": "Guwahati",
        "destination": "Shillong"
    }
    resp_check = client.post("/api/vehicles/check-suitability", json=check_payload)
    assert resp_check.status_code == 200
    check_data = resp_check.json()
    assert check_data["status"] == "NOT SUITABLE"
    assert check_data["is_suitable"] is False
    assert len(check_data["reasons"]) > 0
    print(f"  [PASS] POST /api/vehicles/check-suitability returned {check_data['status']} with {len(check_data['reasons'])} reasons.")


def test_route_calculation_with_vehicle_awareness():
    print("\n--- Test 7: Full Route Calculation Integration (/api/routes/calculate) ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "heavy_truck",
        "vehicle_weight": 12.0,
        "cargo_type": "Machinery",
        "cargo_weight": 5.0,
        "vehicle_height": 3.8,
        "vehicle_width": 2.5,
        "vehicle_length": 12.0,
        "vehicle_weight_kg": 17000
    }
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()

    # Primary route must contain vehicle_suitability
    assert "vehicle_suitability" in data, "Primary route must contain vehicle_suitability"
    primary_suit = data["vehicle_suitability"]
    assert primary_suit["status"] in ["SUITABLE", "NOT SUITABLE"]
    assert "vehicle_profile" in primary_suit

    # Alternatives must also contain vehicle_suitability
    assert "alternatives" in data and len(data["alternatives"]) > 0
    alt = data["alternatives"][0]
    assert "vehicle_suitability" in alt, "Alternative route must contain vehicle_suitability"
    alt_suit = alt["vehicle_suitability"]
    assert alt_suit["status"] == "NOT SUITABLE", f"Alternate bypass should be NOT SUITABLE for 17t truck, got {alt_suit['status']}"

    print("  [PASS] Route calculation successfully integrated vehicle suitability intelligence:")
    print(f"         Primary route suitability:   {primary_suit['status']}")
    print(f"         Alternative route suitability: {alt_suit['status']} (Violations: {len(alt_suit['violations'])})")


if __name__ == "__main__":
    print("========================================================================")
    print("      RUNNING PHASE 7: VEHICLE-AWARE ROUTING TEST SUITE")
    print("========================================================================")
    test_vehicle_profiles()
    test_spec_resolution()
    test_suitable_route_evaluation()
    test_bridge_weight_violation()
    test_overhead_clearance_violation()
    test_vehicle_api_endpoints()
    test_route_calculation_with_vehicle_awareness()
    print("\n========================================================================")
    print("      [ALL PHASE 7 BACKEND TESTS PASSED SUCCESSFULLY!]")
    print("========================================================================")
