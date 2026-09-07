"""
UNIT & INTEGRATION TESTS FOR PHASE 5: ML RISK PREDICTION & BACKEND INTEGRATION
=============================================================================
Tests:
1. POST /api/risk/predict with exact prompt payload.
2. Output schema validation (risk, confidence).
3. Prediction accuracy on safe vs severe test cases.
4. Input validation error handling (422 Unprocessable Entity on invalid inputs).
5. Route planning workflow integration (POST /api/routes/calculate includes ml_risk).
"""

import os
import sys
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from services.risk_service import risk_service

client = TestClient(app)


def test_risk_service_loaded():
    """Verify ML model is loaded in risk_service."""
    print("\n--- Test 1: Verify ML Model Loaded in RiskService ---")
    assert risk_service is not None
    assert risk_service.is_loaded is True, "Expected ML model to be loaded into memory"
    assert risk_service.pipeline is not None
    print(f"[PASS] RiskService loaded model successfully from: {risk_service.model_path}")


def test_predict_prompt_payload():
    """Verify POST /api/risk/predict with the exact prompt payload."""
    print("\n--- Test 2: POST /api/risk/predict with Prompt Payload ---")
    payload = {
        "rainfall": 100,
        "slope": 30,
        "road_quality": 2,
        "visibility": 4,
        "traffic": 60,
        "historical_incidents": 5,
        "elevation": 1200,
        "temperature": 22,
        "wind_speed": 15
    }

    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "risk" in data, "Missing 'risk' in response"
    assert "confidence" in data, "Missing 'confidence' in response"
    assert data["risk"] in ["LOW", "MEDIUM", "HIGH"], f"Invalid risk category: {data['risk']}"
    assert isinstance(data["confidence"], (int, float)), "Confidence must be a number"
    assert 0.0 <= data["confidence"] <= 1.0, f"Confidence out of bounds: {data['confidence']}"

    print(f"[PASS] API returned 200 OK:")
    print(f"       risk: {data['risk']}")
    print(f"       confidence: {data['confidence']}")


def test_predict_low_risk_scenario():
    """Verify POST /api/risk/predict predicts LOW for ideal driving conditions."""
    print("\n--- Test 3: Safe Valley Scenario Evaluation ---")
    payload = {
        "rainfall": 0,
        "slope": 1.5,
        "road_quality": 4.8,
        "visibility": 10.0,
        "traffic": 15,
        "historical_incidents": 0,
        "elevation": 150,
        "temperature": 25,
        "wind_speed": 8
    }

    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk"] == "LOW", f"Expected LOW risk for ideal conditions, got {data['risk']}"
    print(f"[PASS] Safe conditions classified as: {data['risk']} (Confidence: {data['confidence']})")


def test_predict_high_risk_scenario():
    """Verify POST /api/risk/predict predicts HIGH for dangerous torrential mountain conditions."""
    print("\n--- Test 4: Dangerous Mountain Ghat Scenario Evaluation ---")
    payload = {
        "rainfall": 45.0,
        "slope": 26.0,
        "road_quality": 1.5,
        "visibility": 0.4,
        "traffic": 85,
        "historical_incidents": 7,
        "elevation": 2100,
        "temperature": 8,
        "wind_speed": 55
    }

    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk"] == "HIGH", f"Expected HIGH risk for dangerous conditions, got {data['risk']}"
    print(f"[PASS] Dangerous conditions classified as: {data['risk']} (Confidence: {data['confidence']})")


def test_input_validation_negative_rainfall():
    """Verify negative rainfall triggers 422 Unprocessable Entity."""
    print("\n--- Test 5: Input Validation - Negative Rainfall ---")
    payload = {
        "rainfall": -15.0,
        "slope": 10.0,
        "road_quality": 3.0,
        "visibility": 5.0,
        "traffic": 20,
        "historical_incidents": 1,
        "elevation": 500,
        "temperature": 20,
        "wind_speed": 10
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    print("[PASS] Negative rainfall rejected with HTTP 422")


def test_input_validation_invalid_road_quality():
    """Verify road_quality > 5 triggers 422 Unprocessable Entity."""
    print("\n--- Test 6: Input Validation - Out-of-bounds Road Quality ---")
    payload = {
        "rainfall": 10.0,
        "slope": 10.0,
        "road_quality": 6.5,  # scale is 1 to 5
        "visibility": 5.0,
        "traffic": 20,
        "historical_incidents": 1,
        "elevation": 500,
        "temperature": 20,
        "wind_speed": 10
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    print("[PASS] Out-of-bounds road quality (6.5) rejected with HTTP 422")


def test_input_validation_missing_field():
    """Verify missing required field triggers 422 Unprocessable Entity."""
    print("\n--- Test 7: Input Validation - Missing Required Field ---")
    payload = {
        "rainfall": 10.0,
        # 'slope' omitted
        "road_quality": 3.0,
        "visibility": 5.0,
        "traffic": 20,
        "historical_incidents": 1,
        "elevation": 500,
        "temperature": 20,
        "wind_speed": 10
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    print("[PASS] Missing required 'slope' rejected with HTTP 422")


def test_route_calculation_workflow_integration():
    """Verify POST /api/routes/calculate incorporates ml_risk."""
    print("\n--- Test 8: Route Planning Workflow Integration with ML Risk ---")
    route_payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 12.0,
        "cargo_type": "Perishable Foods",
        "cargo_weight": 6.0
    }

    response = client.post("/api/routes/calculate", json=route_payload)
    assert response.status_code == 200, f"Route calculation failed: {response.text}"
    data = response.json()

    assert "ml_risk" in data, "Primary route is missing 'ml_risk'"
    primary_risk = data["ml_risk"]
    assert "risk" in primary_risk, "Missing 'risk' in ml_risk"
    assert "confidence" in primary_risk, "Missing 'confidence' in ml_risk"
    assert primary_risk["risk"] in ["LOW", "MEDIUM", "HIGH"]

    print(f"[PASS] Route Guwahati -> Shillong successfully integrated with ML Risk:")
    print(f"       Distance: {data['distance_km']} km | Duration: {data['duration_text']}")
    print(f"       ML Risk Level: {primary_risk['risk']} (Confidence: {primary_risk['confidence']})")
    print(f"       Estimated Risk Score: {primary_risk.get('estimated_risk_score')}/100")
    print(f"       Terrain Context: {primary_risk.get('terrain_context')}")

    if data.get("alternatives"):
        alt_risk = data["alternatives"][0].get("ml_risk")
        assert alt_risk is not None
        print(f"       Alternative Route 1 ML Risk: {alt_risk['risk']} (Confidence: {alt_risk['confidence']})")


if __name__ == "__main__":
    print("=" * 68)
    print("  RUNNING PHASE 5 UNIT TESTS: BACKEND ML RISK PREDICTION")
    print("=" * 68)
    test_risk_service_loaded()
    test_predict_prompt_payload()
    test_predict_low_risk_scenario()
    test_predict_high_risk_scenario()
    test_input_validation_negative_rainfall()
    test_input_validation_invalid_road_quality()
    test_input_validation_missing_field()
    test_route_calculation_workflow_integration()
    print("\n" + "=" * 68)
    print("  ALL 8 PHASE 5 TESTS PASSED SUCCESSFULLY!")
    print("=" * 68)
