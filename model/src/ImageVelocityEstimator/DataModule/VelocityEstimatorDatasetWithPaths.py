# Import libraries and required modules
from model.src.ImageVelocityEstimator.DataModule.VelocityEstimatorDataset import (
    VelocityEstimatorDataset
)
from model.src.ImageVelocityEstimator.DataModule import Transformations
from model.config.ImageVelocityEstimator.config import CONFIG
from model.config.libraries import *

"""
    Dataset wrapper that additionally returns
    the original image path for each sample.
"""
class VelocityEstimatorDatasetWithPaths(VelocityEstimatorDataset):
    
    def __getitem__(self, idx):

        # Image path
        sample_input_img_path = self.df.loc[
            idx,
            CONFIG.INPUT_IMAGES_CSV_INDEX
        ]

        # Load image
        sample_input_image = Image.open(
            sample_input_img_path
        ).convert("RGB")

        # Target label
        sample_label = float(
            self.df.loc[
                idx,
                CONFIG.OUTPUT_LABEL_CSV_INDEX
            ]
        )

        # Apply transforms
        if self.transform:
            sample_input_image = self.transform(
                sample_input_image
            )

        return (
            sample_input_image,
            sample_label,
            sample_input_img_path
        )
    

# Create dataloader over the complete dataset
def full_dataloader():

    dataset = VelocityEstimatorDatasetWithPaths(
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