# Metrics Plotter
from model.config.HybridVelocityEstimator.config import CONFIG
from model.config.libraries import *
from model.src.HybridVelocityEstimator.Evaluation.Inference import load_model, extract_all_predictions


class MetricsPlotter:

    def __init__(
        self,
        version="latest",
        smoothing_window=3
    ):

        self.smoothing_window = smoothing_window

        self.logs_dir = Path(
            CONFIG.TRAININGLOGS_DIR_PATH + "/lightning_logs"
        )

        self.metrics_dir = Path(
            CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH
        )

        # ----------------------------------------------------
        # Resolve version
        # ----------------------------------------------------
        if version == "latest":
            print(" PATH: ", self.logs_dir)

            versions = sorted(
                self.logs_dir.glob("version_*")
            )

            if len(versions) == 0:
                raise Exception(
                    "No Lightning versions found"
                )

            self.version_dir = versions[-1]

        else:

            self.version_dir = (
                self.logs_dir / f"version_{version}"
            )

        self.csv_path = (
            self.version_dir / "metrics.csv"
        )

        if not self.csv_path.exists():
            raise FileNotFoundError(
                f"Metrics CSV not found: {self.csv_path}"
            )

        print(f"[INFO] Loading metrics from:")
        print(self.csv_path)

        # ----------------------------------------------------
        # Load dataframe
        # ----------------------------------------------------
        self.df = pd.read_csv(self.csv_path)

        self.df = self.df.dropna(
            axis=1,
            how='all'
        )

        self.df = self.df.dropna(
            how='all'
        )

        # ----------------------------------------------------
        # Prepare data
        # ----------------------------------------------------
        self.prepare_data()

    # Prepare Data
    def prepare_data(self):

        # Epoch metrics
        epoch_columns = [
            col for col in [
                "epoch",
                "train_loss_epoch",
                "val_loss",
                "train_mae",
                "val_mae"
            ]
            if col in self.df.columns
        ]

        self.epoch_df = (
            self.df[epoch_columns]
            .dropna(how="all")
            .groupby("epoch")
            .last()
            .reset_index()
        )

        # Step metrics
        step_columns = [
            col for col in [
                "step",
                "train_loss_step"
            ]
            if col in self.df.columns
        ]

        self.step_df = (
            self.df[step_columns]
            .dropna()
        )

        # Optional smoothing
        if (
            self.smoothing_window > 1
            and "train_loss_step" in self.step_df.columns
        ):

            self.step_df["train_loss_step_smooth"] = (
                self.step_df["train_loss_step"]
                .rolling(self.smoothing_window)
                .mean()
            )

        # Test MAE
        self.test_mae = None

        if "test_mae" in self.df.columns:

            test_mae_rows = self.df[
                self.df["test_mae"].notna()
            ]

            if not test_mae_rows.empty:

                self.test_mae = (
                    test_mae_rows["test_mae"]
                    .values[-1]
                )

    # Plot Loss Curves
    def plot_loss(self):

        if "val_loss" not in self.epoch_df.columns:
            return

        plt.figure(figsize=(10, 6))

        if "train_loss_epoch" in self.epoch_df.columns:

            plt.plot(
                self.epoch_df["epoch"],
                self.epoch_df["train_loss_epoch"],
                marker='o',
                label="Train Loss"
            )

        plt.plot(
            self.epoch_df["epoch"],
            self.epoch_df["val_loss"],
            marker='o',
            label="Validation Loss"
        )

        # Best val loss
        best_idx = self.epoch_df["val_loss"].idxmin()

        best_epoch = self.epoch_df.loc[
            best_idx,
            "epoch"
        ]

        best_loss = self.epoch_df.loc[
            best_idx,
            "val_loss"
        ]

        plt.scatter(
            best_epoch,
            best_loss,
            s=120,
            label=f"Best Val Loss ({best_loss:.3f})"
        )

        plt.title(
            f"{CONFIG.MODEL_NAME}\nLoss Curves"
        )

        plt.xlabel("Epoch")
        plt.ylabel("Loss")

        plt.grid(True)
        plt.legend()

        output_path = (
            self.metrics_dir /
            "loss_curves.png"
        )

        plt.savefig(
            output_path,
            dpi=200,
            bbox_inches="tight"
        )

        plt.close()

        print(f"[INFO] Generated:")
        print(output_path)

    # Plot MAE Curves
    def plot_mae(self):

        if "val_mae" not in self.epoch_df.columns:
            return

        plt.figure(figsize=(10, 6))

        if "train_mae" in self.epoch_df.columns:

            plt.plot(
                self.epoch_df["epoch"],
                self.epoch_df["train_mae"],
                marker='o',
                label="Train MAE"
            )

        plt.plot(
            self.epoch_df["epoch"],
            self.epoch_df["val_mae"],
            marker='o',
            label="Validation MAE"
        )

        # Best val mae
        best_idx = self.epoch_df["val_mae"].idxmin()

        best_epoch = self.epoch_df.loc[
            best_idx,
            "epoch"
        ]

        best_mae = self.epoch_df.loc[
            best_idx,
            "val_mae"
        ]

        plt.scatter(
            best_epoch,
            best_mae,
            s=120,
            label=f"Best Val MAE ({best_mae:.3f})"
        )

        # Test MAE
        if self.test_mae is not None:

            plt.axhline(
                y=self.test_mae,
                linestyle='--',
                label=f"Test MAE ({self.test_mae:.3f})"
            )

        plt.title(
            f"{CONFIG.MODEL_NAME}\nMAE Curves"
        )

        plt.xlabel("Epoch")
        plt.ylabel("MAE")

        plt.grid(True)
        plt.legend()

        output_path = (
            self.metrics_dir /
            "mae_curves.png"
        )

        plt.savefig(
            output_path,
            dpi=200,
            bbox_inches="tight"
        )

        plt.close()

        print(f"[INFO] Generated:")
        print(output_path)

    # Plot Step Loss
    def plot_step_loss(self):

        if "train_loss_step" not in self.step_df.columns:
            return

        plt.figure(figsize=(12, 6))

        plt.plot(
            self.step_df["step"],
            self.step_df["train_loss_step"],
            alpha=0.4,
            linewidth=1,
            label="Raw"
        )

        if "train_loss_step_smooth" in self.step_df.columns:

            plt.plot(
                self.step_df["step"],
                self.step_df["train_loss_step_smooth"],
                linewidth=2,
                label="Smoothed"
            )

        plt.title(
            f"{CONFIG.MODEL_NAME}\nTrain Loss per Step"
        )

        plt.xlabel("Step")
        plt.ylabel("Loss")

        plt.grid(True)
        plt.legend()

        output_path = (
            self.metrics_dir /
            "step_loss.png"
        )

        plt.savefig(
            output_path,
            dpi=200,
            bbox_inches="tight"
        )

        plt.close()

        print(f"[INFO] Generated:")
        print(output_path)

    # Export Summary
    def export_summary(self):

        summary = {}

        if "val_loss" in self.epoch_df.columns:

            summary["best_val_loss"] = float(
                self.epoch_df["val_loss"].min()
            )

        if "val_mae" in self.epoch_df.columns:

            summary["best_val_mae"] = float(
                self.epoch_df["val_mae"].min()
            )

        if self.test_mae is not None:

            summary["test_mae"] = float(
                self.test_mae
            )

        summary["epochs"] = int(
            self.epoch_df["epoch"].max()
        )

        summary_path = (
            self.metrics_dir /
            "training_summary.json"
        )

        with open(summary_path, "w") as f:

            json.dump(
                summary,
                f,
                indent=4
            )

        print(f"[INFO] Summary exported:")
        print(summary_path)
    
    def get_inferences(self):
        # Load model
        velocityEstimator = load_model()

        print("\033[0;34m" + "[Generating Inferences...] \033[0m" + "\n")
        # Extract predictions and labels
        true_labels, predictions = (
            extract_all_predictions(
                velocityEstimator
            )
        )

        return true_labels, predictions

    #Comparative Plots
    def plot_true_vs_predicted(
            self,
            true_labels,
            predictions
        ):

        plt.figure(figsize=(8,8))

        plt.scatter(
            true_labels,
            predictions,
            alpha=0.5,
            s=10
        )

        min_val = min(
            true_labels.min(),
            predictions.min()
        )

        max_val = max(
            true_labels.max(),
            predictions.max()
        )

        plt.plot(
            [min_val, max_val],
            [min_val, max_val],
            "r--",
            linewidth=2
        )

        plt.xlabel("True Speed (km/h)")
        plt.ylabel("Predicted Speed (km/h)")
        plt.title("Predicted vs True Speed")

        plt.tight_layout()

        plt.savefig(
            os.path.join(
                CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
                "predicted_vs_true.png"
            ),
            dpi=300
        )

        plt.close()

    def plot_error_vs_speed(
            self,
            true_labels,
            predictions
        ):

        errors = predictions - true_labels

        plt.figure(figsize=(10,6))

        plt.scatter(
            true_labels,
            errors,
            alpha=0.5,
            s=10
        )

        plt.axhline(
            0,
            linestyle="--"
        )

        plt.xlabel("True Speed (km/h)")
        plt.ylabel("Prediction Error")

        plt.title(
            "Prediction Error vs True Speed"
        )

        plt.tight_layout()

        plt.savefig(
            os.path.join(
                CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
                "error_vs_speed.png"
            ),
            dpi=300
        )

        plt.close()

    def plot_violin_error_by_speed(
            self,
            true_labels,
            predictions
        ):

        df = pd.DataFrame({

            "true_speed": true_labels,

            "error": np.abs(
                predictions - true_labels
            )
        })

        bins = np.arange(
            0,
            np.ceil(df["true_speed"].max()) + 10,
            10
        )

        df["speed_bin"] = pd.cut(
            df["true_speed"],
            bins=bins
        )

        plt.figure(figsize=(14,6))

        sns.violinplot(
            data=df,
            x="speed_bin",
            y="error"
        )

        plt.xticks(
            rotation=45
        )

        plt.xlabel(
            "Speed Range (km/h)"
        )

        plt.ylabel(
            "Absolute Error"
        )

        plt.title(
            "Error Distribution by Speed Range"
        )

        plt.tight_layout()

        plt.savefig(
            os.path.join(
                CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
                "violin_error_by_speed.png"
            ),
            dpi=300
        )

        plt.close()

    def plot_true_predicted_curves(
            self,
            true_labels,
            predictions
        ):

        order = np.argsort(
            true_labels
        )

        true_sorted = true_labels[order]
        pred_sorted = predictions[order]

        plt.figure(
            figsize=(14,6)
        )

        plt.plot(
            true_sorted,
            label="True Speed"
        )

        plt.plot(
            pred_sorted,
            label="Predicted Speed"
        )

        plt.legend()

        plt.xlabel(
            "Samples sorted by true speed"
        )

        plt.ylabel(
            "Speed (km/h)"
        )

        plt.title(
            "True vs Predicted Speed"
        )

        plt.tight_layout()

        plt.savefig(
            os.path.join(
                CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
                "true_vs_predicted_curves.png"
            ),
            dpi=300
        )

        plt.close()

    # Run All
    def run(self):

        self.plot_loss()

        self.plot_mae()

        self.plot_step_loss()

        true_labels, predictions = self.get_inferences()

        self.plot_true_vs_predicted(true_labels, predictions)

        self.plot_error_vs_speed(true_labels, predictions)

        self.plot_violin_error_by_speed(true_labels, predictions)

        self.plot_true_predicted_curves(true_labels, predictions)

        self.export_summary()

        print("\n[INFO] Plot phase finished")


# Main
def main():
    plotter = MetricsPlotter(
        version="latest",
        smoothing_window=10
    )

    plotter.run()

    return


# Entry point
if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n")
    main()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n")

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )

