import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Master administrative catalog of NER freight routes across all 8 states
# SIMULATED / DEMO BENCHMARK DATASET - Designed for SIH26002 prototype evaluation
ADMIN_ROUTES = [
    {
        "id": "rt-101",
        "name": "Guwahati ➔ Shillong",
        "highway": "NH6 Asian Highway 1",
        "state_origin": "Assam",
        "district_origin": "Kamrup Metropolitan",
        "state_destination": "Meghalaya",
        "district_destination": "East Khasi Hills",
        "distance_km": 98.8,
        "avg_duration": "2h 42m",
        "risk_tier": "LOW",
        "risk_score": 2.2,
        "coordinates": [
            [26.1445, 91.7362],
            [26.0620, 91.8750],
            [25.9036, 91.8807],
            [25.6700, 91.9150],
            [25.5788, 91.8933]
        ],
        "vehicle_clearance": "SUITABLE_ALL",
        "allowed_cargo": ["Perishables", "Pharma", "Electronics", "FMCG", "Fuel"],
        "status": "OPEN",
        "daily_trips": 124,
        "last_monitored": "2026-09-06T12:30:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-102",
        "name": "Silchar ➔ Agartala",
        "highway": "NH8 / NH208",
        "state_origin": "Assam",
        "district_origin": "Cachar",
        "state_destination": "Tripura",
        "district_destination": "West Tripura",
        "distance_km": 275.2,
        "avg_duration": "7h 15m",
        "risk_tier": "MEDIUM",
        "risk_score": 4.8,
        "coordinates": [
            [24.8333, 92.7789],
            [24.3800, 92.1600],
            [24.0500, 91.6800],
            [23.8315, 91.2868]
        ],
        "vehicle_clearance": "RESTRICTED_12T",
        "allowed_cargo": ["Perishables", "FMCG", "Machinery"],
        "status": "MONITORED",
        "daily_trips": 68,
        "last_monitored": "2026-09-06T12:15:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-103",
        "name": "Dimapur ➔ Kohima",
        "highway": "NH29 Naga Hill Pass",
        "state_origin": "Nagaland",
        "district_origin": "Dimapur",
        "state_destination": "Nagaland",
        "district_destination": "Kohima",
        "distance_km": 69.4,
        "avg_duration": "2h 30m",
        "risk_tier": "HIGH",
        "risk_score": 7.2,
        "coordinates": [
            [25.9068, 93.7273],
            [25.8120, 93.8850],
            [25.7450, 94.0120],
            [25.6751, 94.1086]
        ],
        "vehicle_clearance": "RESTRICTED_10T",
        "allowed_cargo": ["Pharma", "FMCG", "Perishables"],
        "status": "CAUTION_LANDSLIDE",
        "daily_trips": 46,
        "last_monitored": "2026-09-06T12:45:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-104",
        "name": "Tezpur ➔ Itanagar",
        "highway": "NH15 Foothills Corridor",
        "state_origin": "Assam",
        "district_origin": "Sonitpur",
        "state_destination": "Arunachal Pradesh",
        "district_destination": "Papum Pare",
        "distance_km": 140.2,
        "avg_duration": "4h 10m",
        "risk_tier": "LOW",
        "risk_score": 2.8,
        "coordinates": [
            [26.6338, 92.7926],
            [26.8500, 93.1500],
            [27.0844, 93.6053]
        ],
        "vehicle_clearance": "SUITABLE_ALL",
        "allowed_cargo": ["Perishables", "Pharma", "Machinery", "FMCG"],
        "status": "OPEN",
        "daily_trips": 52,
        "last_monitored": "2026-09-06T12:20:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-105",
        "name": "Imphal ➔ Kohima",
        "highway": "NH2 Trans-Naga Corridor",
        "state_origin": "Manipur",
        "district_origin": "Imphal West",
        "state_destination": "Nagaland",
        "district_destination": "Kohima",
        "distance_km": 138.0,
        "avg_duration": "5h 40m",
        "risk_tier": "MEDIUM",
        "risk_score": 4.6,
        "coordinates": [
            [24.8170, 93.9368],
            [25.1500, 94.0200],
            [25.6751, 94.1086]
        ],
        "vehicle_clearance": "RESTRICTED_12T",
        "allowed_cargo": ["Perishables", "FMCG", "Pharma"],
        "status": "MONITORED",
        "daily_trips": 38,
        "last_monitored": "2026-09-06T11:50:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-106",
        "name": "Aizawl ➔ Lunglei",
        "highway": "NH54 South Mizoram Link",
        "state_origin": "Mizoram",
        "district_origin": "Aizawl",
        "state_destination": "Mizoram",
        "district_destination": "Lunglei",
        "distance_km": 175.0,
        "avg_duration": "7h 35m",
        "risk_tier": "HIGH",
        "risk_score": 6.8,
        "coordinates": [
            [23.7271, 92.7176],
            [23.3100, 92.7400],
            [22.8800, 92.7300]
        ],
        "vehicle_clearance": "RESTRICTED_3.5T",
        "allowed_cargo": ["Perishables", "Pharma", "FMCG"],
        "status": "RESTRICTED",
        "daily_trips": 22,
        "last_monitored": "2026-09-06T10:15:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-107",
        "name": "Gangtok ➔ Namchi",
        "highway": "NH10 / NH710 Ridge Road",
        "state_origin": "Sikkim",
        "district_origin": "East Sikkim",
        "state_destination": "Sikkim",
        "district_destination": "South Sikkim",
        "distance_km": 80.0,
        "avg_duration": "3h 05m",
        "risk_tier": "LOW",
        "risk_score": 3.4,
        "coordinates": [
            [27.3389, 88.6065],
            [27.2400, 88.4800],
            [27.1667, 88.3500]
        ],
        "vehicle_clearance": "SUITABLE_ALL",
        "allowed_cargo": ["Perishables", "Pharma", "Electronics"],
        "status": "OPEN",
        "daily_trips": 34,
        "last_monitored": "2026-09-06T11:10:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-108",
        "name": "Tezpur ➔ Tawang",
        "highway": "NH13 Sela Pass High Road",
        "state_origin": "Assam",
        "district_origin": "Sonitpur",
        "state_destination": "Arunachal Pradesh",
        "district_destination": "Tawang",
        "distance_km": 320.0,
        "avg_duration": "13h 45m",
        "risk_tier": "HIGH",
        "risk_score": 8.1,
        "coordinates": [
            [26.6338, 92.7926],
            [27.1500, 92.4200],
            [27.5861, 91.8594]
        ],
        "vehicle_clearance": "RESTRICTED_3.5T",
        "allowed_cargo": ["Pharma", "Fuel", "Machinery"],
        "status": "SEVERE_WEATHER_ALERT",
        "daily_trips": 14,
        "last_monitored": "2026-09-06T09:40:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-109",
        "name": "Silchar ➔ Aizawl",
        "highway": "NH306 Barak-Mizo Lifeline",
        "state_origin": "Assam",
        "district_origin": "Cachar",
        "state_destination": "Mizoram",
        "district_destination": "Aizawl",
        "distance_km": 178.0,
        "avg_duration": "6h 20m",
        "risk_tier": "MEDIUM",
        "risk_score": 5.4,
        "coordinates": [
            [24.8333, 92.7789],
            [24.2800, 92.7100],
            [23.7271, 92.7176]
        ],
        "vehicle_clearance": "RESTRICTED_10T",
        "allowed_cargo": ["Perishables", "FMCG", "Pharma", "Fuel"],
        "status": "OPEN",
        "daily_trips": 54,
        "last_monitored": "2026-09-06T11:00:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-110",
        "name": "Silchar ➔ Imphal",
        "highway": "NH37 via Jiribam Ghat",
        "state_origin": "Assam",
        "district_origin": "Cachar",
        "state_destination": "Manipur",
        "district_destination": "Imphal West",
        "distance_km": 250.0,
        "avg_duration": "9h 30m",
        "risk_tier": "HIGH",
        "risk_score": 6.9,
        "coordinates": [
            [24.8333, 92.7789],
            [24.7900, 93.1200],
            [24.8170, 93.9368]
        ],
        "vehicle_clearance": "RESTRICTED_10T",
        "allowed_cargo": ["Perishables", "FMCG", "Pharma"],
        "status": "MONITORED",
        "daily_trips": 28,
        "last_monitored": "2026-09-06T10:30:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-111",
        "name": "Rangpo ➔ Gangtok",
        "highway": "NH10 Teesta Gorge Corridor",
        "state_origin": "Sikkim",
        "district_origin": "East Sikkim",
        "state_destination": "Sikkim",
        "district_destination": "East Sikkim",
        "distance_km": 42.0,
        "avg_duration": "1h 45m",
        "risk_tier": "MEDIUM",
        "risk_score": 4.5,
        "coordinates": [
            [27.1800, 88.5300],
            [27.2600, 88.5800],
            [27.3389, 88.6065]
        ],
        "vehicle_clearance": "SUITABLE_ALL",
        "allowed_cargo": ["Perishables", "Pharma", "Electronics", "FMCG"],
        "status": "OPEN",
        "daily_trips": 65,
        "last_monitored": "2026-09-06T12:00:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "rt-112",
        "name": "Agartala ➔ Sabroom",
        "highway": "NH8 South Tripura Corridor",
        "state_origin": "Tripura",
        "district_origin": "West Tripura",
        "state_destination": "Tripura",
        "district_destination": "South Tripura",
        "distance_km": 135.0,
        "avg_duration": "3h 40m",
        "risk_tier": "LOW",
        "risk_score": 2.4,
        "coordinates": [
            [23.8315, 91.2868],
            [23.4800, 91.4500],
            [23.0000, 91.7000]
        ],
        "vehicle_clearance": "SUITABLE_ALL",
        "allowed_cargo": ["Perishables", "FMCG", "Machinery"],
        "status": "OPEN",
        "daily_trips": 42,
        "last_monitored": "2026-09-06T11:45:00Z",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    }
]

