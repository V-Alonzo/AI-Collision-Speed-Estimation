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
            load_dm = True
        ):

        # General class properties
        self.model = None
        self.learning_rate = None

        if load_dm:
            # Create DataModule
            self.dm  = VelocityEstimatorDataModule(
                annotations_file=CONFIG.IO_DATASET_MAP_LOCAL_PATH, 
                batch_size=batch_size, 
                num_workers=num_workers, 
                train_transform= Transformations.train_transform, 
                test_transform=  Transformations.test_transform, 
                train_proportion=train_proportion, 
                val_proportion=val_proportion,
                seed=seed
            )
        else:
            self.dm = None

    # Build backbone model (with pretrained params or not)
    def build_backbone_model(self, weights=None):
        # Create base resnet
        model = torch.hub.load(
            "pytorch/vision",
            "resnet50",
            weights=weights
        )

        return model
        
    # Build model
    def build_model(self, learning_rate):

        # ==== Backbone model (Existant arq or custom one) 
        resnet50_model = self.build_backbone_model(weights="IMAGENET1K_V2")

        # freeze layers as default
        for param in resnet50_model.parameters():
            param.requires_grad = False

        # Unfreeze last resnet layer
        for param in resnet50_model.layer4.parameters():
            param.requires_grad = True

        # Unfreeze resnet fc
        for param in resnet50_model.fc.parameters():
            param.requires_grad = True

        # Get number of features
        in_features = resnet50_model.fc.in_features

        # Replace final layer
        resnet50_model.fc = nn.Linear(
            in_features,
            1
        )

        # Instance VelocityEstimator lightning model and use resnet as backbone model
        velocityEstimatorModel = VelocityEstimatorModel(
            model = resnet50_model,
            learning_rate = learning_rate
        )

        return velocityEstimatorModel

    # Execute model training
    def train(
            self,
            image_channels = CONFIG.IMAGE_CHANNELS,
            epochs = 5,
            learning_rate = 1e-4
        ):

        self.learning_rate = learning_rate
        
        # Create new Model instance if this doesnt exist
        if self.model is None:
            # Create backbone model arq
            self.model = self.build_model(self.learning_rate)

        # Create VelocityEstimator's trainer
        self.trainer = L.Trainer(
            max_epochs = epochs,
            logger = CSVLogger(CONFIG.TRAININGLOGS_DIR_PATH, name = CONFIG.MODEL_NAME),
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
    def inference(self, image_path):
        # Verify model
        assert self.model is not None, "Model is not loaded or Training Phase is missing"

        # Eval mode
        self.model.eval()

        # Load image
        image = Image.open(image_path).convert("RGB")

        # Apply transforms
        transformed_image = Transformations.test_transform(image)

        # Add batch dimension
        transformed_image = transformed_image.unsqueeze(0)

        # Move to device
        transformed_image = transformed_image.to(CONFIG.DEVICE)

        # Disable gradients
        with torch.no_grad():

            # Execute inference
            prediction = self.model(transformed_image)

            # Remove dimensions
            prediction = prediction.squeeze()

            # Tensor to python float
            prediction = prediction.item()

        return prediction
    
    
    # Method for loading pretrained VelocityEstimator model from serialized file
    def load_model(self, serialized_object_path=CONFIG.MODEL_SERIALIZED_DIR_PATH):

        # Create base resnet
        resnet50_model = self.build_backbone_model(weights=None)

        # Replace FC exactly as in training
        in_features = resnet50_model.fc.in_features
        resnet50_model.fc = nn.Linear(
            in_features,
            1
        )

        # Create lightning module
        velocityEstimatorModel = VelocityEstimatorModel(
            model=resnet50_model,
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
        # ==== Inital model (Existant arq or custom one) 
        resnet50_model_transfer_learning = torch.hub.load("pytorch/vision", "resnet50", weights=None)

        # Specify learning rate    
        self.learning_rate = learning_rate

        # Load LightningModule from checkpoint
        velocityEstimatorModel = VelocityEstimatorModel.load_from_checkpoint(
            checkpoint_path,
            model=resnet50_model_transfer_learning,
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
        # Get traiing batch for visualization
        images = next(iter(self.dm.train_dataloader()))

        # Show n images
        plt.figure(figsize=(10, 8))
        plt.axis("off")
        plt.title("Training batch")

        # Create torch grid
        grid = torchvision.utils.make_grid(
            images[:n],   
            nrow=int(n * 0.35),       
            padding=2,
            pad_value=1.0,
            normalize=True
        )

        # Tranform tensors to arrays correct format for plt visualization
        plt.imshow(np.transpose(grid, (1, 2, 0)))
        plt.show()

        # Save images
        out_path = os.path.join(CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH, CONFIG.MODEL_NAME+"training_batch_grid.png")
        plt.savefig(out_path, dpi=150)
        plt.close()