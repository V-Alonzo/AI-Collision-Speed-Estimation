# Import libraries and required modules
from torch.utils.data import Dataset
from model.config.HybridVelocityEstimator.config import CONFIG
from model.src.HybridVelocityEstimator.DataModule import Transformations
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

        # Data transformations
        self.transform = transform

        # Set feature columns
        self.feature_columns = CONFIG.TABULAR_FEATURE_COLUMNS

        # Validate for missing features
        missing_features = [col for col in CONFIG.TABULAR_FEATURE_COLUMNS if col not in self.df.columns]

        if missing_features:
            raise ValueError(
                f"Missing tabular features: {missing_features}"
            )

    # Get dataset n_samples
    def __len__(self):
        return len(self.df)

    # Get next iterator item
    def __getitem__(self, idx):
        # Extract input image path
        sample_input_img_path = self.df.loc[idx, CONFIG.INPUT_IMAGES_CSV_INDEX]
        sample_input_image = Image.open(sample_input_img_path).convert("RGB")

        # Label
        sample_label = torch.tensor(
            self.df.loc[idx, CONFIG.OUTPUT_LABEL_CSV_INDEX],
            dtype=torch.float32
        )

        # Tabular features 
        sample_tabular_features = torch.tensor(
            self.df.loc[idx, self.feature_columns].values,
            dtype=torch.float32
        )
        
        # Apply transformation
        if self.transform:
            sample_input_image = self.transform(sample_input_image)

        # Return 
        #      Tensor [3,H,W]    Tensor [num_features]   Tensor    
        return sample_input_image, sample_tabular_features, sample_label

# Create dataloader over the complete dataset
def full_dataloader():

    dataset = VelocityEstimatorDataset(
        annotations_file=CONFIG.IO_DATASET_MAP_LOCAL_PATH,
        transform=Transformations.test_transform,
    )

    return DataLoader(
        dataset,
        batch_size=CONFIG.BATCH_SIZE,
        shuffle=False,
        num_workers=CONFIG.NUM_WORKERS,
        pin_memory=True
    )