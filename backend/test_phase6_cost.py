"""
UNIT & INTEGRATION TESTS FOR PHASE 6: LOGISTICS COST CALCULATION
================================================================
Tests:
1. Exact prompt example:
   Distance: 100 km, Truck (mileage = 5 km/l), Fuel price: 92
   -> fuel_required: 20, fuel_cost: 1840
2. Mini truck example (mileage = 10 km/l)
   -> fuel_required: 10, fuel_cost: 920
3. Car example (mileage = 15 km/l, fuel_price = 98)
   -> fuel_required: 10, fuel_cost: 980
4. Vehicle configuration registry inspection (GET /api/cost/vehicles).
5. POST /api/cost/calculate API endpoint.
6. Input validation (negative distance, zero mileage rejected with 422).
7. Route planning workflow integration (POST /api/routes/calculate includes fuel_cost).
"""

import os
import sys
import warnings
warnings.filterwarnings("ignore")
from dotenv import load_dotenv
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from services.cost_service import cost_service, VEHICLE_CONFIGURATIONS

client = TestClient(app)


def test_prompt_example_truck_cost():
    """Verify exact prompt example: distance 100, truck (mileage 5), price 92 -> fuel_required 20, fuel_cost 1840."""
    print("\n--- Test 1: Exact Prompt Example (Truck) ---")
    result = cost_service.calculate_fuel_cost(
        distance=100,
        vehicle_type="truck",
        vehicle_mileage=5,
        fuel_price=92
    )

    assert result["distance"] == 100, f"Expected distance 100, got {result['distance']}"
    assert result["fuel_required"] == 20, f"Expected fuel_required 20, got {result['fuel_required']}"
    assert result["fuel_price"] == 92, f"Expected fuel_price 92, got {result['fuel_price']}"
    assert result["fuel_cost"] == 1840, f"Expected fuel_cost 1840, got {result['fuel_cost']}"

    print(f"  [PASS] Distance: {result['distance']} km")
    print(f"         Fuel Required: {result['fuel_required']} L")
    print(f"         Fuel Price: {result['fuel_price']} INR/L")
    print(f"         Fuel Cost: {result['fuel_cost']} INR")


def test_vehicle_configuration_system():
    """Verify Vehicle configuration system with Truck (5 km/l), Mini truck (10 km/l), Car (15 km/l)."""
    print("\n--- Test 2: Vehicle Configuration Presets System ---")
    configs = cost_service.get_vehicle_configs()

    assert "truck" in configs, "Missing 'truck' configuration"
    assert "mini truck" in configs, "Missing 'mini truck' configuration"
    assert "car" in configs, "Missing 'car' configuration"

    assert configs["truck"]["mileage"] == 5.0, f"Expected Truck mileage 5, got {configs['truck']['mileage']}"
    assert configs["mini truck"]["mileage"] == 10.0, f"Expected Mini truck mileage 10, got {configs['mini truck']['mileage']}"
    assert configs["car"]["mileage"] == 15.0, f"Expected Car mileage 15, got {configs['car']['mileage']}"

    # Mini truck calculation
    res_mini = cost_service.calculate_fuel_cost(distance=100, vehicle_type="mini truck", fuel_price=92)
    assert res_mini["fuel_required"] == 10
    assert res_mini["fuel_cost"] == 920

    # Car calculation
    res_car = cost_service.calculate_fuel_cost(distance=150, vehicle_type="car", fuel_price=98)
    assert res_car["fuel_required"] == 10
    assert res_car["fuel_cost"] == 980

    print(f"  [PASS] Truck Preset:      5 km/l  -> 100 km = {result_str(100, 5, 92)}")
    print(f"  [PASS] Mini Truck Preset: 10 km/l -> 100 km = {result_str(100, 10, 92)}")
    print(f"  [PASS] Car Preset:        15 km/l -> 150 km = {result_str(150, 15, 98)}")


