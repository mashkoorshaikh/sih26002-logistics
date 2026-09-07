"""
PREPROCESSING PIPELINE FOR NER LOGISTICS RISK PREDICTION
========================================================
Handles data loading, feature validation, categorical encoding,
numerical scaling, and stratified train/test splitting.
"""

import os
from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Define feature schemas
NUMERICAL_FEATURES = [
    "rainfall",
    "slope",
    "road_quality",
    "visibility",
    "traffic",
    "historical_incidents",
    "elevation",
    "temperature",
    "wind_speed"
]

CATEGORICAL_FEATURES = [
    "road_type"
]

ALL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = "risk"

# Target class mappings (ordered by hazard severity)
TARGET_CLASSES = ["LOW", "MEDIUM", "HIGH"]
CLASS_TO_ID = {name: idx for idx, name in enumerate(TARGET_CLASSES)}
ID_TO_CLASS = {idx: name for idx, name in enumerate(TARGET_CLASSES)}


def get_feature_preprocessor() -> ColumnTransformer:
    """
    Build scikit-learn ColumnTransformer for numerical scaling and categorical one-hot encoding.
    """
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )

    return preprocessor


def load_dataset(csv_path: str = None) -> pd.DataFrame:
    """
    Load dataset from CSV and validate feature schema.
    """
    if csv_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, "data", "synthetic_route_risk_data.csv")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset not found at: {csv_path}. "
            "Please run 'python ml/data/generate_synthetic_data.py' first."
        )

    df = pd.read_csv(csv_path)

    # Validate required columns
    missing_cols = [col for col in ALL_FEATURES + [TARGET_COLUMN] if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    return df


def prepare_train_test_data(
    csv_path: str = None,
    test_size: float = 0.20,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Load dataset, split into stratified train/test sets, fit the preprocessor,
    and return transformed arrays along with metadata.
    """
    df = load_dataset(csv_path)

    X = df[ALL_FEATURES].copy()
    y_raw = df[TARGET_COLUMN].copy()

    # Map target strings to integer IDs
    y = y_raw.map(CLASS_TO_ID)
    if y.isnull().any():
        unrecognized = y_raw[y.isnull()].unique()
        raise ValueError(f"Unrecognized target values found in dataset: {unrecognized}")

    # Stratified split to preserve class distribution across folds
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    preprocessor = get_feature_preprocessor()

    # Fit on training data only to prevent data leakage
    X_train_transformed = preprocessor.fit_transform(X_train_raw)
    X_test_transformed = preprocessor.transform(X_test_raw)

    # Extract transformed feature names
    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    transformed_feature_names = NUMERICAL_FEATURES + cat_feature_names

    return {
        "X_train_raw": X_train_raw,
        "X_test_raw": X_test_raw,
        "X_train": X_train_transformed,
        "X_test": X_test_transformed,
        "y_train": y_train.values,
        "y_test": y_test.values,
        "preprocessor": preprocessor,
        "feature_names": transformed_feature_names,
        "raw_feature_names": ALL_FEATURES,
        "classes": TARGET_CLASSES,
        "class_to_id": CLASS_TO_ID,
        "id_to_class": ID_TO_CLASS,
        "df_raw": df
    }


if __name__ == "__main__":
    print("[*] Testing preprocessing pipeline...")
    data = prepare_train_test_data()
    print(f"[+] Total samples loaded: {len(data['df_raw'])}")
    print(f"[+] Training samples: {data['X_train'].shape[0]} (Features: {data['X_train'].shape[1]})")
    print(f"[+] Testing samples:  {data['X_test'].shape[0]}")
    print(f"[+] Transformed feature names: {data['feature_names']}")
    print("[+] Preprocessing pipeline verification complete.")
