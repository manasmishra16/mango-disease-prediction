"""
Disease Detection CNN Models for MangoDL.

Contains:
- MangoLeafXNet: Vanilla baseline (6 conv layers, matches IEEE Access 2025 paper)
- SEBlock: Squeeze-and-Excitation block
- MangoLeafXNetSE: SE-enhanced version (SE after conv 3 and 5)
- MangoLeafXNetMultiTask: SE + severity regression head
- EfficientNetB3Classifier: ImageNet pretrained EfficientNet-B3
- VGG16Classifier: ImageNet pretrained VGG16
"""

import torch
import torch.nn as nn
import torchvision.models as models


class MangoLeafXNet(nn.Module):
    """
    Vanilla MangoLeafXNet baseline.
    6 convolutional layers with ReLU, MaxPool, Dropout, and FC layers.
    Input: (B, 3, 227, 227) → Output: (B, num_classes)
    """
    def __init__(self, num_classes=8):
        super().__init__()
        
        self.features = nn.Sequential(
            # Conv Block 1
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Conv Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Conv Block 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Conv Block 4
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Conv Block 5
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Conv Block 6
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 3 * 3, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


class SEBlock(nn.Module):
    """Squeeze-and-Excitation block."""
    def __init__(self, channels, reduction=16):
        super().__init__()
        self.squeeze = nn.AdaptiveAvgPool2d(1)
        self.excitation = nn.Sequential(
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        b, c, _, _ = x.size()
        y = self.squeeze(x).view(b, c)
        y = self.excitation(y).view(b, c, 1, 1)
        return x * y.expand_as(x)


class MangoLeafXNetSE(nn.Module):
    """
    MangoLeafXNet with SE blocks after conv layers 3 and 5.
    Input: (B, 3, 227, 227) → Output: (B, num_classes)
    """
    def __init__(self, num_classes=8):
        super().__init__()
        
        # Conv blocks 1-2 (no SE)
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        # Conv block 3 + SE
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.se3 = SEBlock(128)
        
        # Conv block 4 (no SE)
        self.block4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        # Conv block 5 + SE
        self.block5 = nn.Sequential(
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.se5 = SEBlock(512)
        
        # Conv block 6 (no SE)
        self.block6 = nn.Sequential(
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 3 * 3, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )
    
    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.se3(self.block3(x))
        x = self.block4(x)
        x = self.se5(self.block5(x))
        x = self.block6(x)
        x = self.classifier(x)
        return x


class MangoLeafXNetMultiTask(nn.Module):
    """
    SE-enhanced MangoLeafXNet with multi-task heads:
    - Classification head: 8 disease classes
    - Severity regression head: scalar (0-3)
    
    Input: (B, 3, 227, 227)
    Output: (class_logits: (B, 8), severity: (B, 1))
    """
    def __init__(self, num_classes=8):
        super().__init__()
        
        # Shared backbone (same as MangoLeafXNetSE)
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.se3 = SEBlock(128)
        self.block4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.block5 = nn.Sequential(
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.se5 = SEBlock(512)
        self.block6 = nn.Sequential(
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        # Shared feature extractor
        self.shared_fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 3 * 3, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
        )
        
        # Classification head
        self.cls_head = nn.Sequential(
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )
        
        # Severity regression head
        self.severity_head = nn.Sequential(
            nn.Linear(1024, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )
    
    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.se3(self.block3(x))
        x = self.block4(x)
        x = self.se5(self.block5(x))
        x = self.block6(x)
        
        shared = self.shared_fc(x)
        cls_out = self.cls_head(shared)
        sev_out = self.severity_head(shared)
        
        return cls_out, sev_out


class EfficientNetB3Classifier(nn.Module):
    """EfficientNet-B3 pretrained on ImageNet, fine-tuned for mango disease."""
    def __init__(self, num_classes=8, pretrained=True):
        super().__init__()
        weights = models.EfficientNet_B3_Weights.DEFAULT if pretrained else None
        self.model = models.efficientnet_b3(weights=weights)
        in_features = self.model.classifier[1].in_features
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, num_classes),
        )
    
    def forward(self, x):
        return self.model(x)


class VGG16Classifier(nn.Module):
    """VGG16 pretrained on ImageNet, fine-tuned for mango disease."""
    def __init__(self, num_classes=8, pretrained=True):
        super().__init__()
        weights = models.VGG16_Weights.DEFAULT if pretrained else None
        self.model = models.vgg16(weights=weights)
        in_features = self.model.classifier[6].in_features
        self.model.classifier[6] = nn.Linear(in_features, num_classes)
    
    def forward(self, x):
        return self.model(x)
