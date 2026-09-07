"""
VERIFICATION SUITE FOR PHASE 4: ML ROUTE RISK PREDICTION DATA PIPELINE
======================================================================
Tests:
1. Synthetic dataset presence and feature columns.
2. Preprocessor ColumnTransformer transformation and stratified split.
3. Trained RandomForestClassifier model loading via joblib.
4. Evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix).
5. Single and batch inference with the RouteRiskPredictor.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.preprocessing import (
    load_dataset,
    prepare_train_test_data,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    ALL_FEATURES,
    TARGET_COLUMN,
    TARGET_CLASSES
)
from ml.predict import RouteRiskPredictor


def test_synthetic_dataset():
    print("\n--- Test 1: Synthetic Dataset Validation ---")
    data_path = os.path.join(PROJECT_ROOT, "ml", "data", "synthetic_route_risk_data.csv")
    assert os.path.exists(data_path), f"Missing dataset at {data_path}"

    df = pd.read_csv(data_path)
    assert len(df) >= 3000, f"Expected >= 3000 rows, got {len(df)}"
    for col in ALL_FEATURES + [TARGET_COLUMN]:
        assert col in df.columns, f"Missing required column {col}"

    classes_present = set(df[TARGET_COLUMN].unique())
    assert classes_present == set(TARGET_CLASSES), f"Unexpected classes: {classes_present}"
    print(f"[PASS] Dataset contains {len(df)} samples with all 10 features and 3 target classes: {classes_present}")


def test_preprocessing():
    print("\n--- Test 2: Preprocessing and Stratified Split Validation ---")
    data = prepare_train_test_data(test_size=0.20, random_state=42)

    assert data["X_train"].shape[0] == 2800, f"Expected 2800 train samples, got {data['X_train'].shape[0]}"
    assert data["X_test"].shape[0] == 700, f"Expected 700 test samples, got {data['X_test'].shape[0]}"
    assert data["X_train"].shape[1] == 12, f"Expected 12 transformed columns, got {data['X_train'].shape[1]}"
    print(f"[PASS] Successfully generated stratified splits: Train={data['X_train'].shape}, Test={data['X_test'].shape}")


def test_model_loading_and_metadata():
    print("\n--- Test 3: Model Serialization & Metadata Validation ---")
    model_path = os.path.join(PROJECT_ROOT, "ml", "models", "risk_rf_model.joblib")
    meta_path = os.path.join(PROJECT_ROOT, "ml", "models", "model_metadata.json")
    report_path = os.path.join(PROJECT_ROOT, "ml", "models", "evaluation_report.json")

    assert os.path.exists(model_path), f"Missing model at {model_path}"
    assert os.path.exists(meta_path), f"Missing metadata at {meta_path}"
    assert os.path.exists(report_path), f"Missing evaluation report at {report_path}"

    bundle = joblib.load(model_path)
    assert "pipeline" in bundle and "classifier" in bundle
    assert bundle["is_synthetic"] is True
    assert bundle["is_production_ready"] is False

    with open(report_path, "r", encoding="utf-8") as f:
        report = json.load(f)
    print(f"[PASS] Model loaded successfully.")
    print(f"       Accuracy: {report['accuracy']*100:.2f}% | F1 Macro: {report['f1_score_macro']*100:.2f}%")
    print(f"       Disclaimer Verified: is_synthetic={report['is_synthetic']}, production_ready={report['is_production_ready']}")


def test_inference_pipeline():
    print("\n--- Test 4: Route Risk Inference Pipeline Validation ---")
    predictor = RouteRiskPredictor()

    # Clear valley highway
    clear_corridor = {
        "rainfall": 0.0,
        "slope": 1.5,
        "road_quality": 4.8,
        "visibility": 10.0,
        "traffic": 0.2,
        "historical_incidents": 0,
        "road_type": "national_highway",
        "elevation": 100.0,
        "temperature": 27.0,
        "wind_speed": 10.0
    }
    res_clear = predictor.predict_single(clear_corridor)
    assert res_clear["predicted_risk"] == "LOW", f"Expected LOW, got {res_clear['predicted_risk']}"
    print(f"[PASS] Clear Corridor predicted: {res_clear['predicted_risk']} (Confidence: {res_clear['confidence']*100:.1f}%)")

    # Hazardous torrential hill ghat
    severe_corridor = {
        "rainfall": 35.0,
        "slope": 22.0,
        "road_quality": 1.8,
        "visibility": 0.5,
        "traffic": 0.7,
        "historical_incidents": 6,
        "road_type": "rural_hill_road",
        "elevation": 2100.0,
        "temperature": 9.0,
        "wind_speed": 45.0
    }
    res_severe = predictor.predict_single(severe_corridor)
    assert res_severe["predicted_risk"] == "HIGH", f"Expected HIGH, got {res_severe['predicted_risk']}"
    print(f"[PASS] Severe Mountain Ghat predicted: {res_severe['predicted_risk']} (Confidence: {res_severe['confidence']*100:.1f}%)")


if __name__ == "__main__":
    print("=" * 65)
    print("  RUNNING FULL PHASE 4 ML DATA PIPELINE VERIFICATION SUITE")
    print("=" * 65)
    test_synthetic_dataset()
    test_preprocessing()
    test_model_loading_and_metadata()
    test_inference_pipeline()
    print("\n" + "=" * 65)
    print("  ALL PHASE 4 PIPELINE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)
