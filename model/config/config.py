# Import libraries and required modules
from model.config.libraries import *


# ====== Configuration file ====== 

# ------ Configuration for model training: model/src/* ------
# Device configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
torch.set_float32_matmul_precision('high')

# -- General dataset and data (images) params obtained from "model/data/scripts/dataset_eda.ipynb"
# Image crop transform measures
DIM_SIZE_FACTOR = 1

IMAGE_HEIGHTS_MEDIAN = int(224 * DIM_SIZE_FACTOR)
IMAGE_WIDTHS_MEDIAN = int(224 * DIM_SIZE_FACTOR)
IMAGE_CHANNELS = 3

# Images Distribution Parameters
IMAGE_MEAN = [0.45484897, 0.47033188, 0.47973604] # [0.51322499, 0.49685384, 0.49083403] # -- NOT USED
IMAGE_STD = [0.24885239, 0.24789241,  0.24780511] # [0.26715419, 0.26588872, 0.26546267] # -- NOT USED

# Numbers of samples used for dataset split
N_SAMPLES = 15513

# Number of classes (lables)
# N_CLASSES = 43


# -- Model's Training Phase Parameters
BATCH_SIZE = 128
NUM_WORKERS = 20
TRAIN_PROPORTION = 0.80
VAL_PROPORTION = 0.80
N_EPOCHS = 25
LEARNING_RATE = 1e-4
SEED = 42
EARLY_STOPPING_PATIENCE = 20
TRAINER_ACCELERATOR = 'gpu'
TRAINER_PRECISION = "16-mixed"


# -- Model's NAME

# Model name
MODEL_NAME = "VelocityEstimator_augmented_"+str(IMAGE_HEIGHTS_MEDIAN)+"_"+str(IMAGE_WIDTHS_MEDIAN)+"_"+str(N_SAMPLES)+"samples"


# -- Input Data CSV Params
# File from where data input paths will be extracted for model's train phase
IO_DATASET_MAP_LOCAL_PATH = "model/data/CSV/ciren_training_augmented_manifest.csv"

# Csv column from where image input paths and labels will be extracted
INPUT_IMAGES_CSV_INDEX = "image_relpath"
OUTPUT_LABEL_CSV_INDEX = "final_speed_kph"


# -- Lightning paths and params
# Lightning model's checkpoints path
CHECKPOINTS_DIR_PATH = "model/src/ModelCheckpoints/"

# Lightning model's training logs path 
TRAININGLOGS_DIR_PATH = "model/src/TrainingLogs"
os.makedirs(TRAININGLOGS_DIR_PATH, exist_ok = True)

# Ploted metrics dir path
METRICS_PLOTS_OUTPUT_DIR_PATH = "model/src/Metrics_Plots"
os.makedirs(METRICS_PLOTS_OUTPUT_DIR_PATH, exist_ok = True)

# Lightning logger: model's version to plot metrics.csv
METRICS_MODEL_VERSION_TO_PLOT = 0


# -- Model serialization paths
# Dir path for model serialized objects storage and dir existance verification
MODEL_SERIALIZED_DIR_PATH = "model/src/SerializedObjects"
os.makedirs(MODEL_SERIALIZED_DIR_PATH, exist_ok=True)

# Model serialized object "pth" path
MODEL_SERIALIZED_PATH = MODEL_SERIALIZED_DIR_PATH + "/" + MODEL_NAME + "_weights.pth"


# -- Model's Inference Phase Parameters
N_INFERENCES_2_EXEC = 9
OUTPUT_INFERENCES_DIR = "model/src/"+MODEL_NAME+"_OUTPUT_INFERENCES"
os.makedirs(OUTPUT_INFERENCES_DIR, exist_ok=True)


