"""
SYNTHETIC / DEMO DATASET GENERATION SCRIPT FOR NER LOGISTICS RISK PIPELINE
==========================================================================
DISCLAIMER:
This dataset is purely SYNTHETIC / DEMO data generated algorithmically
for developing, testing, and validating the software pipeline architecture.
It is NOT real-world data and must NOT be used for production safety-critical
decision making.
"""

import os
import random
import numpy as np
import pandas as pd

# Set deterministic seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

ROAD_TYPES = ["national_highway", "state_highway", "rural_hill_road"]


def generate_synthetic_route_data(n_samples: int = 3000) -> pd.DataFrame:
    """
    Generate synthetic data representing route segments across diverse
    North Eastern Region (NER) terrain, weather, and infrastructure conditions.

    Features generated:
      - rainfall: precipitation in mm/h (0.0 to 45.0)
      - slope: road gradient/incline in degrees (0.0 to 28.0)
      - road_quality: road surface rating (1.0 = poor/broken, 5.0 = excellent)
      - visibility: atmospheric visibility in km (0.2 to 12.0)
      - traffic: congestion index (0.0 = free flow, 1.0 = heavy gridlock)
      - historical_incidents: past recorded roadblocks/landslides (0 to 12)
      - road_type: 'national_highway', 'state_highway', 'rural_hill_road'
      - elevation: altitude in meters (50 to 2600)
      - temperature: ambient temperature in Celsius (-2.0 to 38.0)
      - wind_speed: wind gusts in km/h (0.0 to 70.0)

    Target:
      - risk: 'LOW', 'MEDIUM', 'HIGH'
    """
    records = []

    for _ in range(n_samples):
        # Road type distribution in mountainous logistics
        road_type = random.choices(ROAD_TYPES, weights=[0.45, 0.35, 0.20])[0]

        # Elevation depends somewhat on road type / hill regions
        if road_type == "rural_hill_road":
            elevation = round(float(np.random.uniform(700, 2600)), 1)
            slope = round(float(np.random.uniform(5.0, 26.0)), 2)
            road_quality = round(float(np.clip(np.random.normal(2.4, 0.7), 1.0, 4.0)), 2)
        elif road_type == "state_highway":
            elevation = round(float(np.random.uniform(200, 1800)), 1)
            slope = round(float(np.random.uniform(2.0, 18.0)), 2)
            road_quality = round(float(np.clip(np.random.normal(3.3, 0.8), 1.5, 4.8)), 2)
        else:  # national_highway
            elevation = round(float(np.random.uniform(60, 1500)), 1)
            slope = round(float(np.random.uniform(0.5, 12.0)), 2)
            road_quality = round(float(np.clip(np.random.normal(4.1, 0.6), 2.0, 5.0)), 2)

        # Weather parameters
        # Rainfall follows skewed exponential/gamma (many dry/light days, occasional torrential downpours)
        is_raining = random.random() < 0.40
        if is_raining:
            rainfall = round(float(np.random.exponential(scale=7.5)), 2)
            rainfall = min(rainfall, 48.0)
        else:
            rainfall = 0.0

        # Visibility is strongly correlated with rainfall and hill fog
        if rainfall > 15.0:
            visibility = round(float(np.clip(np.random.uniform(0.3, 2.5), 0.2, 10.0)), 2)
        elif rainfall > 5.0:
            visibility = round(float(np.clip(np.random.uniform(1.2, 5.0), 0.5, 10.0)), 2)
        elif elevation > 1200 and random.random() < 0.35:  # mountain mist/fog
            visibility = round(float(np.clip(np.random.uniform(0.4, 3.0), 0.2, 10.0)), 2)
        else:
            visibility = round(float(np.clip(np.random.normal(8.5, 2.0), 2.5, 12.0)), 2)

        # Temperature decreases with altitude (lapse rate approx 6.5C / 1000m)
        base_temp = np.random.uniform(24.0, 34.0)
        lapse = (elevation / 1000.0) * 6.5
        temperature = round(float(np.clip(base_temp - lapse + np.random.normal(0, 2), -2.0, 38.0)), 1)

        # Wind speed
        wind_speed = round(float(np.clip(np.random.gamma(shape=2.5, scale=6.0), 1.0, 68.0)), 1)

        # Traffic index (0 to 1)
        traffic = round(float(np.clip(np.random.beta(2.0, 3.0), 0.02, 0.98)), 3)

        # Historical incident count along segment (landslides, mudslips, road blocks)
        incident_lambda = 0.8
        if slope > 14.0 and rainfall > 8.0:
            incident_lambda = 4.5
        elif slope > 10.0:
            incident_lambda = 2.2
        elif road_type == "rural_hill_road":
            incident_lambda = 1.8
        historical_incidents = int(np.clip(np.random.poisson(lam=incident_lambda), 0, 12))

        # =====================================================================
        # Synthetic Ground-Truth Risk Calculation
        # (Weighted composite hazard index designed to emulate realistic risks)
        # =====================================================================
        # Weather component (0 to 35)
        w_score = 0.0
        if rainfall >= 18.0:
            w_score += 22.0
        elif rainfall >= 8.0:
            w_score += 14.0
        elif rainfall >= 2.0:
            w_score += 6.0

        if visibility <= 1.0:
            w_score += 10.0
        elif visibility <= 3.0:
            w_score += 5.0

        if wind_speed >= 45.0:
            w_score += 6.0
        elif wind_speed >= 30.0:
            w_score += 3.0

        # Terrain & Landslide component (0 to 35)
        # Landslides are strongly triggered by combination of steep slope + heavy rainfall
        t_score = 0.0
        if slope >= 18.0:
            t_score += 16.0
            if rainfall >= 10.0:
                t_score += 12.0  # high landslide hazard trigger
        elif slope >= 10.0:
            t_score += 9.0
            if rainfall >= 10.0:
                t_score += 7.0
        elif slope >= 5.0:
            t_score += 4.0

        if elevation >= 1600.0:
            t_score += 5.0
        elif elevation >= 1000.0:
            t_score += 2.0

        # Road infrastructure & quality component (0 to 20)
        r_score = 0.0
        if road_type == "rural_hill_road":
            r_score += 9.0
        elif road_type == "state_highway":
            r_score += 4.0

        # Lower quality (scale 1 to 5) increases risk
        r_score += (5.0 - road_quality) * 2.2

        # Operational & Historical component (0 to 18)
        o_score = 0.0
        o_score += min(historical_incidents * 1.6, 12.0)
        o_score += traffic * 6.0  # congestion adds vulnerability & response delay

        # Composite score calculation with subtle non-linear noise
        noise = np.random.normal(0, 2.5)
        composite_risk_score = w_score + t_score + r_score + o_score + noise
        composite_risk_score = float(np.clip(composite_risk_score, 0.0, 100.0))

        # Target classification
        if composite_risk_score < 22.0:
            risk = "LOW"
        elif composite_risk_score < 38.0:
            risk = "MEDIUM"
        else:
            risk = "HIGH"

        records.append({
            "rainfall": rainfall,
            "slope": slope,
            "road_quality": road_quality,
            "visibility": visibility,
            "traffic": traffic,
            "historical_incidents": historical_incidents,
            "road_type": road_type,
            "elevation": elevation,
            "temperature": temperature,
            "wind_speed": wind_speed,
            "risk": risk
        })

    df = pd.DataFrame(records)
    return df


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(current_dir, "synthetic_route_risk_data.csv")

    print("[*] Generating synthetic NER transportation route risk dataset...")
    df = generate_synthetic_route_data(n_samples=3500)

    # Add header disclaimer comments via file write or inspect dataframe
    df.to_csv(output_csv, index=False)

    print(f"[+] Successfully generated {len(df)} synthetic records.")
    print(f"[+] Saved to: {output_csv}")
    print("\nDataset Class Distribution:")
    print(df["risk"].value_counts(normalize=True).apply(lambda x: f"{x * 100:.1f}%"))
    print("\nSample records:")
    print(df.head(4))
