# TabularVelocityEstimator_XGBoost

This directory contains the full training pipeline for **tabular velocity estimation models using XGBoost** on the **CIREN (Crash Investigation and Research Engineering Network) dataset from NHTSA**.

The objective of this module is to train a robust **gradient boosting regression model** to predict **impact velocity** from structured crash, vehicle, and injury-related features.

Unlike the neural network-based implementation in `TabularVelocityEstimator`, this module replaces the MLP architecture with **XGBoost**, while keeping the same data and preprocessing logic.

---

## Overview

This module focuses on **tabular machine learning using gradient boosting trees** for impact velocity estimation.

The training pipeline is designed to evaluate how tree-based models perform compared to neural architectures on the same structured feature space.

Supported modeling approach:

- Gradient Boosting Regression using XGBoost

---

## Dataset

The dataset is identical to the one used in the MLP-based pipeline and is derived from the **CIREN dataset (NHTSA)**.

### Target Variable

The regression target is **impact velocity**, constructed by combining:

- Measured impact velocity (when available)
- Simulated velocity estimates (used as fallback when measurements are missing)

This hybrid target formulation ensures:

- Increased dataset coverage
- Reduced missing-target bias
- More stable supervised learning signal

---

## Preprocessing Pipeline

The preprocessing logic is fully shared with the MLP pipeline and is implemented in:


`utils/Preprocessing/HuggingFaceExtraction/HF_DB_Pipeline.py`


The dataset is generated through:


`model/data/scripts/build_tabular_dataset.py`


### Active preprocessing configuration

This module uses the **current (non-legacy) pipeline**, which includes:

- Target encoding for categorical variables (replacing one-hot encoding)
- Z-score normalization for numerical features
- Sine/cosine encoding for directional variables
- Binary encoding for categorical binary features
- Hybrid target construction (measured + simulated velocity)

### Key difference from legacy pipeline

The only major modification from the older pipeline is:

- One-hot encoding → Target encoding
- Hybrid target construction (measured + simulated velocity)

This change improves:
- Feature compactness
- Generalization performance
- Compatibility with tree-based models

---

## Feature Selection Pipeline (Optional)

This module supports an optional **feature selection stage** to improve model efficiency and reduce redundancy.

Implemented in:


`model/data/scripts/feature_selection_pipeline.py`


### Purpose

- Remove redundant or low-information features
- Reduce multicollinearity
- Improve generalization
- Optimize model training efficiency

### Methods used

- Constant feature removal
- Mutual information filtering
- Correlation-based pruning (threshold-based)
- Group-based selection for engineered directional features

The same feature selection logic is shared with other tabular experiments to ensure comparability.

---

## Model Architecture

The model used in this module is **XGBoost**, a high-performance implementation of gradient boosting for regression tasks.

### Model Type

- Ensemble of decision trees trained sequentially
- Each tree learns to correct residual errors from previous iterations
- Optimized using gradient descent on regression loss

---

## Key Advantages of XGBoost

Compared to neural network-based approaches, this model provides:

- Strong performance on structured tabular data
- Built-in regularization (L1/L2)
- Robustness to feature scaling
- Reduced sensitivity to hyperparameter tuning
- Efficient handling of nonlinear interactions

---

## Training Pipeline

The workflow for training is as follows:

1. Load dataset from `build_tabular_dataset.py`
2. Apply preprocessing pipeline (current version only)
3. Optionally apply feature selection pipeline
4. Split dataset into training, validation, and test sets
5. Train XGBoost regressor
6. Apply early stopping using validation set
7. Evaluate final model performance

---

## Data Splitting Strategy

The dataset is split using the same configuration as other experiments:

- **Training set:** 80% of full dataset  
- **Test set:** 20% of full dataset  

The validation set is specifically used for **early stopping** and model selection.

---

## Key Design Consistency with MLP Pipeline

This module maintains full consistency with the MLP-based pipeline in terms of:

- Dataset construction
- Feature engineering
- Preprocessing logic
- Feature selection pipeline
- Train/test/validation splitting

The **only structural difference** is the replacement of:

- Neural network (MLP) → XGBoost regressor

---

## Objective of the Module

The goal of this experiment is to evaluate whether **gradient boosting models** can outperform or complement neural network approaches in estimating impact velocity from structured crash data, under identical preprocessing conditions.

This allows for a controlled comparison between:

- Deep learning-based tabular regression (MLP)
- Tree-based gradient boosting regression (XGBoost)

---

## Summary

The `TabularVelocityEstimator_XGBoost` module provides a complete, reproducible pipeline for training **XGBoost** models on structured CIREN crash data.

It preserves full consistency with the neural pipeline while enabling direct comparison between deep learning