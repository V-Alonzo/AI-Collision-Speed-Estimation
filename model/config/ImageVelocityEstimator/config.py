# Import libraries and required modules
from model.config.libraries import *

@dataclass
class TrainingConfig:

    # Device configuration
    DEVICE: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    FLOAT32_MATMUL_PRECISION: str = 'high'

    # -- General dataset and data (images) params obtained from "model/data/scripts/dataset_eda.ipynb"
    DIM_SIZE_FACTOR: int = 1

    IMAGE_HEIGHTS_MEDIAN: int = 224
    IMAGE_WIDTHS_MEDIAN: int = 224
    IMAGE_CHANNELS: int = 3

    IMAGE_MEAN: list = None
    IMAGE_STD: list = None

    N_SAMPLES: int = 15513

    # Training Parameters
    BATCH_SIZE: int = 128
    NUM_WORKERS: int = 20

    TRAIN_PROPORTION: float = 0.8 
    VAL_PROPORTION: float = 0.8

    N_EPOCHS: int = 60

    LEARNING_RATE: float = 1e-4

    SEED: int = 42

    EARLY_STOPPING_PATIENCE: int = 20

    TRAINER_ACCELERATOR: str = 'gpu'
    TRAINER_PRECISION: str = "bf16-mixed"

    # Dataset CSV Parameters
    IO_DATASET_MAP_LOCAL_PATH: str = (
        "model/data/CSV/ciren_training_augmented_manifest.csv"
    )

    INPUT_IMAGES_CSV_INDEX: str = "image_relpath"
    OUTPUT_LABEL_CSV_INDEX: str = "final_speed_kph"

    # Experiment / Model Naming
    MODEL_PREFIX: str = "ImgVelEst_aug_ModFc_EmbHd_l1Loss_dycLR_v3"

    EXPERIMENTS_ROOT_DIR: str = "model/experiments"

    # INFERENCE_MODE
    INFERENCE_MODE: bool = False

    # METRICS MODE
    METRICS_MODE: bool = False
    
    # Post Init
    def __post_init__(self):

        torch.set_float32_matmul_precision('high')

        if self.IMAGE_MEAN is None:
            self.IMAGE_MEAN = [
                0.45484897,
                0.47033188,
                0.47973604
            ]

        if self.IMAGE_STD is None:
            self.IMAGE_STD = [
                0.24885239,
                0.24789241,
                0.24780511
            ]

        #timestamp = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")

        # ---------- Dynamic model name ----------
        self.MODEL_NAME = (
            f"{self.MODEL_PREFIX}"
            #f"{self.N_SAMPLES}samples"
            #f"{timestamp}"
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