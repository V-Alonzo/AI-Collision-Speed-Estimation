# TabularVelocityEstimator

This directory contains all the training pipelines and experiments for **tabular-only velocity estimation models** using the **CIREN (Crash Investigation and Research Engineering Network) dataset from NHTSA**.

The main objective of this module is to train machine learning models (primarily **Multi-Layer Perceptrons (MLPs)**) that predict **impact velocity** from structured tabular crash data.

---

## Overview

This project focuses exclusively on **tabular learning approaches** for estimating vehicle impact velocity using engineered features derived from crash, vehicle, and injury data.

---

## Dataset

The dataset is derived from the **CIREN database (NHTSA)** and consists of structured crash investigation records.

### Target Variable

The prediction target is **impact velocity**, constructed using:

- Measured impact velocity (when available)
- Simulated velocity estimates (used when measured values are missing)

This hybrid formulation increases dataset coverage and improves training stability.

After preprocessing and filtering, the final dataset is used in a fully supervised regression setting.

---

## Preprocessing Pipeline

All preprocessing steps are centralized in:


utils/Preprocessing/HuggingFaceExtraction/HF_DB_Pipeline.py


The pipeline is executed during dataset construction via:


`model/data/scripts/build_tabular_dataset.py`


### Key preprocessing operations include:

- Duplicate removal
- Handling missing velocity values using simulated estimates
- Encoding categorical variables
- Scaling numerical features (z-score normalization)
- Encoding directional variables using sine/cosine transformations
- Encoding binary variables (e.g., rollover status)

---

## Preprocessing Versions

Two preprocessing pipeline versions are supported:

### 1. Legacy Pipeline (Deprecated but available in code)

- Implemented in earlier experiments
- Still present in `HF_DB_Pipeline.py` (commented out)
- Uses **one-hot encoding** for categorical variables

### 2. Current Pipeline (Active)

The current pipeline introduces minor but important improvements:

- Replaces **one-hot encoding → target encoding**
  - Reduces dimensionality
  - Improves generalization for categorical variables
- Improves handling of hybrid velocity target construction
- Combines:
  - Measured CIREN velocity
  - Simulated velocity estimates (fallback values)

The rest of the preprocessing logic remains largely unchanged, ensuring comparability between versions.

---

## Feature Selection Pipeline (Optional Experiment)

An additional optional module introduces a **feature selection pipeline** to reduce redundancy and improve model efficiency.

Implemented in:


`model/data/scripts/feature_selection_pipeline.py`


### Purpose

The feature selection stage aims to:

- Remove redundant variables
- Eliminate low-information features
- Reduce multicollinearity
- Improve generalization of neural models
- Reduce training complexity

### Methodology

The pipeline typically includes:

- Constant feature removal
- Mutual information filtering
- Correlation-based pruning
- Group-based feature selection (for engineered directional variables)

This stage is optional and used in specific experiments where feature efficiency is a priority.

---

## Model Training

This module is primarily designed for training **tabular neural networks**, including:

### Multi-Layer Perceptron (MLP)

A standard feed-forward architecture used for regression tasks:

- Input layer: tabular feature vector
- Hidden layers: fully connected layers with nonlinear activations (ReLU)
- Output layer: single neuron for continuous velocity prediction

Regularization techniques such as dropout may be used depending on the experiment.

---

## Training Pipeline Structure

The general training workflow is:

1. Load processed dataset from `build_tabular_dataset.py`
2. Apply selected preprocessing pipeline (current or legacy)
3. Optionally apply feature selection pipeline
4. Split dataset into training/validation/test sets
5. Train MLP or alternative neural model
6. Evaluate performance using regression metrics (e.g., MAE, MSE)

---

## Data Splitting Strategy

Standard split configuration:

- **Training set:** 80%
- **Test set:** 20%
- **Validation set:** 20% of training set

The validation set is used for hyperparameter tuning and early stopping.

---

## Key Design Goals

This module is designed with the following objectives:

- Enable robust tabular learning on structured crash data
- Compare preprocessing strategies (one-hot vs target encoding)
- Evaluate the impact of simulated velocity augmentation
- Support feature selection experiments
- Provide a reproducible training pipeline for neural regression models

---

## Summary

The `TabularVelocityEstimator` module provides a complete pipeline for training neural network models on stru