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
# # Preprocessing & Augmentation (Phase 2)
# 
# This notebook validates the Phase 2 pipelines:
# 1. Albumentations transforms
# 2. PyTorch Dataset & DataLoader
# 3. Stratified splits

# %%
import os
import sys
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import torch
from torch.utils.data import DataLoader, random_split

# Fix CWD if run from notebooks/
if Path.cwd().name == 'notebooks':
    os.chdir('..')

# Import our custom modules
from src.augment import get_transforms
from src.dataset import MangoLeafDataset, ClimateYieldDataset

# %% [markdown]
# ## 1. Image Data Pipeline

# %%
RAW_DIR = Path('data/processed/images')
REPORTS_DIR = Path('reports/figures')

# Get training transforms (heavy augmentation)
train_transforms = get_transforms(train=True)
val_transforms = get_transforms(train=False)

# Initialize Datasets
train_dataset = MangoLeafDataset(root_dir=RAW_DIR, transform=train_transforms)
val_dataset = MangoLeafDataset(root_dir=RAW_DIR, transform=val_transforms)

print(f"Total images found: {len(train_dataset)}")
print(f"Classes: {train_dataset.classes}")

# Create DataLoaders
train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, num_workers=0)

# %% [markdown]
# ### Visualize Augmentations

# %%
# Helper function to unnormalize and show image
def imshow(inp, title=None):
    """Imshow for Tensor."""
    inp = inp.numpy().transpose((1, 2, 0))
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    inp = std * inp + mean
    inp = np.clip(inp, 0, 1)
    plt.imshow(inp)
    if title is not None:
        plt.title(title)
    plt.axis('off')

# Get a batch of training data
images, labels = next(iter(train_loader))

plt.figure(figsize=(16, 8))
for i in range(4):
    plt.subplot(1, 4, i+1)
    imshow(images[i], title=train_dataset.classes[labels[i]])

plt.tight_layout()
plt.savefig(REPORTS_DIR / 'augmented_batch.png')

# %% [markdown]
# ## 2. Tabular Pipeline

# %%
climate_dataset = ClimateYieldDataset(csv_path='data/processed/tabular_schema.csv', is_train=True)
climate_loader = DataLoader(climate_dataset, batch_size=4, shuffle=True)

x_batch, y_batch = next(iter(climate_loader))
print("Climate Batch Features (Normalized):")
print(x_batch)
print("\nYield Batch Labels:")
print(y_batch)
