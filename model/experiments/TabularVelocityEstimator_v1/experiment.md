## Tabular Dataset Experiment Description

This experiment is part of a broader project that includes multiple modeling approaches over structured data. Specifically, this section describes one of the **tabular data experiments**, where a machine learning model is trained using engineered features derived from vehicle and event-related information.

---

### Dataset Overview

The dataset used in this experiment is a structured tabular dataset composed of **23 input features**. These features capture information related to vehicle specifications, damage characteristics, and directional dynamics.

The target variable for this experiment is the **estimated impact velocity**, used in a supervised regression setting.

Only samples with **available real measured impact velocity** are included in the dataset. Records without observed velocity are removed to ensure data quality and consistency. Additionally, **simulated or imputed velocity values are explicitly excluded**, meaning that no synthetic velocity values are used during training or evaluation. As a result, the final dataset size is **240 samples**.

---

### Data Preprocessing Pipeline

Before training, the dataset undergoes several preprocessing steps:

- **Duplicate removal** to eliminate repeated records and ensure data consistency.
- **Filtering of missing target values**, retaining only samples with valid measured impact velocity.
- **One-hot encoding** for categorical variables to transform them into a numerical representation suitable for machine learning models.
- **Cyclical feature encoding** using sine and cosine transformations for directional variables, preserving their periodic nature.
- **Feature-type separation**, distinguishing numerical, categorical, and ordinal variables for structured preprocessing.

---

### Input Features

#### Numerical features
- `num__curbWeightKg`
- `num__cargoWeightKg`

#### Vehicle class (one-hot encoded)
- `cat__vehicleClass_Compact (wheelbase >= 254 but < 265 cm)`
- `cat__vehicleClass_Compact pickup truck (<=4,536 kgs GVWR)`
- `cat__vehicleClass_Compact utility vehicle`
- `cat__vehicleClass_Full size (wheelbase >=278 but < 291 cm)`
- `cat__vehicleClass_Intermediate (wheelbase >=265 but < 278 cm)`
- `cat__vehicleClass_Large pickup truck (<=4,536 kgs GVWR)`
- `cat__vehicleClass_Large utility vehicle (<=4,536 kgs GVWR)`
- `cat__vehicleClass_Largest (wheelbase >=291 cm)`
- `cat__vehicleClass_Minivan (<=4,536 kgs GVWR)`
- `cat__vehicleClass_Subcompact/mini (wheelbase < 254 cm)`

#### Damage plane description (one-hot encoded)
- `cat__damagePlaneDescription_Back`
- `cat__damagePlaneDescription_Front`
- `cat__damagePlaneDescription_Left side`
- `cat__damagePlaneDescription_Right side`

#### Ordinal and additional features
- `ord__severityDescription`
- `mais__mais`
- `rollover__rolloverStatus`

#### Cyclical features (directional encoding)
- `force_cyc__forceDirection_sin`
- `force_cyc__forceDirection_cos`
- `clock_cyc__clockDirection_sin`
- `clock_cyc__clockDirection_cos`

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

The final layer consists of a single linear neuron that outputs a continuous scalar value corresponding to the predicted impact velocity in this regression task.

Overall, the architecture can be summarized as follows:

- **Input layer:** feature vector of size `input_dim`
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