"""Smoke test for Phase 1 & 2 pipelines."""
import sys
from pathlib import Path

# Fix CWD
import os
if Path.cwd().name != 'mango-disease-prediction':
    os.chdir(Path(__file__).resolve().parent.parent.parent)

def test_phase1_data():
    """Phase 1: Verify raw data exists and schema is valid."""
    raw = Path('data/raw')
    processed = Path('data/processed')
    
    # Image classes
    classes = ['Anthracnose', 'Bacterial Canker', 'Cutting Weevil', 
               'Die Back', 'Gall Midge', 'Healthy', 'Powdery Mildew', 'Sooty Mould']
    for cls in classes:
        cls_dir = raw / cls
        assert cls_dir.exists(), f"Missing class dir: {cls_dir}"
        count = len(list(cls_dir.glob('*.*')))
        assert count > 0, f"Empty class dir: {cls_dir}"
    
    # Climate CSV
    climate_csv = raw / 'climate_daily_2015_2024.csv'
    assert climate_csv.exists(), "Missing climate CSV"
    
    # Yield CSV
    yield_csv = raw / 'nhb_yield_mock_2015_2024.csv'
    assert yield_csv.exists(), "Missing yield CSV"
    
    # Merged schema
    schema_csv = processed / 'tabular_schema.csv'
    assert schema_csv.exists(), "Missing tabular schema"
    
    import pandas as pd
    df = pd.read_csv(schema_csv)
    assert df.shape[0] > 0, "Schema CSV empty"
    assert df.isnull().sum().sum() == 0, "Schema has nulls"
    
    print("✓ Phase 1: All data present, no nulls")

def test_phase2_augment():
    """Phase 2: Verify augmentation pipeline."""
    from src.augment import get_transforms
    import numpy as np
    
    train_t = get_transforms(train=True)
    val_t = get_transforms(train=False)
    
    # Fake image
    fake_img = np.random.randint(0, 255, (300, 400, 3), dtype=np.uint8)
    
    out_train = train_t(image=fake_img)['image']
    out_val = val_t(image=fake_img)['image']
    
    assert out_train.shape == (3, 227, 227), f"Train shape wrong: {out_train.shape}"
    assert out_val.shape == (3, 227, 227), f"Val shape wrong: {out_val.shape}"
    
    print("✓ Phase 2: Augmentations output correct shape (3, 227, 227)")

def test_phase2_datasets():
    """Phase 2: Verify PyTorch datasets load."""
    from src.dataset import MangoLeafDataset, ClimateYieldDataset
    from src.augment import get_transforms
    from torch.utils.data import DataLoader
    
    # Image dataset
    ds = MangoLeafDataset(root_dir='data/raw', transform=get_transforms(train=False))
    assert len(ds) > 0, "Image dataset empty"
    img, label = ds[0]
    assert img.shape == (3, 227, 227), f"Image tensor shape wrong: {img.shape}"
    assert 0 <= label <= 7, f"Label out of range: {label}"
    
    # DataLoader
    loader = DataLoader(ds, batch_size=4, shuffle=False, num_workers=0)
    batch_img, batch_label = next(iter(loader))
    assert batch_img.shape[0] == 4, "Batch size wrong"
    
    # Climate dataset
    cds = ClimateYieldDataset(csv_path='data/processed/tabular_schema.csv', is_train=True)
    assert len(cds) > 0, "Climate dataset empty"
    x, y = cds[0]
    assert x.shape[0] == 5, f"Feature dim wrong: {x.shape}"  # 4 features + temp_delta
    
    print("✓ Phase 2: Datasets and DataLoaders working")

if __name__ == '__main__':
    try:
        test_phase1_data()
        test_phase2_augment()
        test_phase2_datasets()
        print("\n🟢 ALL SMOKE TESTS PASSED")
    except Exception as e:
        print(f"\n🔴 SMOKE TEST FAILED: {e}")
        sys.exit(1)
