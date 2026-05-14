import os
from pathlib import Path
from PIL import Image
import numpy as np
import pandas as pd
import cv2
import torch
from torch.utils.data import Dataset
from sklearn.preprocessing import StandardScaler

class MangoLeafDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        """
        Args:
            root_dir (string): Directory with all the images in class folders.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = Path(root_dir)
        self.transform = transform
        
        # Determine classes
        self.classes = sorted([d.name for d in self.root_dir.iterdir() if d.is_dir()])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        self.image_paths = []
        self.labels = []
        
        for cls_name in self.classes:
            cls_dir = self.root_dir / cls_name
            for img_path in cls_dir.glob('*.*'):
                if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    self.image_paths.append(img_path)
                    self.labels.append(self.class_to_idx[cls_name])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        img_path = str(self.image_paths[idx])
        
        # Albumentations expects numpy array (RGB)
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        label = self.labels[idx]

        if self.transform:
            # Albumentations uses keyword 'image'
            augmented = self.transform(image=image)
            image = augmented['image']
            
        return image, label

class ClimateYieldDataset(Dataset):
    def __init__(self, csv_path, scaler=None, is_train=True):
        """
        Args:
            csv_path (string): Path to the tabular schema csv.
            scaler (StandardScaler, optional): Fitted scaler. If None and is_train=True, fits a new one.
        """
        self.df = pd.read_csv(csv_path)
        
        # Features and target
        feature_cols = ['tmax', 'tmin', 'rain', 'humidity']
        self.X = self.df[feature_cols].values
        self.y = self.df['yield_t_ha'].values
        
        # Optional: Feature Engineering (e.g., Vapor Pressure Deficit, Temp Delta)
        # We can add this directly to X here if needed.
        temp_delta = (self.X[:, 0] - self.X[:, 1]).reshape(-1, 1) # tmax - tmin
        self.X = np.hstack([self.X, temp_delta])
        
        self.scaler = scaler
        if self.scaler is None and is_train:
            self.scaler = StandardScaler()
            self.X = self.scaler.fit_transform(self.X)
        elif self.scaler is not None:
            self.X = self.scaler.transform(self.X)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        x_tensor = torch.tensor(self.X[idx], dtype=torch.float32)
        y_tensor = torch.tensor(self.y[idx], dtype=torch.float32)
        return x_tensor, y_tensor
