from model.config.libraries import *


@dataclass
class TrainingConfig:

    # =========================================================
    # Dataset
    # =========================================================

    DATASET_NAME: str = "dataset_v3"

    TABULAR_FEATURES_PATH: str = (
        f"model/data/CSV/{DATASET_NAME}/tabular_features.csv"
    )

    TABULAR_TARGET_PATH: str = (
        f"model/data/CSV/{DATASET_NAME}/tabular_target.csv"
    )

    TARGET_COLUMN: str = "targetVariable"

    # =========================================================
    # Reproducibility
    # =========================================================

    SEED: int = 42

    # =========================================================
    # Train / Validation Split
    # =========================================================

    TRAIN_PROPORTION: float = 0.8

    # =========================================================
    # XGBoost Hyperparameters
    # =========================================================

    N_ESTIMATORS: int = 1000

    MAX_DEPTH: int = 5

    LEARNING_RATE: float = 0.05

    EVAL_METRIC: str = "mae"

    SUBSAMPLE: float = 0.8

    COLSAMPLE_BYTREE: float = 0.8

    EARLY_STOPPING_ROUNDS: int = 50

    OBJECTIVE: str = "reg:squarederror"

    # =========================================================
    # Experiment Naming
    # =========================================================

    MODEL_PREFIX: str = "TabularVelocity_XGBoost_v1"

    EXPERIMENTS_ROOT_DIR: str = "model/experiments"

    # =========================================================
    # Modes
    # =========================================================

    INFERENCE_MODE: bool = False

    METRICS_MODE: bool = False

    # =========================================================
    # Post Init
    # =========================================================

    def __post_init__(self):

        self.MODEL_NAME = self.MODEL_PREFIX

        self.EXPERIMENT_DIR = (
            f"{self.EXPERIMENTS_ROOT_DIR}/"
            f"{self.MODEL_NAME}"
        )

        # -----------------------------------------------------
        # Model Serialization
        # -----------------------------------------------------

        self.MODEL_SERIALIZED_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/serialized"
        )

        self.MODEL_SERIALIZED_PATH = (
            f"{self.MODEL_SERIALIZED_DIR_PATH}/"
            f"{self.MODEL_NAME}.joblib"
        )

        # -----------------------------------------------------
        # Logs
        # -----------------------------------------------------

        self.TRAININGLOGS_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/logs"
        )

        # -----------------------------------------------------
        # Metrics
        # -----------------------------------------------------

        self.METRICS_PLOTS_OUTPUT_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/metrics"
        )

        # -----------------------------------------------------
        # Inference
        # -----------------------------------------------------

        self.OUTPUT_INFERENCES_DIR = (
            f"{self.EXPERIMENT_DIR}/inference_outputs"
        )

        # -----------------------------------------------------
        # Config
        # -----------------------------------------------------

        self.EXPERIMENT_CONFIG_PATH = (
            f"{self.EXPERIMENT_DIR}/config.json"
        )

        if not self.INFERENCE_MODE and not self.METRICS_MODE:

            os.makedirs(self.EXPERIMENT_DIR, exist_ok=True)

            os.makedirs(
                self.MODEL_SERIALIZED_DIR_PATH,
                exist_ok=True
            )

            os.makedirs(
                self.TRAININGLOGS_DIR_PATH,
                exist_ok=True
            )

            os.makedirs(
                self.METRICS_PLOTS_OUTPUT_DIR_PATH,
                exist_ok=True
            )

            os.makedirs(
                self.OUTPUT_INFERENCES_DIR,
                exist_ok=True
            )

    # =========================================================
    # Save Config
    # =========================================================

    def save(self, output_path=None):

        if output_path is None:
            output_path = self.EXPERIMENT_CONFIG_PATH

        with open(output_path, "w") as f:

            json.dump(
                asdict(self),
                f,
                indent=4
            )

        print(
            f"[INFO] Config saved at: "
            f"{output_path}"
        )

    # =========================================================
    # Load Config
    # =========================================================

    @classmethod
    def load(cls, config_path):

        with open(config_path, "r") as f:
            config_dict = json.load(f)

        return cls(**config_dict)


CONFIG = TrainingConfig()