# Sample Strategic Logistics Hubs across all 8 NER states
# Clearly identified as demo/sample simulation facilities
LOGISTICS_HUBS = [
    {
        "id": "hub-1",
        "name": "Guwahati Multi-Modal Freight Terminal",
        "city": "Guwahati",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "lat": 26.1445,
        "lon": 91.7362,
        "capacity_tonnes": 45000,
        "utilization_pct": 78.4,
        "has_cold_storage": True,
        "railhead_connected": True,
        "daily_dispatches": 210,
        "role": "Regional Central Gateway Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-2",
        "name": "Silchar Inland Container Depot",
        "city": "Silchar",
        "state": "Assam",
        "district": "Cachar",
        "lat": 24.8333,
        "lon": 92.7789,
        "capacity_tonnes": 18000,
        "utilization_pct": 82.1,
        "has_cold_storage": True,
        "railhead_connected": True,
        "daily_dispatches": 85,
        "role": "Barak Valley Distribution Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-3",
        "name": "Dimapur Transshipment Railhead",
        "city": "Dimapur",
        "state": "Nagaland",
        "district": "Dimapur",
        "lat": 25.9068,
        "lon": 93.7273,
        "capacity_tonnes": 22000,
        "utilization_pct": 74.5,
        "has_cold_storage": False,
        "railhead_connected": True,
        "daily_dispatches": 95,
        "role": "Nagaland / Manipur Gateway Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-4",
        "name": "Agartala Integrated Freight Checkpost",
        "city": "Agartala",
        "state": "Tripura",
        "district": "West Tripura",
        "lat": 23.8315,
        "lon": 91.2868,
        "capacity_tonnes": 16000,
        "utilization_pct": 69.2,
        "has_cold_storage": True,
        "railhead_connected": True,
        "daily_dispatches": 64,
        "role": "Tripura Cross-Border & Inter-State Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-5",
        "name": "Banderdewa Regional Logistics Park",
        "city": "Itanagar",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "lat": 27.0844,
        "lon": 93.6053,
        "capacity_tonnes": 12000,
        "utilization_pct": 62.0,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 45,
        "role": "Foothills Strategic Depot",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-6",
        "name": "Byrnihat Industrial Logistics Corridor",
        "city": "Nongpoh",
        "state": "Meghalaya",
        "district": "Ri-Bhoi",
        "lat": 25.9036,
        "lon": 91.8807,
        "capacity_tonnes": 28000,
        "utilization_pct": 84.0,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 130,
        "role": "Mineral & Industrial Dispatch Center",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-7",
        "name": "Imphal Nilakuthi Food Storage Depot",
        "city": "Imphal",
        "state": "Manipur",
        "district": "Imphal West",
        "lat": 24.8170,
        "lon": 93.9368,
        "capacity_tonnes": 14000,
        "utilization_pct": 71.8,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 50,
        "role": "Essential Commodities Buffer Depot",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-8",
        "name": "Rangpo Border Logistics Checkpost",
        "city": "Gangtok",
        "state": "Sikkim",
        "district": "East Sikkim",
        "lat": 27.1800,
        "lon": 88.5300,
        "capacity_tonnes": 10000,
        "utilization_pct": 65.4,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 42,
        "role": "Sikkim Lifeline Supply Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-9",
        "name": "Aizawl Sairang Railhead Logistics Yard",
        "city": "Aizawl",
        "state": "Mizoram",
        "district": "Aizawl",
        "lat": 23.7745,
        "lon": 92.6580,
        "capacity_tonnes": 15000,
        "utilization_pct": 68.5,
        "has_cold_storage": True,
        "railhead_connected": True,
        "daily_dispatches": 48,
        "role": "Lushai Hills Central Freight Depot",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-10",
        "name": "Pasighat East Siang Multi-Utility Depot",
        "city": "Pasighat",
        "state": "Arunachal Pradesh",
        "district": "East Siang",
        "lat": 28.0667,
        "lon": 95.3333,
        "capacity_tonnes": 8500,
        "utilization_pct": 58.0,
        "has_cold_storage": False,
        "railhead_connected": False,
        "daily_dispatches": 28,
        "role": "Upper Arunachal Forward Staging Hub",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-11",
        "name": "Kohima Hillside Distribution Depot",
        "city": "Kohima",
        "state": "Nagaland",
        "district": "Kohima",
        "lat": 25.6751,
        "lon": 94.1086,
        "capacity_tonnes": 11000,
        "utilization_pct": 72.0,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 40,
        "role": "Naga Highlands Lifeline Terminal",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-12",
        "name": "Dharmanagar North Rail Freight Depot",
        "city": "Dharmanagar",
        "state": "Tripura",
        "district": "North Tripura",
        "lat": 24.3756,
        "lon": 92.1645,
        "capacity_tonnes": 13500,
        "utilization_pct": 76.2,
        "has_cold_storage": False,
        "railhead_connected": True,
        "daily_dispatches": 52,
        "role": "North Tripura Bulk Distribution Center",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-13",
        "name": "Shillong Mawlai Transit Warehouse",
        "city": "Shillong",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "lat": 25.5788,
        "lon": 91.8933,
        "capacity_tonnes": 14000,
        "utilization_pct": 79.5,
        "has_cold_storage": True,
        "railhead_connected": False,
        "daily_dispatches": 62,
        "role": "Plateau Cold-Chain & General Distribution",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "hub-14",
        "name": "Tezpur Central Assam Transit Depot",
        "city": "Tezpur",
        "state": "Assam",
        "district": "Sonitpur",
        "lat": 26.6338,
        "lon": 92.7926,
        "capacity_tonnes": 20000,
        "utilization_pct": 81.0,
        "has_cold_storage": True,
        "railhead_connected": True,
        "daily_dispatches": 90,
        "role": "Northern Brahmaputra Freight Gateway",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    }
]

