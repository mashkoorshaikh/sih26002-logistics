"""
MODEL TRAINING SCRIPT FOR NER LOGISTICS ROUTE RISK PREDICTION
=============================================================
Trains a RandomForestClassifier on the synthetic/demo dataset,
evaluates cross-validation performance, and serializes the model
pipeline using joblib.

DISCLAIMER:
This model is trained on SYNTHETIC / DEMO DATA for architecture
validation. It is NOT production-ready.
"""

import os
import sys
import json
from datetime import datetime
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

# Ensure ml package is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from preprocessing import prepare_train_test_data, get_feature_preprocessor, ALL_FEATURES, TARGET_CLASSES


def train_risk_model(
    data_csv: str = None,
    models_dir: str = None,
    n_estimators: int = 150,
    max_depth: int = 12,
    random_state: int = 42
):
    """
    Train a RandomForestClassifier on the prepared dataset and serialize the artifact.
    """
    if models_dir is None:
        models_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 70)
    print("  NER LOGISTICS RISK PREDICTION - MODEL TRAINING PIPELINE")
    print("  [DEMO / SYNTHETIC DATASET - NOT PRODUCTION READY]")
    print("=" * 70)

    # 1. Prepare data splits
    print("[1/4] Loading and preprocessing dataset...")
    data = prepare_train_test_data(csv_path=data_csv, test_size=0.20, random_state=random_state)

    X_train = data["X_train"]
    y_train = data["y_train"]
    X_test = data["X_test"]
    y_test = data["y_test"]
    feature_names = data["feature_names"]
    preprocessor = data["preprocessor"]

    print(f"      Training samples: {X_train.shape[0]} | Validation samples: {X_test.shape[0]}")
    print(f"      Feature dimensionality: {X_train.shape[1]}")

    # 2. Configure RandomForestClassifier
    print("[2/4] Initializing RandomForestClassifier...")
    rf_clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state,
        n_jobs=-1
    )

    # Cross-validation on training fold
    print("      Running 5-fold stratified cross-validation on train split...")
    cv_scores = cross_val_score(rf_clf, X_train, y_train, cv=5, scoring="accuracy")
    print(f"      5-Fold CV Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

    # 3. Fit on full training set
    print("[3/4] Fitting Random Forest model on full training set...")
    rf_clf.fit(X_train, y_train)

    # Create end-to-end inference pipeline: Raw Features -> ColumnTransformer Preprocessor -> Classifier
    full_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", rf_clf)
    ])

    # 4. Serialize artifacts
    print("[4/4] Saving model artifacts...")
    model_path = os.path.join(models_dir, "risk_rf_model.joblib")
    
    # Save composite bundle containing the pipeline, classes, and feature names
    artifact_bundle = {
        "pipeline": full_pipeline,
        "classifier": rf_clf,
        "preprocessor": preprocessor,
        "feature_names": feature_names,
        "raw_features": ALL_FEATURES,
        "classes": TARGET_CLASSES,
        "class_to_id": data["class_to_id"],
        "id_to_class": data["id_to_class"],
        "is_synthetic": True,
        "is_production_ready": False,
        "training_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    joblib.dump(artifact_bundle, model_path, compress=3)
    print(f"      [+] Saved trained model bundle to: {model_path}")

    # Save human-readable metadata JSON
    metadata = {
        "model_name": "NER_Transportation_Route_Risk_RandomForest",
        "algorithm": "RandomForestClassifier",
        "parameters": {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "class_weight": "balanced",
            "random_state": random_state
        },
        "classes": TARGET_CLASSES,
        "input_features": ALL_FEATURES,
        "transformed_features": feature_names,
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "cv_accuracy_mean": float(round(cv_scores.mean(), 4)),
        "cv_accuracy_std": float(round(cv_scores.std(), 4)),
        "disclaimer": "Trained on SYNTHETIC / DEMO data only. NOT for production safety-critical use.",
        "production_ready": False,
        "trained_at_utc": datetime.utcnow().isoformat() + "Z"
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"      [+] Saved model metadata to: {metadata_path}")

    print("\n[OK] Training complete. Run 'python ml/evaluate.py' to inspect evaluation metrics.")
    return artifact_bundle


if __name__ == "__main__":
    train_risk_model()
