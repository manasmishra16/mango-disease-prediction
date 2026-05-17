import albumentations as A
from albumentations.pytorch import ToTensorV2
from albumentations.core.transforms_interface import ImageOnlyTransform
import cv2
import numpy as np
import os
import random

class SyntheticBackgroundSwap(ImageOnlyTransform):
    def __init__(self, bg_dir='data/raw/backgrounds', always_apply=False, p=0.5):
        super().__init__(always_apply, p)
        self.bg_dir = bg_dir
        self.bg_images = []
        if os.path.exists(bg_dir):
            self.bg_images = [os.path.join(bg_dir, f) for f in os.listdir(bg_dir) if f.endswith('.jpg')]
            
    def apply(self, img, **params):
        if not self.bg_images:
            return img
            
        # img is RGB numpy array (H, W, C)
        bg_path = random.choice(self.bg_images)
        bg = cv2.imread(bg_path)
        if bg is None: return img
        bg = cv2.cvtColor(bg, cv2.COLOR_BGR2RGB)
        
        # Resize/crop background to match img size
        h, w = img.shape[:2]
        bg_h, bg_w = bg.shape[:2]
        
        if bg_h < h or bg_w < w:
            bg = cv2.resize(bg, (w, h))
        else:
            # Random crop
            y = random.randint(0, bg_h - h)
            x = random.randint(0, bg_w - w)
            bg = bg[y:y+h, x:x+w]
            
        # Create mask for the leaf (assuming light/white background in original dataset)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        # Blur to reduce noise
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        # Threshold: leaf is darker than white background. Usually white is >200
        _, mask = cv2.threshold(gray, 210, 255, cv2.THRESH_BINARY_INV)
        
        # Morphological operations to clean up mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        # Expand mask to 3 channels
        mask_3d = mask[:, :, None] / 255.0
        
        # Blend
        composite = (img * mask_3d + bg * (1 - mask_3d)).astype(np.uint8)
        return composite

def get_transforms(train=True):
    """
    Returns albumentations transforms for MangoLeafXNet dataset.
    Args:
        train (bool): If True, applies data augmentation. 
                      If False, applies only resizing and normalization.
    """
    # Base transforms required for model input
    base_transforms = [
        A.Resize(227, 227),
        A.Normalize(
            mean=[0.485, 0.456, 0.406], # ImageNet mean
            std=[0.229, 0.224, 0.225],  # ImageNet std
            max_pixel_value=255.0
        ),
        ToTensorV2()
    ]
    
    if not train:
        return A.Compose(base_transforms)
        
    # Heavy augmentations for training to simulate domain shift
    # (Bangladesh to Karnataka conditions)
    train_transforms = [
        # Synthetic Background
        SyntheticBackgroundSwap(p=0.8),
        
        # Geometric
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.Affine(translate_percent=(-0.1, 0.1), scale=(0.8, 1.2), rotate=(-45, 45), p=0.5),
        A.ElasticTransform(alpha=1, sigma=50, p=0.2),
        
        # Color & Lighting
        A.CLAHE(clip_limit=2.0, tile_grid_size=(8, 8), p=0.5),
        A.GaussianBlur(blur_limit=(3, 7), p=0.3),
        A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.5),
        
        # Dropout
        A.CoarseDropout(num_holes_range=(1, 8), hole_height_range=(8, 16), hole_width_range=(8, 16), fill=0, p=0.2),
        
        # Base
        A.Resize(227, 227),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
            max_pixel_value=255.0
        ),
        ToTensorV2()
    ]
    
    return A.Compose(train_transforms)