# 8 Documented Geographic & Logistical Challenges Specific to the North Eastern Region
NER_CHALLENGES = [
    {
        "id": "ch-terrain",
        "title": "Mountainous Terrain & Gradient Constraints",
        "category": "Topography & Vehicle Mechanics",
        "icon": "Mountain",
        "severity_level": "SEVERE",
        "description": "High altitude mountain passes and sharp escarpments characterize over 70% of the NER landmass. Steep road gradients (frequently exceeding 8% to 14%) and hairpin turns limit heavy axle vehicle passage, causing severe engine strain, brake overheating, and stringent gross vehicle weight (GVW) restrictions (often capped at 10 to 12 tonnes).",
        "impact_on_logistics": "35% to 45% lower fuel efficiency, heavy brake wear, load splitting required at transshipment foothill points, and transit speeds constrained to 20-30 km/h.",
        "mitigation_strategy": "OR-Tools payload and gradient-aware dispatching; hill-rate fuel surcharging; prioritizing multi-axle trailers only on widened four-lane corridors.",
        "sample_affected_areas": ["Patkai Range (Nagaland/Arunachal)", "Khasi & Jaintia Hills (Meghalaya)", "Lushai Hills (Mizoram)", "Sikkim Himalayan Ridges"]
    },
    {
        "id": "ch-rainfall",
        "title": "Extreme Monsoon Rainfall & Precipitation Belts",
        "category": "Hydro-Meteorology",
        "icon": "CloudRain",
        "severity_level": "HIGH",
        "description": "The North Eastern Region receives some of the highest precipitation on earth (Cherrapunji/Mawsynram belt exceeds 11,000 mm annually). Extended monsoon seasons lasting from May through October continuously saturate hill slopes and deteriorate asphalt subgrades.",
        "impact_on_logistics": "Reduced tire traction, zero-visibility fog belts, unpaved shoulder collapse, and rapid road surface degradation requiring frequent convoy stops.",
        "mitigation_strategy": "Real-time precipitation sensor integration with OpenWeatherMap; predictive speed throttling; dynamic rerouting via valley corridors.",
        "sample_affected_areas": ["Sohra/Mawsynram (Meghalaya)", "Subansiri Basin (Arunachal)", "Tamenglong (Manipur)"]
    },
    {
        "id": "ch-landslides",
        "title": "Active Landslides & Sinking Subgrade Zones",
        "category": "Geotechnical Risk",
        "icon": "AlertTriangle",
        "severity_level": "CRITICAL",
        "description": "The young, seismically active Himalayan and Indo-Burma ranges feature fractured sedimentary rock strata. Heavy rainwater percolation triggers periodic mudslides, rockfalls, and road subsidence that temporarily sever primary arterial links.",
        "impact_on_logistics": "Complete corridor blockages lasting from several hours to multiple days; perishable cargo spoilage; single-lane alternating convoy bottlenecks.",
        "mitigation_strategy": "Random Forest ML geological failure score prediction; early sensor warnings; pre-planned secondary bypass itineraries (e.g. Zubza link for Pagla Pahar).",
        "sample_affected_areas": ["Pagla Pahar NH29 (Nagaland)", "Barail Range NH8 (Assam/Tripura border)", "Dzongu / North Sikkim Roads"]
    },
    {
        "id": "ch-flooding",
        "title": "River Valley Flooding & Submerged Causeways",
        "category": "Hydrology & Drainage",
        "icon": "Waves",
        "severity_level": "HIGH",
        "description": "The Brahmaputra and Barak river basins, fed by hundreds of Himalayan tributaries, undergo severe annual flooding during peak monsoon months, inundating low-lying national highway sections and bridge approaches in plains and river junctions.",
        "impact_on_logistics": "Submerged causeways, temporary ferry suspensions across river crossings, washed out culverts, and structural load caps on swollen river bridges.",
        "mitigation_strategy": "Bridge clearance sensor telemetry; water-level flood gauge alerts; routing via elevated bypass alignments.",
        "sample_affected_areas": ["Kaziranga NH715 sector (Assam)", "Dhemaji/Majuli (Assam)", "South Tripura river plains"]
    },
    {
        "id": "ch-connectivity",
        "title": "Remote Connectivity & Single-Artery Bottlenecks",
        "category": "Network Topology",
        "icon": "Network",
        "severity_level": "CRITICAL",
        "description": "The entire North Eastern Region connects to mainland India through the narrow Siliguri Corridor ('Chicken's Neck', ~22 km wide). Beyond Guwahati, intra-regional state capital connections often depend on a single arterial highway corridor without redundant high-capacity expressways.",
        "impact_on_logistics": "High network vulnerability: disruption at any single critical chokepoint forces detour routes of 150 to 300+ extra kilometers or isolates entire state supply lines.",
        "mitigation_strategy": "Multi-objective corridor redundancy mapping; multimodal coordination combining railway transshipment and inland waterway links (NW-2).",
        "sample_affected_areas": ["Siliguri Corridor gateway", "NH306 sole highway lifeline into Mizoram", "NH37 Jiribam corridor into Manipur"]
    },
    {
        "id": "ch-infrastructure",
        "title": "Limited Logistics Infrastructure & Cold Chains",
        "category": "Supply Chain Infrastructure",
        "icon": "Building",
        "severity_level": "MEDIUM",
        "description": "While central hubs like Guwahati possess modern freight parks, remote mountain districts have a documented deficit of commercial temperature-controlled cold storages, automated transshipment cross-docks, and standardized truck repair hubs.",
        "impact_on_logistics": "High transit spoilage rates for organic horticultural produce (ginger, kiwi, oranges, spices); empty backhaul running due to unbalanced inbound vs outbound freight.",
        "mitigation_strategy": "Registry of lifeline emergency facilities (hospitals, fuel depots, reefer hubs); optimizing reefer fleet utilization; encouraging consolidated multi-drop dispatches.",
        "sample_affected_areas": ["Tawang/Ziro (Arunachal Pradesh)", "Lunglei (Mizoram)", "Mon/Tuensang (Nagaland)", "Churachandpur (Manipur)"]
    },
    {
        "id": "ch-transittime",
        "title": "Extended Transit Durations & Driver Fatigue",
        "category": "Fleet Operations",
        "icon": "Clock",
        "severity_level": "MEDIUM",
        "description": "Due to hill topography, sharp curves, heavy vehicle speed restrictions, and checkpost documentation queues, long-haul freight in NER averages only 150-220 km per 24 hours, compared to 400-500 km per day on mainland golden quadrilateral highways.",
        "impact_on_logistics": "Driver exhaustion, extended delivery lead times, tied-up working capital, and higher wage and per-diem operational overheads.",
        "mitigation_strategy": "Automated driving hour caps; scheduled mandatory rest stops at designated safe logistic hubs; telemetry tracking of actual vs planned transit variance.",
        "sample_affected_areas": ["Guwahati to Agartala (580 km takes ~22-26 hours)", "Tezpur to Tawang (takes ~14 hours for 320 km)"]
    },
    {
        "id": "ch-accessibility",
        "title": "Seasonal Road Accessibility & Sub-Zero Pass Closures",
        "category": "Seasonal Access",
        "icon": "Compass",
        "severity_level": "HIGH",
        "description": "High-altitude passes (such as Sela Pass at 13,700 ft in Arunachal Pradesh and Nathu La in Sikkim) face severe sub-zero winter temperatures, black ice, and snow accumulation from November to March, restricting conventional two-wheel-drive commercial trucks.",
        "impact_on_logistics": "Mandatory snow-chaining, seasonal convoy operation under BRO guidance, payload rationing for essential winter fuel and medical reserves.",
        "mitigation_strategy": "Pre-monsoon and pre-winter strategic buffer stocking at forward logistics depots; automated vehicle clearance classification.",
        "sample_affected_areas": ["Sela Pass / Tawang corridor (Arunachal Pradesh)", "North Sikkim (Lachen / Lachung)", "Dzükou Valley approaches"]
    }
]

