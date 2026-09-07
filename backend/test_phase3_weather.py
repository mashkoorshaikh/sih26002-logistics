import sys
import json
import asyncio
from fastapi.testclient import TestClient
from services.weather_service import weather_service
from app.main import app

client = TestClient(app)

def test_deterministic_risk_rules():
    print("--- Test 1: Deterministic Risk Scoring Formula (Non-LLM) ---")
    
    # 1. Clear / Favorable Conditions -> LOW
    low_res = weather_service.calculate_weather_risk(
        precipitation_mm=0.0,
        visibility_km=10.0,
        wind_speed_kmh=12.0,
        weather_code=0
    )
    assert low_res["risk_level"] == "LOW", f"Expected LOW, got {low_res['risk_level']}"
    assert low_res["risk_score"] < 35, f"Expected < 35, got {low_res['risk_score']}"
    print(f"[PASS] Clear Weather evaluated as: {low_res['risk_level']} (Score: {low_res['risk_score']}/100)")
    
    # 2. Moderate Rain + Hill Mist -> MEDIUM
    med_res = weather_service.calculate_weather_risk(
        precipitation_mm=4.0,
        visibility_km=3.5,
        wind_speed_kmh=28.0,
        weather_code=61
    )
    assert med_res["risk_level"] == "MEDIUM", f"Expected MEDIUM, got {med_res['risk_level']}"
    assert 35 <= med_res["risk_score"] < 70, f"Expected 35-69, got {med_res['risk_score']}"
    print(f"[PASS] Moderate Rain + Mist evaluated as: {med_res['risk_level']} (Score: {med_res['risk_score']}/100)")
    
    # 3. Heavy Downpour + Fog + High Winds -> HIGH
    high_res = weather_service.calculate_weather_risk(
        precipitation_mm=18.0,
        visibility_km=0.8,
        wind_speed_kmh=48.0,
        weather_code=95
    )
    assert high_res["risk_level"] == "HIGH", f"Expected HIGH, got {high_res['risk_level']}"
    assert high_res["risk_score"] >= 70, f"Expected >= 70, got {high_res['risk_score']}"

    print(f"[PASS] Heavy Downpour + Fog evaluated as: {high_res['risk_level']} (Score: {high_res['risk_score']}/100)")
    print(f"       Advisories generated: {high_res['advisories']}")


def test_api_weather_endpoints():
    print("\n--- Test 2: GET & POST /api/weather Endpoints ---")
    
    # GET /api/weather?location=Guwahati
    resp = client.get("/api/weather?location=Guwahati")
    assert resp.status_code == 200, f"GET /api/weather failed: {resp.text}"
    data = resp.json()
    assert "temperature_c" in data
    assert "precipitation_mm" in data
    assert "wind_speed_kmh" in data
    assert "visibility_km" in data
    assert "condition" in data
    assert "risk" in data
    assert data["risk"]["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    print(f"[PASS] GET /api/weather?location=Guwahati returned 200 OK")
    print(f"       Temp: {data['temperature_c']} C | Rain: {data['precipitation_mm']} mm | Wind: {data['wind_speed_kmh']} km/h")
    print(f"       Visibility: {data['visibility_km']} km | Condition: {data['condition']} | Risk: {data['risk']['risk_level']}")

    # POST /api/weather with coordinates
    post_resp = client.post("/api/weather", json={"latitude": 25.5788, "longitude": 91.8933, "location": "Shillong"})
    assert post_resp.status_code == 200, f"POST /api/weather failed: {post_resp.text}"
    post_data = post_resp.json()
    assert post_data["location_name"] == "Shillong"
    print(f"[PASS] POST /api/weather with coordinates returned 200 OK")


def test_combined_route_and_weather():
    print("\n--- Test 3: Combined Route Data + Weather Data via POST /api/routes/calculate ---")
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Vegetables",
        "cargo_weight": 5.0
    }
    resp = client.post("/api/routes/calculate", json=payload)
    assert resp.status_code == 200, f"Combined route calculation failed: {resp.text}"
    data = resp.json()
    
    # Route assertions
    assert data["distance_km"] > 0
    assert "duration_text" in data
    
    # Weather assertions
    assert "weather" in data and data["weather"] is not None
    weather_info = data["weather"]
    assert "corridor_risk_level" in weather_info
    assert weather_info["corridor_risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "checkpoints" in weather_info
    assert len(weather_info["checkpoints"]) >= 2
    
    print(f"[PASS] Combined Route + Weather succeeded:")
    print(f"       Distance: {data['distance_km']} km | Duration: {data['duration_text']}")
    print(f"       Corridor Weather Risk: {weather_info['corridor_risk_level']} (Score: {weather_info['corridor_risk_score']}/100)")
    print(f"       Corridor Summary: {weather_info['summary']}")
    print(f"       Checkpoints Sampled: {len(weather_info['checkpoints'])}")
    for cp in weather_info["checkpoints"]:
        print(f"         - {cp['location_name']}: {cp['temperature_c']} C, {cp['condition']}, Rain: {cp['precipitation_mm']}mm, Risk: {cp['risk']['risk_level']}")


if __name__ == "__main__":
    test_deterministic_risk_rules()
    test_api_weather_endpoints()
    test_combined_route_and_weather()
    print("\n=== ALL PHASE 3 BACKEND WEATHER TESTS PASSED! ===")
