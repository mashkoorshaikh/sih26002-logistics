# Phase 4: AI Route Risk Prediction Data Pipeline

> [!CAUTION]
> ### ⚠️ Critical Disclaimer: Synthetic / Demo Pipeline Artifact
> - The dataset used in this pipeline (`ml/data/synthetic_route_risk_data.csv`) is **DEMO / SYNTHETIC DATA** generated algorithmically to validate data preprocessing, training workflows, model serialization, and API interfaces.
> - It is **NOT REAL-WORLD DATA**.
> - **DO NOT CLAIM THIS MODEL IS PRODUCTION-READY.**
> - See [`ml/data/DATASET_DOCUMENTATION.md`](data/DATASET_DOCUMENTATION.md) for the roadmap of verified real-world datasets (IMD, GSI NLSM, NHAI RAMS, MoRTH iRAD) required to transition this system to production.

---

## 1. Directory Structure

```
ml/
├── data/
│   ├── synthetic_route_risk_data.csv   # Labeled synthetic dataset (3,500 samples)
│   ├── generate_synthetic_data.py      # Reproducible synthetic data generation script
│   └── DATASET_DOCUMENTATION.md        # Feature schema & real-world dataset replacement roadmap
├── preprocessing.py                    # Data loading, validation, ColumnTransformer, train/test split
├── train.py                            # RandomForestClassifier training & joblib serialization
├── evaluate.py                         # Evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix)
├── predict.py                          # Programmatic & CLI route risk inference interface
├── models/
│   ├── risk_rf_model.joblib            # Serialized model & preprocessing pipeline artifact
│   ├── model_metadata.json             # Model configuration, classes, and training parameters
│   └── evaluation_report.json          # Full test split metrics & confusion matrix
└── README.md                           # Documentation & execution guide
```

---

## 2. Features & Target Specification

### Input Features (10 Features)
1. **`rainfall`**: Hourly precipitation rate ($0.0 - 48.0\text{ mm/h}$)
2. **`slope`**: Road gradient / incline ($0.0^\circ - 28.0^\circ$)
3. **`road_quality`**: Surface rating index ($1.0 = \text{severely broken}$, $5.0 = \text{pristine asphalt}$)
4. **`visibility`**: Atmospheric visibility ($0.2 - 12.0\text{ km}$)
5. **`traffic`**: Congestion index ($0.0 = \text{free flow}$, $1.0 = \text{gridlock}$)
6. **`historical_incidents`**: Frequency of past landslides/accidents along segment ($0 - 12$)
7. **`road_type`**: Categorical (`national_highway`, `state_highway`, `rural_hill_road`)
8. **`elevation`**: Elevation in meters ($50 - 2600\text{ m}$)
9. **`temperature`**: Ambient temperature in Celsius ($-2.0^\circ\text{C} - 38.0^\circ\text{C}$)
10. **`wind_speed`**: Surface wind speed ($1.0 - 70.0\text{ km/h}$)

### Target Classes
- **`LOW`**: Safe transit conditions. Normal operations.
- **`MEDIUM`**: Caution advised. Moderate rain, hill mist, winding ghats.
- **`HIGH`**: Severe operational hazard. High landslide/flood probability, poor visibility, severe road damage.

---

## 3. How to Run the Pipeline

Ensure dependencies are installed in your virtual environment:
```bash
pip install pandas scikit-learn joblib
```

### Step 1: Generate Synthetic Dataset (Demo)
```bash
python ml/data/generate_synthetic_data.py
```
*Generates 3,500 labeled synthetic route samples in `ml/data/synthetic_route_risk_data.csv`.*

### Step 2: Validate Data Preprocessing
```bash
python ml/preprocessing.py
```
*Runs ColumnTransformer validation, stratified splitting (80/20), and feature scaling checks.*

### Step 3: Train the RandomForestClassifier
```bash
python ml/train.py
```
*Executes 5-fold cross-validation, fits the model, and serializes `ml/models/risk_rf_model.joblib`.*

### Step 4: Evaluate the Model
```bash
python ml/evaluate.py
```
*Computes test set accuracy, precision, recall, F1, confusion matrix, and feature importances.*

### Step 5: Test Route Risk Inference
```bash
python ml/predict.py
```
*Runs programmatic inference for sample route conditions.*

---

## 4. Evaluation Results (Held-out Test Set, $N = 700$)

### Overall Performance
- **Accuracy**: `87.29%`
- **Macro Precision**: `85.61%` (Weighted: `87.48%`)
- **Macro Recall**: `86.08%` (Weighted: `87.29%`)
- **Macro F1-Score**: `85.83%` (Weighted: `87.37%`)

### Per-Class Performance Breakdown
| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **`LOW`** | 93.58% | 91.03% | 92.29% | 368 |
| **`MEDIUM`** | 79.15% | 82.30% | 80.69% | 226 |
| **`HIGH`** | 84.11% | 84.91% | 84.51% | 106 |

### Confusion Matrix
```
                  Pred LOW   Pred MEDIUM   Pred HIGH
  Actual LOW           335            33           0
  Actual MEDIUM         23           186          17
  Actual HIGH            0            16          90
```
> **Safety Note**: Zero false-negatives between extreme classes (0 Actual HIGH misclassified as LOW; 0 Actual LOW misclassified as HIGH).

### Top Feature Importances
1. `slope`: `0.188` (Steep ghat incline is the primary hazard driver)
2. `rainfall`: `0.171` (Downpours trigger surface slickness and landslides)
3. `visibility`: `0.148` (Mountain fog/mist impacts collision avoidance)
4. `road_type_rural_hill_road`: `0.078`
5. `road_quality`: `0.078`
6. `elevation`: `0.072`
7. `road_type_national_highway`: `0.070`
8. `historical_incidents`: `0.056`
9. `temperature`: `0.038`
10. `traffic`: `0.036`
11. `wind_speed`: `0.034`
12. `road_type_state_highway`: `0.031`

---

## 5. Real-World Datasets Roadmap (Production Replacement)

When transitioning to production, replace synthetic generation with the following empirical datasets:
1. **Weather**: India Meteorological Department (IMD) Gridded Rainfall Data & Open-Meteo API.
2. **Terrain & Landslide**: Geological Survey of India (GSI) National Landslide Susceptibility Mapping (NLSM) & CartoDEM.
3. **Road Asset Quality**: NHAI Road Asset Management System (RAMS) & OpenStreetMap highway infrastructure tags.
4. **Historical Incidents**: State Disaster Management Authorities (ASDMA, MSDMA) & MoRTH iRAD crash database.
5. **Traffic Flow**: NHAI FASTag freight transit volumes & Google/TomTom speed feeds.
