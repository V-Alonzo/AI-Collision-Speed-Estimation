from model.config.libraries import *

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


class MetricsPlotter:

    def __init__(self, config):

        self.config = config

        self.metrics_dir = Path(
            self.config.METRICS_PLOTS_OUTPUT_DIR_PATH
        )

        os.makedirs(
            self.metrics_dir,
            exist_ok=True
        )

    # =========================================================
    # Metrics
    # =========================================================

    def compute_metrics(
        self,
        true_labels,
        predictions
    ):

        mae = mean_absolute_error(
            true_labels,
            predictions
        )

        rmse = np.sqrt(
            mean_squared_error(
                true_labels,
                predictions
            )
        )

        r2 = r2_score(
            true_labels,
            predictions
        )

        return {
            "MAE": float(mae),
            "RMSE": float(rmse),
            "R2": float(r2)
        }

    # =========================================================
    # Predicted vs True
    # =========================================================

    def plot_true_vs_predicted(
        self,
        true_labels,
        predictions
    ):

        plt.figure(figsize=(8, 8))

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

        plt.xlabel(
            "True Speed (km/h)"
        )

        plt.ylabel(
            "Predicted Speed (km/h)"
        )

        plt.title(
            "Predicted vs True Speed"
        )

        plt.tight_layout()

        plt.savefig(
            self.metrics_dir /
            "predicted_vs_true.png",
            dpi=300
        )

        plt.close()

    # =========================================================
    # Error vs Speed
    # =========================================================

    def plot_error_vs_speed(
        self,
        true_labels,
        predictions
    ):

        errors = predictions - true_labels

        plt.figure(figsize=(10, 6))

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

        plt.xlabel(
            "True Speed (km/h)"
        )

        plt.ylabel(
            "Prediction Error"
        )

        plt.title(
            "Prediction Error vs True Speed"
        )

        plt.tight_layout()

        plt.savefig(
            self.metrics_dir /
            "error_vs_speed.png",
            dpi=300
        )

        plt.close()

    # =========================================================
    # Violin Error by Speed
    # =========================================================

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
            np.ceil(
                df["true_speed"].max()
            ) + 10,
            10
        )

        df["speed_bin"] = pd.cut(
            df["true_speed"],
            bins=bins
        )

        plt.figure(figsize=(14, 6))

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
            self.metrics_dir /
            "violin_error_by_speed.png",
            dpi=300
        )

        plt.close()

    # =========================================================
    # True vs Predicted Curves
    # =========================================================

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
            figsize=(14, 6)
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
            "Samples Sorted by True Speed"
        )

        plt.ylabel(
            "Speed (km/h)"
        )

        plt.title(
            "True vs Predicted Speed"
        )

        plt.tight_layout()

        plt.savefig(
            self.metrics_dir /
            "true_vs_predicted_curves.png",
            dpi=300
        )

        plt.close()

    # =========================================================
    # Summary
    # =========================================================

    def export_summary(
        self,
        metrics,
        model=None
    ):

        summary = dict(metrics)

        if (
            model is not None
            and hasattr(
                model,
                "best_iteration"
            )
        ):

            summary[
                "best_iteration"
            ] = int(
                model.best_iteration
            )

        summary_path = (
            self.metrics_dir /
            "metrics_summary.json"
        )

        with open(
            summary_path,
            "w"
        ) as f:

            json.dump(
                summary,
                f,
                indent=4
            )

        print(
            f"[INFO] Summary exported:"
        )

        print(summary_path)

    # =========================================================
    # Run
    # =========================================================

    def run(
        self,
        true_labels,
        predictions,
        model
    ):

        metrics = self.compute_metrics(
            true_labels,
            predictions
        )

        self.plot_true_vs_predicted(
            true_labels,
            predictions
        )

        self.plot_error_vs_speed(
            true_labels,
            predictions
        )

        self.plot_violin_error_by_speed(
            true_labels,
            predictions
        )

        self.plot_true_predicted_curves(
            true_labels,
            predictions
        )

        self.export_summary(
            metrics,
            model
        )

        print(
            "\n[INFO] Metrics generation completed."
        )

        return metrics