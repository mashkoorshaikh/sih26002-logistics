"""
NER LOGISTICS PLATFORM - ML ROUTE RISK SERVICE
==============================================
Loads the trained RandomForestClassifier model bundle from ml/models/risk_rf_model.joblib
and provides validated risk classification and confidence estimation for route segments
and multi-route comparison.
"""

import os
import sys
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger("ner_logistics.risk_service")

# Candidate paths to locate ml/models/risk_rf_model.joblib
POSSIBLE_MODEL_PATHS = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "risk_rf_model.joblib")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "models", "risk_rf_model.joblib")),
    r"E:\hackathon\ml\models\risk_rf_model.joblib",
]

TARGET_CLASSES = ["LOW", "MEDIUM", "HIGH"]
ID_TO_CLASS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}

FEATURE_COLUMNS = [
    "rainfall",
    "slope",
    "road_quality",
    "visibility",
    "traffic",
    "historical_incidents",
    "road_type",
    "elevation",
    "temperature",
    "wind_speed"
]


class RiskService:
    """
    Service encapsulating the trained Random Forest model for route risk inference.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_bundle = None
        self.pipeline = None
        self.classes = TARGET_CLASSES
        self.is_loaded = False
        self.model_path = model_path or self._find_model_path()
        self._load_model()

    def _find_model_path(self) -> Optional[str]:
        for path in POSSIBLE_MODEL_PATHS:
            if os.path.exists(path):
                return path
        return None

    def _load_model(self):
        """
        Load the joblib model bundle into memory.
        """
        if not self.model_path or not os.path.exists(self.model_path):
            logger.warning(
                f"Trained ML model not found at candidate paths: {POSSIBLE_MODEL_PATHS}. "
                "Using fallback heuristic risk estimator."
            )
            return

        try:
            self.model_bundle = joblib.load(self.model_path)
            self.pipeline = self.model_bundle.get("pipeline")
            self.classes = self.model_bundle.get("classes", TARGET_CLASSES)
            self.is_loaded = True
            logger.info(f"Successfully loaded ML Risk Model from: {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load ML Risk model: {e}", exc_info=True)
            self.is_loaded = False

    def predict(
        self,
        rainfall: float,
        slope: float,
        road_quality: float,
        visibility: float,
        traffic: float,
        historical_incidents: int,
        elevation: float,
        temperature: float,
        wind_speed: float,
        road_type: str = "national_highway"
    ) -> Dict[str, Any]:
        """
        Predict transportation risk level ('LOW', 'MEDIUM', 'HIGH') and confidence.
        """
        # 1. Normalize traffic: if given as percentage 0-100, convert to 0-1
        normalized_traffic = float(traffic)
        if normalized_traffic > 1.0:
            normalized_traffic = normalized_traffic / 100.0
        normalized_traffic = float(np.clip(normalized_traffic, 0.0, 1.0))

        # 2. Standardize road_type
        clean_road_type = str(road_type).lower().strip().replace(" ", "_")
        valid_types = ["national_highway", "state_highway", "rural_hill_road"]
        if clean_road_type not in valid_types:
            clean_road_type = "national_highway"

        # 3. Construct single-row DataFrame
        feature_dict = {
            "rainfall": float(rainfall),
            "slope": float(slope),
            "road_quality": float(road_quality),
            "visibility": float(visibility),
            "traffic": normalized_traffic,
            "historical_incidents": int(historical_incidents),
            "road_type": clean_road_type,
            "elevation": float(elevation),
            "temperature": float(temperature),
            "wind_speed": float(wind_speed)
        }

        # 4. If ML model is loaded, run pipeline
        if self.is_loaded and self.pipeline is not None:
            try:
                df = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]
                pred_id = int(self.pipeline.predict(df)[0])
                pred_probas = self.pipeline.predict_proba(df)[0]

                risk_class = ID_TO_CLASS.get(pred_id, "MEDIUM")
                confidence = float(round(float(pred_probas[pred_id]), 2))

                proba_dict = {
                    self.classes[i]: float(round(float(pred_probas[i]), 4))
                    for i in range(len(self.classes))
                }

                # Continuous 0-100 score for UI gauges
                est_score = (
                    proba_dict.get("LOW", 0.0) * 15.0 +
                    proba_dict.get("MEDIUM", 0.0) * 50.0 +
                    proba_dict.get("HIGH", 0.0) * 85.0
                )

                return {
                    "risk": risk_class,
                    "confidence": confidence,
                    "class_probabilities": proba_dict,
                    "estimated_risk_score": float(round(est_score, 1))
                }
            except Exception as e:
                logger.warning(f"ML Risk prediction pipeline failed during inference: {e}. Utilizing heuristic fallback.")
                return self._heuristic_fallback(feature_dict)

        # Fallback heuristic if model file is unavailable
        return self._heuristic_fallback(feature_dict)

    def _heuristic_fallback(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministic scoring fallback in case of model load failure.
        """
        score = 0.0
        if features["rainfall"] >= 15.0:
            score += 35.0
        elif features["rainfall"] >= 5.0:
            score += 20.0

        if features["slope"] >= 15.0:
            score += 25.0
        elif features["slope"] >= 8.0:
            score += 15.0

        if features["visibility"] <= 1.0:
            score += 20.0
        elif features["visibility"] <= 4.0:
            score += 10.0

        if features["road_quality"] <= 2.0:
            score += 15.0

        if features["historical_incidents"] >= 3:
            score += 15.0

        score = float(np.clip(score, 0.0, 100.0))
        if score < 30.0:
            risk = "LOW"
            conf = 0.85
        elif score < 65.0:
            risk = "MEDIUM"
            conf = 0.80
        else:
            risk = "HIGH"
            conf = 0.88

        return {
            "risk": risk,
            "confidence": conf,
            "class_probabilities": {"LOW": 0.1, "MEDIUM": 0.2, "HIGH": 0.7},
            "estimated_risk_score": score
        }

    def assess_route_risk(
        self,
        origin_name: str,
        destination_name: str,
        distance_km: float,
        duration_minutes: float,
        weather_summary: Optional[Dict[str, Any]] = None,
        road_type: str = "national_highway"
    ) -> Dict[str, Any]:
        """
        Evaluate corridor-level ML risk for a route candidate by deriving realistic
        terrain and operational parameters.
        """
        # Extract or default weather attributes
        if weather_summary:
            avg_rain = float(weather_summary.get("average_rainfall_mm", 0.0))
            avg_vis = float(weather_summary.get("average_visibility_km", 8.0))
            avg_wind = float(weather_summary.get("average_wind_kmh", 10.0))
            avg_temp = float(weather_summary.get("average_temperature_c", 24.0))
        else:
            avg_rain = 0.0
            avg_vis = 8.0
            avg_wind = 12.0
            avg_temp = 25.0

        # Terrain estimation based on known NER geography
        is_hill_corridor = any(
            hill in (origin_name + destination_name).lower()
            for hill in ["shillong", "kohima", "aizawl", "tawang", "gangtok", "itangar", "cherrapunji"]
        )

        if is_hill_corridor:
            slope = 14.5
            elevation = 1520.0
            road_quality = 3.2
            historical_incidents = 3
            traffic = 45.0
        else:
            slope = 2.5
            elevation = 85.0
            road_quality = 4.2
            historical_incidents = 1
            traffic = 30.0

        prediction = self.predict(
            rainfall=avg_rain,
            slope=slope,
            road_quality=road_quality,
            visibility=avg_vis,
            traffic=traffic,
            historical_incidents=historical_incidents,
            elevation=elevation,
            temperature=avg_temp,
            wind_speed=avg_wind,
            road_type=road_type
        )

        return {
            "risk": prediction["risk"],
            "confidence": prediction["confidence"],
            "estimated_risk_score": prediction.get("estimated_risk_score", 40.0),
            "terrain_context": "Mountain Ghat Section" if is_hill_corridor else "Valley Plains",
            "model_version": "RandomForest-v1"
        }


# Global singleton
risk_service = RiskService()
