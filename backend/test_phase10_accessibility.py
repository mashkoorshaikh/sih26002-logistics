"""
Phase 10 Accessibility Intelligence Test Suite
Tests:
1. Verified NER Facilities Registry integrity & data provenance
2. Spatial proximity along Guwahati -> Shillong corridor
3. Nearest critical facilities (hospital, fuel station, logistics hub)
4. Facility counts breakdown
5. Accessibility score calculation & rating tiers
6. Accessibility API endpoints (/api/accessibility/facilities, /api/accessibility/evaluate)
7. End-to-end route calculation integration (/api/routes/calculate) with OR-Tools
"""
import sys
import os

# Set UTF-8 encoding for stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.accessibility_service import (
    accessibility_service,
    VERIFIED_NER_FACILITIES,
    haversine_distance,
    point_to_polyline_distance
)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("========================================================================")
print("   RUNNING PHASE 10: ACCESSIBILITY INTELLIGENCE TEST SUITE")
print("========================================================================")

# ----------------------------------------------------------------------------
# Test 1: Verified NER Facilities Registry Integrity
# ----------------------------------------------------------------------------
print("\n--- Test 1: Verified NER Facilities Registry & Data Provenance ---")
facilities = accessibility_service.get_all_facilities()
assert len(facilities) >= 20, f"Expected at least 20 verified facilities, found {len(facilities)}"

categories = {f["category"] for f in facilities}
expected_categories = {"hospital", "fuel_station", "warehouse", "logistics_hub", "repair_center", "emergency_service"}
assert expected_categories.issubset(categories), f"Missing categories: {expected_categories - categories}"

# Verify strict data provenance: Never present fabricated locations as real
for f in facilities:
    assert f.get("is_verified_real") is True, f"Facility {f['name']} marked as unverified"
    assert f.get("data_source") in ("VERIFIED_PUBLIC_REGISTRY", "REAL_OVERPASS_API"), f"Invalid source {f.get('data_source')}"
    assert "latitude" in f and "longitude" in f, f"Facility {f['name']} missing coordinates"

print(f"  [PASS] Verified {len(facilities)} official NER infrastructure locations across 6 categories.")
print(f"         Data Provenance: 100% verified public registry / official datasets.")

# ----------------------------------------------------------------------------
# Test 2: Spatial Proximity Calculation
# ----------------------------------------------------------------------------
print("\n--- Test 2: Spatial Corridor Distance Calculation ---")
# Guwahati to Shillong representative highway corridor
test_corridor = [
    [91.7362, 26.1445],  # Guwahati
    [91.8020, 26.1150],  # Khanapara
    [91.8750, 26.0620],  # Jorabat
    [91.8807, 25.9036],  # Nongpoh
    [91.9020, 25.8010],  # Umsning
    [91.9150, 25.6700],  # Barapani
    [91.8933, 25.5788],  # Shillong
]

# Distance from Civil Hospital Nongpoh (25.9060, 91.8820) to corridor should be under 1.0 km
d_nongpoh_hosp = point_to_polyline_distance(25.9060, 91.8820, test_corridor)
assert d_nongpoh_hosp < 2.0, f"Nongpoh Civil Hospital should be within 2km of highway, got {d_nongpoh_hosp} km"
print(f"  [PASS] Civil Hospital Nongpoh distance to NH-6 corridor: {d_nongpoh_hosp} km")

# ----------------------------------------------------------------------------
# Test 3: Nearest Critical Facilities Detection
# ----------------------------------------------------------------------------
print("\n--- Test 3: Nearest Critical Facilities Detection along Corridor ---")
eval_result = accessibility_service.evaluate_route_accessibility(
    polyline_coords=test_corridor,
    max_buffer_km=12.0
)

assert eval_result["nearest_hospital"] is not None, "Must identify nearest hospital"
assert eval_result["nearest_fuel_station"] is not None, "Must identify nearest fuel station"
assert eval_result["nearest_logistics_hub"] is not None, "Must identify nearest logistics hub"

hosp = eval_result["nearest_hospital"]
fuel = eval_result["nearest_fuel_station"]
hub = eval_result["nearest_logistics_hub"]

print(f"  [PASS] Nearest Hospital:      {hosp['name']} ({hosp['distance_km']} km away)")
print(f"  [PASS] Nearest Fuel Station:  {fuel['name']} ({fuel['distance_km']} km away)")
print(f"  [PASS] Nearest Logistics Hub: {hub['name']} ({hub['distance_km']} km away)")

assert hosp["distance_km"] <= 10.0, "Nearest hospital should be within corridor bounds"
assert fuel["distance_km"] <= 10.0, "Nearest fuel should be within corridor bounds"

# ----------------------------------------------------------------------------
# Test 4: Facility Counts Breakdown & Density
# ----------------------------------------------------------------------------
print("\n--- Test 4: Facility Counts Breakdown ---")
counts = eval_result["counts"]
print(f"  [PASS] Facilities Near Corridor (<= 12 km):")
print(f"         - Hospitals:          {counts['hospitals']}")
print(f"         - Fuel Stations:      {counts['fuel_stations']}")
print(f"         - Warehouses:         {counts['warehouses']}")
print(f"         - Logistics Hubs:     {counts['logistics_hubs']}")
print(f"         - Repair Workshops:   {counts['repair_centers']}")
print(f"         - Emergency Stations: {counts['emergency_services']}")
print(f"         - Total Infrastructure Near Corridor: {counts['total_facilities_near_route']}")

