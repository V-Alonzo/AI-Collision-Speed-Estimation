# Import libraries and required modules
from model.config.libraries import *
from model.src.DataModule.VelocityEstimatorDataModule import VelocityEstimatorDataModule
from model.src.DataModule import Transformations
from model.config.config import IO_DATASET_MAP_LOCAL_PATH, DEVICE
from model.config.config import CHECKPOINTS_DIR_PATH, TRAININGLOGS_DIR_PATH, MODEL_NAME, MODEL_SERIALIZED_PATH
from model.config.config import IMAGE_CHANNELS
from model.config.config import EARLY_STOPPING_PATIENCE, TRAINER_ACCELERATOR, TRAINER_PRECISION, METRICS_PLOTS_OUTPUT_DIR_PATH
from model.src.LightningModule.VelocityEstimatorModel import VelocityEstimatorModel

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
                annotations_file=IO_DATASET_MAP_LOCAL_PATH, 
                batch_size=batch_size, 
                num_workers=num_workers, 
                train_transform= Transformations.train_transform, 
                test_transform= Transformations.test_transform, 
                train_proportion=train_proportion, 
                val_proportion=val_proportion,
                seed=seed
            )
        else:
            self.dm = None

    # Execute model training
    def train(
            self,
            image_channels = IMAGE_CHANNELS,
            epochs = 5,
            learning_rate = 1e-4
        ):

        self.learning_rate = learning_rate
        
        # Create new Model instance if this doesnt exist
        if self.model is None:
            
            # ==== Inital model (Existant arq or custom one) 
            resnet50_model = torch.hub.load("pytorch/vision", "resnet50", weights="IMAGENET1K_V2")

            # freeze layers
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

            # Instance VelocityEstimator lightning model
            velocityEstimatorModel = VelocityEstimatorModel(
                model = resnet50_model,
                learning_rate = learning_rate
            )

            self.model = velocityEstimatorModel

        # Create picobanana's trainer
        self.trainer = L.Trainer(
            max_epochs = epochs,
            logger = CSVLogger(TRAININGLOGS_DIR_PATH, name = MODEL_NAME),
            callbacks=[
                EarlyStopping(monitor="val_loss", mode="min", patience=EARLY_STOPPING_PATIENCE),
                ModelCheckpoint(monitor="val_loss", mode="min", save_top_k=1, dirpath=CHECKPOINTS_DIR_PATH, filename="best_model_"+MODEL_NAME)
                ],
            accelerator = TRAINER_ACCELERATOR,
            devices=1,
            precision= TRAINER_PRECISION
        )

        # Execute model's training step
        self.trainer.fit(
            model = self.model,
            train_dataloaders = self.dm.train_dataloader(),
            val_dataloaders = self.dm.val_dataloader()
        )

    def test(self):
        self.trainer.test(datamodule=self.dm)

    # Method for generating new images with trained model
    def inference(self):
        # Verify if there is a model loaded
        assert self.model is not None, "Training Phase is missing for model's inference mode" 

        # Results
        self.trainer.test(datamodule=self.dm)
        
    # Method for loading pretrained VelocityEstimator model
    def load_model(self, serialized_object_path = MODEL_SERIALIZED_PATH):
        # ==== Inital model (Existant arq or custom one) 
        resnet50_model_transfer_learning = torch.hub.load("pytorch/vision", "resnet50", weights=None)

        # Instance VelocityEstimator lightning model
        velocityEstimatorModel = VelocityEstimatorModel(
            model = resnet50_model_transfer_learning,
            learning_rate = self.learning_rate
        )

        # Load weights from serialized object
        velocityEstimatorModel.load_state_dict(torch.load(serialized_object_path))

        # Assign Loaded model
        self.model = velocityEstimatorModel

        # Send model to proper device
        self.model.to(DEVICE)

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
        torch.save(self.model.state_dict(), MODEL_SERIALIZED_PATH)

        # Send Model to proper device
        self.model.to(DEVICE)

        print(f"Model loaded from checkpoint path : {checkpoint_path}")

        return True

    # Method for saving model as serialized object
    def save_model(self, serialized_object_path_destination = MODEL_SERIALIZED_PATH):
        torch.save(self.model.state_dict(), serialized_object_path_destination)
        return True

    # Method for showing a train dataloader's batch
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
        out_path = os.path.join(METRICS_PLOTS_OUTPUT_DIR_PATH, MODEL_NAME+"training_batch_grid.png")
        plt.savefig(out_path, dpi=150)
        plt.close()