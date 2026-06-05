# Inference

# == Main for model's inference phase

# Import libraries and required modules
from model.src.TabularVelocityEstimator.VelocityEstimator import VelocityEstimator 

from model.config.TabularVelocityEstimator.config import CONFIG

from model.config.libraries import *


# Function for model's inference execution
def execute_inference():
    """
    Loads a trained model, performs inference on the configured
    input payload, and saves the predictions to a CSV file.
    """

    # Create model
    model = VelocityEstimator(
        batch_size=CONFIG.BATCH_SIZE,
        num_workers=CONFIG.NUM_WORKERS,
        train_proportion=CONFIG.TRAIN_PROPORTION,
        val_proportion=CONFIG.VAL_PROPORTION
    )

    # Load trained model
    model.load_model(CONFIG.MODEL_SERIALIZED_PATH)

    print(
        "Model was correctly loaded from "
        + CONFIG.MODEL_SERIALIZED_PATH
        + " ..."
    )

    # Load payload for inference
    payload_path = CONFIG.INFERENCE_SAMPLE_PATH

    with open(payload_path, "r") as f:
        payload = json.load(f)

    # Convert single sample into list format
    if isinstance(payload, dict):
        payload = [payload]

    sample_df = pd.DataFrame(payload)

    # Validate required input schema
    expected_columns = pd.read_csv(
        CONFIG.TABULAR_FEATURES_PATH
    ).columns

    missing_columns = (
        set(expected_columns)
        - set(sample_df.columns)
    )

    if missing_columns:

        missing_list = ", ".join(
            sorted(missing_columns)
        )

        raise ValueError(
            "Payload is missing required columns: "
            + missing_list
        )

    # Match training feature order
    sample_df = sample_df.reindex(
        columns=expected_columns
    )

    # Generate predictions
    predictions = model.inference(
        sample_df
    )

    # Append predictions to output
    output_df = sample_df.copy()

    output_df["predicted_speed_kph"] = (
        predictions
    )

    # Save inference results
    output_path = os.path.join(
        CONFIG.OUTPUT_INFERENCES_DIR,
        CONFIG.MODEL_NAME
        + "_inference_"
        + str(len(sample_df))
        + "_rows.csv"
    )

    output_df.to_csv(
        output_path,
        index=False
    )

    print(
        "Inference phase finished, results saved in "
        + output_path
        + "..."
    )


def get_test_inferences():
    """
    Runs inference on the test dataset and returns both
    ground-truth labels and model predictions.
    """

    model = VelocityEstimator(
        batch_size=CONFIG.BATCH_SIZE,
        num_workers=CONFIG.NUM_WORKERS,
        train_proportion=CONFIG.TRAIN_PROPORTION,
        val_proportion=CONFIG.VAL_PROPORTION
    )

    # Load trained model
    model.load_model(
        CONFIG.MODEL_SERIALIZED_PATH
    )

    # Set evaluation mode
    model.model.eval()

    predictions = []
    true_labels = []

    # Disable gradient computation
    with torch.no_grad():

        # Iterate over test batches
        for features, labels in model.dm.test_dataloader():

            # Move features to execution device
            features = features.to(
                CONFIG.DEVICE
            )

            # Forward pass
            preds = (
                model.model(features)
                .squeeze(-1)
            )

            # Store predictions and labels
            predictions.append(
                preds.cpu().numpy()
            )

            true_labels.append(
                labels.cpu().numpy()
            )

    # Merge all batches
    predictions = np.concatenate(
        predictions
    )

    true_labels = np.concatenate(
        true_labels
    )

    return true_labels, predictions