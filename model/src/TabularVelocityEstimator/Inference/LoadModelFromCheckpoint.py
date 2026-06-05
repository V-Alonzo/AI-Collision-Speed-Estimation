# Load Model From checpoint

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

    # Load Model from Checkpointi
    model.load_from_checkpoint(CONFIG.CHECKPOINTS_DIR_PATH + "best_model_" + CONFIG.MODEL_NAME + ".ckpt")

    # Sample n rows for inference
    features_df = pd.read_csv(CONFIG.TABULAR_FEATURES_PATH)
    sample_df = features_df.sample(n=CONFIG.N_INFERENCES_2_EXEC, random_state=CONFIG.SEED)

    predictions = model.inference(sample_df)

    output_df = sample_df.copy()
    output_df["predicted_speed_kph"] = predictions

    output_path = os.path.join(
        CONFIG.OUTPUT_INFERENCES_DIR,
        CONFIG.MODEL_NAME + "_inference_" + str(CONFIG.N_INFERENCES_2_EXEC) + "_rows.csv"
    )
    output_df.to_csv(output_path, index=False)
    print("Inference phase finished, results saved in " + output_path + "...")

if __name__ == "__main__":
    execute_inference()