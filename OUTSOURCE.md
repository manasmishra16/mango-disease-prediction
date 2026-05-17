# Training Instructions for GPU Machine (Phase 6/7)

Follow these steps to train the robust MangoDL disease detection models with Synthetic Background Augmentation.

## 1. Setup Environment
Ensure `uv` is installed.
```bash
git clone <repo-url>
cd mango-disease-prediction
uv sync
```

## 2. Setup GPU Support
Install CUDA-enabled PyTorch (example for CUDA 12.8):
```bash
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
```

## 3. Setup Data & Background Augmentation
You need a Kaggle API token.
```bash
mkdir -p ~/.kaggle
echo "YOUR_KAGGLE_TOKEN" > ~/.kaggle/access_token
chmod 600 ~/.kaggle/access_token
export KAGGLE_KEY="YOUR_KAGGLE_TOKEN"
```

Download raw datasets and background noise images:
```bash
# 1. Base Dataset (100MB)
mkdir -p data/raw/mangoleafbd
.venv/bin/kaggle datasets download aryashah2k/mango-leaf-disease-dataset -p data/raw/mangoleafbd --unzip

# 2. Big Dataset (16GB)
mkdir -p data/raw/mangoleafds2025
.venv/bin/kaggle datasets download pankajsthakre/mangoleafds2025 -p data/raw/mangoleafds2025 --unzip

# 3. Download Farm/Soil Backgrounds
PYTHONPATH=. uv run python src/data/download_backgrounds.py

# 4. Merge Image Datasets
PYTHONPATH=. uv run python src/data/merge_image_datasets.py

# 5. Pull Tabular Climate & Yield Data
PYTHONPATH=. uv run python src/data/pull_nasa_power.py
PYTHONPATH=. uv run python src/data/mock_nhb_yield.py
PYTHONPATH=. uv run python src/data/merge_data.py
```

## 4. Run Robust Training
Run the training scripts. The dataloader will automatically apply `SyntheticBackgroundSwap` (p=0.8) pasting leaves onto farm soil to make the models immune to real-world background noise.

```bash
# Baseline
PYTHONPATH=. uv run python src/models/train.py --model vanilla --epochs 50

# SE-Enhanced
PYTHONPATH=. uv run python src/models/train.py --model se --epochs 50

# Multi-Task (Disease + Severity) (CRITICAL FOR FULL STACK)
PYTHONPATH=. uv run python src/models/train.py --model multitask --epochs 50 --lr 1e-4

# Competitors
PYTHONPATH=. uv run python src/models/train.py --model efficientnet --epochs 30
PYTHONPATH=. uv run python src/models/train.py --model vgg16 --epochs 30 --lr 1e-4
```
*(Note: VGG16 requires `--lr 1e-4` to prevent model collapse).*

## 5. Return Results
Send back the contents of the `models/` directory:
- `*.pt` files (weights)
- `*_results.json` files (metrics)
