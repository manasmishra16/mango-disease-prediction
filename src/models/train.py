"""
Training script for Disease Detection models.

Usage:
    PYTHONPATH=. uv run python src/models/train.py --model vanilla --epochs 50 --batch-size 32
    PYTHONPATH=. uv run python src/models/train.py --model se --epochs 50
    PYTHONPATH=. uv run python src/models/train.py --model multitask --epochs 50 --lambda-mt 0.7
    PYTHONPATH=. uv run python src/models/train.py --model efficientnet --epochs 30
    PYTHONPATH=. uv run python src/models/train.py --model vgg16 --epochs 30
"""

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.optim import Adam
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader, Subset
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

from src.augment import get_transforms
from src.dataset import MangoLeafDataset
from src.models.disease_cnn import (
    MangoLeafXNet, MangoLeafXNetSE, MangoLeafXNetMultiTask,
    EfficientNetB3Classifier, VGG16Classifier
)


MODEL_REGISTRY = {
    'vanilla': MangoLeafXNet,
    'se': MangoLeafXNetSE,
    'multitask': MangoLeafXNetMultiTask,
    'efficientnet': EfficientNetB3Classifier,
    'vgg16': VGG16Classifier,
}


def get_splits(dataset, seed=42):
    """Stratified 80/10/10 split."""
    labels = np.array(dataset.labels)
    
    # First split: 80% train, 20% temp
    sss1 = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=seed)
    train_idx, temp_idx = next(sss1.split(np.zeros(len(labels)), labels))
    
    # Second split: 50/50 of temp → 10% val, 10% test
    temp_labels = labels[temp_idx]
    sss2 = StratifiedShuffleSplit(n_splits=1, test_size=0.5, random_state=seed)
    val_idx_rel, test_idx_rel = next(sss2.split(np.zeros(len(temp_labels)), temp_labels))
    
    val_idx = temp_idx[val_idx_rel]
    test_idx = temp_idx[test_idx_rel]
    
    return train_idx, val_idx, test_idx


def train_one_epoch(model, loader, criterion, optimizer, device, is_multitask=False, lambda_mt=0.7):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    all_preds, all_labels = [], []
    
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        
        if is_multitask:
            cls_out, sev_out = model(images)
            # For now, use label as proxy for severity (0 for healthy, 1-3 for diseases)
            severity_target = (labels > 0).float().unsqueeze(1) * 2.0  # Proxy severity
            loss_cls = nn.CrossEntropyLoss()(cls_out, labels)
            loss_sev = nn.MSELoss()(sev_out, severity_target)
            loss = lambda_mt * loss_cls + (1 - lambda_mt) * loss_sev
            preds = cls_out.argmax(dim=1)
        else:
            outputs = model(images)
            loss = criterion(outputs, labels)
            preds = outputs.argmax(dim=1)
        
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
    
    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)
    return epoch_loss, epoch_acc


@torch.no_grad()
def evaluate(model, loader, criterion, device, is_multitask=False, lambda_mt=0.7):
    """Evaluate on val/test set."""
    model.eval()
    running_loss = 0.0
    all_preds, all_labels = [], []
    
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        
        if is_multitask:
            cls_out, sev_out = model(images)
            severity_target = (labels > 0).float().unsqueeze(1) * 2.0
            loss_cls = nn.CrossEntropyLoss()(cls_out, labels)
            loss_sev = nn.MSELoss()(sev_out, severity_target)
            loss = lambda_mt * loss_cls + (1 - lambda_mt) * loss_sev
            preds = cls_out.argmax(dim=1)
        else:
            outputs = model(images)
            loss = criterion(outputs, labels)
            preds = outputs.argmax(dim=1)
        
        running_loss += loss.item() * images.size(0)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
    
    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)
    
    return epoch_loss, epoch_acc, np.array(all_preds), np.array(all_labels)


