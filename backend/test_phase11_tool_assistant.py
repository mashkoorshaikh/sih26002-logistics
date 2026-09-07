"""
Test Suite: Phase 11 Tool/Function Calling AI Logistics Assistant
=================================================================
Verifies:
1. 6 Backend Tool functions (get_route_details, get_weather, get_risk,
   get_vehicle_constraints, get_accessibility, compare_routes).
2. The 10 specific operational question scenarios:
   - Q1: Why is this route recommended?
   - Q2: Why is Route A risky?
   - Q3: Which route is cheapest?
   - Q4: Which route is safest?
   - Q5: Which route is fastest?
   - Q6: What happens if rainfall increases?
   - Q7: Is this route suitable for my truck?
   - Q8: Are there hospitals near the route?
   - Q9: Where is the nearest fuel station?
   - Q10: Should I choose the alternative route?
3. Handling of unavailable information without guessing.
4. FastAPI endpoint /api/assistant returning tools_called metadata.
"""

import sys
import asyncio
from typing import Dict, Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from services.ai_tools import (
    LOGISTICS_TOOLS,
    dispatch_tool_call,
    execute_get_route_details,
    execute_get_weather,
    execute_get_risk,
    execute_get_vehicle_constraints,
    execute_get_accessibility,
    execute_compare_routes
)
from services.ai_service import ai_service
from fastapi.testclient import TestClient
from app.main import app


# Mock verified route data for Guwahati to Shillong
MOCK_ROUTE_DATA: Dict[str, Any] = {
    "source": {"name": "Guwahati", "lat": 26.1445, "lng": 91.7362},
    "destination": {"name": "Shillong", "lat": 25.5788, "lng": 91.8933},
    "distance_km": 98.8,
    "duration_text": "2h 42m",
    "duration_hours": 2.7,
    "summary": "NH-6 Primary Freight Highway",
    "vehicle_type": "heavy_truck",
    "vehicle_weight": 17000,
    "cargo_type": "medicine",
    "vehicle_info": {
        "vehicle_type": "heavy_truck",
        "gross_weight_tonnes": 17.0,
        "cargo_type": "medicine"
    },
    "fuel_cost": {
        "fuel_cost": 1817.92,
        "fuel_required": 19.76,
        "efficiency_km_per_liter": 5.0
    },
    "ml_risk": {
        "risk": "LOW",
        "risk_score": 22.5,
        "confidence": 0.88
    },
    "vehicle_suitability": {
        "status": "SUITABLE",
        "violations": [],
        "reasons": []
    },
    "final_route_score": 0.065,
    "is_optimal_recommendation": True,
    "weather": {
        "condition": "Light Rain",
        "temperature": 21.5,
        "rainfall_mm": 3.8,
        "humidity": 84,
        "wind_speed_kmh": 12.0
    },
    "accessibility": {
        "accessibility_score": 98.0,
        "accessibility_rating": "EXCELLENT",
        "counts": {
            "hospitals": 8,
            "fuel_stations": 8,
            "warehouses": 6,
            "logistics_hubs": 6,
            "total_facilities_near_route": 39
        },
        "nearest_hospital": {
            "name": "Civil Hospital Nongpoh",
            "distance_km": 0.82,
            "emergency_phone": "03638-232230"
        },
        "nearest_fuel_station": {
            "name": "BPCL City Service Station Police Bazar",
            "distance_km": 0.15
        },
        "nearest_logistics_hub": {
            "name": "Jorabat Tri-Junction Logistics Sorting Hub",
            "distance_km": 0.86
        }
    },
    "alternatives": [
        {
            "id": "alt-1",
            "name": "NH Secondary Valley Bypass",
            "distance_km": 110.8,
            "duration_text": "3h 25m",
            "difference_km": 12.0,
            "fuel_cost": {"fuel_cost": 2150.50, "fuel_required": 23.37},
            "ml_risk": {"risk": "HIGH", "risk_score": 64.0},
            "vehicle_suitability": {
                "status": "NOT SUITABLE",
                "violations": [
                    {
                        "violation_type": "bridge_weight_limit",
                        "message": "Vehicle gross weight (17000 kg) exceeds Umiam Heritage Bypass Bridge capacity limit (12000 kg) by 5000 kg."
                    }
                ],
                "reasons": [
                    "Vehicle gross weight (17000 kg) exceeds Umiam Heritage Bypass Bridge capacity limit (12000 kg) by 5000 kg."
                ]
            },
            "final_route_score": 0.450,
            "accessibility": {
                "accessibility_score": 85.0,
                "nearest_hospital": {"name": "Bethany Outreach Clinic", "distance_km": 1.4},
                "nearest_fuel_station": {"name": "IOCL Filling Station", "distance_km": 0.9}
            }
        }
    ]
}


