# Import libraries and required modules
from model.config.libraries import *

@dataclass
class TrainingConfig:

    # Device configuration
    DEVICE: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    FLOAT32_MATMUL_PRECISION: str = 'high'

    # Dataset name
    DATASET_NAME: str = "dataset_v3"

    # Tabular dataset paths
    TABULAR_FEATURES_PATH = f"model/data/CSV/{DATASET_NAME}/tabular_features.csv"
    TABULAR_TARGET_PATH = f"model/data/CSV/{DATASET_NAME}/tabular_target.csv"
    INFERENCE_SAMPLE_PATH: str = "model/src/TabularVelocityEstimator/Inference/payloads/sample_payload.json"

    # Training Parameters
    BATCH_SIZE: int = 16
    NUM_WORKERS: int = 2

    TRAIN_PROPORTION: float = 0.8
    VAL_PROPORTION: float = 0.8

    N_EPOCHS: int = 100
    LEARNING_RATE: float = 3e-4
    SEED: int = 42

    EARLY_STOPPING_PATIENCE: int = 10

    TRAINER_ACCELERATOR: str = 'gpu'
    TRAINER_PRECISION: str = "16-mixed"

    # Tabular model parameters
    TABULAR_HIDDEN_DIMS: tuple = (64, 32, 16)
    TABULAR_DROPOUT: float = 0.05

    # Experiment / Model Naming
    MODEL_PREFIX: str = "TabularVelocityEstimator_v3"
    EXPERIMENTS_ROOT_DIR: str = "model/experiments"

    # INFERENCE_MODE
    INFERENCE_MODE: bool = False

    # METRICS MODE
    METRICS_MODE: bool = False

    TARGET_COLUMN: str = "targetVariable"

    # Post Init
    def __post_init__(self):

        torch.set_float32_matmul_precision('high')

        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        # Resolve input dimension for model naming
        try:
            features_df = pd.read_csv(self.TABULAR_FEATURES_PATH)
            n_features = features_df.shape[1]
        except Exception:
            n_features = "unknown"

        # ---------- Dynamic model name ----------
        self.MODEL_NAME = (
            f"{self.MODEL_PREFIX}"
        )

        # ---------- Experiment root ----------
        self.EXPERIMENT_DIR = (
            f"{self.EXPERIMENTS_ROOT_DIR}/"
            f"{self.MODEL_NAME}"
        )

        # ---------- Dynamic paths ----------
        # Serialized model path inside dir
        self.MODEL_SERIALIZED_PATH = (
            f"{self.EXPERIMENT_DIR}/serialized/"
            f"{self.MODEL_NAME}_weights.pth"
        )

        # ---------- Experiment subdirs ----------

        self.CHECKPOINTS_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/checkpoints"
        )

        self.TRAININGLOGS_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/logs"
        )

        self.METRICS_PLOTS_OUTPUT_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/metrics"
        )

        self.MODEL_SERIALIZED_DIR_PATH = (
            f"{self.EXPERIMENT_DIR}/serialized/"
        )

        self.OUTPUT_INFERENCES_DIR = (
            f"{self.EXPERIMENT_DIR}/inference_outputs"
        )

        self.EXPERIMENT_CONFIG_PATH = (
            f"{self.EXPERIMENT_DIR}/config.json"
        )

        if not self.INFERENCE_MODE and not self.METRICS_MODE:
            # ---------- Create dirs ----------
            os.makedirs(self.EXPERIMENT_DIR, exist_ok=True)

            os.makedirs(self.CHECKPOINTS_DIR_PATH, exist_ok=True)

            os.makedirs(self.TRAININGLOGS_DIR_PATH, exist_ok=True)

            os.makedirs(self.METRICS_PLOTS_OUTPUT_DIR_PATH, exist_ok=True)

            os.makedirs(self.MODEL_SERIALIZED_DIR_PATH, exist_ok=True)

            os.makedirs(self.OUTPUT_INFERENCES_DIR, exist_ok=True)

    # Save config
    def save(self, output_path=None):

        if output_path is None:
            output_path = self.EXPERIMENT_CONFIG_PATH

        with open(output_path, "w") as f:
            json.dump(
                asdict(self),
                f,
                indent=4
            )

        print(f"[INFO] Config saved at: {output_path}")

    # Load config
    @classmethod
    def load(cls, config_path):

        with open(config_path, "r") as f:
            config_dict = json.load(f)

        return cls(**config_dict)
    
# Configuration
CONFIG = TrainingConfig()
