# NER Logistics Risk Prediction Dataset Documentation

> [!CAUTION]
> **CRITICAL DISCLAIMER: DEMO / SYNTHETIC DATASET ONLY**
>
> The data contained in `synthetic_route_risk_data.csv` is **100% SYNTHETIC AND ALGORITHMICALLY GENERATED** for software architecture development, pipeline verification, model training interface design, and automated testing.
>
> - **DO NOT** claim or represent this dataset as real-world data.
> - **DO NOT** use models trained exclusively on this synthetic data for production logistics, life-critical route dispatching, or real-world safety decisions.
> - This model is a **proof-of-concept pipeline validation artifact** and is **NOT production-ready**.

---

## 1. Dataset Overview

- **File**: `ml/data/synthetic_route_risk_data.csv`
- **Total Records**: 3,500 samples
- **Feature Count**: 10 input features
- **Target Variable**: `risk` (Multi-class classification)
- **Class Distribution**:
  - `LOW`: ~52.5% (Safe, dry/mild conditions, sound infrastructure, gentle terrain)
  - `MEDIUM`: ~32.3% (Moderate precipitation, hill mist, winding ghat roads, caution advised)
  - `HIGH`: ~15.2% (Torrential downpours, severe zero-visibility fog, steep unstable ghats, poor road surface, high historical landslide recurrence)

---

## 2. Feature Schema & Specifications

| Feature Name | Type | Unit / Range | Description | Emulated NER Context |
|---|---|---|---|---|
| `rainfall` | Float | $0.0 - 48.0\text{ mm/h}$ | Hourly precipitation rate | Emulates monsoon downpours and hill orographic rains (Mawsynram/Cherrapunji corridors). |
| `slope` | Float | $0.0^\circ - 28.0^\circ$ | Road gradient / incline | Captures hill passes and steep ghat sections (e.g. NH6 Nongpoh–Umiam climb, Kohima bypass). |
| `road_quality` | Float | $1.0 - 5.0$ | Surface index ($1=\text{severely damaged}$, $5=\text{pristine}$) | Accounts for potholed, waterlogged, or unpaved hill roads versus newly resurfaced 4-lane NH highways. |
| `visibility` | Float | $0.2 - 12.0\text{ km}$ | Optical atmospheric visibility | Reflects dense mountain cloud mist, morning winter fog, and blinding rain spray. |
| `traffic` | Float | $0.0 - 1.0$ | Congestion index ($0=\text{empty}$, $1=\text{gridlock}$) | Reflects freight bottleneck slowdowns at border checkpoints and hill town choke points. |
| `historical_incidents` | Integer | $0 - 12$ | Documented historical incidents/closures | Past landslides, mud slips, rock falls, or bridge washouts recorded along the segment. |
| `road_type` | Categorical | `national_highway`, `state_highway`, `rural_hill_road` | Administrative classification of corridor | Determines design speed, drainage engineering, and road width. |
| `elevation` | Float | $50 - 2600\text{ m}$ | Altitude above sea level | Lowland Brahmaputra valley (50m) up to Khasi Hills, Naga Hills, and high-altitude Himalayan sectors. |
| `temperature` | Float | $-2.0^\circ\text{C} - 38.0^\circ\text{C}$ | Ambient dry-bulb temperature | Cold mountain winter passes through sub-tropical river plains. |
| `wind_speed` | Float | $1.0 - 70.0\text{ km/h}$ | 10-meter surface wind speed | Mountain gorge wind funnels and storm squalls causing trailer sway or toppling hazard. |

### Target Label: `risk`
- **`LOW`**: Standard transit safety conditions. Normal freight speeds permissible.
- **`MEDIUM`**: Elevated hazard conditions. Wet roads, reduced hill speeds, headlights required, increased headway.
- **`HIGH`**: Severe operational hazard. High landslide probability, heavy downpour, poor visibility; schedule delays, daylight travel restrictions, or rerouting advised.

---

## 3. Real-World Datasets for Production Replacement

To transition this platform from prototype to production-grade operational status, the synthetic data generator must be replaced with empirical data pipelines aggregating the following verified sources:

### A. Meteorological & Atmospheric Data
1. **India Meteorological Department (IMD) Gridded Meteorological Datasets**:
   - **Data**: High-resolution daily/hourly rainfall ($0.25^\circ \times 0.25^\circ$) and surface temperature ($1^\circ \times 1^\circ$).
   - **Access**: IMD Pune Data Supply Portal / National Data Centre (NDC).
   - **Use**: Historical training benchmarks for multi-decadal rainfall thresholds.
