# Import libraries and required modules
from model.src.HybridVelocityEstimator.DataModule.VelocityEstimatorDataset import VelocityEstimatorDataset
from model.config.libraries import *
from model.config.HybridVelocityEstimator.config import CONFIG


# Data Module for dataloader creation
class VelocityEstimatorDataModule(L.LightningDataModule):
    # Class constructor
    def __init__(
            self, 
            annotations_file, 
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
        self.annotations_file = annotations_file
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
        # Compute correct split's dimensions
        train_size = int(CONFIG.N_SAMPLES * self.train_proportion)
        test_size = CONFIG.N_SAMPLES - train_size
        val_size = int(train_size * (1 - self.val_proportion))
        train_size = train_size - val_size

        print(f"Split sizes -> Train: {train_size}, Val: {val_size}, Test: {test_size}")

        # Use data generator with specific seed
        generator = torch.Generator().manual_seed(self.seed)

        # Execute random split with computed index
        train_idx, val_idx, test_idx = torch.utils.data.random_split(
            range(CONFIG.N_SAMPLES),
            [train_size, val_size, test_size],
            generator=generator
        )
        
        # Create datasets with its transformation
        self.train = VelocityEstimatorDataset(self.annotations_file, transform=self.train_transform)
        self.valid = VelocityEstimatorDataset(self.annotations_file, transform=self.test_transform)
        self.test = VelocityEstimatorDataset(self.annotations_file, transform=self.test_transform)

        # Subsets extraction according to computed random splits
        self.train = torch.utils.data.Subset(self.train, train_idx.indices)
        self.valid = torch.utils.data.Subset(self.valid, val_idx.indices)
        self.test = torch.utils.data.Subset(self.test, test_idx.indices)

        # -------------------------
        # TRAIN LABELS FOR SAMPLER
        # -------------------------
        self.train_labels = np.array([
            self.train.dataset.df.loc[i, CONFIG.OUTPUT_LABEL_CSV_INDEX]
            for i in self.train.indices
        ])

        bins = [0,20,40,60,80,100,200]

        bin_ids = np.digitize(
            self.train_labels,
            bins
        )

        bin_counts = np.bincount(bin_ids)

        weights = 1.0 / bin_counts[bin_ids]

        self.sample_weights = torch.DoubleTensor(weights)

    # Training dataloader
    def train_dataloader(self):
        sampler = WeightedRandomSampler(
            weights=self.sample_weights,
            num_samples=len(self.sample_weights),
            replacement=True
        )

        train_loader = DataLoader(
            dataset=self.train,
            batch_size=self.batch_size,
            sampler=sampler,
            drop_last=True,
            num_workers=self.num_workers,
        )

        # train_loader = DataLoader(
        #     dataset=self.train,
        #     batch_size=self.batch_size,
        #     drop_last=True,
        #     shuffle=True,
        #     num_workers=self.num_workers,
        # )
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