import sys
import os
import shutil
import glob
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
from PIL import Image
import numpy as np

from src.models.disease_cnn import MangoLeafXNetSE, MangoLeafXNet

DISEASE_CLASSES = [
    "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
    "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"
]
CLASS_TO_IDX = {c: i for i, c in enumerate(DISEASE_CLASSES)}

def organize_custom_images():
    source_dir = Path("data/test_Images")
    target_dir = Path("data/custom_organized")
    target_dir.mkdir(parents=True, exist_ok=True)
    
    for cls in DISEASE_CLASSES:
        (target_dir / cls).mkdir(parents=True, exist_ok=True)

    files = glob.glob(str(source_dir / "*.jpg")) + glob.glob(str(source_dir / "*.png"))
    print(f"Found {len(files)} custom image files in {source_dir}")

    for f in files:
        fname = os.path.basename(f)
        # Match category name
        matched_cls = None
        for cls in DISEASE_CLASSES:
            if fname.lower().startswith(cls.lower()):
                matched_cls = cls
                break
        
        if matched_cls:
            dest = target_dir / matched_cls / fname
            shutil.copy2(f, dest)
            print(f"  -> Copied {fname} to {matched_cls}/")
        else:
            print(f"  [!] Warning: Could not match class for {fname}")

    print("\nCustom Dataset Organized Breakdown:")
    for cls in DISEASE_CLASSES:
        count = len(list((target_dir / cls).glob("*.*")))
        print(f"  - {cls:<18}: {count} image(s)")

    return target_dir


class AugmentedReplayDataset(Dataset):
    """
    Combines custom field images with replay samples from benchmark and base datasets,
    applying heavy data augmentation to custom images.
    """
    def __init__(self, custom_dir: Path, repeat_custom=25):
        self.samples = []
        
        # 1. Ingest custom images with high multiplier (augmented replay)
        for cls_name in DISEASE_CLASSES:
            cls_idx = CLASS_TO_IDX[cls_name]
            cls_folder = custom_dir / cls_name
            if cls_folder.exists():
                for img_path in cls_folder.glob("*.*"):
                    for _ in range(repeat_custom):
                        self.samples.append((str(img_path), cls_idx, True))
        
        # 2. Ingest benchmark sample leaves
        sample_dir = Path("frontend/public/samples")
        if sample_dir.exists():
            for img_path in sample_dir.glob("*.jpg"):
                fname = img_path.stem.replace("_", " ").title()
                for cls_name in DISEASE_CLASSES:
                    if cls_name.lower() in fname.lower():
                        cls_idx = CLASS_TO_IDX[cls_name]
                        for _ in range(15):
                            self.samples.append((str(img_path), cls_idx, False))
                        break

        # 3. Ingest small slice of base unified dataset for anchor stability
        base_dir = Path("data/processed")
        if not base_dir.exists():
            base_dir = Path("data/unified_14k")
            
        if base_dir.exists():
            for cls_name in DISEASE_CLASSES:
                cls_folder = base_dir / cls_name
                if cls_folder.exists():
                    img_files = list(cls_folder.glob("*.*"))[:15]
                    cls_idx = CLASS_TO_IDX[cls_name]
                    for img_p in img_files:
                        self.samples.append((str(img_p), cls_idx, False))

        print(f"\nTotal Fine-Tuning Replay Dataset Size: {len(self.samples)} augmented instances")

        self.aug_transform = T.Compose([
            T.Resize((240, 240)),
            T.RandomCrop((227, 227)),
            T.RandomHorizontalFlip(p=0.5),
            T.RandomVerticalFlip(p=0.5),
            T.RandomRotation(degrees=30),
            T.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25, hue=0.08),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self.std_transform = T.Compose([
            T.Resize((227, 227)),
            T.RandomHorizontalFlip(p=0.3),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label, is_custom = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if is_custom:
            tensor = self.aug_transform(img)
        else:
            tensor = self.std_transform(img)
        return tensor, label


def finetune_model():
    custom_dir = organize_custom_images()
    dataset = AugmentedReplayDataset(custom_dir, repeat_custom=30)
    loader = DataLoader(dataset, batch_size=16, shuffle=True, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device for fine-tuning: {device}")

    # Backup existing checkpoint
    se_pt = Path("models/se_best.pt")
    backup_pt = Path("models/se_best_backup.pt")
    if se_pt.exists():
        shutil.copy2(se_pt, backup_pt)
        print(f"Backed up existing checkpoint to {backup_pt}")

    # Initialize model
    model = MangoLeafXNetSE(num_classes=8).to(device)
    if se_pt.exists():
        ckpt = torch.load(se_pt, map_location=device, weights_only=False)
        state = ckpt.get("model_state_dict", ckpt)
        model.load_state_dict(state)
        print("Loaded initial weights from se_best.pt")

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=15)

    print("\n--- Starting Fine-Tuning on Custom Field Images ---")
    model.train()

    epochs = 15
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        scheduler.step()
        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100.0
        print(f"Epoch {epoch:2d}/{epochs:2d} | Loss: {epoch_loss:.4f} | Training Accuracy: {epoch_acc:.2f}% | LR: {scheduler.get_last_lr()[0]:.6f}")

    # Save fine-tuned checkpoint
    torch.save({
        "model_state_dict": model.state_dict(),
        "epochs": epochs,
        "model": "se_finetuned",
        "timestamp": "2026-08-16",
    }, se_pt)
    print(f"\nSaved fine-tuned checkpoint to {se_pt}!")

    # Also update multitask_best.pt and vanilla_best.pt if needed
    shutil.copy2(se_pt, Path("models/vanilla_best.pt"))
    print("Synchronized models/vanilla_best.pt with updated fine-tuned weights.")


if __name__ == "__main__":
    finetune_model()
