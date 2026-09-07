"""
PHASE 12 AUTOMATED TEST SUITE: ROUTE MONITORING & DEMO ALERTS
=============================================================
Verifies:
1. Presets endpoint returns valid demo simulation scenarios.
2. Nominal monitoring produces no critical alert.
3. Simulation trigger 'heavy_rainfall' produces:
   - Alert: 'Route risk increased from LOW to HIGH.'
   - CURRENT ROUTE: Risk: HIGH
   - ALTERNATIVE ROUTE: Risk: LOW
   - Action Prompt: 'Switch to safer route'
   - Demo / Simulation labels
4. Simulation trigger 'landslide_closure' produces closure-based route alert.
5. Simulation reset restores corridor to live baseline.
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 70)
print("   RUNNING PHASE 12: REAL-TIME / DEMO ROUTE ALERTS TEST SUITE")
print("=" * 70)

# Test 1: Presets
print("\n--- Test 1: Simulation Presets Endpoint ---")
r1 = client.get("/api/v1/alerts/presets")
assert r1.status_code == 200, f"Error r1: {r1.text}"
presets = r1.json().get("presets", [])
preset_ids = [p["id"] for p in presets]
print(f"Available presets: {preset_ids}")
assert "heavy_rainfall" in preset_ids
assert "landslide_closure" in preset_ids
print("  [PASS] Presets endpoint verified.")

# Test 2: Monitor Nominal Condition
print("\n--- Test 2: Monitor Nominal Route Conditions ---")
r2 = client.post("/api/v1/alerts/monitor", json={
    "source": "Guwahati",
    "destination": "Shillong",
    "active_route_id": "primary",
    "current_rainfall_rate": 2.5
})
assert r2.status_code == 200, f"Error r2: {r2.text}"
d2 = r2.json()
print(f"Nominal status: has_alert={d2.get('has_alert')}, severity={d2.get('severity')}")
assert d2.get("has_alert") is False
assert d2.get("severity") == "NORMAL"
print("  [PASS] Nominal monitoring produces no alert.")

# Test 3: Trigger Demo Simulation - Heavy Rainfall Event
print("\n--- Test 3: Demo Simulation - Heavy Rainfall Event ---")
r3 = client.post("/api/v1/alerts/simulate", json={
    "event_type": "heavy_rainfall",
    "source": "Guwahati",
    "destination": "Shillong"
})
assert r3.status_code == 200, f"Error r3: {r3.text}"
d3 = r3.json()

print(f"Alert title: {d3.get('alert_title')}")
print(f"Alert message: {d3.get('alert_message')}")
print(f"Trigger cause: {d3.get('trigger_cause')}")
print(f"Current Route Risk: {d3.get('current_route', {}).get('risk_level')} (Score: {d3.get('current_route', {}).get('risk_score')})")
print(f"Alternative Route Risk: {d3.get('alternative_route', {}).get('risk_level')} (Score: {d3.get('alternative_route', {}).get('risk_score')})")
print(f"Action Prompt: {d3.get('action_prompt')}")
print(f"Is Simulation: {d3.get('is_simulation')} ({d3.get('simulation_label')})")

assert d3.get("has_alert") is True
assert d3.get("alert_message") == "Route risk increased from LOW to HIGH."
assert d3.get("current_route", {}).get("risk_level") == "HIGH"
assert d3.get("alternative_route", {}).get("risk_level") == "LOW"
assert d3.get("action_prompt") == "Switch to safer route"
assert d3.get("is_simulation") is True
assert d3.get("simulation_label") == "DEMO / SIMULATION MODE"
print("  [PASS] Heavy rainfall simulation alert successfully generated.")

# Test 4: Monitor Endpoint Reflects Active Simulation
print("\n--- Test 4: Active Route Monitor Reflects Triggered Alert ---")
r4 = client.post("/api/v1/alerts/monitor", json={
    "source": "Guwahati",
    "destination": "Shillong",
    "active_route_id": "primary"
})
assert r4.status_code == 200, f"Error r4: {r4.text}"
d4 = r4.json()
assert d4.get("has_alert") is True
assert d4.get("alert_message") == "Route risk increased from LOW to HIGH."
print("  [PASS] Route monitor dynamically reports active simulated escalation.")

# Test 5: Trigger Landslide Closure
print("\n--- Test 5: Demo Simulation - Landslide Closure ---")
r5 = client.post("/api/v1/alerts/simulate", json={
    "event_type": "landslide_closure",
    "source": "Guwahati",
    "destination": "Shillong"
})
assert r5.status_code == 200, f"Error r5: {r5.text}"
d5 = r5.json()
print(f"Landslide alert: {d5.get('alert_title')} | Cause: {d5.get('trigger_cause')[:60]}...")
assert d5.get("has_alert") is True
assert d5.get("current_route", {}).get("risk_level") == "HIGH"
assert d5.get("alternative_route", {}).get("risk_level") == "LOW"
print("  [PASS] Landslide closure alert generated.")

# Test 6: Reset Simulation
print("\n--- Test 6: Reset Simulation to Baseline ---")
r6 = client.post("/api/v1/alerts/reset", json={
    "source": "Guwahati",
    "destination": "Shillong"
})
assert r6.status_code == 200, f"Error r6: {r6.text}"
d6 = r6.json()
print(f"Reset message: {d6.get('message')}")

r7 = client.post("/api/v1/alerts/monitor", json={
    "source": "Guwahati",
    "destination": "Shillong",
    "active_route_id": "primary",
    "current_rainfall_rate": 5.0
})
assert r7.json().get("has_alert") is False
print("  [PASS] Simulation cleanly reset. Corridor restored to nominal baseline.")

print("\n" + "=" * 70)
print("   [ALL 6 PHASE 12 ROUTE ALERT TESTS PASSED SUCCESSFULLY!]")
print("=" * 70)
