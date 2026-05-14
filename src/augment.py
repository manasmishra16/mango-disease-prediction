import albumentations as A
from albumentations.pytorch import ToTensorV2

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
