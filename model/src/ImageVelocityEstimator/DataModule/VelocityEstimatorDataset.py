# Import libraries and required modules
from torch.utils.data import Dataset
from model.config.ImageVelocityEstimator.config import CONFIG
from model.config.libraries import *


# Pico banana dataset loader
class VelocityEstimatorDataset(Dataset):
    # Class constructor
    def __init__(self, annotations_file = CONFIG.IO_DATASET_MAP_LOCAL_PATH, transform=None):
        # Annotation file as pandas df
        self.df = pd.read_csv(annotations_file)

        # Remove samples without target
        self.df = self.df.dropna(
            subset=[CONFIG.OUTPUT_LABEL_CSV_INDEX]
        ).reset_index(drop=True)

        self.transform = transform

    # Get dataset n_samples
    def __len__(self):
        return len(self.df)

    # Get next iterator item
    def __getitem__(self, idx):
        # Extract input image path
        sample_input_img_path = self.df.loc[idx, CONFIG.INPUT_IMAGES_CSV_INDEX]
        sample_input_image = Image.open(sample_input_img_path).convert("RGB")

        # Label
        sample_label = float(self.df.loc[idx, CONFIG.OUTPUT_LABEL_CSV_INDEX])

        # Apply transformation
        if self.transform:
            sample_input_image = self.transform(sample_input_image)

        return sample_input_image, sample_label
