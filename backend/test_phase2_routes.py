import sys
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_phase2_route_guwahati_to_shillong():
    print("--- Test 1: Guwahati to Shillong (10t Truck, 5t Vegetables) ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Vegetables",
        "cargo_weight": 5.0
    }
    # Test POST /api/routes/calculate
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    
    assert data["status"] == "success"
    assert data["source"]["name"].lower() == "guwahati"
    assert data["destination"]["name"].lower() == "shillong"
    assert data["distance_km"] > 90 and data["distance_km"] < 120, f"Unexpected distance: {data['distance_km']}"
    assert "duration_text" in data
    assert data["vehicle_info"]["gross_weight_tonnes"] == 15.0
    assert data["vehicle_info"]["vehicle_weight_tonnes"] == 10.0
    assert data["vehicle_info"]["cargo_weight_tonnes"] == 5.0
    assert len(data["geometry"]["coordinates"]) > 10
    assert len(data["alternatives"]) >= 1
    
    print(f"[PASS] Route calculated successfully:")
    print(f"   Origin: {data['source']['name']} ({data['source']['latitude']}, {data['source']['longitude']})")
    print(f"   Destination: {data['destination']['name']} ({data['destination']['latitude']}, {data['destination']['longitude']})")
    print(f"   Distance: {data['distance_km']} km")
    print(f"   Est. Travel Time: {data['duration_text']}")
    print(f"   Gross Weight: {data['vehicle_info']['gross_weight_tonnes']} tonnes")
    print(f"   Alternative Routes: {len(data['alternatives'])}")
    print(f"   First Alt: {data['alternatives'][0]['name']} ({data['alternatives'][0]['distance_km']} km, {data['alternatives'][0]['duration_text']})")

def test_api_v1_alias():
    print("\n--- Test 2: Verify /api/v1/routes/calculate works identically ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Vegetables",
        "cargo_weight": 5.0
    }
    resp = client.post("/api/v1/routes/calculate", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("[PASS] /api/v1/routes/calculate returned 200 OK")

def test_invalid_location():
    print("\n--- Test 3: Verify error handling on invalid location ---")
    payload = {
        "source": "NonExistentAtlantisPlace999",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Vegetables",
        "cargo_weight": 5.0
    }
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}"
    detail = resp.json().get("detail", "")
    assert "Could not find coordinates" in detail
    print(f"[PASS] 400 Bad Request handled correctly with message: {detail}")

if __name__ == "__main__":
    test_phase2_route_guwahati_to_shillong()
    test_api_v1_alias()
    test_invalid_location()
    print("\n=== ALL PHASE 2 BACKEND ROUTE TESTS PASSED! ===")

