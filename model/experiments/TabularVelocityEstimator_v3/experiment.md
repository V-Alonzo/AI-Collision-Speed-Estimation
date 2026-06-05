## Tabular Dataset Experiment Description

This experiment is part of a broader project that includes multiple modeling approaches over structured data. Specifically, this section describes a tabular-data experiment in which a machine learning model is trained using engineered vehicle, crash, and injury-related features to estimate impact velocity.

---

### Dataset Overview

The dataset used in this experiment is a structured tabular dataset derived from vehicle crash records. The target variable is the **impact velocity**, formulated as a supervised regression problem.

Both measured and simulation-derived velocity values are included. For records where measured impact velocity was unavailable, a simulation-based estimate was used, increasing the number of available training samples. After data cleaning and preprocessing, the final dataset contains **288 samples**.

Unlike previous versions of the experiment, an additional **feature selection stage** was incorporated to identify the most informative variables and reduce feature redundancy. As a result, the final model is trained using **7 selected features**.

---

### Data Preprocessing Pipeline

Before feature selection and model training, the dataset undergoes several preprocessing steps:

- **Duplicate removal** to eliminate repeated records and ensure data consistency.
- **Missing velocity handling** through the inclusion of simulation-derived velocity estimates when measured values are unavailable.
- **Target encoding** for categorical variables, replacing one-hot encoding and reducing dimensionality while preserving predictive information.
- **Ordinal encoding** for injury severity levels.
- **Standardization** of numerical and ordinal variables using z-score normalization.
- **Cyclical feature encoding** using sine and cosine transformations for directional variables.
- **Binary encoding** of rollover status.

The preprocessing pipeline used throughout this experiment is implemented in the file:

`utils/Preprocessing/HuggingFaceExtraction/HF_DB_Pipeline.py`

---

### Feature Selection Procedure

A dedicated feature selection pipeline was applied after preprocessing to retain only the most relevant variables for impact velocity prediction.

The procedure consisted of four stages:

#### 1. Constant Feature Removal

Features with no variability across the dataset were removed, as they do not contribute predictive information.

#### 2. Mutual Information Filtering

The mutual information (MI) between each feature and the target variable was computed. Features with MI values below a predefined threshold were discarded, retaining only variables with meaningful predictive relevance.

#### 3. Group-Based Directional Feature Selection

The directional variables were organized into two competing groups:

- Force direction:
  - `forceDirection_sin`
  - `forceDirection_cos`

- Clock direction:
  - `clockDirection_sin`
  - `clockDirection_cos`

The average mutual information of each group was calculated, and only the group with the highest predictive relevance was retained.

#### 4. Correlation-Based Redundancy Removal

Pairwise correlations between features were analyzed using a correlation threshold of 0.90.

For groups of highly correlated variables, only the feature with the highest mutual information score was preserved, reducing redundancy while maintaining predictive power.

---

### Final Selected Features

After the feature selection process, the final dataset was reduced from 11 to 7 input features:

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

These variables exhibited the highest predictive relevance while minimizing redundancy within the feature space.

---

### Objective of the Experiment

The objective of this experiment is to evaluate whether a reduced subset of highly informative variables can accurately predict impact velocity while improving model efficiency, reducing feature redundancy, and potentially improving generalization performance.

This experiment focuses on **feature selection for tabular regression**, serving as an extension of previous tabular modeling approaches within the overall project.

---

### Model Architecture

The model used in this experiment is a fully connected feed-forward neural network (MLP) designed for tabular regression tasks.

#### Backbone Network

The architecture follows a standard multilayer perceptron design where the selected input features are progressively transformed through a sequence of fully connected layers with decreasing dimensionality. Each hidden layer is followed by a ReLU activation function.

Dropout regularization is applied between hidden layers when enabled to reduce overfitting and improve generalization.

The final layer consists of a single linear neuron producing a continuous prediction corresponding to the estimated impact velocity.

Overall, the architecture can be summarized as follows:

- **Input layer:** feature vector of size `7`
- **Hidden layers:** progressively reduced dimensions (e.g., 64 → 32 → 16)
- **Activation function:** ReLU
- **Regularization:** Dropout applied between hidden layers
- **Output layer:** single neuron producing a continuous regression output

---

### Data Splits

The dataset is divided into training, validation, and test sets using a predefined split strategy:

- **Train set:** 80% of the full dataset
- **Test set:** 20% of the full dataset
- **Validation set:** 20% of the training set

This results in a hierarchical split where the validation set is derived from the training portion.

---

### Training Configuration

- **Number of epochs:** 100
- **Batch size:** 16
- **Early stopping patience:** 10 epochs
- **Learning rate:** 3e-4