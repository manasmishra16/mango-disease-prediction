"""
Mango Leaf Domain Gate Classifier.
Binary classifier using MobileNetV3-Small to determine whether an image is a Mango Leaf (1)
or Not a Mango Leaf (0 - other plant leaves, household objects, faces, paper, furniture, etc.).
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T
from PIL import Image


class MangoDomainGate(nn.Module):
    """
    Lightweight Domain Gate Classifier.
    Evaluates whether an input image belongs to the Mango Leaf domain.
    """
    def __init__(self, pretrained: bool = True):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        base = models.mobilenet_v3_small(weights=weights)
        
        # Backbone feature extractor (outputs 576-dim feature vector)
        self.features = base.features
        self.avgpool = base.avgpool
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(576, 128),
            nn.Hardswish(inplace=True),
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(128, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.classifier(x)
        return logits.squeeze(-1)

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """Returns probability of being a mango leaf: P(mango_leaf) in [0, 1]."""
        with torch.no_grad():
            logits = self.forward(x)
            return torch.sigmoid(logits)


# Standard preprocessing transform for domain gate evaluation
domain_gate_transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
