"""
Phase 11 Generative AI Logistics Assistant Test Suite
Tests:
1. Ground Truth Context Serializer from Backend Pipeline
2. Anti-Hallucination System Prompt Directives
3. Factual Explanation Engine (Zero invented facts)
4. Questions Coverage:
   - "Why did you select the Primary Route?"
   - "Why was Alternative Route B rejected?"
   - "What are the main risks?"
   - "What is the expected cost and travel time?"
   - "What accessibility and hospital information is available?"
5. API Endpoint Tests: GET /api/assistant/health and POST /api/assistant
"""
import sys
import os

# Set UTF-8 encoding for stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ai_service import ai_service, SYSTEM_PROMPT
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("========================================================================")
print("   RUNNING PHASE 11: GENERATIVE AI LOGISTICS ASSISTANT TEST SUITE")
print("========================================================================")

# ----------------------------------------------------------------------------
# Test 1: Ground Truth Context Extraction & Zero-Hallucination Policy
# ----------------------------------------------------------------------------
print("\n--- Test 1: Anti-Hallucination System Directives & Context Extraction ---")
assert "NEVER invent" in SYSTEM_PROMPT, "System prompt must strictly forbid hallucination"
assert "roads" in SYSTEM_PROMPT and "weather" in SYSTEM_PROMPT and "risk scores" in SYSTEM_PROMPT
assert "Ground Truth" in SYSTEM_PROMPT
print("  [PASS] Anti-hallucination system prompt directives verified.")

# Sample structured route result from backend
mock_route_data = {
    "source": {"name": "Guwahati", "latitude": 26.1445, "longitude": 91.7362},
    "destination": {"name": "Shillong", "latitude": 25.5788, "longitude": 91.8933},
    "distance_km": 98.5,
    "duration_text": "2h 40m",
    "summary": "NH-6 Primary Freight Highway",
    "vehicle_info": {
        "vehicle_type": "Heavy Truck",
        "gross_weight_tonnes": 17.0,
        "cargo_type": "Medicine"
    },
    "fuel_cost": {
        "fuel_cost": 2950,
        "fuel_required": 32.0,
        "fuel_price": 92.2
    },
    "ml_risk": {
        "risk": "LOW",
        "risk_score": 22.5,
        "confidence": 0.88
    },
    "vehicle_suitability": {
        "status": "SUITABLE",
        "violations": []
    },
    "final_route_score": 0.078,
    "is_optimal_recommendation": True,
    "accessibility": {
        "accessibility_score": 98.0,
        "accessibility_rating": "EXCELLENT",
        "nearest_hospital": {
            "name": "Civil Hospital Nongpoh",
            "distance_km": 0.82,
            "emergency_phone": "03638-232233"
        },
        "nearest_fuel_station": {
            "name": "BPCL Police Bazar",
            "distance_km": 0.15
        },
        "nearest_logistics_hub": {
            "name": "Jorabat Tri-Junction Logistics Sorting Hub",
            "distance_km": 0.86
        },
        "counts": {
            "total_facilities_near_route": 39
        }
    },
    "alternatives": [
        {
            "id": "alt-bypass-1",
            "name": "Secondary Old Hill Pass",
            "distance_km": 118.0,
            "duration_text": "3h 45m",
            "difference_km": 19.5,
            "fuel_cost": {"fuel_cost": 3540, "fuel_required": 38.4},
            "ml_risk": {"risk": "HIGH", "risk_score": 74.0},
            "vehicle_suitability": {
                "status": "NOT SUITABLE",
                "violations": ["Bridge weight capacity exceeded: 17.0t exceeds 12.0t limit on Old Umiam Span"],
                "reasons": ["Weight 17.0t > 12.0t bridge threshold"]
            },
            "final_route_score": 9999.0,
            "is_optimal_recommendation": False,
            "accessibility": {
                "accessibility_score": 45.0,
                "nearest_hospital": {"name": "Umsning CHC", "distance_km": 6.5},
                "nearest_fuel_station": {"name": "Nayara Umsning", "distance_km": 4.2}
            }
        }
    ]
}

context = ai_service.build_ground_truth_context(mock_route_data)
assert context["corridor"] == "Guwahati to Shillong"
assert context["primary_route"]["distance_km"] == 98.5
assert context["primary_route"]["fuel_cost_inr"] == 2950
assert len(context["alternative_routes"]) == 1
assert context["alternative_routes"][0]["vehicle_suitability"] == "NOT SUITABLE"
print("  [PASS] Ground Truth context extraction successfully formatted backend facts.")

