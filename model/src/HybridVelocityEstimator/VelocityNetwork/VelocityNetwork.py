# Import libraries and required modules
from model.config.libraries import *

class VelocityNetwork(nn.Module):

    def __init__(self, image_encoder, num_tabular_features, embedding_dim = 512):
        super().__init__()

        # Model's image encoder for image to embedding transformation
        self.image_encoder = image_encoder

        self.regressor = nn.Sequential(
            nn.Linear(embedding_dim + num_tabular_features, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.2),

            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.GELU(),
            nn.Dropout(0.2),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),

            nn.Linear(128, 64),
            nn.GELU(),

            nn.Linear(64, 1)
        )
    
    def forward(self, image, tabular_features):
        # Transform image to embedding 
        with torch.no_grad():
            embedding = self.image_encoder.get_embedding(
                image
            )

        # Concat features
        x = torch.cat(
            [
                embedding,
                tabular_features
            ],
            dim=1
        )

        return self.regressor(x)