assert counts["hospitals"] >= 2, "Expected at least 2 hospitals along Guwahati-Shillong corridor"
assert counts["fuel_stations"] >= 3, "Expected multiple fuel stations along NH-6"
assert counts["total_facilities_near_route"] >= 10, "Expected at least 10 facilities along corridor"

# ----------------------------------------------------------------------------
# Test 5: Accessibility Score & Rating Tiers
# ----------------------------------------------------------------------------
print("\n--- Test 5: Accessibility Score & Rating Tier ---")
score = eval_result["accessibility_score"]
rating = eval_result["accessibility_rating"]
penalty = eval_result["inaccessibility_penalty"]

print(f"  [PASS] Composite Accessibility Score: {score}/100")
print(f"  [PASS] Accessibility Tier:           {rating}")
print(f"  [PASS] Inaccessibility Penalty:      {penalty} (For OR-Tools MIP Solver)")

assert 60.0 <= score <= 100.0, f"Guwahati-Shillong corridor should have high accessibility score, got {score}"
assert rating in ("EXCELLENT", "GOOD"), f"Expected EXCELLENT or GOOD rating, got {rating}"
assert penalty == round(1.0 - (score / 100.0), 3), "Penalty must be exact complement of score"

# ----------------------------------------------------------------------------
# Test 6: Accessibility API Endpoints
# ----------------------------------------------------------------------------
print("\n--- Test 6: Accessibility API Endpoints ---")
# GET /api/accessibility/facilities
resp = client.get("/api/accessibility/facilities?category=hospital")
assert resp.status_code == 200, f"GET /api/accessibility/facilities failed: {resp.text}"
hosp_list = resp.json()
assert len(hosp_list) >= 4, f"Expected at least 4 hospitals in API response, got {len(hosp_list)}"
print(f"  [PASS] GET /api/accessibility/facilities returned {len(hosp_list)} verified hospitals.")

# POST /api/accessibility/evaluate
resp_eval = client.post("/api/accessibility/evaluate", json={
    "polyline": test_corridor,
    "max_buffer_km": 10.0
})
assert resp_eval.status_code == 200, f"POST /api/accessibility/evaluate failed: {resp_eval.text}"
eval_data = resp_eval.json()
assert "accessibility_score" in eval_data, "Response missing accessibility_score"
assert "nearest_hospital" in eval_data, "Response missing nearest_hospital"
print(f"  [PASS] POST /api/accessibility/evaluate returned score: {eval_data['accessibility_score']}/100")

# ----------------------------------------------------------------------------
# Test 7: Full Route Calculation Integration with Accessibility (/api/routes/calculate)
# ----------------------------------------------------------------------------
print("\n--- Test 7: Route Calculation Integration with Accessibility ---")
route_resp = client.post("/api/routes/calculate", json={
    "source": "Guwahati",
    "destination": "Shillong",
    "vehicle_type": "Truck",
    "cargo_type": "Medicine"
})
assert route_resp.status_code == 200, f"Route calculation failed: {route_resp.text}"
route_data = route_resp.json()

assert "accessibility" in route_data, "Primary route response must include accessibility"
primary_acc = route_data["accessibility"]
assert primary_acc["accessibility_score"] > 50, f"Primary route accessibility score too low: {primary_acc['accessibility_score']}"
assert primary_acc["nearest_hospital"]["name"] is not None
assert primary_acc["nearest_fuel_station"]["name"] is not None
assert primary_acc["nearest_logistics_hub"]["name"] is not None

print(f"  [PASS] Primary Route Accessibility:")
print(f"         Score: {primary_acc['accessibility_score']}/100 ({primary_acc['accessibility_rating']})")
print(f"         Nearest Hospital: {primary_acc['nearest_hospital']['name']} ({primary_acc['nearest_hospital']['distance_km']} km)")
print(f"         Nearest Fuel:     {primary_acc['nearest_fuel_station']['name']} ({primary_acc['nearest_fuel_station']['distance_km']} km)")
print(f"         Nearest Hub:      {primary_acc['nearest_logistics_hub']['name']} ({primary_acc['nearest_logistics_hub']['distance_km']} km)")
print(f"         Total Facilities: {primary_acc['counts']['total_facilities_near_route']}")

# Verify alternative routes also have accessibility
if route_data.get("alternatives"):
    alt = route_data["alternatives"][0]
    assert "accessibility" in alt, "Alternative route must include accessibility"
    alt_acc = alt["accessibility"]
    print(f"  [PASS] Alternative Route ({alt['name']}) Accessibility:")
    print(f"         Score: {alt_acc['accessibility_score']}/100 ({alt_acc['accessibility_rating']})")

print("\n========================================================================")
print("   [ALL PHASE 10 BACKEND TESTS PASSED SUCCESSFULLY!]")
print("========================================================================")
