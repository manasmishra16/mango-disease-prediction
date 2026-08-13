import os
from pathlib import Path
import cv2
import numpy as np
import pandas as pd

def create_processed_datasets():
    base_dir = Path("p:/mango-disease-prediction")
    raw_dir = base_dir / "data" / "raw"
    processed_dir = base_dir / "data" / "processed"

    classes = [
        "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
        "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"
    ]

    print("Creating dataset directory structure...")
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    # 1. Create class folders and sample images for data/raw and data/processed
    class_colors = {
        "Anthracnose": (30, 20, 80),      # Dark brown spots
        "Bacterial Canker": (10, 120, 200),# Amber/yellow spots
        "Cutting Weevil": (50, 50, 50),   # Cut edges / grey
        "Die Back": (20, 40, 90),         # Dark necrotic tip
        "Gall Midge": (60, 100, 40),      # Gall bumps
        "Healthy": (34, 197, 94),         # Vibrant green
        "Powdery Mildew": (230, 230, 230),# White mildew film
        "Sooty Mould": (20, 20, 20),      # Black sooty coating
    }

    for cls in classes:
        cls_raw = raw_dir / cls
        cls_proc = processed_dir / cls
        cls_raw.mkdir(parents=True, exist_ok=True)
        cls_proc.mkdir(parents=True, exist_ok=True)

        for idx in range(1, 6):
            # Create a 400x400 leaf image
            img = np.zeros((400, 400, 3), dtype=np.uint8)
            # Orchard background
            img[:] = (21, 36, 15)

            # Draw leaf shape
            center = (200, 200)
            axes = (80, 160)
            cv2.ellipse(img, center, axes, 0, 0, 360, (34, 138, 58), -1)
            cv2.ellipse(img, center, axes, 0, 0, 360, (20, 90, 40), 2)
            cv2.line(img, (200, 40), (200, 360), (15, 70, 30), 3)

            # Draw disease-specific symptoms
            c_rgb = class_colors.get(cls, (50, 50, 50))
            if cls == "Anthracnose":
                cv2.circle(img, (190, 150), 25, c_rgb, -1)
                cv2.circle(img, (220, 230), 18, c_rgb, -1)
                cv2.circle(img, (180, 270), 20, c_rgb, -1)
            elif cls == "Bacterial Canker":
                cv2.rectangle(img, (180, 140), (215, 175), c_rgb, -1)
                cv2.rectangle(img, (190, 220), (225, 250), c_rgb, -1)
            elif cls == "Powdery Mildew":
                cv2.circle(img, (200, 160), 40, c_rgb, -1)
                cv2.circle(img, (185, 240), 35, c_rgb, -1)
            elif cls == "Sooty Mould":
                cv2.ellipse(img, center, (70, 140), 0, 0, 360, c_rgb, -1)
            elif cls == "Die Back":
                cv2.ellipse(img, (200, 90), (70, 50), 0, 0, 360, c_rgb, -1)
            elif cls == "Gall Midge":
                for pt in [(170, 120), (230, 160), (180, 220), (220, 280)]:
                    cv2.circle(img, pt, 12, c_rgb, -1)

            # Save raw image (JPEG)
            raw_path = cls_raw / f"{cls.lower()}_{idx:02d}.jpg"
            cv2.imwrite(str(raw_path), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

            # Save processed image (CLAHE enhanced PNG)
            lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            proc_img = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

            proc_path = cls_proc / f"{cls.lower()}_processed_{idx:02d}.png"
            cv2.imwrite(str(proc_path), cv2.cvtColor(proc_img, cv2.COLOR_RGB2BGR))

    print(f"Generated 5 sample images for each of the 8 classes in {raw_dir} and {processed_dir}.")

    # 2. Create tabular_schema.csv in data/processed/
    tabular_schema_path = processed_dir / "tabular_schema.csv"
    np.random.seed(42)
    n_samples = 200
    df_schema = pd.DataFrame({
        "image_id": [f"img_{i:04d}" for i in range(n_samples)],
        "disease_label": np.random.choice(classes, n_samples),
        "severity_grade": np.random.choice(["None", "Low", "Medium", "High"], n_samples),
        "tmax": np.round(np.random.uniform(28.0, 42.0, n_samples), 1),
        "tmin": np.round(np.random.uniform(18.0, 28.0, n_samples), 1),
        "rain": np.round(np.random.exponential(5.0, n_samples), 1),
        "humidity": np.round(np.random.uniform(45.0, 85.0, n_samples), 1),
        "ndvi": np.round(np.random.uniform(0.4, 0.85, n_samples), 3),
        "evi": np.round(np.random.uniform(0.3, 0.75, n_samples), 3),
        "yield_t_ha": np.round(np.random.uniform(12.0, 24.0, n_samples), 2),
        "variety": np.random.choice(["Banganapalli", "Raspuri", "Totapuri"], n_samples)
    })
    df_schema.to_csv(tabular_schema_path, index=False)
    print(f"Created {tabular_schema_path} with {n_samples} records.")

    # 3. Create raw climate & yield CSVs in data/raw/
    climate_csv = raw_dir / "climate_daily_2015_2024.csv"
    yield_csv = raw_dir / "nhb_yield_mock_2015_2024.csv"

    dates = pd.date_range("2015-01-01", "2024-12-31", freq="D")
    df_climate = pd.DataFrame({
        "date": dates,
        "year": dates.year,
        "month": dates.month,
        "tmax": np.round(np.random.uniform(26.0, 40.0, len(dates)), 1),
        "tmin": np.round(np.random.uniform(16.0, 26.0, len(dates)), 1),
        "rain": np.round(np.random.exponential(4.0, len(dates)), 1),
        "humidity": np.round(np.random.uniform(50.0, 90.0, len(dates)), 1)
    })
    df_climate.to_csv(climate_csv, index=False)
    print(f"Created {climate_csv} with {len(dates)} daily weather records.")

    df_yield = pd.DataFrame({
        "year": list(range(2015, 2025)),
        "variety": ["Banganapalli"] * 10,
        "yield_t_ha": [14.2, 15.1, 16.5, 15.8, 17.2, 18.0, 17.5, 19.1, 18.6, 20.2]
    })
    df_yield.to_csv(yield_csv, index=False)
    print(f"Created {yield_csv}.")

if __name__ == "__main__":
    create_processed_datasets()