def result_str(dist, mil, price):
    req = dist / mil
    cost = req * price
    return f"{req:.0f}L, Rs {cost:.0f}"


def test_api_cost_calculate_endpoint():
    """Verify POST /api/cost/calculate returns exact JSON matching prompt."""
    print("\n--- Test 3: POST /api/cost/calculate API Endpoint ---")
    payload = {
        "distance": 100,
        "vehicle_type": "truck",
        "vehicle_mileage": 5,
        "fuel_price": 92
    }

    response = client.post("/api/cost/calculate", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert data["distance"] == 100
    assert data["fuel_required"] == 20
    assert data["fuel_price"] == 92
    assert data["fuel_cost"] == 1840

    print(f"  [PASS] POST /api/cost/calculate returned 200 OK:")
    print(f"         distance={data['distance']}, fuel_required={data['fuel_required']}L, fuel_price={data['fuel_price']}, fuel_cost={data['fuel_cost']}")


def test_api_get_vehicles_endpoint():
    """Verify GET /api/cost/vehicles returns vehicle profiles."""
    print("\n--- Test 4: GET /api/cost/vehicles API Endpoint ---")
    response = client.get("/api/cost/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert "vehicles" in data
    assert "truck" in data["vehicles"]
    assert "mini truck" in data["vehicles"]
    assert "car" in data["vehicles"]
    print(f"  [PASS] Registry returned {len(data['vehicles'])} vehicle configurations.")


def test_cost_input_validation():
    """Verify input validation handles invalid distance and zero/negative mileage."""
    print("\n--- Test 5: Input Validation & Error Handling ---")
    # Negative distance
    res_neg_dist = client.post("/api/cost/calculate", json={"distance": -50})
    assert res_neg_dist.status_code == 422, "Expected 422 for negative distance"

    # Zero mileage
    res_zero_mil = client.post("/api/cost/calculate", json={"distance": 100, "vehicle_mileage": 0})
    assert res_zero_mil.status_code == 422, "Expected 422 for zero mileage"

    print("  [PASS] Negative distance and zero mileage properly rejected with HTTP 422.")


def test_route_calculation_with_fuel_cost():
    """Verify POST /api/routes/calculate includes fuel_cost."""
    print("\n--- Test 6: Route Planning Workflow with Fuel Cost Integration ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck"
    }

    response = client.post("/api/routes/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "fuel_cost" in data, "Primary route is missing 'fuel_cost'"
    fc = data["fuel_cost"]
    assert "fuel_required" in fc and "fuel_cost" in fc and "fuel_price" in fc
    assert fc["fuel_cost"] > 0
    assert fc["fuel_required"] > 0

    print(f"  [PASS] Route Guwahati -> Shillong ({data['distance_km']} km):")
    print(f"         Fuel Required: {fc['fuel_required']} Liters")
    print(f"         Fuel Price:    Rs {fc['fuel_price']} / L")
    print(f"         Est Fuel Cost: Rs {fc['fuel_cost']}")

    if data.get("alternatives"):
        alt_fc = data["alternatives"][0].get("fuel_cost")
        assert alt_fc is not None
        print(f"         Alternative 1 Fuel Cost: Rs {alt_fc['fuel_cost']} ({alt_fc['fuel_required']} L)")


if __name__ == "__main__":
    print("=" * 68)
    print("  RUNNING PHASE 6 LOGISTICS COST & FUEL ESTIMATION TESTS")
    print("=" * 68)
    test_prompt_example_truck_cost()
    test_vehicle_configuration_system()
    test_api_cost_calculate_endpoint()
    test_api_get_vehicles_endpoint()
    test_cost_input_validation()
    test_route_calculation_with_fuel_cost()
    print("\n" + "=" * 68)
    print("  ALL PHASE 6 LOGISTICS COST TESTS PASSED SUCCESSFULLY!")
    print("=" * 68)
