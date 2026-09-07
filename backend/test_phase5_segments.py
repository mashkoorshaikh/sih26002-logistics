"""
UNIT & INTEGRATION TESTS FOR SEGMENT-BY-SEGMENT ROUTE RISK INTELLIGENCE
=======================================================================
Tests:
1. Route decomposition into logical waypoints/segments (Guwahati -> Nongpoh -> Umiam -> Shillong).
2. Segment-level weather conditions and ML risk evaluation.
3. Color coding verification: GREEN (#22c55e), YELLOW (#eab308), RED (#ef4444).
4. Route Risk Summary calculation:
   - Overall risk
   - Highest-risk segment
   - Number of high-risk segments
   - Average risk score
5. End-to-end API integration via POST /api/routes/calculate.
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
from services.segmentation_service import segmentation_service, RISK_COLORS

client = TestClient(app)


def test_guwahati_shillong_segmentation():
    """Verify route decomposition into 3 logical segments."""
    print("\n--- Test 1: Route Decomposition into Logical Segments (Guwahati -> Shillong) ---")
    
    mock_coords = [
        [91.7362, 26.1445],
        [91.8020, 26.1150],
        [91.8807, 25.9036],
        [91.9020, 25.8010],
        [91.9150, 25.6700],
        [91.8933, 25.5788]
    ]

    mock_weather = {
        "checkpoints": [
            {"name": "Guwahati", "temperature_c": 26.0, "precipitation_mm": 0.1, "wind_speed_kmh": 6.0, "visibility_km": 8.0, "condition": "Clear"},
            {"name": "Nongpoh", "temperature_c": 22.0, "precipitation_mm": 2.5, "wind_speed_kmh": 14.0, "visibility_km": 3.5, "condition": "Mist"},
            {"name": "Shillong", "temperature_c": 19.0, "precipitation_mm": 0.5, "wind_speed_kmh": 8.0, "visibility_km": 6.0, "condition": "Overcast"}
        ]
    }

    result = segmentation_service.segment_and_evaluate_route(
        source_name="Guwahati",
        destination_name="Shillong",
        full_coordinates=mock_coords,
        total_distance_km=98.8,
        weather_data=mock_weather
    )

    segments = result["segments"]
    assert len(segments) == 3, f"Expected 3 segments, got {len(segments)}"

    expected_nodes = [
        ("Guwahati", "Nongpoh"),
        ("Nongpoh", "Umiam"),
        ("Umiam", "Shillong")
    ]

    for idx, (expected_start, expected_end) in enumerate(expected_nodes):
        seg = segments[idx]
        assert seg["start_node"] == expected_start, f"Segment {idx+1} expected start {expected_start}, got {seg['start_node']}"
        assert seg["end_node"] == expected_end, f"Segment {idx+1} expected end {expected_end}, got {seg['end_node']}"
        print(f"  [+] Segment {idx+1}: {seg['name']} ({seg['start_node']} -> {seg['end_node']})")


def test_segment_weather_risk_and_color_coding():
    """Verify segment weather, ML risk score, and color coding."""
    print("\n--- Test 2: Segment Weather, Risk Score, and Color Coding ---")
    
    mock_coords = [[91.7362, 26.1445], [91.8807, 25.9036], [91.9150, 25.6700], [91.8933, 25.5788]]
    result = segmentation_service.segment_and_evaluate_route(
        source_name="Guwahati",
        destination_name="Shillong",
        full_coordinates=mock_coords,
        total_distance_km=98.8,
        weather_data=None
    )

    segments = result["segments"]

    for idx, seg in enumerate(segments, start=1):
        # Weather checks
        assert "weather" in seg
        weather = seg["weather"]
        for key in ["temperature_c", "rainfall_mm", "wind_speed_kmh", "visibility_km"]:
            assert key in weather, f"Missing weather key {key} in segment {idx}"

        # Risk & score checks
        assert seg["risk"] in ["LOW", "MEDIUM", "HIGH"]
        assert 0.0 <= seg["risk_score"] <= 100.0

        # Color coding checks: GREEN = LOW, YELLOW = MEDIUM, RED = HIGH
        expected_color = RISK_COLORS[seg["risk"]]
        assert seg["color"] == expected_color, f"Segment {idx} color mismatch: expected {expected_color}, got {seg['color']}"
        assert seg["color"] in ["#22c55e", "#eab308", "#ef4444"]

        # Coordinates check
        assert len(seg["coordinates"]) >= 2, f"Segment {idx} polyline must have >= 2 points"

        print(f"  [PASS] Segment {idx} ({seg['name']}):")
        print(f"         Weather: Rain={weather['rainfall_mm']}mm, Temp={weather['temperature_c']}C, Vis={weather['visibility_km']}km")
        print(f"         ML Risk: {seg['risk']} (Score: {seg['risk_score']}/100) -> Color: {seg['color']}")


def test_route_risk_summary():
    """Verify Route Risk Summary: overall risk, highest-risk segment, count of high-risk, average score."""
    print("\n--- Test 3: Route Risk Summary Verification ---")
    
    mock_coords = [[91.7362, 26.1445], [91.8807, 25.9036], [91.9150, 25.6700], [91.8933, 25.5788]]
    result = segmentation_service.segment_and_evaluate_route(
        source_name="Guwahati",
        destination_name="Shillong",
        full_coordinates=mock_coords,
        total_distance_km=98.8,
        weather_data=None
    )

    summary = result["risk_summary"]

    assert "overall_risk" in summary
    assert summary["overall_risk"] in ["LOW", "MEDIUM", "HIGH"]

    assert "highest_risk_segment" in summary
    highest = summary["highest_risk_segment"]
    assert highest is not None
    assert "name" in highest and "risk_score" in highest and "risk" in highest

    assert "high_risk_segments_count" in summary
    assert isinstance(summary["high_risk_segments_count"], int)
    assert summary["high_risk_segments_count"] >= 0

    assert "average_risk_score" in summary
    assert isinstance(summary["average_risk_score"], (int, float))
    assert 0.0 <= summary["average_risk_score"] <= 100.0

    print(f"  [PASS] Route Risk Summary:")
    print(f"         Overall Risk:             {summary['overall_risk']} ({summary['overall_color']})")
    print(f"         Highest-Risk Segment:     {highest['name']} (Score: {highest['risk_score']}/100, Risk: {highest['risk']})")
    print(f"         High-Risk Segments Count: {summary['high_risk_segments_count']}")
    print(f"         Average Risk Score:       {summary['average_risk_score']}/100")


def test_api_route_calculation_with_segments():
    """Verify POST /api/routes/calculate returns segments and risk_summary in response."""
    print("\n--- Test 4: End-to-End POST /api/routes/calculate Integration ---")
    
    payload = {
        "source": "Guwahati",
        "destination": "Shillong",
        "vehicle_type": "Truck",
        "vehicle_weight": 10.0,
        "cargo_type": "Vegetables",
        "cargo_weight": 5.0
    }

    response = client.post("/api/routes/calculate", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "segments" in data, "Response missing 'segments'"
    assert len(data["segments"]) >= 3, f"Expected >= 3 segments, got {len(data['segments'])}"

    assert "risk_summary" in data, "Response missing 'risk_summary'"
    risk_summary = data["risk_summary"]
    assert risk_summary["overall_risk"] in ["LOW", "MEDIUM", "HIGH"]
    assert risk_summary["highest_risk_segment"] is not None

    print(f"  [PASS] API returned {len(data['segments'])} color-coded segments for map display:")
    for s in data["segments"]:
        print(f"         - {s['name']}: {s['risk']} ({s['risk_score']}/100, {s['color']})")
    print(f"  [PASS] API returned Route Risk Summary: Overall={risk_summary['overall_risk']}, Avg={risk_summary['average_risk_score']}")


if __name__ == "__main__":
    print("=" * 72)
    print("  RUNNING SEGMENT-BY-SEGMENT ROUTE RISK & MAP INTEGRATION TESTS")
    print("=" * 72)
    test_guwahati_shillong_segmentation()
    test_segment_weather_risk_and_color_coding()
    test_route_risk_summary()
    test_api_route_calculation_with_segments()
    print("\n" + "=" * 72)
    print("  ALL SEGMENT-BY-SEGMENT ROUTE RISK TESTS PASSED SUCCESSFULLY!")
    print("=" * 72)
