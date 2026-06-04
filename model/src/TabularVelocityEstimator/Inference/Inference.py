# Inference

# == Main for model's inference phase

# Import libraries and required modules
from model.src.TabularVelocityEstimator.VelocityEstimator import VelocityEstimator 
from model.config.TabularVelocityEstimator.config import CONFIG
from model.config.libraries import *


# Function for model's inference execution
def execute_inference():
    # Create model
    model = VelocityEstimator(
        batch_size = CONFIG.BATCH_SIZE,
        num_workers = CONFIG.NUM_WORKERS,
        train_proportion = CONFIG.TRAIN_PROPORTION,
        val_proportion = CONFIG.VAL_PROPORTION
    )

    # Save model
    model.load_model( CONFIG.MODEL_SERIALIZED_PATH)
    print("Model was correctly loaded from " +CONFIG.MODEL_SERIALIZED_PATH+ " ...")

    # Load payload for inference
    payload_path = CONFIG.INFERENCE_SAMPLE_PATH

    with open(payload_path, "r") as f:
        payload = json.load(f)

    if isinstance(payload, dict):
        payload = [payload]

    sample_df = pd.DataFrame(payload)

    expected_columns = pd.read_csv(CONFIG.TABULAR_FEATURES_PATH).columns
    missing_columns = set(expected_columns) - set(sample_df.columns)
    if missing_columns:
        missing_list = ", ".join(sorted(missing_columns))
        raise ValueError("Payload is missing required columns: " + missing_list)

    sample_df = sample_df.reindex(columns=expected_columns)

    predictions = model.inference(sample_df)

    output_df = sample_df.copy()
    output_df["predicted_speed_kph"] = predictions

    output_path = os.path.join(
        CONFIG.OUTPUT_INFERENCES_DIR,
            CONFIG.MODEL_NAME + "_inference_" + str(len(sample_df)) + "_rows.csv"
    )
    output_df.to_csv(output_path, index=False)
    print("Inference phase finished, results saved in " + output_path + "...")


def get_test_inferences():

    model = VelocityEstimator(
        batch_size=CONFIG.BATCH_SIZE,
        num_workers=CONFIG.NUM_WORKERS,
        train_proportion=CONFIG.TRAIN_PROPORTION,
        val_proportion=CONFIG.VAL_PROPORTION
    )

    model.load_model(
        CONFIG.MODEL_SERIALIZED_PATH
    )

    model.model.eval()

    predictions = []
    true_labels = []

    with torch.no_grad():

        for features, labels in model.dm.test_dataloader():

            features = features.to(CONFIG.DEVICE)

            preds = (
                model.model(features)
                .squeeze(-1)
            )

            predictions.append(
                preds.cpu().numpy()
            )

            true_labels.append(
                labels.cpu().numpy()
            )

    predictions = np.concatenate(
        predictions
    )

    true_labels = np.concatenate(
        true_labels
    )

    return true_labels, predictions
