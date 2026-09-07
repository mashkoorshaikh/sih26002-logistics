import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.admin_service import admin_service, ADMIN_ROUTES, LOGISTICS_HUBS, HIGH_RISK_AREAS, ACTIVE_GOV_ALERTS

def test_admin_dashboard_defaults():
    """Verify default admin dashboard payload."""
    res = admin_service.get_dashboard()
    assert res["status"] == "success"
    assert "summary_kpis" in res
    assert res["summary_kpis"]["active_corridors_count"] == len(ADMIN_ROUTES)
    assert res["summary_kpis"]["logistics_hubs_count"] == len(LOGISTICS_HUBS)
    assert res["summary_kpis"]["hazards_count"] == len(HIGH_RISK_AREAS)
    assert res["summary_kpis"]["active_alerts_count"] == len(ACTIVE_GOV_ALERTS)

def test_admin_risk_filtering():
    """Verify filtering routes by LOW, MEDIUM, and HIGH risk."""
    for tier in ["LOW", "MEDIUM", "HIGH"]:
        res = admin_service.get_dashboard(risk=tier)
        for route in res["routes"]:
            assert route["risk_tier"] == tier

def test_admin_state_filtering():
    """Verify filtering by state (e.g. Nagaland or Meghalaya)."""
    res = admin_service.get_dashboard(state="Nagaland")
    assert len(res["routes"]) > 0
    for r in res["routes"]:
        assert r["state_origin"] == "Nagaland" or r["state_destination"] == "Nagaland"

def test_admin_vehicle_and_cargo_filtering():
    """Verify filtering by vehicle and cargo constraints."""
    res = admin_service.get_dashboard(vehicle="Heavy Multi-Axle 17t", cargo="Perishables")
    assert len(res["routes"]) > 0
    for r in res["routes"]:
        assert r["vehicle_clearance"] == "SUITABLE_ALL"
        assert any("perishables" in c.lower() for c in r["allowed_cargo"])

def test_tri_color_risk_routes():
    """Verify all routes have valid coordinates and risk levels for map rendering."""
    for r in ADMIN_ROUTES:
        assert r["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
        assert len(r["coordinates"]) >= 2
        for pt in r["coordinates"]:
            assert len(pt) == 2
            # Check NER latitude (22 to 30) and longitude (88 to 98)
            assert 21.0 <= pt[0] <= 31.0
            assert 87.0 <= pt[1] <= 98.0

if __name__ == "__main__":
    test_admin_dashboard_defaults()
    test_admin_risk_filtering()
    test_admin_state_filtering()
    test_admin_vehicle_and_cargo_filtering()
    test_tri_color_risk_routes()
    print("ALL PHASE 14 ADMIN DASHBOARD TESTS PASSED!")
