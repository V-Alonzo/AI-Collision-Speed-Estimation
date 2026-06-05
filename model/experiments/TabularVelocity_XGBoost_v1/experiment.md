## Tabular Dataset Experiment Description

This experiment is part of a broader project that evaluates multiple modeling approaches on structured tabular data. This section describes a machine learning experiment in which a model is trained to estimate **impact velocity** using engineered vehicle, crash, and injury-related features.

---

### Dataset Overview

The dataset used in this experiment is a structured tabular dataset derived from vehicle crash records. The target variable is **impact velocity**, formulated as a supervised regression problem.

Both measured and simulation-derived velocity values are included. When measured values were unavailable, simulation-based estimates were used, increasing the number of usable training samples. After data cleaning and preprocessing, the final dataset contains **288 samples**.

A **feature selection stage** was applied to reduce redundancy and retain only the most informative variables for prediction.

---

### Data Preprocessing Pipeline

Before feature selection and model training, the dataset undergoes several preprocessing steps:

- Duplicate removal to ensure data consistency  
- Imputation of missing velocity values using simulation-derived estimates  
- Target encoding for categorical variables  
- Ordinal encoding for injury severity levels  
- Standardization (z-score normalization) of numerical and ordinal variables  
- Cyclical encoding (sine/cosine) for directional features  
- Binary encoding for rollover status  

The preprocessing pipeline is implemented in:

`utils/Preprocessing/HuggingFaceExtraction/HF_DB_Pipeline.py`

---

### Feature Selection Procedure

A structured feature selection pipeline was applied in four stages:

#### 1. Constant Feature Removal
Features with zero variance were removed as they provide no predictive information.

#### 2. Mutual Information Filtering
Mutual information between each feature and the target variable was computed. Features below a defined threshold were discarded.

#### 3. Group-Based Directional Selection
Directional features were grouped as:

- Force direction:
  - `forceDirection_sin`
  - `forceDirection_cos`

- Clock direction:
  - `clockDirection_sin`
  - `clockDirection_cos`

The group with the highest average mutual information was retained.

#### 4. Correlation-Based Redundancy Removal
Highly correlated features (|r| > 0.90) were analyzed, and only the feature with the highest mutual information in each group was kept.

---

### Final Selected Features

After feature selection, the dataset was reduced from 11 to **7 input features**:

#### Vehicle-related feature
- `curbWeightKg`

#### Target-encoded categorical features
- `vehicleClass`
- `damagePlaneDescription`
- `severityDescription`

#### Injury severity feature
- `mais`

#### Directional force features
- `forceDirection_sin`
- `forceDirection_cos`

---

### Objective of the Experiment

The objective of this experiment is to evaluate whether a reduced set of highly informative features can accurately predict impact velocity while improving model efficiency, reducing redundancy, and enhancing generalization performance.

---

## Model Architecture

The model used in this experiment is **XGBoost**, a highly optimized gradient boosting framework based on decision trees for supervised learning tasks.

---

### Gradient Boosting Regressor

The model is an ensemble of decision trees built sequentially, where each tree corrects the residual errors of the previous ones. This boosting process minimizes the regression loss function while incorporating regularization to reduce overfitting.

---

### Hyperparameter Configuration

The model is configured with the following hyperparameters:

- **SEED:** 42  
- **TRAIN_PROPORTION:** 0.8  
- **N_ESTIMATORS:** 1000  
- **MAX_DEPTH:** 5  
- **LEARNING_RATE:** 0.05  
- **EVAL_METRIC:** MAE (Mean Absolute Error)  
- **SUBSAMPLE:** 0.8  
- **COLSAMPLE_BYTREE:** 0.8  
- **EARLY_STOPPING_ROUNDS:** 50  
- **OBJECTIVE:** reg:squarederror  

---

### Regularization and Training Behavior

The model incorporates multiple regularization mechanisms:

- **Tree depth constraint (max_depth=5):** limits model complexity  
- **Learning rate (0.05):** stabilizes boosting updates  
- **Subsampling (0.8):** introduces stochasticity across rows  
- **Column sampling (0.8):** reduces feature dependency per tree  
- **Early stopping (50 rounds):** halts training when validation MAE stops improving  

These mechanisms collectively improve generalization and reduce overfitting risk.

---

### Data Splits

The dataset is split as follows:

- **Training set:** 80% of the full dataset  
- **Test set:** 20% of the full dataset  

---

### Summary

This experiment evaluates a gradient boosting regression model applied to a reduced, high-signal feature space. The goal is to assess whether **XGBoost** can maintain strong predictive performance while benefiting from feature selection in terms of efficiency, stability, and generalization.  