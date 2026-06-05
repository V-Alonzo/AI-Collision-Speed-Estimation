# == VelocityEstimator model as lightning Module

# Import required modules and libraries
from model.config.libraries import *
#from model.config.config import N_CLASSES

# VelocityEstimator Model Condiguration with Lightning tools
class VelocityEstimatorModel(L.LightningModule):
    # Class constructor
    def __init__(self, model, learning_rate=1e-4):
        super().__init__()

        # General properties
        self.learning_rate = learning_rate
        self.model = model

        # Metrics
        self.train_mae = torchmetrics.MeanAbsoluteError()
        self.val_mae = torchmetrics.MeanAbsoluteError()
        self.test_mae = torchmetrics.MeanAbsoluteError()

    # Compute Model Forward
    def forward(self, x):
        return self.model(x)
    
    # Model's shared steps (for both training/val phases)
    # Forward and loss computation
    def shared_step(self, batch):
        features, true_labels = batch
        
        # --- Get prediction
        true_labels = true_labels.float()
        predicted_labels = self(features).squeeze(-1)

        # --- Loss
        loss = F.smooth_l1_loss(predicted_labels, true_labels)

        return loss, true_labels, predicted_labels
    
    # Execute training step and store loss 
    def training_step(self, batch, batch_idx):
        # Execute model's shared steps
        loss, true_labels, predicted_labels = self.shared_step(batch)

        # Log computed loss
        self.log("train_loss", loss, on_epoch=True, prog_bar=True, logger=True)
        
        # --- MAE Computation
        self.train_mae(predicted_labels, true_labels)
        self.log("train_mae", self.train_mae, prog_bar=True, on_epoch=True, on_step=False)
        return loss

    
    # Execute validation step and store loss 
    def validation_step(self, batch, batch_idx):
        # Execute model's shared steps
        loss, true_labels, predicted_labels = self.shared_step(batch)

        # Log computed loss
        self.log("val_loss", loss, on_epoch=True, prog_bar=True, logger=True)
        
        # --- Accuracy Computation
        self.val_mae(predicted_labels, true_labels)
        self.log("val_mae", self.val_mae, prog_bar=True, on_epoch=True, on_step=False)

        return loss
    
    # Execute testing step and store loss 
    def test_step(self, batch, batch_idx):
        with torch.no_grad():
            # Execute model's shared steps 
            loss, true_labels, predicted_labels = self.shared_step(batch)
            
            # --- Accuracy Computation
            self.test_mae(predicted_labels, true_labels)
            self.log("test_mae", self.test_mae, prog_bar=True, on_epoch=True, on_step=False)

    # Configure Model Optimizer
    def configure_optimizers(self):
        # Configure optimizer as AdamW with specified learning rate
        optimizer = torch.optim.AdamW(
            self.parameters(),
            lr=self.learning_rate
        )
        return optimizer
