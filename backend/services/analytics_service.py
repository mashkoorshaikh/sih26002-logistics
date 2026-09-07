import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, date

logger = logging.getLogger(__name__)

class AnalyticsService:
    """
    Analytics Service for North Eastern Region (NER) Smart Logistics Platform.
    Provides data computation and aggregation for:
    1. Average transportation cost
    2. Route risk
    3. Travel time
    4. Fuel consumption
    5. Number of high-risk routes
    6. Route usage
    7. Estimated savings

    Clearly flags demo vs telemetry data for audit transparency.
    """

    def __init__(self):
        self.data_provenance = {
            "source": "NER Logistics Telemetry & Calibrated Historical Benchmark",
            "is_demo_data": True,
            "demo_label": "DEMO / CALIBRATED SIMULATION DATA",
            "last_calibrated": "2026-09-06T12:00:00Z",
            "region": "North Eastern Region (8 States: AS, ML, MN, NL, TR, MZ, AR, SK)"
        }

    def get_overview_kpis(self, time_range: str = "30d", persona: str = "all") -> Dict[str, Any]:
        """
        Aggregate executive KPI cards tailored by stakeholder persona and time window.
        """
        # Base metrics for 30-day baseline
        multiplier = 1.0
        if time_range == "7d":
            multiplier = 0.25
        elif time_range == "90d":
            multiplier = 2.8
        elif time_range == "1y":
            multiplier = 11.2

        total_trips = int(602 * multiplier)
        total_distance_km = int(180600 * multiplier)
        total_fuel_saved_l = int(4850 * multiplier)
        total_cost_saved_inr = int(446200 * multiplier)
        co2_avoided_tons = round(total_fuel_saved_l * 2.68 / 1000, 1)

        # Persona-tailored highlights
        persona_focus = {
            "logistics_operator": {
                "headline": "Fleet Fuel & Cost Efficiency",
                "primary_metric": f"₹{total_cost_saved_inr:,} Saved",
                "subtext": f"{total_fuel_saved_l:,} Liters fuel conserved via OR-Tools optimal paths",
                "priority_kpi": "Fuel Cost / Tonne-Km",
                "priority_value": "₹14.20"
            },
            "government_admin": {
                "headline": "Inter-State Freight Mobility",
                "primary_metric": f"{total_trips:,} Inter-State Trips",
                "subtext": f"{total_distance_km:,} km freight carried across 8 NER states",
                "priority_kpi": "Regional Connectivity Index",
                "priority_value": "91.4% Active"
            },
            "transport_planner": {
                "headline": "Corridor Capacity & Bottlenecks",
                "primary_metric": "4 Arterial Corridors",
                "subtext": "NH6, NH8, NH15, and NH29 monitored for bridge & tonnage compliance",
                "priority_kpi": "Avg Corridor Utilization",
                "priority_value": "78.6%"
            },
            "emergency_management": {
                "headline": "Monsoon Terrain Vulnerability",
                "primary_metric": "3 Monitored Fault Sectors",
                "subtext": "Pagla Pahar (NH29), Nongpoh (NH6), Barail Range (NH8)",
                "priority_kpi": "Active Weather Alerts",
                "priority_value": "2 Critical"
            },
            "all": {
                "headline": "Comprehensive Regional Overview",
                "primary_metric": f"{total_trips:,} Total Trips",
                "subtext": f"₹{total_cost_saved_inr:,} saved • {total_fuel_saved_l:,} L saved",
                "priority_kpi": "Average Fleet Risk",
                "priority_value": "3.8 / 10 (Moderate)"
            }
        }

        selected_focus = persona_focus.get(persona, persona_focus["all"])

        return {
            "status": "success",
            "time_range": time_range,
            "persona": persona,
            "provenance": self.data_provenance,
            "kpis": {
                "total_trips": {
                    "value": total_trips,
                    "change_pct": 12.4,
                    "unit": "trips",
                    "trend": "up"
                },
                "total_distance_km": {
                    "value": total_distance_km,
                    "formatted": f"{total_distance_km:,} km",
                    "change_pct": 15.1,
                    "trend": "up"
                },
                "avg_cost_per_tonne_km": {
                    "value": 14.2,
                    "formatted": "₹14.20 / t-km",
                    "change_pct": -6.8,
                    "trend": "down",
                    "note": "Lower is better (cost reduction)"
                },
                "avg_travel_time_hours": {
                    "value": 7.2,
                    "formatted": "7.2 hrs avg",
                    "change_pct": -5.6,
                    "trend": "down"
                },
                "avg_risk_score": {
                    "value": 3.8,
                    "formatted": "3.8 / 10",
                    "change_pct": -8.2,
                    "trend": "down"
                },
                "high_risk_routes_count": {
                    "value": 3,
                    "formatted": "3 Corridors",
                    "status": "ACTIVE_WATCH",
                    "trend": "neutral"
                },
                "total_fuel_saved_liters": {
                    "value": total_fuel_saved_l,
                    "formatted": f"{total_fuel_saved_l:,} L",
                    "change_pct": 18.5,
                    "trend": "up"
                },
                "total_cost_saved_inr": {
                    "value": total_cost_saved_inr,
                    "formatted": f"₹{total_cost_saved_inr:,}",
                    "change_pct": 19.2,
                    "trend": "up"
                },
                "co2_emissions_avoided_tons": {
                    "value": co2_avoided_tons,
                    "formatted": f"{co2_avoided_tons} Tonnes",
                    "trend": "up"
                }
            },
            "persona_insight": selected_focus
        }

    def get_all_metrics(self, time_range: str = "30d") -> Dict[str, Any]:
        """
        Returns all 7 specific analytics charts requested:
        1. Average transportation cost
        2. Route risk
        3. Travel time
        4. Fuel consumption
        5. Number of high-risk routes
        6. Route usage
        7. Estimated savings
        """
        return {
            "status": "success",
            "provenance": self.data_provenance,
            "transportation_cost": self._get_transportation_cost_metrics(),
            "route_risk": self._get_route_risk_metrics(),
            "travel_time": self._get_travel_time_metrics(),
            "fuel_consumption": self._get_fuel_consumption_metrics(),
            "high_risk_routes": self._get_high_risk_routes_metrics(),
            "route_usage": self._get_route_usage_metrics(),
            "estimated_savings": self._get_estimated_savings_metrics(),
        }

    # 1. Average Transportation Cost
    def _get_transportation_cost_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Average Transportation Cost",
            "unit": "₹ / Tonne-Km & Monthly Fleet Avg",
            "overall_avg_inr": 2140.0,
            "cost_per_tonne_km": 14.2,
            "cost_breakdown": [
                {"category": "Fuel Expense", "percentage": 42, "color": "#6366f1"},
                {"category": "Vehicle Wear & Terrain", "percentage": 22, "color": "#14b8a6"},
                {"category": "Driver Wages & Halting", "percentage": 18, "color": "#f59e0b"},
                {"category": "Highway Tolls & Permits", "percentage": 18, "color": "#8b5cf6"}
            ],
            "monthly_cost_trend": [
                {"month": "Oct", "optimized": 15.2, "standard": 17.8, "savings_pct": 14.6},
                {"month": "Nov", "optimized": 14.9, "standard": 17.4, "savings_pct": 14.3},
                {"month": "Dec", "optimized": 14.5, "standard": 17.1, "savings_pct": 15.2},
                {"month": "Jan", "optimized": 14.8, "standard": 17.5, "savings_pct": 15.4},
                {"month": "Feb", "optimized": 14.4, "standard": 16.9, "savings_pct": 14.7},
                {"month": "Mar", "optimized": 14.1, "standard": 16.6, "savings_pct": 15.0},
                {"month": "Apr", "optimized": 13.9, "standard": 16.5, "savings_pct": 15.7},
                {"month": "May", "optimized": 14.3, "standard": 17.0, "savings_pct": 15.8},
                {"month": "Jun", "optimized": 15.6, "standard": 18.9, "savings_pct": 17.4},
                {"month": "Jul", "optimized": 16.2, "standard": 19.8, "savings_pct": 18.1},
                {"month": "Aug", "optimized": 15.0, "standard": 18.2, "savings_pct": 17.5},
                {"month": "Sep", "optimized": 14.2, "standard": 17.3, "savings_pct": 17.9}
            ],
            "corridor_costs": [
                {"corridor": "Guwahati ➔ Shillong", "avg_cost": 1817.92, "cost_per_km": 18.4},
                {"corridor": "Silchar ➔ Agartala", "avg_cost": 4876.00, "cost_per_km": 17.7},
                {"corridor": "Tezpur ➔ Itanagar", "avg_cost": 2852.00, "cost_per_km": 20.3},
                {"corridor": "Dimapur ➔ Kohima", "avg_cost": 1361.60, "cost_per_km": 19.6}
            ]
        }

    # 2. Route Risk
    def _get_route_risk_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Route Risk Distribution & Seasonality",
            "unit": "Random Forest ML Risk Score (0-10)",
            "risk_distribution": [
                {"tier": "Low Risk", "count": 312, "color": "#22c55e", "percentage": 51.8},
                {"tier": "Medium Risk", "count": 186, "color": "#f59e0b", "percentage": 30.9},
                {"tier": "High Risk", "count": 104, "color": "#ef4444", "percentage": 17.3}
            ],
            "seasonal_risk_trend": [
                {"month": "Oct", "risk_index": 3.2, "rainfall_mm": 110},
                {"month": "Nov", "risk_index": 3.5, "rainfall_mm": 45},
                {"month": "Dec", "risk_index": 4.1, "rainfall_mm": 20},
                {"month": "Jan", "risk_index": 4.8, "rainfall_mm": 18},
                {"month": "Feb", "risk_index": 3.9, "rainfall_mm": 35},
                {"month": "Mar", "risk_index": 3.1, "rainfall_mm": 60},
                {"month": "Apr", "risk_index": 2.8, "rainfall_mm": 140},
                {"month": "May", "risk_index": 3.3, "rainfall_mm": 230},
                {"month": "Jun", "risk_index": 5.2, "rainfall_mm": 420},
                {"month": "Jul", "risk_index": 6.1, "rainfall_mm": 490},
                {"month": "Aug", "risk_index": 4.4, "rainfall_mm": 380},
                {"month": "Sep", "risk_index": 3.0, "rainfall_mm": 210}
            ],
            "key_insight": "Monsoon surge peaks in June-July (6.1/10 risk) due to soil saturation and rockfall triggers."
        }

    # 3. Travel Time
    def _get_travel_time_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Corridor Travel Time & Mountain Variance",
            "unit": "Hours & Minutes",
            "avg_overall_hours": 7.2,
            "corridors": [
                {"corridor": "Guwahati ➔ Shillong", "planned_hours": 2.7, "actual_hours": 3.2, "delay_mins": 30, "distance_km": 98.8},
                {"corridor": "Dimapur ➔ Kohima", "planned_hours": 2.5, "actual_hours": 3.1, "delay_mins": 36, "distance_km": 69.4},
                {"corridor": "Tezpur ➔ Itanagar", "planned_hours": 4.1, "actual_hours": 4.6, "delay_mins": 30, "distance_km": 140.2},
                {"corridor": "Silchar ➔ Agartala", "planned_hours": 7.25, "actual_hours": 8.0, "delay_mins": 45, "distance_km": 275.2},
                {"corridor": "Guwahati ➔ Dibrugarh", "planned_hours": 9.3, "actual_hours": 10.2, "delay_mins": 54, "distance_km": 440.0},
                {"corridor": "Imphal ➔ Kohima", "planned_hours": 5.7, "actual_hours": 6.4, "delay_mins": 42, "distance_km": 138.0}
            ],
            "delay_contributors": [
                {"factor": "Steep Hill Gradients & Slow Ascents", "percentage": 38},
                {"factor": "Checkpost & Weighbridge Halts", "percentage": 26},
                {"factor": "Monsoon Road Work & Single-Lane Blocks", "percentage": 24},
                {"factor": "Urban Congestion at Entry Hubs", "percentage": 12}
            ]
        }

    # 4. Fuel Consumption
    def _get_fuel_consumption_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Fleet Fuel Consumption by Vehicle Class",
            "unit": "Liters / 100 km & Terrain Surge Factors",
            "fleet_categories": [
                {
                    "vehicle_type": "Mini Truck (3.5t)",
                    "flat_rate_l_per_100km": 11.5,
                    "hill_rate_l_per_100km": 14.8,
                    "hill_surge_pct": 28.7,
                    "avg_co2_kg_per_km": 0.38
                },
                {
                    "vehicle_type": "Truck (10t)",
                    "flat_rate_l_per_100km": 21.0,
                    "hill_rate_l_per_100km": 28.5,
                    "hill_surge_pct": 35.7,
                    "avg_co2_kg_per_km": 0.72
                },
                {
                    "vehicle_type": "Reefer Truck (11t)",
                    "flat_rate_l_per_100km": 24.5,
                    "hill_rate_l_per_100km": 32.8,
                    "hill_surge_pct": 33.8,
                    "avg_co2_kg_per_km": 0.84
                },
                {
                    "vehicle_type": "Heavy Multi-Axle (17t)",
                    "flat_rate_l_per_100km": 28.0,
                    "hill_rate_l_per_100km": 39.5,
                    "hill_surge_pct": 41.1,
                    "avg_co2_kg_per_km": 1.05
                }
            ],
            "fuel_price_benchmark_inr": 92.50,
            "monthly_fuel_consumed_liters": [
                {"month": "Oct", "liters": 18400},
                {"month": "Nov", "liters": 22100},
                {"month": "Dec", "liters": 16900},
                {"month": "Jan", "liters": 14200},
                {"month": "Feb", "liters": 19800},
                {"month": "Mar", "liters": 26500},
                {"month": "Apr", "liters": 29800},
                {"month": "May", "liters": 25400},
                {"month": "Jun", "liters": 21000},
                {"month": "Jul", "liters": 18200},
                {"month": "Aug", "liters": 23500},
                {"month": "Sep", "liters": 28900}
            ]
        }

    # 5. Number of High-Risk Routes
    def _get_high_risk_routes_metrics(self) -> Dict[str, Any]:
        return {
            "title": "High-Risk Routes Surveillance Log",
            "unit": "Routes with ML Risk > 6.0 / 10",
            "current_high_risk_count": 3,
            "high_risk_corridors": [
                {
                    "id": "hr-1",
                    "route": "Dimapur ➔ Kohima",
                    "highway": "NH29 Naga Hills",
                    "hazard": "Pagla Pahar Active Sinking Zone",
                    "ml_risk_score": 7.2,
                    "watch_status": "CRITICAL_WATCH",
                    "alternate_advised": "Zubza Valley Link"
                },
                {
                    "id": "hr-2",
                    "route": "Aizawl ➔ Lunglei",
                    "highway": "NH54 Southern Mizoram",
                    "hazard": "Steep Escarpment & Rockfall",
                    "ml_risk_score": 6.8,
                    "watch_status": "MODERATE_WATCH",
                    "alternate_advised": "Thenzawl Bypass"
                },
                {
                    "id": "hr-3",
                    "route": "Tezpur ➔ Tawang",
                    "highway": "NH13 Sela Pass Ridge",
                    "hazard": "High Altitude Sub-Zero Icing & Fog",
                    "ml_risk_score": 8.1,
                    "watch_status": "SEVERE_WEATHER",
                    "alternate_advised": "Staggered Convoy Only"
                }
            ],
            "monthly_high_risk_trend": [
                {"month": "Oct", "high_risk_routes": 2},
                {"month": "Nov", "high_risk_routes": 1},
                {"month": "Dec", "high_risk_routes": 3},
                {"month": "Jan", "high_risk_routes": 4},
                {"month": "Feb", "high_risk_routes": 2},
                {"month": "Mar", "high_risk_routes": 1},
                {"month": "Apr", "high_risk_routes": 1},
                {"month": "May", "high_risk_routes": 3},
                {"month": "Jun", "high_risk_routes": 6},
                {"month": "Jul", "high_risk_routes": 8},
                {"month": "Aug", "high_risk_routes": 5},
                {"month": "Sep", "high_risk_routes": 3}
            ]
        }

    # 6. Route Usage
    def _get_route_usage_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Route Usage & Regional Freight Flow",
            "unit": "Dispatched Trips & Freight Tonnage",
            "top_routes": [
                {"corridor": "Guwahati ➔ Shillong", "trips": 89, "tonnage": 1120, "state_pair": "Assam ➔ Meghalaya"},
                {"corridor": "Guwahati ➔ Dibrugarh", "trips": 72, "tonnage": 940, "state_pair": "Assam Intra-state"},
                {"corridor": "Imphal ➔ Kohima", "trips": 54, "tonnage": 620, "state_pair": "Manipur ➔ Nagaland"},
                {"corridor": "Guwahati ➔ Itanagar", "trips": 41, "tonnage": 510, "state_pair": "Assam ➔ Arunachal"},
                {"corridor": "Agartala ➔ Silchar", "trips": 38, "tonnage": 450, "state_pair": "Tripura ➔ Assam"},
                {"corridor": "Shillong ➔ Tura", "trips": 34, "tonnage": 390, "state_pair": "Meghalaya Intra-state"},
                {"corridor": "Aizawl ➔ Lunglei", "trips": 28, "tonnage": 310, "state_pair": "Mizoram Intra-state"},
                {"corridor": "Gangtok ➔ Namchi", "trips": 25, "tonnage": 260, "state_pair": "Sikkim Intra-state"}
            ],
            "state_distribution": [
                {"state": "Assam", "trips": 186, "share_pct": 30.9, "color": "#6366f1"},
                {"state": "Meghalaya", "trips": 98, "share_pct": 16.3, "color": "#14b8a6"},
                {"state": "Manipur", "trips": 74, "share_pct": 12.3, "color": "#f59e0b"},
                {"state": "Nagaland", "trips": 62, "share_pct": 10.3, "color": "#22c55e"},
                {"state": "Tripura", "trips": 58, "share_pct": 9.6, "color": "#ef4444"},
                {"state": "Mizoram", "trips": 45, "share_pct": 7.5, "color": "#8b5cf6"},
                {"state": "Arunachal Pradesh", "trips": 42, "share_pct": 7.0, "color": "#ec4899"},
                {"state": "Sikkim", "trips": 37, "share_pct": 6.1, "color": "#06b6d4"}
            ]
        }

    # 7. Estimated Savings
    def _get_estimated_savings_metrics(self) -> Dict[str, Any]:
        return {
            "title": "Estimated Platform Savings via AI Route Optimization",
            "unit": "₹ Currency, Fuel Liters & CO2 Avoided",
            "summary": {
                "total_fuel_saved_liters": 4850,
                "total_money_saved_inr": 446200,
                "avg_trip_savings_inr": 741.20,
                "co2_avoided_kg": 12998,
                "travel_time_saved_hours": 182.5
            },
            "monthly_cumulative_savings": [
                {"month": "Oct", "money_saved_inr": 31200, "fuel_saved_l": 340},
                {"month": "Nov", "money_saved_inr": 69800, "fuel_saved_l": 760},
                {"month": "Dec", "money_saved_inr": 104200, "fuel_saved_l": 1135},
                {"month": "Jan", "money_saved_inr": 132600, "fuel_saved_l": 1445},
                {"month": "Feb", "money_saved_inr": 172400, "fuel_saved_l": 1880},
                {"month": "Mar", "money_saved_inr": 224600, "fuel_saved_l": 2445},
                {"month": "Apr", "money_saved_inr": 281200, "fuel_saved_l": 3060},
                {"month": "May", "money_saved_inr": 331500, "fuel_saved_l": 3610},
                {"month": "Jun", "money_saved_inr": 368900, "fuel_saved_l": 4015},
                {"month": "Jul", "money_saved_inr": 395400, "fuel_saved_l": 4305},
                {"month": "Aug", "money_saved_inr": 421800, "fuel_saved_l": 4590},
                {"month": "Sep", "money_saved_inr": 446200, "fuel_saved_l": 4850}
            ]
        }


# Singleton instance
analytics_service = AnalyticsService()