# Sample Geological Hazard Hotspots monitored by authorities (simulated geographic zones)
HIGH_RISK_AREAS = [
    {
        "id": "haz-1",
        "name": "Pagla Pahar Active Sinking Zone",
        "highway": "NH29",
        "state": "Nagaland",
        "district": "Kohima",
        "lat": 25.7520,
        "lon": 93.9540,
        "hazard_type": "Active Geological Fault & Sinking Subgrade",
        "severity": "CRITICAL",
        "current_status": "Single Lane Alternating Convoy",
        "alternate_route": "Zubza Valley Alternate Link",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "haz-2",
        "name": "Barail Range Landslide Belt",
        "highway": "NH8 / NH208",
        "state": "Assam",
        "district": "Dima Hasao",
        "lat": 25.1200,
        "lon": 92.9800,
        "hazard_type": "Mudslide & Debris Flow during Rain > 40mm/h",
        "severity": "HIGH",
        "current_status": "Monitored via Rain Gauges",
        "alternate_route": "Dharmanagar Bypass",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "haz-3",
        "name": "Sela Pass Sub-Zero Ridge",
        "highway": "NH13",
        "state": "Arunachal Pradesh",
        "district": "Tawang",
        "lat": 27.5020,
        "lon": 92.1050,
        "hazard_type": "Black Ice, Snow Drifts & Thick Fog",
        "severity": "HIGH",
        "current_status": "Chained Tyres & Escort Only",
        "alternate_route": "No bypass available; Staggered Convoy",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "haz-4",
        "name": "Umiam Lake Bridge Clearance Zone",
        "highway": "NH6",
        "state": "Meghalaya",
        "district": "Ri-Bhoi",
        "lat": 25.6650,
        "lon": 91.9120,
        "hazard_type": "Bridge Weight Strict 17t Cap",
        "severity": "MEDIUM",
        "current_status": "Automated Weigh-in-Motion Active",
        "alternate_route": "Umsning East Bypass for >17t loads",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    }
]

