# Metrics Plotter

from model.config.libraries import *


class MetricsPlotter:

    def __init__(
        self,
        config,
        version="latest",
        smoothing_window=3
    ):

        self.config = config

        self.smoothing_window = smoothing_window

        self.logs_dir = Path(
            self.config.TRAININGLOGS_DIR_PATH + "/lightning_logs"
        )

        self.metrics_dir = Path(
            self.config.METRICS_PLOTS_OUTPUT_DIR_PATH
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
            f"{self.config.MODEL_NAME}\nLoss Curves"
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
            f"{self.config.MODEL_NAME}\nMAE Curves"
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
            f"{self.config.MODEL_NAME}\nTrain Loss per Step"
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

    # Run All
    def run(self):

        self.plot_loss()

        self.plot_mae()

        self.plot_step_loss()

        self.export_summary()

        print("\n[INFO] Plot phase finished")


# Main
def main():

    from model.config.ImageVelocityEstimator.config import (
        CONFIG
    )

    plotter = MetricsPlotter(
        config=CONFIG,
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