# ----------------------------------------------------------------------------
# Test 2: Factual Explanation Engine (Why Route Selected vs Rejected)
# ----------------------------------------------------------------------------
print("\n--- Test 2: Answering 'Why did you select this route?' ---")
reply_why = ai_service.generate_factual_fallback_reply("Why did you select the primary route over Route B?", context)
assert "98.5 km" in reply_why, "Reply must cite exact primary distance"
assert "2h 40m" in reply_why, "Reply must cite exact primary duration"
assert "SUITABLE" in reply_why or "compliant" in reply_why, "Reply must explain physical vehicle compliance"
assert "REJECTED" in reply_why or "DISQUALIFIED" in reply_why, "Reply must explain rejection of alternative"
assert "12.0t" in reply_why or "Bridge" in reply_why, "Reply must explain bridge weight violation"
print(f"  [PASS] Response correctly explained route selection and bridge restriction rejection:\n{reply_why[:220]}...")

# ----------------------------------------------------------------------------
# Test 3: Factual Explanation Engine (Main Risks)
# ----------------------------------------------------------------------------
print("\n--- Test 3: Answering 'What are the main risks?' ---")
reply_risk = ai_service.generate_factual_fallback_reply("What are the main risks on this route?", context)
assert "LOW" in reply_risk, "Must cite exact ML risk level"
assert "22.5" in reply_risk, "Must cite exact ML risk score"
assert "Civil Hospital" in reply_risk, "Must mention nearest hospital safety net"
print(f"  [PASS] Response correctly cited ML risk score and nearest emergency unit:\n{reply_risk[:200]}...")

# ----------------------------------------------------------------------------
# Test 4: Factual Explanation Engine (Expected Cost & Travel Time)
# ----------------------------------------------------------------------------
print("\n--- Test 4: Answering 'Expected Cost & Travel Time' ---")
reply_cost = ai_service.generate_factual_fallback_reply("What is the expected fuel cost and travel time?", context)
assert "2,950" in reply_cost, "Must cite exact fuel cost ₹2,950"
assert "98.5 km" in reply_cost, "Must cite exact distance"
assert "2h 40m" in reply_cost, "Must cite exact travel time"
assert "32" in reply_cost, "Must cite exact fuel liters"
print(f"  [PASS] Response cited verified cost and duration metrics.")

# ----------------------------------------------------------------------------
# Test 5: Factual Explanation Engine (Important Accessibility Information)
# ----------------------------------------------------------------------------
print("\n--- Test 5: Answering 'Important Accessibility Information' ---")
reply_access = ai_service.generate_factual_fallback_reply("What important accessibility facilities are nearby?", context)
assert "Civil Hospital Nongpoh" in reply_access, "Must name nearest hospital"
assert "0.82" in reply_access, "Must cite nearest hospital distance"
assert "BPCL Police Bazar" in reply_access, "Must cite nearest fuel station"
assert "39" in reply_access, "Must cite total facilities count"
print(f"  [PASS] Response cited verified nearest facilities and infrastructure count.")

# ----------------------------------------------------------------------------
# Test 6: AI Assistant Health Check Endpoint
# ----------------------------------------------------------------------------
print("\n--- Test 6: GET /api/assistant/health ---")
health_resp = client.get("/api/assistant/health")
assert health_resp.status_code == 200
h_data = health_resp.json()
assert "configured" in h_data
assert "model" in h_data
print(f"  [PASS] Assistant Health: Model='{h_data['model']}', Mode='{h_data['mode']}'")

# ----------------------------------------------------------------------------
# Test 7: Full Pipeline POST /api/assistant with Auto-Calculation
# ----------------------------------------------------------------------------
print("\n--- Test 7: POST /api/assistant (Full Pipeline with Auto-Calculated Route) ---")
post_resp = client.post("/api/assistant", json={
    "message": "Why did you select this route and what are the main risks?",
    "source": "Guwahati",
    "destination": "Shillong",
    "vehicle_type": "Truck",
    "cargo_type": "Medicine"
})
assert post_resp.status_code == 200, f"POST /api/assistant failed: {post_resp.text}"
post_data = post_resp.json()

assert "reply" in post_data and len(post_data["reply"]) > 50, "Assistant reply must be substantive"
assert "corridor" in post_data, "Response missing corridor"
assert "ground_truth_summary" in post_data, "Response missing ground_truth_summary"
assert "Guwahati" in post_data["corridor"]

print(f"  [PASS] Full Pipeline Assistant Response Generated:")
print(f"         Corridor:   {post_data['corridor']}")
print(f"         Model Used: {post_data['model_used']} (Fallback Mode: {post_data['is_fallback']})")
print(f"         Excerpt:    {post_data['reply'][:160]}...")

print("\n========================================================================")
print("   [ALL PHASE 11 BACKEND TESTS PASSED SUCCESSFULLY!]")
print("========================================================================")