# Sample Government / Administrative Regulatory Notices
ACTIVE_GOV_ALERTS = [
    {
        "id": "gov-alt-1",
        "title": "NDMA Monsoon Advisory: Pagla Pahar Sector (NH29)",
        "source": "State Disaster Management Authority (SDMA) Nagaland",
        "severity": "HIGH",
        "timestamp": "2026-09-06T10:15:00Z",
        "message": "Continuous heavy rainfall recorded. Freight vehicles exceeding 10 tonnes diverted to Zubza Valley alternate link.",
        "affected_corridor": "Dimapur ➔ Kohima",
        "action_required": "Enforce weighbridge checks & redirect heavy trailers",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "gov-alt-2",
        "title": "Bridge Structural Advisory: NH8 Cachar-Tripura Border",
        "source": "Ministry of Road Transport and Highways (MoRTH)",
        "severity": "MEDIUM",
        "timestamp": "2026-09-06T08:30:00Z",
        "message": "Routine sonar & strain gauge inspection on Sonai River Bridge. 15-minute staggered intervals between 02:00 and 06:00.",
        "affected_corridor": "Silchar ➔ Agartala",
        "action_required": "Stagger dispatch schedules from Silchar ICD",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    },
    {
        "id": "gov-alt-3",
        "title": "Lifeline Supply Corridor Priority: NH6 Asian Highway 1",
        "source": "North Eastern Council (NEC) Secretariat",
        "severity": "LOW",
        "timestamp": "2026-09-05T14:00:00Z",
        "message": "Green channel established for refrigerated pharmaceutical and perishable shipments entering Meghalaya.",
        "affected_corridor": "Guwahati ➔ Shillong",
        "action_required": "Fast-track toll passage for reefer transport",
        "is_simulated": True,
        "data_source": "SIMULATED_DEMO_BENCHMARK"
    }
]