def main():
    parser = argparse.ArgumentParser(description='Train disease detection model')
    parser.add_argument('--model', type=str, default='vanilla',
                        choices=list(MODEL_REGISTRY.keys()),
                        help='Model architecture to train')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--lr', type=float, default=1e-3)
    parser.add_argument('--device', type=str, default='auto',
                        help='Device: cpu, cuda, mps, or auto')
    parser.add_argument('--data-dir', type=str, default='data/processed/images')
    parser.add_argument('--output-dir', type=str, default='models')
    parser.add_argument('--patience', type=int, default=10,
                        help='Early stopping patience')
    parser.add_argument('--lambda-mt', type=float, default=0.7,
                        help='Multi-task loss weight (classification vs severity)')
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--num-workers', type=int, default=0)
    args = parser.parse_args()
    
    # Seed
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    
    # Device
    if args.device == 'auto':
        device = torch.device('cuda' if torch.cuda.is_available() 
                              else 'mps' if torch.backends.mps.is_available()
                              else 'cpu')
    else:
        device = torch.device(args.device)
    print(f"Using device: {device}")
    
    # Datasets
    full_dataset = MangoLeafDataset(root_dir=args.data_dir, transform=None)
    train_idx, val_idx, test_idx = get_splits(full_dataset, seed=args.seed)
    
    print(f"Split: train={len(train_idx)}, val={len(val_idx)}, test={len(test_idx)}")
    
    train_transforms = get_transforms(train=True)
    val_transforms = get_transforms(train=False)
    
    # Create subsets with different transforms
    train_ds = MangoLeafDataset(root_dir=args.data_dir, transform=train_transforms)
    val_ds = MangoLeafDataset(root_dir=args.data_dir, transform=val_transforms)
    test_ds = MangoLeafDataset(root_dir=args.data_dir, transform=val_transforms)
    
    train_subset = Subset(train_ds, train_idx)
    val_subset = Subset(val_ds, val_idx)
    test_subset = Subset(test_ds, test_idx)
    
    train_loader = DataLoader(train_subset, batch_size=args.batch_size, shuffle=True,
                              num_workers=args.num_workers, pin_memory=True)
    val_loader = DataLoader(val_subset, batch_size=args.batch_size, shuffle=False,
                            num_workers=args.num_workers, pin_memory=True)
    test_loader = DataLoader(test_subset, batch_size=args.batch_size, shuffle=False,
                             num_workers=args.num_workers, pin_memory=True)
    
    # Model
    is_multitask = args.model == 'multitask'
    model_cls = MODEL_REGISTRY[args.model]
    model = model_cls(num_classes=8).to(device)
    
    param_count = sum(p.numel() for p in model.parameters())
    print(f"Model: {args.model} | Params: {param_count:,}")
    
    # Optimizer & Scheduler
    optimizer = Adam(model.parameters(), lr=args.lr)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)
    criterion = nn.CrossEntropyLoss()
    
    # Training loop
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    best_val_acc = 0.0
    patience_counter = 0
    history = []
    
    print(f"\nTraining {args.model} for {args.epochs} epochs...")
    print("-" * 60)
    
    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device,
            is_multitask=is_multitask, lambda_mt=args.lambda_mt
        )
        val_loss, val_acc, _, _ = evaluate(
            model, val_loader, criterion, device,
            is_multitask=is_multitask, lambda_mt=args.lambda_mt
        )
        
        scheduler.step()
        dt = time.time() - t0
        
        history.append({
            'epoch': epoch,
            'train_loss': train_loss,
            'train_acc': train_acc,
            'val_loss': val_loss,
            'val_acc': val_acc,
        })
        
        print(f"Epoch {epoch:3d}/{args.epochs} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | "
              f"{dt:.1f}s")
        
        # Save best
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            torch.save({
                'model_state_dict': model.state_dict(),
                'epoch': epoch,
                'val_acc': val_acc,
                'args': vars(args),
            }, output_dir / f'{args.model}_best.pt')
            print(f"  → Saved best model (val_acc={val_acc:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                print(f"  → Early stopping at epoch {epoch}")
                break
    
    # Final test evaluation
    print("\n" + "=" * 60)
    print("FINAL TEST EVALUATION")
    print("=" * 60)
    
    # Load best model
    checkpoint = torch.load(output_dir / f'{args.model}_best.pt', weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    
    test_loss, test_acc, test_preds, test_labels = evaluate(
        model, test_loader, criterion, device,
        is_multitask=is_multitask, lambda_mt=args.lambda_mt
    )
    
    class_names = full_dataset.classes
    
    print(f"\nTest Accuracy: {test_acc:.4f}")
    print(f"Test F1 (macro): {f1_score(test_labels, test_preds, average='macro'):.4f}")
    print(f"\nClassification Report:")
    print(classification_report(test_labels, test_preds, target_names=class_names))
    print(f"\nConfusion Matrix:")
    print(confusion_matrix(test_labels, test_preds))
    
    # Save results
    results = {
        'model': args.model,
        'best_val_acc': best_val_acc,
        'test_acc': test_acc,
        'test_f1_macro': float(f1_score(test_labels, test_preds, average='macro')),
        'test_precision_macro': float(precision_score(test_labels, test_preds, average='macro')),
        'test_recall_macro': float(recall_score(test_labels, test_preds, average='macro')),
        'params': param_count,
        'epochs_trained': len(history),
        'history': history,
    }
    
    with open(output_dir / f'{args.model}_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to {output_dir / f'{args.model}_results.json'}")


if __name__ == '__main__':
    main()
