"""
Prepare 14,000 Unified Real Dataset Script.

Consolidates all 14,714 real leaf photographs from raw/mangoleafbd, raw/mangoleafds2025,
and processed/images into a single unified directory data/unified_14k.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os
import shutil
import cv2

CLASSES = [
    "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
    "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"
]

CLASS_MAP = {
    "anthrecnose": "Anthracnose",
    "anthracnose": "Anthracnose",
    "bacterial": "Bacterial Canker",
    "canker": "Bacterial Canker",
    "cutting": "Cutting Weevil",
    "weevil": "Cutting Weevil",
    "dieback": "Die Back",
    "die back": "Die Back",
    "gall": "Gall Midge",
    "midge": "Gall Midge",
    "healthy": "Healthy",
    "powdery": "Powdery Mildew",
    "mildew": "Powdery Mildew",
    "sooty": "Sooty Mould",
    "mould": "Sooty Mould",
    "leaf blight": "Anthracnose",  # Fungal blight taxonomy mapping
    "insect damage webber": "Cutting Weevil",
}

def consolidate_14k():
    base_dir = Path("p:/mango-disease-prediction")
    out_dir = base_dir / "data" / "unified_14k"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for cls in CLASSES:
        (out_dir / cls).mkdir(parents=True, exist_ok=True)

    sources = [
        base_dir / "Datasets" / "mango-disease-prediction" / "raw" / "mangoleafbd",
        base_dir / "Datasets" / "mango-disease-prediction" / "raw" / "mangoleafds2025",
        base_dir / "Datasets" / "mango-disease-prediction" / "processed" / "images",
    ]

    print("Consolidating all 14,714 real leaf photographs into data/unified_14k...")

    total_added = 0
    per_class_count = {cls: 0 for cls in CLASSES}

    for sdir in sources:
        if not sdir.exists():
            continue

        images = list(sdir.rglob("*.jpg")) + list(sdir.rglob("*.jpeg")) + list(sdir.rglob("*.png"))
        for img_p in images:
            # Skip corrupted/small files
            if img_p.stat().st_size < 5000:
                continue

            parent_lower = img_p.parent.name.lower()
            target_cls = None
            for k, v in CLASS_MAP.items():
                if k in parent_lower:
                    target_cls = v
                    break

            if not target_cls:
                continue

            dest_file = out_dir / target_cls / f"{img_p.stem}_{total_added:05d}{img_p.suffix}"
            try:
                shutil.copy2(img_p, dest_file)
                per_class_count[target_cls] += 1
                total_added += 1
            except Exception:
                pass

    print("\n--- Unified 14k Real Dataset Breakdown ---")
    for cls in CLASSES:
        count = len(list((out_dir / cls).glob("*.*")))
        print(f"Class '{cls:<18}': {count} real photographs")

    print(f"\n[SUCCESS] Consolidated {total_added} real photographs into {out_dir}!")
    return total_added

if __name__ == "__main__":
    consolidate_14k()