class AdminService:
    """
    Administrative intelligence service for SIH26002 government authorities.
    Integrates multi-criteria filtering across 8 NER states.
    """

    def __init__(self):
        self.provenance = {
            "authority": "Government Administration Portal (SIH26002)",
            "agencies": "Ministry of DoNER • North Eastern Council • State Transport Depts • NDMA",
            "is_demo_data": True,
            "demo_label": "DEMO / GOVERNMENT ADMINISTRATIVE DATA",
            "last_updated": "2026-09-06T13:00:00Z"
        }

    def get_dashboard(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        risk: Optional[str] = None,
        vehicle: Optional[str] = None,
        cargo: Optional[str] = None,
        date_range: Optional[str] = "30d"
    ) -> Dict[str, Any]:
        """
        Returns full administrative dataset filtered by multi-criteria query parameters.
        """
        # Filter routes
        filtered_routes = ADMIN_ROUTES
        if state and state.lower() != "all":
            s_clean = state.lower()
            filtered_routes = [r for r in filtered_routes if r["state_origin"].lower() == s_clean or r["state_destination"].lower() == s_clean]

        if district and district.lower() != "all":
            d_clean = district.lower()
            filtered_routes = [r for r in filtered_routes if r["district_origin"].lower() == d_clean or r["district_destination"].lower() == d_clean]

        if risk and risk.upper() != "ALL":
            filtered_routes = [r for r in filtered_routes if r["risk_tier"] == risk.upper()]

        if vehicle and vehicle.lower() != "all":
            # Filter by vehicle clearance
            if "heavy" in vehicle.lower() or "17t" in vehicle.lower():
                filtered_routes = [r for r in filtered_routes if r["vehicle_clearance"] == "SUITABLE_ALL"]
            elif "10t" in vehicle.lower():
                filtered_routes = [r for r in filtered_routes if r["vehicle_clearance"] in ["SUITABLE_ALL", "RESTRICTED_12T", "RESTRICTED_10T"]]

        if cargo and cargo.lower() != "all":
            c_clean = cargo.lower()
            filtered_routes = [r for r in filtered_routes if any(c_clean in c.lower() for c in r["allowed_cargo"])]

        # Filter hubs by state
        filtered_hubs = LOGISTICS_HUBS
        if state and state.lower() != "all":
            filtered_hubs = [h for h in filtered_hubs if h["state"].lower() == state.lower()]

        # Filter hazards by state
        filtered_hazards = HIGH_RISK_AREAS
        if state and state.lower() != "all":
            filtered_hazards = [hz for hz in filtered_hazards if hz["state"].lower() == state.lower()]

        # Transportation statistics
        stats = self._compute_transport_stats(filtered_routes, filtered_hubs)

        # System usage
        system_usage = self._compute_system_usage()

        return {
            "status": "success",
            "provenance": self.provenance,
            "filters_applied": {
                "state": state or "ALL",
                "district": district or "ALL",
                "risk": risk or "ALL",
                "vehicle": vehicle or "ALL",
                "cargo": cargo or "ALL",
                "date_range": date_range or "30d"
            },
            "summary_kpis": {
                "active_corridors_count": len(filtered_routes),
                "high_risk_count": sum(1 for r in filtered_routes if r["risk_tier"] == "HIGH"),
                "medium_risk_count": sum(1 for r in filtered_routes if r["risk_tier"] == "MEDIUM"),
                "low_risk_count": sum(1 for r in filtered_routes if r["risk_tier"] == "LOW"),
                "active_alerts_count": len(ACTIVE_GOV_ALERTS),
                "logistics_hubs_count": len(filtered_hubs),
                "hazards_count": len(filtered_hazards),
                "total_daily_freight_tonnes": stats["total_daily_tonnes"],
                "fleet_compliance_rate_pct": system_usage["compliance_rate_pct"]
            },
            "routes": filtered_routes,
            "logistics_hubs": filtered_hubs,
            "high_risk_areas": filtered_hazards,
            "active_alerts": ACTIVE_GOV_ALERTS,
            "transport_stats": stats,
            "system_usage": system_usage
        }

    def _compute_transport_stats(self, routes: List[Dict[str, Any]], hubs: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_daily_tonnes = sum(r["daily_trips"] * 12 for r in routes)  # avg 12t per dispatch
        total_km = sum(r["distance_km"] for r in routes)
        avg_cost = 14.20

        return {
            "total_daily_tonnes": total_daily_tonnes,
            "total_arterial_network_km": round(total_km, 1),
            "avg_freight_rate_per_tkm": avg_cost,
            "modal_share": [
                {"mode": "National & State Highways", "percentage": 82.5, "color": "#6366f1"},
                {"mode": "NFR Broad Gauge Rail", "percentage": 13.8, "color": "#14b8a6"},
                {"mode": "Inland Waterway (NW-2 Brahmaputra)", "percentage": 3.7, "color": "#f59e0b"}
            ],
            "cargo_distribution": [
                {"cargo": "Agricultural & Perishables", "share_pct": 34.2},
                {"cargo": "Industrial Construction & Cement", "share_pct": 28.5},
                {"cargo": "Lifeline Pharmaceuticals & Meds", "share_pct": 18.1},
                {"cargo": "Petroleum & Fuel (POL)", "share_pct": 12.4},
                {"cargo": "FMCG & Consumer Goods", "share_pct": 6.8}
            ]
        }

    def _compute_system_usage(self) -> Dict[str, Any]:
        return {
            "active_registered_carriers": 142,
            "telemetry_connected_trucks": 1284,
            "active_sensor_beacons": 48,
            "telemetry_pings_per_min": 3840,
            "compliance_rate_pct": 94.6,
            "diverted_trips_to_safe_routes": 312,
            "system_uptime_pct": 99.94
        }

    def get_ner_challenges(self) -> List[Dict[str, Any]]:
        """
        Returns structured documentation of 8 critical geographic, meteorological,
        and logistical challenges inherent to freight operations across the NER.
        """
        return NER_CHALLENGES

    def to_geojson(self, state: Optional[str] = None) -> Dict[str, Any]:
        """
        Exports hubs, corridors, and hazard points in standard RFC 7946 GeoJSON format.
        Coordinates are formatted as [longitude, latitude] per GeoJSON standard.
        Facilitates seamless interoperability with GIS platforms (QGIS, PM Gati Shakti, ArcGIS).
        """
        features = []

        # Filtered sets
        hubs = LOGISTICS_HUBS
        routes = ADMIN_ROUTES
        hazards = HIGH_RISK_AREAS

        if state and state.lower() != "all":
            s_clean = state.lower()
            hubs = [h for h in hubs if h["state"].lower() == s_clean]
            routes = [r for r in routes if r["state_origin"].lower() == s_clean or r["state_destination"].lower() == s_clean]
            hazards = [hz for hz in hazards if hz["state"].lower() == s_clean]

        # 1. Logistics Hubs (Point)
        for hub in hubs:
            features.append({
                "type": "Feature",
                "id": hub["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [hub["lon"], hub["lat"]]
                },
                "properties": {
                    "feature_type": "logistics_hub",
                    "name": hub["name"],
                    "city": hub["city"],
                    "state": hub["state"],
                    "district": hub["district"],
                    "capacity_tonnes": hub["capacity_tonnes"],
                    "utilization_pct": hub["utilization_pct"],
                    "has_cold_storage": hub["has_cold_storage"],
                    "railhead_connected": hub["railhead_connected"],
                    "role": hub["role"],
                    "is_simulated": hub.get("is_simulated", True),
                    "data_source": hub.get("data_source", "SIMULATED_DEMO_BENCHMARK")
                }
            })

        # 2. Hazard Areas (Point)
        for haz in hazards:
            features.append({
                "type": "Feature",
                "id": haz["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [haz["lon"], haz["lat"]]
                },
                "properties": {
                    "feature_type": "hazard_hotspot",
                    "name": haz["name"],
                    "highway": haz["highway"],
                    "state": haz["state"],
                    "district": haz["district"],
                    "hazard_type": haz["hazard_type"],
                    "severity": haz["severity"],
                    "current_status": haz["current_status"],
                    "alternate_route": haz["alternate_route"],
                    "is_simulated": haz.get("is_simulated", True),
                    "data_source": haz.get("data_source", "SIMULATED_DEMO_BENCHMARK")
                }
            })

        # 3. Routes (LineString) - convert [lat, lon] to [lon, lat] for standard GeoJSON
        for rt in routes:
            geo_coords = [[pt[1], pt[0]] for pt in rt["coordinates"]]
            features.append({
                "type": "Feature",
                "id": rt["id"],
                "geometry": {
                    "type": "LineString",
                    "coordinates": geo_coords
                },
                "properties": {
                    "feature_type": "arterial_corridor",
                    "name": rt["name"],
                    "highway": rt["highway"],
                    "state_origin": rt["state_origin"],
                    "state_destination": rt["state_destination"],
                    "distance_km": rt["distance_km"],
                    "risk_tier": rt["risk_tier"],
                    "risk_score": rt["risk_score"],
                    "vehicle_clearance": rt["vehicle_clearance"],
                    "status": rt["status"],
                    "is_simulated": rt.get("is_simulated", True),
                    "data_source": rt.get("data_source", "SIMULATED_DEMO_BENCHMARK")
                }
            })

        return {
            "type": "FeatureCollection",
            "metadata": {
                "title": "North Eastern Region (NER) Logistics GIS Layer",
                "crs": "urn:ogc:def:crs:OGC:1.3:CRS84",
                "dataset_classification": "SIMULATED_DEMO_BENCHMARK",
                "simulated_warning": "Benchmark demonstration dataset for SIH26002 prototype evaluation. Real MoRTH/State GIS feeds plug in via standard GeoJSON schema.",
                "total_features": len(features),
                "state_filter": state or "ALL",
                "generated_at": datetime.utcnow().isoformat() + "Z"
            },
            "features": features
        }


# Singleton instance
admin_service = AdminService()

