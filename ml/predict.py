"""
INFERENCE MODULE FOR NER ROUTE RISK PREDICTION
==============================================
Provides high-level programmatic and CLI inference using the trained
RandomForestClassifier model bundle.

DISCLAIMER:
Uses a model trained on SYNTHETIC / DEMO DATA for architecture validation.
It is NOT production-ready.
"""

import os
import sys
from typing import Dict, Any, List, Union
import pandas as pd
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from preprocessing import ALL_FEATURES, TARGET_CLASSES, ID_TO_CLASS


class RouteRiskPredictor:
    """
    Inference engine for route risk prediction.
    """

    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = os.path.join(BASE_DIR, "models", "risk_rf_model.joblib")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model bundle not found at: {model_path}. Run ml/train.py first.")

        self.bundle = joblib.load(model_path)
        self.pipeline = self.bundle["pipeline"]
        self.classes = self.bundle.get("classes", TARGET_CLASSES)
        self.raw_features = self.bundle.get("raw_features", ALL_FEATURES)

    def predict_single(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk class and class probabilities for a single route segment.
        """
        df = pd.DataFrame([feature_dict])
        return self.predict_batch(df)[0]

    def predict_batch(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Predict risk for a dataframe of route segments.
        """
        # Ensure all required features are present
        missing = [col for col in self.raw_features if col not in df.columns]
        if missing:
            raise ValueError(f"Input features missing required columns: {missing}")

        X_input = df[self.raw_features]
        pred_ids = self.pipeline.predict(X_input)
        pred_probas = self.pipeline.predict_proba(X_input)

        results = []
        for i, pred_id in enumerate(pred_ids):
            class_name = ID_TO_CLASS[pred_id]
            proba_dict = {
                self.classes[c_idx]: float(round(pred_probas[i][c_idx], 4))
                for c_idx in range(len(self.classes))
            }

            # Map to 0-100 composite risk score for smooth UI visualization
            # LOW: 0-33, MEDIUM: 34-66, HIGH: 67-100
            score_estimate = (
                proba_dict.get("LOW", 0.0) * 15.0 +
                proba_dict.get("MEDIUM", 0.0) * 50.0 +
                proba_dict.get("HIGH", 0.0) * 85.0
            )

            results.append({
                "predicted_risk": class_name,
                "confidence": float(round(proba_dict[class_name], 4)),
                "class_probabilities": proba_dict,
                "estimated_risk_score": float(round(score_estimate, 1)),
                "is_synthetic_model": True,
                "production_ready": False
            })

        return results


if __name__ == "__main__":
    predictor = RouteRiskPredictor()

    # Test cases: Clear valley vs Mountain Ghat during downpour
    sample_safe = {
        "rainfall": 0.0,
        "slope": 2.1,
        "road_quality": 4.5,
        "visibility": 10.0,
        "traffic": 0.15,
        "historical_incidents": 0,
        "road_type": "national_highway",
        "elevation": 120.0,
        "temperature": 28.0,
        "wind_speed": 12.0
    }

    sample_severe = {
        "rainfall": 28.5,
        "slope": 19.8,
        "road_quality": 2.1,
        "visibility": 0.8,
        "traffic": 0.65,
        "historical_incidents": 5,
        "road_type": "rural_hill_road",
        "elevation": 1850.0,
        "temperature": 11.0,
        "wind_speed": 42.0
    }

    print("=" * 60)
    print("  ROUTE RISK INFERENCE VERIFICATION (DEMO)")
    print("=" * 60)

    res_safe = predictor.predict_single(sample_safe)
    print("\n[Safe Valley Corridor]")
    print(f"  Prediction: {res_safe['predicted_risk']} (Confidence: {res_safe['confidence']*100:.1f}%)")
    print(f"  Probabilities: {res_safe['class_probabilities']}")
    print(f"  Risk Gauge: {res_safe['estimated_risk_score']}/100")

    res_severe = predictor.predict_single(sample_severe)
    print("\n[Mountain Ghat Heavy Monsoon Corridor]")
    print(f"  Prediction: {res_severe['predicted_risk']} (Confidence: {res_severe['confidence']*100:.1f}%)")
    print(f"  Probabilities: {res_severe['class_probabilities']}")
    print(f"  Risk Gauge: {res_severe['estimated_risk_score']}/100")
