import os
import torch
import torchvision.transforms as transforms
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import numpy as np

from src.models.disease_cnn import MangoLeafXNetMultiTask

# Dataset classes mapped to our current model's 8 classes
# mangoleafds2025 has: Anthracnose, Dieback, Insect Damage Webber, Gall Midge Damage, Leaf Blight, Healthy
CLASS_MAPPING = {
    'Anthracnose': 'Anthracnose',
    'Dieback': 'Die Back',
    'Gall Midge Damage': 'Gall Midge',
    'Healthy': 'Healthy',
    # Unmapped classes will be ignored or evaluated separately
}

MODEL_CLASSES = [
    'Anthracnose', 'Bacterial Canker', 'Cutting Weevil', 'Die Back',
    'Gall Midge', 'Healthy', 'Powdery Mildew', 'Sooty Mould'
]

def load_model(weights_path='models/multitask_best.pt'):
    model = MangoLeafXNetMultiTask(num_classes=8)
    ckpt = torch.load(weights_path, map_location='cpu', weights_only=False)
    model.load_state_dict(ckpt['model_state_dict'])
    model.eval()
    return model

def run_inference_eda(dataset_path='data/raw/mangoleafds2025'):
    dataset_dir = Path(dataset_path)
    if not dataset_dir.exists():
        print(f"Dataset not found at {dataset_path}. Please extract it there.")
        return

    model = load_model()
    
    transform = transforms.Compose([
        transforms.Resize((227, 227)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    y_true = []
    y_pred = []
    
    print(f"Running inference on overlapping classes from {dataset_path}...")
    
    for class_dir in dataset_dir.iterdir():
        if not class_dir.is_dir(): continue
        
        dir_name = class_dir.name
        if dir_name not in CLASS_MAPPING:
            print(f"Skipping unmapped class: {dir_name}")
            continue
            
        target_idx = MODEL_CLASSES.index(CLASS_MAPPING[dir_name])
        
        # Sample all images for comprehensive EDA
        images = list(class_dir.glob('*.jpg'))
        
        for img_path in images:
            img = Image.open(img_path).convert('RGB')
            tensor = transform(img).unsqueeze(0)
            
            with torch.no_grad():
                cls_out, _ = model(tensor)
                pred_idx = cls_out.argmax(dim=1).item()
                
            y_true.append(target_idx)
            y_pred.append(pred_idx)
            
    if len(y_true) == 0:
        print("No valid images found for mapped classes.")
        return
        
    print("\n--- Classification Report ---")
    print(classification_report(y_true, y_pred, target_names=[MODEL_CLASSES[i] for i in sorted(list(set(y_true)))]))
    
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=MODEL_CLASSES, yticklabels=MODEL_CLASSES)
    plt.title("Confusion Matrix: Existing Model on New Dataset")
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.savefig('reports/figures/new_dataset_confusion.png')
    print("Saved confusion matrix to reports/figures/new_dataset_confusion.png")

if __name__ == '__main__':
    run_inference_eda()
