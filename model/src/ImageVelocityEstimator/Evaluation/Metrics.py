# == Function for plotting metrics

# Import libraries and required modules
from model.config.libraries import *
from model.config.ImageVelocityEstimator.config import (
    MODEL_NAME,
    METRICS_PLOTS_OUTPUT_DIR_PATH,
    METRICS_MODEL_VERSION_TO_PLOT
)

# --- CONFIG ---
CSV_PATH = (
    "model/src/TrainingLogs/"
    + MODEL_NAME
    + "/version_"
    + str(METRICS_MODEL_VERSION_TO_PLOT)
    + "/metrics.csv"
)

def plot_metrics():

    # LOAD CSV
    print(f"Loading metrics from {CSV_PATH} ...")

    df = pd.read_csv(CSV_PATH)

    # Remove empty rows/cols
    df = df.dropna(axis=1, how='all')
    df = df.dropna(how='all')

    # PREPARE DATA

    # Epoch metrics
    epoch_df = df[
        [
            "epoch",
            "train_loss_epoch",
            "val_loss",
            "train_mae",
            "val_mae"
        ]
    ].dropna(how="all")

    # Group by epoch and keep latest value
    epoch_df = epoch_df.groupby("epoch").last().reset_index()

    # Step metrics
    step_df = df[
        [
            "step",
            "train_loss_step"
        ]
    ].dropna()

    # Final test MAE
    test_mae_row = df[df["test_mae"].notna()]
    test_mae = None

    if not test_mae_row.empty:
        test_mae = test_mae_row["test_mae"].values[-1]

    # PLOT TRAIN VS VAL LOSS

    plt.figure(figsize=(10, 6))

    plt.plot(
        epoch_df["epoch"],
        epoch_df["train_loss_epoch"],
        marker='o',
        label="Train Loss"
    )

    plt.plot(
        epoch_df["epoch"],
        epoch_df["val_loss"],
        marker='o',
        label="Validation Loss"
    )

    plt.title(f"{MODEL_NAME} | Train vs Validation Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.grid(True)
    plt.legend()

    loss_path = os.path.join(
        METRICS_PLOTS_OUTPUT_DIR_PATH,
        MODEL_NAME + "_loss.png"
    )

    plt.savefig(loss_path, dpi=150, bbox_inches="tight")
    plt.close()

    print(f"Generated: {loss_path}")

    # PLOT TRAIN VS VAL MAE
    plt.figure(figsize=(10, 6))

    plt.plot(
        epoch_df["epoch"],
        epoch_df["train_mae"],
        marker='o',
        label="Train MAE"
    )

    plt.plot(
        epoch_df["epoch"],
        epoch_df["val_mae"],
        marker='o',
        label="Validation MAE"
    )

    # Plot final test MAE
    if test_mae is not None:

        plt.axhline(
            y=test_mae,
            linestyle='--',
            label=f"Test MAE = {test_mae:.3f}"
        )

    plt.title(f"{MODEL_NAME} | Train vs Validation MAE")
    plt.xlabel("Epoch")
    plt.ylabel("MAE")
    plt.grid(True)
    plt.legend()

    mae_path = os.path.join(
        METRICS_PLOTS_OUTPUT_DIR_PATH,
        MODEL_NAME + "_mae.png"
    )

    plt.savefig(mae_path, dpi=150, bbox_inches="tight")
    plt.close()

    print(f"Generated: {mae_path}")

    # PLOT STEP LOSS
    plt.figure(figsize=(12, 6))

    plt.plot(
        step_df["step"],
        step_df["train_loss_step"],
        linewidth=1
    )

    plt.title(f"{MODEL_NAME} | Train Loss per Step")
    plt.xlabel("Step")
    plt.ylabel("Train Loss Step")
    plt.grid(True)

    step_path = os.path.join(
        METRICS_PLOTS_OUTPUT_DIR_PATH,
        MODEL_NAME + "_step_loss.png"
    )

    plt.savefig(step_path, dpi=150, bbox_inches="tight")
    plt.close()

    print(f"Generated: {step_path}")

    # SUMMARY
    print("\n===== TRAINING SUMMARY =====")

    if test_mae is not None:
        print(f"Final Test MAE: {test_mae:.4f}")

    print(f"Best Validation Loss: {epoch_df['val_loss'].min():.4f}")
    print(f"Best Validation MAE: {epoch_df['val_mae'].min():.4f}")

    print("\nPlot phase finished...")


if __name__ == "__main__":
    plot_metrics()