
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.analytics_service import analytics_service

def test_provenance_flag_present():
    """Verify that all analytics data has explicit provenance labeling demo data."""
    assert analytics_service.data_provenance["is_demo_data"] is True
    assert "DEMO" in analytics_service.data_provenance["demo_label"]
    assert "North Eastern Region" in analytics_service.data_provenance["region"]

def test_overview_kpis():
    """Verify high-level executive KPI aggregation."""
    res = analytics_service.get_overview_kpis(time_range="30d", persona="all")
    assert res["status"] == "success"
    assert "kpis" in res
    assert res["kpis"]["total_trips"]["value"] > 0
    assert "avg_cost_per_tonne_km" in res["kpis"]
    assert res["kpis"]["high_risk_routes_count"]["value"] == 3
    assert res["kpis"]["total_fuel_saved_liters"]["value"] > 0
    assert res["kpis"]["total_cost_saved_inr"]["value"] > 0

def test_persona_filtering():
    """Verify that each stakeholder persona gets customized insights."""
    personas = ["logistics_operator", "government_admin", "transport_planner", "emergency_management"]
    for p in personas:
        res = analytics_service.get_overview_kpis(time_range="30d", persona=p)
        assert res["persona"] == p
        assert "headline" in res["persona_insight"]
        assert "primary_metric" in res["persona_insight"]

def test_all_seven_metrics():
    """Verify all 7 required dimensions are computed and non-empty."""
    metrics = analytics_service.get_all_metrics(time_range="30d")
    
    # 1. Average transportation cost
    cost = metrics["transportation_cost"]
    assert cost["overall_avg_inr"] > 0
    assert len(cost["cost_breakdown"]) == 4
    assert len(cost["monthly_cost_trend"]) == 12

    # 2. Route risk
    risk = metrics["route_risk"]
    assert len(risk["risk_distribution"]) == 3
    assert len(risk["seasonal_risk_trend"]) == 12

    # 3. Travel time
    travel = metrics["travel_time"]
    assert len(travel["corridors"]) >= 4
    assert len(travel["delay_contributors"]) >= 3

    # 4. Fuel consumption
    fuel = metrics["fuel_consumption"]
    assert len(fuel["fleet_categories"]) == 4
    assert len(fuel["monthly_fuel_consumed_liters"]) == 12

    # 5. Number of high-risk routes
    hr = metrics["high_risk_routes"]
    assert hr["current_high_risk_count"] == 3
    assert len(hr["high_risk_corridors"]) == 3
    assert len(hr["monthly_high_risk_trend"]) == 12

    # 6. Route usage
    usage = metrics["route_usage"]
    assert len(usage["top_routes"]) >= 4
    assert len(usage["state_distribution"]) == 8  # 8 NER states

    # 7. Estimated savings
    savings = metrics["estimated_savings"]
    assert savings["summary"]["total_fuel_saved_liters"] > 0
    assert savings["summary"]["total_money_saved_inr"] > 0
    assert len(savings["monthly_cumulative_savings"]) == 12

if __name__ == "__main__":
    test_provenance_flag_present()
    test_overview_kpis()
    test_persona_filtering()
    test_all_seven_metrics()
    print("ALL PHASE 13 ANALYTICS TESTS PASSED!")
