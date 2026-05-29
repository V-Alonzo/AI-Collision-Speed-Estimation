# Import libraries and required modules
from torch.utils.data import Dataset
from model.config.TabularVelocityEstimator.config import CONFIG
from model.config.libraries import *


# Tabular dataset loader
class VelocityEstimatorDataset(Dataset):
    # Class constructor
    def __init__(
        self,
        features_df=None,
        target_df=None,
        features_path=CONFIG.TABULAR_FEATURES_PATH,
        target_path=CONFIG.TABULAR_TARGET_PATH,
        transform=None
    ):
        if features_df is None:
            features_df = pd.read_csv(features_path)
        if target_df is None:
            target_df = pd.read_csv(target_path)

        if len(features_df) != len(target_df):
            raise ValueError("Features and target CSVs must have the same number of rows.")

        self.features_df = features_df.reset_index(drop=True)
        self.target_df = target_df.reset_index(drop=True)
        self.transform = transform

    # Get dataset n_samples
    def __len__(self):
        return len(self.features_df)

    # Get next iterator item
    def __getitem__(self, idx):
        features = self.features_df.iloc[idx].to_numpy(dtype=np.float32)
        target = self.target_df.iloc[idx].to_numpy(dtype=np.float32)

        if target.ndim > 0:
            target = target.squeeze()

        features_tensor = torch.tensor(features, dtype=torch.float32)
        target_tensor = torch.tensor(target, dtype=torch.float32)

        if self.transform:
            features_tensor = self.transform(features_tensor)

        return features_tensor, target_tensor
