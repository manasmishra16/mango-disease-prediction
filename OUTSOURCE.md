# Training Instructions for GPU Machine

Follow these steps to train the MangoDL disease detection models.

## 1. Setup Environment
Ensure `uv` is installed.
```bash
git clone <repo-url>
cd mango-disease-prediction
uv sync
```

## 2. Setup GPU Support
Install CUDA-enabled PyTorch (example for CUDA 12.8, adjust if needed):
```bash
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
```

## 3. Setup Data
You need a Kaggle API token.
```bash
mkdir -p ~/.kaggle
echo "YOUR_KAGGLE_TOKEN" > ~/.kaggle/access_token
chmod 600 ~/.kaggle/access_token
```

Run data setup:
```bash
# Download images
uv run kaggle datasets download aryashah2k/mango-leaf-disease-dataset -p data/raw --unzip

# Pull climate/yield data
uv run python src/data/pull_nasa_power.py
uv run python src/data/mock_nhb_yield.py
uv run python src/data/merge_data.py
```

## 4. Run Training
Run these in order. Weights and results will save to `models/`.

```bash
# Baseline
PYTHONPATH=. uv run python src/models/train.py --model vanilla --epochs 50

# SE-Enhanced
PYTHONPATH=. uv run python src/models/train.py --model se --epochs 50

# Multi-Task (Disease + Severity)
PYTHONPATH=. uv run python src/models/train.py --model multitask --epochs 50

# Competitors
PYTHONPATH=. uv run python src/models/train.py --model efficientnet --epochs 30
PYTHONPATH=. uv run python src/models/train.py --model vgg16 --epochs 30
```

## 5. Return Results
Send back the contents of the `models/` directory:
- `*.pt` files (weights)
- `*_results.json` files (metrics)
