# Import libraries and required modules
from model.config.libraries import *

class VelocityNetwork(nn.Module):

    def __init__(self, image_encoder, num_tabular_features, embedding_dim = 512):
        super().__init__()

        # Model's image encoder for image to embedding transformation
        self.image_encoder = image_encoder

        self.regressor = nn.Sequential(
            nn.Linear(
                embedding_dim + num_tabular_features,
                256
            ),
            nn.ReLU(),
            nn.Linear(256, 1)
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