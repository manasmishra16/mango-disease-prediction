# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.16.1
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
# ---

# %% [markdown]
# # XAI Analysis (Phase 3)
#
# Generates Grad-CAM, Saliency maps, and LIME explanations
# for the trained disease detection models.
#
# **Prerequisite**: Trained model weights in `models/` directory.

# %%
import os
from pathlib import Path
import torch
import matplotlib.pyplot as plt
import numpy as np
import cv2

if Path.cwd().name == 'notebooks':
    os.chdir('..')

from src.augment import get_transforms
from src.dataset import MangoLeafDataset
from src.models.disease_cnn import MangoLeafXNetSE
from src.models.xai import generate_gradcam, generate_saliency

# %% [markdown]
# ## Load Best Model

# %%
device = 'cpu'
model = MangoLeafXNetSE(num_classes=8)

weight_path = Path('models/se_best.pt')
if weight_path.exists():
    checkpoint = torch.load(weight_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"Loaded model from {weight_path} (val_acc={checkpoint['val_acc']:.4f})")
else:
    print("WARNING: No trained weights found. Using random weights for demo.")

model.eval()

# %% [markdown]
# ## Grad-CAM Examples

# %%
val_transforms = get_transforms(train=False)
dataset = MangoLeafDataset(root_dir='data/raw', transform=val_transforms)
class_names = dataset.classes

# Target layer: last conv in block6
target_layer = 'block6.0'

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i, ax in enumerate(axes.flat):
    idx = i * (len(dataset) // 8)  # Sample from different classes
    image_tensor, label = dataset[idx]
    
    overlay, cam = generate_gradcam(
        model, image_tensor.unsqueeze(0), target_layer, device=device
    )
    
    ax.imshow(overlay)
    ax.set_title(f'{class_names[label]}')
    ax.axis('off')

plt.suptitle('Grad-CAM Heatmaps', fontsize=14)
plt.tight_layout()
plt.savefig('reports/figures/xai/gradcam_grid.png')

# %% [markdown]
# ## Saliency Map Examples

# %%
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i, ax in enumerate(axes.flat):
    idx = i * (len(dataset) // 8)
    image_tensor, label = dataset[idx]
    
    saliency = generate_saliency(
        model, image_tensor.unsqueeze(0), device=device
    )
    
    ax.imshow(saliency, cmap='hot')
    ax.set_title(f'{class_names[label]}')
    ax.axis('off')

plt.suptitle('Saliency Maps', fontsize=14)
plt.tight_layout()
plt.savefig('reports/figures/xai/saliency_grid.png')

# %% [markdown]
# ## Qualitative Analysis
# 
# After training on GPU, check:
# - Do Grad-CAM heatmaps highlight the **actual lesion regions** on diseased leaves?
# - Are healthy leaves showing diffuse, low-activation maps?
# - Does saliency agree with Grad-CAM?
