# Import libraries and required modules
from model.config.libraries import *
from model.config.ImageVelocityEstimator.config import CONFIG
from model.src.ImageVelocityEstimator.DataModule.VelocityEstimatorDataModule import VelocityEstimatorDataModule
from model.src.ImageVelocityEstimator.DataModule import Transformations
from model.src.ImageVelocityEstimator.LightningModule.VelocityEstimatorModel import VelocityEstimatorModel
from model.src.ImageVelocityEstimator.VelocityNetwork.VelocityNetwork import VelocityNetwork

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
        self.lightningModel = None
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
    
    # Build EmbeddingHead/fc
    def build_fc(self, backbone_model):
        return VelocityNetwork(backbone_model)
        
    # Build model
    def build_model(self, learning_rate):
        
        # ============ Model Arq ============

        # ==== Backbone model (Existant arq or custom one) 
        resnet50_model = self.build_backbone_model(weights="IMAGENET1K_V2")

        # freeze layers as default
        for param in resnet50_model.parameters():
            param.requires_grad = False

        # Unfreeze last resnet layer
        for param in resnet50_model.layer4.parameters():
            param.requires_grad = True

        # Build final model arquitecture
        model_arq = self.build_fc(backbone_model= resnet50_model)

        # ============ END Model Arq ============

        # Instance VelocityEstimator lightning model and use resnet as backbone model
        velocityEstimatorModel = VelocityEstimatorModel(
            model = model_arq,
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
        if self.lightningModel is None:
            # Create backbone model arq
            self.lightningModel = self.build_model(self.learning_rate)

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
            model = self.lightningModel,
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
    # This method uses as input the desired image_path to use for inference
    # This method can return: (embedding_representation_of_a_given_image, velocity_estimation_scalar)
    #           Or          : (null, velocity_estimation_scalar)
    def inference(self, image_path, return_embedding = False):
        # Verify model
        assert self.lightningModel is not None, "Model is not loaded or Training Phase is missing"

        # Eval mode
        self.lightningModel.eval()

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
            if return_embedding:
                # Execute inference with embedding return and velocity estimation scalar
                # Get embedding directly from VelocityNetwork's get_embedding method
                embedding = self.lightningModel.get_embedding(transformed_image)

                # Execute direcet regression inference
                prediction = self.lightningModel(transformed_image)

                # Remove embedding overdimention and move tensor to cpu
                embedding = embedding.squeeze(0).cpu()

                # Remove dimensions
                prediction = prediction.squeeze()

                # Tensor to python float
                prediction = prediction.item()

                return embedding, prediction
            else:
                # Execute inference and return only velocity estimation scalar value
                prediction = self.lightningModel(transformed_image)

                # Remove dimensions
                prediction = prediction.squeeze()

                # Tensor to python float
                prediction = prediction.item()

                return None, prediction
    
    # Method for executing inference with an image batch where :
    #           batch_images = [N_Batch, n_Image_Channels, Height, Width]
    def inference_batch(self, batch_images, return_embedding=False ):
        # Verify model
        assert self.lightningModel is not None, "Model is not loaded or Training Phase is missing"

        # Eval mode
        self.lightningModel.eval()

        # Load image
        batch_images = batch_images.to(CONFIG.DEVICE)

        # Disable gradients
        with torch.no_grad():
            # Execute inference
            if return_embedding:
                # Execute inference with embedding return and velocity estimation scalar
                # Get embedding directly from VelocityNetwork's get_embedding method
                embeddings = self.lightningModel.get_embedding(batch_images)

                # Execute direcet regression inference
                predictions = self.lightningModel(batch_images)

                return (
                    embeddings.cpu(),
                    predictions.squeeze(1).cpu()
                )
            
            # Execute inference and return only velocity estimation scalar value
            predictions = self.lightningModel(batch_images)

            return predictions.squeeze(1).cpu()

    # Method for loading pretrained VelocityEstimator model from serialized file
    def load_model(self, serialized_object_path=CONFIG.MODEL_SERIALIZED_DIR_PATH):

        # Create base resnet
        resnet50_model = self.build_backbone_model(weights=None)

        # Build final model arquitecture exactly as in training
        model_arq = self.build_fc(backbone_model= resnet50_model)

        # Create lightning module
        velocityEstimatorModel = VelocityEstimatorModel(
            model=model_arq,
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
        self.lightningModel = velocityEstimatorModel

        # Move to device
        self.lightningModel.to(CONFIG.DEVICE)

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
        self.lightningModel = velocityEstimatorModel

        # Save serialized Model as object 
        torch.save(self.lightningModel.state_dict(), CONFIG.MODEL_SERIALIZED_DIR_PATH)

        # Send Model to proper device
        self.lightningModel.to(CONFIG.DEVICE)

        print(f"Model loaded from checkpoint path : {checkpoint_path}")

        return True

    # Method for saving model as serialized object
    def save_model(self, serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_DIR_PATH):
        torch.save(self.lightningModel.state_dict(), serialized_object_path_destination)
        return True
    
    # Method for getting model's architecture
    def get_model_architecture(self):

        assert self.lightningModel is not None, "Model has not been created"

        architecture = {
            "lightning_module": self.lightningModel.__class__.__name__,
            "total_parameters": sum(
                p.numel() for p in self.lightningModel.parameters()
            ),
            "trainable_parameters": sum(
                p.numel()
                for p in self.lightningModel.parameters()
                if p.requires_grad
            ),
            "model_structure": str(self.lightningModel)
        }

        return architecture

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