def run_all_tool_tests():
    print("========================================================================")
    print("   RUNNING PHASE 11: AI LOGISTICS TOOL-CALLING TEST SUITE")
    print("========================================================================")

    # 1. Tool definitions check
    print("\n--- Test 1: Tool Definitions & Parameter Schemas ---")
    tool_names = [t["function"]["name"] for t in LOGISTICS_TOOLS]
    expected_tools = [
        "get_route_details",
        "get_weather",
        "get_risk",
        "get_vehicle_constraints",
        "get_accessibility",
        "compare_routes"
    ]
    for et in expected_tools:
        assert et in tool_names, f"Tool '{et}' missing from LOGISTICS_TOOLS"
    print(f"  [PASS] All 6 backend tools registered in OpenAI function schema: {tool_names}")

    # 2. Q1: Why is this route recommended?
    print("\n--- Test 2: Q1 - 'Why is this route recommended?' ---")
    r1 = ai_service.generate_factual_fallback_reply("Why is this route recommended?", MOCK_ROUTE_DATA)
    assert "OR-Tools" in r1["reply"] or "Optimization" in r1["reply"]
    assert "0.065" in r1["reply"]
    tools_used = [t["tool"] for t in r1["tools_called"]]
    assert "compare_routes" in tools_used or "get_route_details" in tools_used
    print(f"  [PASS] Q1 successfully evaluated using tools: {tools_used}")

    # 3. Q2: Why is Route A risky?
    print("\n--- Test 3: Q2 - 'Why is Route A risky?' ---")
    r2 = ai_service.generate_factual_fallback_reply("Why is Route A risky?", MOCK_ROUTE_DATA)
    assert "Risk" in r2["reply"] or "risk" in r2["reply"]
    assert "22.5" in r2["reply"]
    tools_used = [t["tool"] for t in r2["tools_called"]]
    assert "get_risk" in tools_used
    print(f"  [PASS] Q2 cited ML risk score using tools: {tools_used}")

    # 4. Q3: Which route is cheapest?
    print("\n--- Test 4: Q3 - 'Which route is cheapest?' ---")
    r3 = ai_service.generate_factual_fallback_reply("Which route is cheapest?", MOCK_ROUTE_DATA)
    assert "Cheapest" in r3["reply"] or "cheapest" in r3["reply"]
    assert "1,817.92" in r3["reply"] or "1817" in r3["reply"]
    tools_used = [t["tool"] for t in r3["tools_called"]]
    assert "compare_routes" in tools_used
    print(f"  [PASS] Q3 correctly identified cheapest corridor (₹1,817.92) using tool: {tools_used}")

    # 5. Q4: Which route is safest?
    print("\n--- Test 5: Q4 - 'Which route is safest?' ---")
    r4 = ai_service.generate_factual_fallback_reply("Which route is safest?", MOCK_ROUTE_DATA)
    assert "Safest" in r4["reply"] or "safest" in r4["reply"]
    assert "22.5" in r4["reply"]
    tools_used = [t["tool"] for t in r4["tools_called"]]
    assert "compare_routes" in tools_used
    print(f"  [PASS] Q4 correctly identified safest corridor (22.5/100) using tool: {tools_used}")

    # 6. Q5: Which route is fastest?
    print("\n--- Test 6: Q5 - 'Which route is fastest?' ---")
    r5 = ai_service.generate_factual_fallback_reply("Which route is fastest?", MOCK_ROUTE_DATA)
    assert "Fastest" in r5["reply"] or "fastest" in r5["reply"]
    assert "2h 42m" in r5["reply"]
    tools_used = [t["tool"] for t in r5["tools_called"]]
    assert "compare_routes" in tools_used
    print(f"  [PASS] Q5 correctly identified fastest corridor (2h 42m) using tool: {tools_used}")

    # 7. Q6: What happens if rainfall increases?
    print("\n--- Test 7: Q6 - 'What happens if rainfall increases?' ---")
    r6 = ai_service.generate_factual_fallback_reply("What happens if rainfall increases?", MOCK_ROUTE_DATA)
    assert "Rainfall Increase" in r6["reply"] or "rainfall" in r6["reply"].lower()
    assert "delay" in r6["reply"].lower() or "risk" in r6["reply"].lower()
    tools_used = [t["tool"] for t in r6["tools_called"]]
    assert "get_weather" in tools_used or "get_risk" in tools_used
    print(f"  [PASS] Q6 simulated rainfall what-if scenario using tools: {tools_used}")

    # 8. Q7: Is this route suitable for my truck?
    print("\n--- Test 8: Q7 - 'Is this route suitable for my truck?' ---")
    r7 = ai_service.generate_factual_fallback_reply("Is this route suitable for my truck?", MOCK_ROUTE_DATA)
    assert "SUITABLE" in r7["reply"]
    tools_used = [t["tool"] for t in r7["tools_called"]]
    assert "get_vehicle_constraints" in tools_used
    print(f"  [PASS] Q7 evaluated vehicle bridge & clearance constraints using tool: {tools_used}")

    # 9. Q8: Are there hospitals near the route?
    print("\n--- Test 9: Q8 - 'Are there hospitals near the route?' ---")
    r8 = ai_service.generate_factual_fallback_reply("Are there hospitals near the route?", MOCK_ROUTE_DATA)
    assert "Civil Hospital Nongpoh" in r8["reply"]
    assert "0.82" in r8["reply"]
    tools_used = [t["tool"] for t in r8["tools_called"]]
    assert "get_accessibility" in tools_used
    print(f"  [PASS] Q8 located nearest hospital using tool: {tools_used}")

    # 10. Q9: Where is the nearest fuel station?
    print("\n--- Test 10: Q9 - 'Where is the nearest fuel station?' ---")
    r9 = ai_service.generate_factual_fallback_reply("Where is the nearest fuel station?", MOCK_ROUTE_DATA)
    assert "BPCL" in r9["reply"] or "Fuel" in r9["reply"]
    assert "0.15" in r9["reply"]
    tools_used = [t["tool"] for t in r9["tools_called"]]
    assert "get_accessibility" in tools_used
    print(f"  [PASS] Q9 located nearest fuel station using tool: {tools_used}")

    # 11. Q10: Should I choose the alternative route?
    print("\n--- Test 11: Q10 - 'Should I choose the alternative route?' ---")
    r10 = ai_service.generate_factual_fallback_reply("Should I choose the alternative route?", MOCK_ROUTE_DATA)
    assert "Alternative" in r10["reply"] or "alternative" in r10["reply"]
    assert "exceeds" in r10["reply"].lower() or "violate" in r10["reply"].lower() or "delay" in r10["reply"].lower()
    tools_used = [t["tool"] for t in r10["tools_called"]]
    assert "compare_routes" in tools_used or "get_vehicle_constraints" in tools_used
    print(f"  [PASS] Q10 evaluated alternative feasibility using tools: {tools_used}")

    # 12. Handling of unavailable information without guessing
    print("\n--- Test 12: Unavailable Information Handling (No Guessing) ---")
    r_unavail = ai_service.generate_factual_fallback_reply("What is the current stock price of Apple?", MOCK_ROUTE_DATA)
    assert "unavailable" in r_unavail["reply"].lower(), f"Expected unavailable notice, got: {r_unavail['reply']}"
    print(f"  [PASS] Correctly stated information is unavailable instead of guessing: '{r_unavail['reply'][:75]}...'")

    # 13. FastAPI Endpoint Integration with tools_called
    print("\n--- Test 13: POST /api/assistant Endpoint Tool Execution Metadata ---")
    client = TestClient(app)
    response = client.post(
        "/api/assistant",
        json={
            "message": "Which route is cheapest?",
            "route_data": MOCK_ROUTE_DATA
        }
    )
    assert response.status_code == 200, f"API failed: {response.text}"
    data = response.json()
    assert "reply" in data
    assert "tools_called" in data
    assert data["tools_called"] is not None
    assert len(data["tools_called"]) > 0
    tools_in_api = [t["tool"] for t in data["tools_called"]]
    print(f"  [PASS] API response returned tools_called metadata: {tools_in_api}")
    print(f"         Reply excerpt: {data['reply'][:120]}...")

    print("\n========================================================================")
    print("   [ALL 13 AI LOGISTICS TOOL-CALLING TESTS PASSED SUCCESSFULLY!]")
    print("========================================================================")


if __name__ == "__main__":
    run_all_tool_tests()
