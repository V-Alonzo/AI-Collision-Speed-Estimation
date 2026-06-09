# Import libraries and required modules
from model.config.libraries import *
from model.src.TabularVelocityEstimator.DataModule.VelocityEstimatorDataModule import VelocityEstimatorDataModule
from model.src.TabularVelocityEstimator.DataModule import Transformations
from model.config.TabularVelocityEstimator.config import CONFIG
from model.src.TabularVelocityEstimator.LightningModule.VelocityEstimatorModel import VelocityEstimatorModel

# Import lightning tools
from lightning.pytorch.loggers import CSVLogger
from lightning.pytorch.callbacks import ModelCheckpoint
from lightning.pytorch.callbacks.early_stopping import EarlyStopping


# VelocityEstimator main class implementation 
class VelocityEstimator:
    def __init__(
            self,
            batch_size = 64, 
            num_workers = 4, 
            train_proportion = 0.8, 
            val_proportion = 0.8,
            seed = 42,
            load_dm = True,
            input_dim = None
        ):

        # General class properties
        self.model = None
        self.learning_rate = None

        self.input_dim = input_dim

        if load_dm:
            # Create DataModule
            self.dm  = VelocityEstimatorDataModule(
                features_path=CONFIG.TABULAR_FEATURES_PATH,
                target_path=CONFIG.TABULAR_TARGET_PATH,
                batch_size=batch_size,
                num_workers=num_workers,
                train_transform=Transformations.train_transform,
                test_transform=Transformations.test_transform,
                train_proportion=train_proportion,
                val_proportion=val_proportion,
                seed=seed
            )
            self.input_dim = self.dm.input_dim
        else:
            self.dm = None

    # Build backbone model for tabular data
    def build_backbone_model(self, input_dim):
        layers = []
        prev_dim = input_dim
        for hidden_dim in CONFIG.TABULAR_HIDDEN_DIMS:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.ReLU())
            if CONFIG.TABULAR_DROPOUT > 0:
                layers.append(nn.Dropout(CONFIG.TABULAR_DROPOUT))
            prev_dim = hidden_dim

        layers.append(nn.Linear(prev_dim, 1))
        return nn.Sequential(*layers)
        
    # Build model
    def build_model(self, learning_rate, input_dim):

        backbone_model = self.build_backbone_model(input_dim)

        velocityEstimatorModel = VelocityEstimatorModel(
            model=backbone_model,
            learning_rate=learning_rate
        )

        return velocityEstimatorModel

    # Execute model training
    def train(
            self,
            epochs = 5,
            learning_rate = 1e-4
        ):

        self.learning_rate = learning_rate
        
        # Create new Model instance if this doesnt exist
        if self.model is None:
            input_dim = self._resolve_input_dim()
            self.model = self.build_model(self.learning_rate, input_dim)

        # Create VelocityEstimator's trainer
        self.trainer = L.Trainer(
            max_epochs = epochs,
            logger = CSVLogger(CONFIG.TRAININGLOGS_DIR_PATH),
            callbacks=[
                EarlyStopping(monitor="val_loss", mode="min", patience=CONFIG.EARLY_STOPPING_PATIENCE),
                ModelCheckpoint(monitor="val_loss", mode="min", save_top_k=1, dirpath=CONFIG.CHECKPOINTS_DIR_PATH, filename="best_model_"+CONFIG.MODEL_NAME)
                ],
            accelerator = CONFIG.TRAINER_ACCELERATOR,
            devices=1,
            precision= CONFIG.TRAINER_PRECISION,
            log_every_n_steps=5
        )

        # Execute model's training step
        self.trainer.fit(
            model = self.model,
            train_dataloaders = self.dm.train_dataloader(),
            val_dataloaders = self.dm.val_dataloader()
        )

    # Test last epoch model's checkpoint with datamodule's test dataset
    def test(self):
        self.trainer.test(
            datamodule=self.dm,
            ckpt_path="last" # {last, best}
        )

    # Method for executing inference with the trained model
    def inference(self, input_features):
        # Verify model
        assert self.model is not None, "Model is not loaded or Training Phase is missing"

        # Eval mode
        self.model.eval()

        if isinstance(input_features, pd.DataFrame):
            features = input_features.to_numpy(dtype=np.float32)
        elif isinstance(input_features, np.ndarray):
            features = input_features.astype(np.float32)
        elif torch.is_tensor(input_features):
            features = input_features.float().cpu().numpy()
        else:
            features = np.asarray(input_features, dtype=np.float32)

        if features.ndim == 1:
            features = np.expand_dims(features, axis=0)

        features_tensor = torch.tensor(features, dtype=torch.float32).to(CONFIG.DEVICE)

        with torch.no_grad():
            predictions = self.model(features_tensor).squeeze(-1)

        return predictions.cpu().numpy()
    
    
    # Method for loading pretrained VelocityEstimator model from serialized file
    def load_model(self, serialized_object_path=CONFIG.MODEL_SERIALIZED_PATH):

        input_dim = self._resolve_input_dim()

        if self.learning_rate is None:
            self.learning_rate = CONFIG.LEARNING_RATE

        # Create lightning module
        velocityEstimatorModel = VelocityEstimatorModel(
            model=self.build_backbone_model(input_dim),
            learning_rate=self.learning_rate
        )

        # Load weights
        velocityEstimatorModel.load_state_dict(
            torch.load(
                serialized_object_path,
                map_location=CONFIG.DEVICE
            )
        )

        # Save model
        self.model = velocityEstimatorModel

        # Move to device
        self.model.to(CONFIG.DEVICE)

        print(f"Model loaded from: {serialized_object_path}")

        return True
    
    # Method for loading model form lightning chekpoint (for posterior retraining)
    def load_from_checkpoint(self, checkpoint_path, learning_rate=1e-4):
        input_dim = self._resolve_input_dim()

        # Specify learning rate
        self.learning_rate = learning_rate

        # Load LightningModule from checkpoint
        velocityEstimatorModel = VelocityEstimatorModel.load_from_checkpoint(
            checkpoint_path,
            model=self.build_backbone_model(input_dim),
            learning_rate=self.learning_rate
        )

        # Set model as actual
        self.model = velocityEstimatorModel

        # Save serialized Model as object 
        torch.save(self.model.state_dict(), CONFIG.MODEL_SERIALIZED_DIR_PATH)

        # Send Model to proper device
        self.model.to(CONFIG.DEVICE)

        print(f"Model loaded from checkpoint path : {checkpoint_path}")

        return True

    # Method for saving model as serialized object
    def save_model(self, serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_DIR_PATH):
        torch.save(self.model.state_dict(), serialized_object_path_destination)
        return True

    # Method for showing a train dataloader's batch  -- Missing correction
    def show_batch(self, n):
        if self.dm is None:
            raise ValueError("DataModule is not loaded.")

        batch = next(iter(self.dm.train_dataloader()))
        features, labels = batch
        print("Batch features shape:", features.shape)
        print("Batch labels shape:", labels.shape)
        print("Sample labels:", labels[:n].cpu().numpy())

    def _resolve_input_dim(self):
        if self.input_dim is not None:
            return self.input_dim
        if self.dm is not None and hasattr(self.dm, "input_dim"):
            return self.dm.input_dim
        raise ValueError("Input dimension is required when DataModule is not loaded.")