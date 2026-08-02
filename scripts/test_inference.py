import os
import random
import torch
import cv2
import numpy as np
from pathlib import Path

from src.models.disease_cnn import MangoLeafXNetMultiTask
from src.augment import get_transforms

classes = [
    'Anthracnose', 'Bacterial Canker', 'Cutting Weevil', 'Die Back',
    'Gall Midge', 'Healthy', 'Powdery Mildew', 'Sooty Mould'
]

def test_inference_unseen():
    print("Loading model...")
    device = torch.device('cpu')
    model = MangoLeafXNetMultiTask(num_classes=8)
    ckpt_path = Path("models/multitask_best.pt")
    if ckpt_path.exists():
        ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
        model.load_state_dict(ckpt['model_state_dict'])
    model.eval()
    
    transform = get_transforms(train=False)
    
    unseen_dir = Path("data/raw/mangoleafds2025")
    if not unseen_dir.exists():
        print(f"{unseen_dir} not found.")
        return
        
    print(f"\n--- Testing on {unseen_dir} ---")
    for subdir in unseen_dir.iterdir():
        if not subdir.is_dir(): continue
        
        images = list(subdir.glob("*.jpg")) + list(subdir.glob("*.png")) + list(subdir.glob("*.JPG"))
        if not images: continue
        
        # Pick 2 random images per class
        sample_imgs = random.sample(images, min(2, len(images)))
        
        for img_path in sample_imgs:
            # Read image
            img_cv = cv2.imread(str(img_path))
            if img_cv is None: continue
            img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
            
            # Preprocess
            tensor = transform(image=img_rgb)['image'].unsqueeze(0)
            
            # Predict
            with torch.no_grad():
                cls_out, sev_out = model(tensor)
                probs = torch.softmax(cls_out, dim=1)[0]
                conf, pred_idx = torch.max(probs, dim=0)
                
                disease_name = classes[pred_idx.item()]
                confidence = conf.item()
                severity = sev_out.item()
                
            print(f"True: {subdir.name[:15]:<15} | Pred: {disease_name:<15} | Conf: {confidence:.2f} | Sev: {severity:.2f}")

if __name__ == "__main__":
    test_inference_unseen()