2. **Open-Meteo & ECMWF ERA5-Land Reanalysis**:
   - **Data**: Hourly global reanalysis covering precipitation, wind gusts, relative humidity, and dew point at $9\text{ km}$ spatial resolution.
   - **Access**: Copernicus Climate Data Store (CDS) API & Open-Meteo API.
   - **Use**: Real-time operational overlay and backtesting.

### B. Terrain, Elevation & Landslide Susceptibility
1. **Geological Survey of India (GSI) - National Landslide Susceptibility Mapping (NLSM)**:
   - **Data**: 1:50,000 scale GIS landslide susceptibility atlas covering all 8 North Eastern states, detailing lithology, structural lineaments, slope morphometry, and historical rupture inventories.
   - **Access**: GSI Bhukosh Portal (`bhukosh.gsi.gov.in`).
   - **Use**: Precise spatial ground-truth for landslide hazard polygons along highway corridors.
2. **ISRO Bhuvan Geoportal & CartoDEM**:
   - **Data**: High-resolution $30\text{m}$ (and Cartosat $2.5\text{m}$) Digital Elevation Models (DEM).
   - **Access**: ISRO Bhuvan Disaster Management Support Programme (`bhuvan.nrsc.gov.in`).
   - **Use**: Real elevation gain, slope angle calculation, and drainage catchment delineation.

### C. Road Infrastructure & Surface Quality
1. **National Highways Authority of India (NHAI) - Road Asset Management System (RAMS)**:
   - **Data**: Pavement condition index (PCI), roughness index (IRI), lane widths, culvert conditions, and blackspot locations across National Highways in Assam, Meghalaya, etc.
   - **Access**: NHAI / Ministry of Road Transport and Highways (MoRTH) Data Sharing Portals.
2. **OpenStreetMap (OSM) Highway Surface & Geometry**:
   - **Data**: Granular highway tags (`highway=*`, `surface=asphalt/unpaved`, `smoothness=intermediate/bad`, `lanes=*`, `incline=*`).
   - **Access**: Overpass API / Geofabrik India extracts.
   - **Use**: Feature extraction along road centerlines.

### D. Historical Accidents, Blockades & Disasters
1. **State Disaster Management Authorities (SDMA) Incident Logs**:
   - **Agencies**: Assam State Disaster Management Authority (ASDMA), Meghalaya SDMA, Nagaland SDMA.
   - **Data**: Daily flood reports, flash flood alerts, seasonal landslide highway closures, and district-level damage logs.
2. **Border Roads Organisation (BRO) Highway Bulletins**:
   - **Commands**: Project Sewak (Nagaland), Project Pushpak (Mizoram/Tripura), Project Vartak (Arunachal).
   - **Data**: Real-time road clearance bulletins, active snow clearance passes, and Bailey bridge weight limits.
3. **MoRTH Integrated Road Accident Database (iRAD)**:
   - **Data**: Geotagged accident frequency, severity indices, and road geometric crash blackspots.

### E. Traffic & Congestion Flow
1. **NHAI National Electronic Toll Collection (FASTag) Data**:
   - **Data**: Hourly toll plaza vehicle counts, transit transit times between consecutive plazas.
2. **Commercial Traffic Speed Feeds**:
   - **Sources**: Google Routes API / TomTom Traffic Flow API / MapmyIndia Traffic API for real-time travel time delay ratios ($T_{\text{actual}} / T_{\text{free\_flow}}$).

---

## 4. Pipeline Integration Roadmap

```
┌────────────────────────────────────────────────────────┐
│             DEMO PHASE (CURRENT IMPLEMENTATION)        │
│   ml/data/synthetic_route_risk_data.csv (Algorithm)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             DATA PIPELINE (PHASE 4 ARCHITECTURE)       │
│   ml/preprocessing.py → ml/train.py → ml/evaluate.py   │
│   RandomForestClassifier Pipeline (joblib)             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             PRODUCTION TRANSITION (FUTURE WORK)        │
│   1. Ingest GSI NLSM shapefiles for terrain risk       │
│   2. Stream IMD/Open-Meteo real-time weather feeds     │
│   3. Query NHAI RAMS & OSM for real road quality       │
│   4. Retrain RF/XGBoost on verified historical labels  │
└────────────────────────────────────────────────────────┘
```
