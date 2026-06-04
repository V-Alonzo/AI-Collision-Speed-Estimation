# Import libraries and required modules
from model.config.libraries import *

class VelocityNetwork(nn.Module):

    def __init__(self, backbone):
        super().__init__()

        # Model's backbone: Resnet Arq
        self.backbone = nn.Sequential(
            *list(backbone.children())[:-1]
        )

        # Get in_features from the output of the last resnet layer before fc
        self.fc_in_features = backbone.fc.in_features

        self.embedding_head = nn.Sequential(
            nn.Linear(self.fc_in_features, 1024),
            nn.BatchNorm1d(1024),
            nn.GELU(),
            nn.Dropout(0.2),

            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.3)
        )

        self.regression_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Dropout(0.2),

            nn.Linear(128, 1)
        )
    

    def get_embedding(self, x):

        features = self.backbone(x)

        features = torch.flatten(features, 1)

        embedding = self.embedding_head(features)

        embedding = F.normalize(
            embedding,
            p=2,
            dim=1
        )

        return embedding
    
    def forward(self, x):

        embedding = self.get_embedding(x)

        return self.regression_head(
            embedding
        )