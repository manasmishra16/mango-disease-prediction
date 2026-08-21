"""
Train & Export Mango Leaf Domain Gate Classifier (MangoDomainGate).
Trained on real mango leaf specimens (healthy + all 7 disease classes)
vs. real non-mango objects (tables, chairs, fans, pens, paper, human portraits, electronics)
and other plant leaves (citrus, rose, fern, monstera, aloe, succulents, palm).
"""

import os
import sys
import random
from pathlib import Path
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# Ensure repository root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.models.domain_gate import MangoDomainGate, domain_gate_transform


# Data Augmentation Transforms
train_transform_pos = T.Compose([
    T.Resize((224, 224)),
    T.RandomHorizontalFlip(),
    T.RandomVerticalFlip(),
    T.RandomRotation(30),
    T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

train_transform_neg = T.Compose([
    T.Resize((224, 224)),
    T.RandomResizedCrop(224, scale=(0.5, 1.0)),
    T.RandomHorizontalFlip(),
    T.RandomVerticalFlip(),
    T.RandomRotation(45),
    T.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.1),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_transform = domain_gate_transform


class DomainGateDataset(Dataset):
    def __init__(self, items, is_train=True):
        """items is a list of (image_path_or_pil, label)"""
        self.items = items
        self.is_train = is_train

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        img_path, label = self.items[idx]
        img = Image.open(img_path).convert("RGB")
        
        if not self.is_train:
            t = val_transform(img)
        elif label == 1:
            t = train_transform_pos(img)
        else:
            t = train_transform_neg(img)
            
        return t, torch.tensor(label, dtype=torch.float32)


def collect_dataset():
    # 1. Mango Leaves (Positives)
    mango_dirs = [
        BASE_DIR / "data" / "custom_organized",
        BASE_DIR / "data" / "unified_14k",
        BASE_DIR / "data" / "test_Images"
    ]
    mango_files = []
    for d in mango_dirs:
        if d.exists():
            mango_files.extend(list(d.glob("**/*.jpg")))
    
    random.seed(42)
    random.shuffle(mango_files)
    selected_mango = mango_files[:1200]
    print(f"Found {len(mango_files)} total mango leaf candidates, selected {len(selected_mango)} for training.")

    # 2. Non-Mango Objects & Other Leaves (Negatives)
    neg_dir = BASE_DIR / "data" / "non_mango_dataset"
    neg_files = list(neg_dir.glob("*.jpg"))
    print(f"Found {len(neg_files)} real non-mango source files in {neg_dir}.")

    # Repeat negative files to create a balanced dataset (~1200 samples)
    selected_neg = []
    repeat_count = max(1, len(selected_mango) // len(neg_files))
    for f in neg_files:
        selected_neg.extend([f] * repeat_count)
    selected_neg = selected_neg[:len(selected_mango)]

    print(f"Created balanced training pool: {len(selected_mango)} Mango Leaves vs {len(selected_neg)} Non-Mango Objects/Leaves.")

    # Create labeled pairs
    dataset_pairs = [(p, 1) for p in selected_mango] + [(p, 0) for p in selected_neg]
    random.shuffle(dataset_pairs)

    # Train / Val split (85% / 15%)
    split = int(0.85 * len(dataset_pairs))
    train_pairs = dataset_pairs[:split]
    val_pairs = dataset_pairs[split:]

    return train_pairs, val_pairs


def train_and_export():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training MangoDomainGate on device: {device}")

    train_pairs, val_pairs = collect_dataset()
    train_dataset = DomainGateDataset(train_pairs, is_train=True)
    val_dataset = DomainGateDataset(val_pairs, is_train=False)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)

    # Initialize MobileNetV3-Small binary model
    model = MangoDomainGate(pretrained=True).to(device)

    # Freeze earlier convolutional layers and fine-tune classifier + top feature layers
    for param in model.features.parameters():
        param.requires_grad = False
    # Unfreeze the last 3 inversion blocks of MobileNetV3 for domain adaptation
    for param in model.features[-3:].parameters():
        param.requires_grad = True

    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=1e-3,
        weight_decay=1e-4
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=8)

    epochs = 8
    best_auc = 0.0
    best_weights = None

    print(f"\nStarting training for {epochs} epochs...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * x.size(0)

        train_loss /= len(train_loader.dataset)
        scheduler.step()

        # Validation
        model.eval()
        all_preds = []
        all_targets = []
        with torch.no_grad():
            for x, y in val_loader:
                x = x.to(device)
                probs = model.predict_proba(x)
                all_preds.extend(probs.cpu().numpy().tolist())
                all_targets.extend(y.numpy().tolist())

        val_auc = roc_auc_score(all_targets, all_preds)
        val_acc = accuracy_score(all_targets, (np.array(all_preds) >= 0.5).astype(int))

        print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {train_loss:.4f} | Val Acc: {val_acc*100:.2f}% | Val AUC: {val_auc:.4f}")

        if val_auc >= best_auc:
            best_auc = val_auc
            best_weights = {
                "model_state_dict": model.state_dict(),
                "val_auc": float(val_auc),
                "val_acc": float(val_acc),
                "epoch": epoch
            }

    # Save best model to models/ and backend/models/
    p1 = BASE_DIR / "models" / "mango_leaf_gate_best.pt"
    p2 = BASE_DIR / "backend" / "models" / "mango_leaf_gate_best.pt"
    p1.parent.mkdir(parents=True, exist_ok=True)
    p2.parent.mkdir(parents=True, exist_ok=True)

    torch.save(best_weights, str(p1))
    torch.save(best_weights, str(p2))
    print(f"\nSuccessfully trained & saved MangoDomainGate to:\n  - {p1}\n  - {p2}\nFinal Best Val AUC: {best_auc:.4f}")


if __name__ == "__main__":
    train_and_export()
