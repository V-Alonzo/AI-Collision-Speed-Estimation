import torch
import torch.nn.functional as F
from torch import nn
from torchvision.models import resnet50


class VelocityNetworkV1(nn.Module):
    def __init__(self, backbone: nn.Module):
        super().__init__()

        self.backbone = nn.Sequential(*list(backbone.children())[:-1])

        fc_in_features = backbone.fc.in_features
        if fc_in_features != 2048:
            raise ValueError(
                "Unexpected ResNet50 backbone output size. "
                f"Expected 2048, got {fc_in_features}."
            )

        self.embedding_head = nn.Sequential(
            nn.Linear(fc_in_features, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.3),
        )

        self.regression_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
        )

    def get_embedding(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        features = torch.flatten(features, 1)
        embedding = self.embedding_head(features)
        return F.normalize(embedding, p=2, dim=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        embedding = self.get_embedding(x)
        return self.regression_head(embedding)


def build_velocity_network_v1() -> VelocityNetworkV1:
    backbone = resnet50(weights=None)
    return VelocityNetworkV1(backbone)