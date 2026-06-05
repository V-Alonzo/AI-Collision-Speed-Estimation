## Tabular Dataset Experiment Description

This experiment is part of a broader project that includes multiple modeling approaches over structured data. Specifically, this section describes one of the **tabular data experiments**, where a machine learning model is trained using engineered features derived from vehicle and event-related information.

---

### Dataset Overview

The dataset used in this experiment is a structured tabular dataset composed of **11 input features**. These features capture information related to vehicle specifications, damage characteristics, severity context, and directional dynamics.

The target variable for this experiment is the **impact velocity**, used in a supervised regression setting.

Unlike previous configurations, this iteration **includes both measured and simulated velocity values**. For records where real measured velocity was not available, a **simulation-based velocity estimate is used**, allowing the dataset to retain additional valid samples instead of discarding them. As a result, the final dataset size is **288 samples**.

---

### Data Preprocessing Pipeline

Before training, the dataset undergoes several preprocessing steps:

- **Duplicate removal** to eliminate repeated records and ensure data consistency.
- **Missing velocity handling**: records without measured velocity are retained by using a **simulation-derived velocity variable**, increasing dataset coverage.
- **Target encoding** is applied to categorical variables, replacing one-hot encoding to reduce dimensionality and capture target-dependent relationships.
- **Cyclical feature encoding** using sine and cosine transformations for directional variables, preserving periodic structure.
- **Feature-type separation**, distinguishing numerical, categorical (target-encoded), and cyclical variables.

The preprocessing pipeline used throughout this experiment is implemented in the file:

`utils/Preprocessing/HuggingFaceExtraction/HF_DB_Pipeline.py`
---

### Input Features

#### Numerical features
- `curbWeightKg`
- `cargoWeightKg`

#### Categorical features (target encoded)
- `vehicleClass`
- `damagePlaneDescription`
- `severityDescription`

#### Additional structured features
- `mais`
- `rolloverStatus`

#### Cyclical directional features
- `forceDirection_sin`
- `forceDirection_cos`
- `clockDirection_sin`
- `clockDirection_cos`

---

### Objective of the Experiment

The goal of this experiment is to train a machine learning model capable of learning relationships between vehicle structure, damage patterns, and directional force information in order to predict the **impact velocity**.

This experiment focuses exclusively on **tabular feature engineering and supervised regression**, serving as one component within a larger multi-experiment framework that may include alternative data modalities or modeling strategies.

---

### Model Architecture

The model used in this experiment is a fully connected feed-forward neural network (MLP) designed for tabular regression tasks.

#### Backbone network

The architecture follows a standard multilayer perceptron design where the input features are progressively transformed through a sequence of hidden layers with decreasing dimensionality. Specifically, the network is constructed as a stack of fully connected (linear) layers, each followed by a non-linear activation function (ReLU).

Between hidden layers, dropout regularization is applied when enabled. This mechanism randomly deactivates a fraction of neurons during training, helping to reduce overfitting and improve generalization.

The hidden layer sizes are predefined as part of the model configuration, producing a funnel-shaped architecture that gradually compresses the input representation into a lower-dimensional latent space.

The final layer consists of a single linear neuron that outputs a continuous scalar value corresponding to the predicted impact velocity.

Overall, the architecture can be summarized as follows:

- **Input layer:** feature vector of size `11`
- **Hidden layers:** progressively reduced dimensions (e.g., 64 → 32 → 16)
- **Activation function:** ReLU after each hidden layer
- **Regularization:** Dropout applied between layers (when enabled)
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