"""
XAI (Explainable AI) tools for disease detection models.

Provides:
- Grad-CAM via torchcam
- LIME image explanations
- Vanilla gradient saliency maps
"""

import numpy as np
import cv2
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
from pathlib import Path
from torchcam.methods import GradCAM
from torchcam.utils import overlay_mask
from torchvision.transforms.functional import to_pil_image
from lime import lime_image
from skimage.segmentation import mark_boundaries


def generate_gradcam(model, image_tensor, target_layer, class_idx=None, device='cpu'):
    """
    Generate Grad-CAM heatmap for a single image.
    
    Args:
        model: PyTorch model
        image_tensor: (1, 3, H, W) tensor
        target_layer: string name of the layer to hook (e.g., 'block6.0' for last conv)
        class_idx: target class index (None = use predicted class)
        device: torch device
    
    Returns:
        overlay: PIL image with heatmap overlay
        cam_map: raw activation map as numpy array
    """
    model.eval()
    model.to(device)
    image_tensor = image_tensor.to(device)
    
    cam_extractor = GradCAM(model, target_layer=target_layer)
    
    out = model(image_tensor)
    
    # Handle multi-task models
    if isinstance(out, tuple):
        out = out[0]  # Use classification logits
    
    if class_idx is None:
        class_idx = out.argmax(dim=1).item()
    
    activation_map = cam_extractor(class_idx, out)
    
    # Overlay
    result = overlay_mask(
        to_pil_image(image_tensor.squeeze(0).cpu()),
        to_pil_image(activation_map[0].squeeze(0), mode='F'),
        alpha=0.5
    )
    
    cam_extractor.remove_hooks()
    
    return result, activation_map[0].squeeze(0).cpu().numpy()


def generate_saliency(model, image_tensor, class_idx=None, device='cpu'):
    """
    Generate vanilla gradient saliency map.
    
    Args:
        model: PyTorch model
        image_tensor: (1, 3, H, W) tensor
        class_idx: target class (None = predicted)
        device: torch device
    
    Returns:
        saliency: (H, W) numpy array
    """
    model.eval()
    model.to(device)
    image_tensor = image_tensor.to(device).requires_grad_(True)
    
    out = model(image_tensor)
    if isinstance(out, tuple):
        out = out[0]
    
    if class_idx is None:
        class_idx = out.argmax(dim=1).item()
    
    score = out[0, class_idx]
    score.backward()
    
    saliency = image_tensor.grad.data.abs().squeeze(0).max(dim=0)[0]
    return saliency.cpu().numpy()


def generate_lime(model, image_np, transform, class_names, num_samples=100, device='cpu'):
    """
    Generate LIME explanation for a single image.
    
    Args:
        model: PyTorch model
        image_np: (H, W, 3) numpy array (RGB, uint8)
        transform: albumentations transform (val/test)
        class_names: list of class name strings
        num_samples: number of perturbation samples
        device: torch device
    
    Returns:
        explanation: LIME explanation object
        temp: visualization image
        mask: explanation mask
    """
    model.eval()
    model.to(device)
    
    def predict_fn(images):
        """Batch prediction function for LIME."""
        batch = []
        for img in images:
            augmented = transform(image=img.astype(np.uint8))
            batch.append(augmented['image'])
        batch_tensor = torch.stack(batch).to(device)
        
        with torch.no_grad():
            out = model(batch_tensor)
            if isinstance(out, tuple):
                out = out[0]
            probs = F.softmax(out, dim=1)
        return probs.cpu().numpy()
    
    explainer = lime_image.LimeImageExplainer()
    explanation = explainer.explain_instance(
        image_np,
        predict_fn,
        top_labels=3,
        hide_color=0,
        num_samples=num_samples
    )
    
    temp, mask = explanation.get_image_and_mask(
        explanation.top_labels[0],
        positive_only=True,
        num_features=5,
        hide_rest=False
    )
    
    return explanation, temp, mask


def save_xai_batch(model, dataset, target_layer, output_dir, class_names,
                   num_per_class=3, device='cpu'):
    """
    Generate and save Grad-CAM + Saliency for N samples per class.
    
    Args:
        model: PyTorch model
        dataset: MangoLeafDataset with val transforms
        target_layer: layer name for Grad-CAM
        output_dir: directory to save images
        class_names: list of class names
        num_per_class: how many samples per class
        device: torch device
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Group indices by class
    class_indices = {}
    for i, label in enumerate(dataset.labels):
        class_indices.setdefault(label, []).append(i)
    
    for cls_idx, indices in class_indices.items():
        cls_name = class_names[cls_idx]
        selected = indices[:num_per_class]
        
        for j, idx in enumerate(selected):
            image_tensor, label = dataset[idx]
            image_tensor = image_tensor.unsqueeze(0)
            
            # Grad-CAM
            overlay, cam = generate_gradcam(model, image_tensor, target_layer, device=device)
            overlay.save(output_dir / f'{cls_name}_gradcam_{j}.png')
            
            # Saliency
            saliency = generate_saliency(model, image_tensor, device=device)
            plt.figure(figsize=(4, 4))
            plt.imshow(saliency, cmap='hot')
            plt.axis('off')
            plt.title(f'{cls_name} - Saliency')
            plt.tight_layout()
            plt.savefig(output_dir / f'{cls_name}_saliency_{j}.png')
            plt.close()
    
    print(f"XAI outputs saved to {output_dir}")
