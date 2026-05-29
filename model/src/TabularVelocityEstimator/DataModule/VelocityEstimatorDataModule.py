# Import libraries and required modules
from torch.utils.data import DataLoader
from model.src.TabularVelocityEstimator.DataModule.VelocityEstimatorDataset import VelocityEstimatorDataset
from model.config.libraries import *
from model.config.TabularVelocityEstimator.config import CONFIG


# Data Module for dataloader creation
class VelocityEstimatorDataModule(L.LightningDataModule):
    # Class constructor
    def __init__(
            self, 
            features_path,
            target_path,
            batch_size=64, 
            num_workers=0, 
            train_transform=None, 
            test_transform=None, 
            train_proportion = 0.8, 
            val_proportion = 0.8, 
            seed = 42
            ):
        super().__init__()

        # General class properties
        self.batch_size = batch_size
        self.features_path = features_path
        self.target_path = target_path
        self.num_workers = num_workers
        self.seed = seed

        # Transform Pipelines 
        self.train_transform = train_transform
        self.test_transform = test_transform

        # Split proportions
        self.val_proportion = val_proportion
        self.train_proportion = train_proportion

        # Create dataloaders
        self.prepare_data()
        self.setup()

    # Method for dataset's subsets creation
    def setup(self, stage=None):
        # Load full dataset once
        features_df = pd.read_csv(self.features_path)
        target_df = pd.read_csv(self.target_path)

        if len(features_df) != len(target_df):
            raise ValueError("Features and target CSVs must have the same number of rows.")

        n_samples = len(features_df)
        self.input_dim = features_df.shape[1]

        # Compute correct split's dimensions
        train_size = int(n_samples * self.train_proportion)
        test_size = n_samples - train_size
        val_size = int(train_size * (1 - self.val_proportion))
        train_size = train_size - val_size

        print(f"Split sizes -> Train: {train_size}, Val: {val_size}, Test: {test_size}")

        # Use data generator with specific seed
        generator = torch.Generator().manual_seed(self.seed)

        # Execute random split with computed index
        train_idx, val_idx, test_idx = torch.utils.data.random_split(
            range(n_samples),
            [train_size, val_size, test_size],
            generator=generator
        )
        
        # Create datasets with its transformation
        self.train = VelocityEstimatorDataset(
            features_df=features_df,
            target_df=target_df,
            transform=self.train_transform
        )
        self.valid = VelocityEstimatorDataset(
            features_df=features_df,
            target_df=target_df,
            transform=self.test_transform
        )
        self.test = VelocityEstimatorDataset(
            features_df=features_df,
            target_df=target_df,
            transform=self.test_transform
        )

        # Subsets extraction according to computed random splits
        self.train = torch.utils.data.Subset(self.train, train_idx.indices)
        self.valid = torch.utils.data.Subset(self.valid, val_idx.indices)
        self.test = torch.utils.data.Subset(self.test, test_idx.indices)

    # Training dataloader
    def train_dataloader(self):
        train_loader = DataLoader(
            dataset=self.train,
            batch_size=self.batch_size,
            drop_last=True,
            shuffle=True,
            num_workers=self.num_workers,
        )
        return train_loader

    # Validation Dataloader
    def val_dataloader(self):
        valid_loader = DataLoader(
            dataset=self.valid,
            batch_size=self.batch_size,
            drop_last=False,
            shuffle=False,
            num_workers=self.num_workers,
        )
        return valid_loader

    # Test Dataloader
    def test_dataloader(self):
        test_loader = DataLoader(
            dataset=self.test,
            batch_size=self.batch_size,
            drop_last=False,
            shuffle=False,
            num_workers=self.num_workers,
        )
        return test_loader