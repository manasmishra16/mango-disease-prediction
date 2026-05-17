import os
from pathlib import Path
import shutil

def create_unified_dataset():
    src_bd = Path('data/raw/mangoleafbd')
    src_ds = Path('data/raw/mangoleafds2025')
    dest_dir = Path('data/processed/images')
    
    # Class mapping for mangoleafds2025
    ds_mapping = {
        'ANTHRECNOSE': 'Anthracnose',
        'DIEBACK': 'Die Back',
        'GALL MILDGE DAMAGE': 'Gall Midge',
        'HEALTHY': 'Healthy'
    }
    
    print(f"Creating unified dataset in {dest_dir}...")
    
    # Clear existing
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    
    # 1. Symlink MangoLeafBD
    if src_bd.exists():
        for class_dir in src_bd.iterdir():
            if not class_dir.is_dir(): continue
            target_cls_dir = dest_dir / class_dir.name
            target_cls_dir.mkdir(parents=True, exist_ok=True)
            
            for img in class_dir.glob('*.jpg'):
                dest_file = target_cls_dir / f"bd_{img.name}"
                # Use symbolic link to save space
                os.symlink(img.absolute(), dest_file.absolute())
        print("Symlinked MangoLeafBD classes.")
    else:
        print("Warning: mangoleafbd not found.")
        
    # 2. Symlink mangoleafds2025
    if src_ds.exists():
        for class_dir in src_ds.iterdir():
            if not class_dir.is_dir() or class_dir.name not in ds_mapping:
                continue
                
            mapped_name = ds_mapping[class_dir.name]
            target_cls_dir = dest_dir / mapped_name
            target_cls_dir.mkdir(parents=True, exist_ok=True)
            
            for img in class_dir.glob('*.jpg'):
                dest_file = target_cls_dir / f"ds_{img.name}"
                os.symlink(img.absolute(), dest_file.absolute())
        print("Symlinked mapped mangoleafds2025 classes.")
    else:
        print("Warning: mangoleafds2025 not found.")

    # Validate output
    print("\nUnified Dataset Class Counts:")
    for class_dir in sorted(dest_dir.iterdir()):
        count = len(list(class_dir.glob('*.jpg')))
        print(f"  {class_dir.name}: {count} images")

if __name__ == '__main__':
    create_unified_dataset()
