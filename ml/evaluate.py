"""
EVALUATION SCRIPT FOR NER LOGISTICS ROUTE RISK PREDICTION
=========================================================
Loads the trained RandomForestClassifier and test dataset, then calculates:
  - Accuracy
  - Precision (macro, weighted, per-class)
  - Recall (macro, weighted, per-class)
  - F1-score (macro, weighted, per-class)
  - Confusion Matrix
  - Feature Importances ranking

DISCLAIMER:
Evaluated on SYNTHETIC / DEMO DATA for architecture and software pipeline
verification. This model is NOT production-ready.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from preprocessing import prepare_train_test_data, TARGET_CLASSES, ID_TO_CLASS


def evaluate_risk_model(
    model_path: str = None,
    data_csv: str = None,
    output_dir: str = None
) -> dict:
    """
    Run evaluation on the held-out test split and display all required metrics.
    """
    if model_path is None:
        model_path = os.path.join(BASE_DIR, "models", "risk_rf_model.joblib")
    if output_dir is None:
        output_dir = os.path.join(BASE_DIR, "models")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at: {model_path}. "
            "Please run 'python ml/train.py' first."
        )

    print("=" * 72)
    print("  NER LOGISTICS ROUTE RISK PREDICTION - MODEL EVALUATION REPORT")
    print("  [DEMO / SYNTHETIC DATASET - NOT PRODUCTION READY]")
    print("=" * 72)

    # 1. Load trained bundle
    print("[*] Loading serialized model artifact...")
    bundle = joblib.load(model_path)
    classifier = bundle["classifier"]
    preprocessor = bundle["preprocessor"]
    feature_names = bundle["feature_names"]
    classes = bundle.get("classes", TARGET_CLASSES)

    # 2. Prepare test dataset
    print("[*] Loading held-out test split (20% stratified test set)...")
    data = prepare_train_test_data(csv_path=data_csv, test_size=0.20, random_state=42)
    X_test = data["X_test"]
    y_test = data["y_test"]

    # 3. Model Predictions
    y_pred = classifier.predict(X_test)
    y_pred_proba = classifier.predict_proba(X_test)

    # 4. Calculate Core Metrics
    accuracy = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
    prec_weighted = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    # Per-class metrics
    prec_per_class = precision_score(y_test, y_pred, average=None, zero_division=0)
    rec_per_class = recall_score(y_test, y_pred, average=None, zero_division=0)
    f1_per_class = f1_score(y_test, y_pred, average=None, zero_division=0)

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)

    # Classification report
    clf_report = classification_report(
        y_test,
        y_pred,
        target_names=classes,
        output_dict=True,
        zero_division=0
    )

    # Feature importances
    importances = classifier.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_ranking = [
        {"feature": feature_names[i], "importance": float(round(importances[i], 4))}
        for i in sorted_idx
    ]

    # Display Printout
    print("\n" + "-" * 72)
    print("  OVERALL PERFORMANCE METRICS (HELD-OUT TEST SET, N = {})".format(len(y_test)))
    print("-" * 72)
    print(f"  * Accuracy:        {accuracy * 100:.2f}%")
    print(f"  * Macro Precision: {prec_macro * 100:.2f}%  (Weighted: {prec_weighted * 100:.2f}%)")
    print(f"  * Macro Recall:    {rec_macro * 100:.2f}%  (Weighted: {rec_weighted * 100:.2f}%)")
    print(f"  * Macro F1-Score:  {f1_macro * 100:.2f}%  (Weighted: {f1_weighted * 100:.2f}%)")

    print("\n" + "-" * 72)
    print("  PER-CLASS METRICS BREAKDOWN")
    print("-" * 72)
    print(f"  {'CLASS':<10} {'PRECISION':<12} {'RECALL':<12} {'F1-SCORE':<12} {'SUPPORT':<10}")
    print("  " + "-" * 56)
    for idx, cls_name in enumerate(classes):
        support = int(np.sum(y_test == idx))
        print(
            f"  {cls_name:<10} "
            f"{prec_per_class[idx] * 100:>8.2f}%   "
            f"{rec_per_class[idx] * 100:>8.2f}%   "
            f"{f1_per_class[idx] * 100:>8.2f}%   "
            f"{support:>8d}"
        )

    print("\n" + "-" * 72)
    print("  CONFUSION MATRIX")
    print("-" * 72)
    print("  Rows = Actual Ground Truth | Columns = Predicted Class")
    header_cols = "   ".join([f"Pred {cls:>6}" for cls in classes])
    print(f"                  {header_cols}")
    for i, true_cls in enumerate(classes):
        row_str = "   ".join([f"{cm[i][j]:>10d}" for j in range(len(classes))])
        print(f"  Actual {true_cls:<7} {row_str}")

    print("\n" + "-" * 72)
    print("  TOP FEATURE IMPORTANCES (RANDOM FOREST)")
    print("-" * 72)
    for rank, item in enumerate(feature_ranking, 1):
        bar = "#" * int(item["importance"] * 40)
        print(f"  {rank:>2}. {item['feature']:<26} {item['importance']:>6.3f}  {bar}")

    print("\n" + "=" * 72)
    print("  IMPORTANT NOTICE:")
    print("  This pipeline is demonstrated using synthetic / demo data.")
    print("  Do NOT claim this model is production-ready.")
    print("=" * 72)

    # Save evaluation report JSON
    results = {
        "evaluation_dataset": "Synthetic/Demo Route Risk Dataset",
        "is_synthetic": True,
        "is_production_ready": False,
        "test_samples": int(len(y_test)),
        "accuracy": float(round(accuracy, 4)),
        "precision_macro": float(round(prec_macro, 4)),
        "precision_weighted": float(round(prec_weighted, 4)),
        "recall_macro": float(round(rec_macro, 4)),
        "recall_weighted": float(round(rec_weighted, 4)),
        "f1_score_macro": float(round(f1_macro, 4)),
        "f1_score_weighted": float(round(f1_weighted, 4)),
        "per_class": {
            cls_name: {
                "precision": float(round(prec_per_class[idx], 4)),
                "recall": float(round(rec_per_class[idx], 4)),
                "f1_score": float(round(f1_per_class[idx], 4)),
                "support": int(np.sum(y_test == idx))
            }
            for idx, cls_name in enumerate(classes)
        },
        "confusion_matrix": {
            "classes": classes,
            "matrix": cm.tolist()
        },
        "feature_importances": feature_ranking
    }

    report_path = os.path.join(output_dir, "evaluation_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\n[+] Saved complete evaluation report to: {report_path}\n")

    return results


if __name__ == "__main__":
    evaluate_risk_model()
