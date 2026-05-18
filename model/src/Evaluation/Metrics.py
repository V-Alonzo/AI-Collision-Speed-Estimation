# == Function for ploting metrics

# Import libraries and required modules
from model.config.libraries import *
from model.config.config import MODEL_NAME, METRICS_PLOTS_OUTPUT_DIR_PATH, METRICS_MODEL_VERSION_TO_PLOT


# --- CONFIG ---
CSV_PATH = "model/src/TrainingLogs/"+MODEL_NAME+"/version_"+str(METRICS_MODEL_VERSION_TO_PLOT)+"/metrics.csv"  

# Function for metrics plot generation
def plot_metrics():

    # Load metrics form Training Logs dirs with latest model version 
    print(f"Loading metrics from {CSV_PATH} ...")
    df = pd.read_csv(CSV_PATH)

    # Delete empty columns
    df = df.dropna(axis=1, how='all')

    # Delete empty rows
    df = df.dropna(how='all')

    # Set columns to plot
    train_cols = ["train_loss_epoch"]
    val_cols = ["val_loss"]

    # Filter existent columns
    train_cols = [c for c in train_cols if c in df.columns]
    val_cols = [c for c in val_cols if c in df.columns]
    if not train_cols and not val_cols:
        print("No train/val loss columns found.")
        return

    # Create plot
    plt.figure(figsize=(8, 5))

    # Graph training loss
    for col in train_cols:
        plt.plot(df[col].dropna().values, label=col)

    # Graph validation loss
    for col in val_cols:
        plt.plot(df[col].dropna().values, label=col)

    # Plot settings
    plt.title(MODEL_NAME + " | Train vs Val Loss")
    plt.xlabel("Epochs")
    plt.ylabel("Loss")
    plt.grid(True)
    plt.legend()

    # Store plot
    out_path = os.path.join(METRICS_PLOTS_OUTPUT_DIR_PATH, MODEL_NAME+"_train_val_loss.png")
    plt.savefig(out_path, dpi=150)
    plt.close()

    print(f"Generated combined plot: {out_path}")
    print("Plot phase finished...")   

if __name__ == "__main__":
    #Plot metrics
    plot_metrics()