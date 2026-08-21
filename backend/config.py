import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────────
# Stage 1: Basic Image Quality & Blur Thresholds
# ──────────────────────────────────────────────
# Minimum image dimensions (width, height in pixels)
MIN_IMAGE_DIMENSION: int = int(os.getenv("MIN_IMAGE_DIMENSION", "64"))

# OpenCV Laplacian variance blur threshold (higher = stricter blur rejection)
IMAGE_BLUR_THRESHOLD: float = float(os.getenv("IMAGE_BLUR_THRESHOLD", "30.0"))


# ──────────────────────────────────────────────
# Stage 2: Mango Leaf Domain Gate Threshold
# ──────────────────────────────────────────────
# Probability threshold for MangoDomainGate MobileNetV3-Small binary classifier.
# Non-mango images score < 6.0%. Mango leaves score >= 70.0%.
# 0.65 cleanly separates real non-mango objects from valid mango leaves.
MANGO_LEAF_THRESHOLD: float = float(os.getenv("MANGO_LEAF_THRESHOLD", "0.65"))

# Model weight file locations
DOMAIN_GATE_MODEL_PATH: Path = BASE_DIR / "models" / "mango_leaf_gate_best.pt"
DISEASE_MODEL_PATH: Path = BASE_DIR / "models" / "se_best.pt"


# ──────────────────────────────────────────────
# Stage 3: PyTorch Disease Model Confidence Threshold
# ──────────────────────────────────────────────
# Minimum Softmax probability (%) for the top disease class
DISEASE_CONFIDENCE_THRESHOLD: float = float(os.getenv("DISEASE_CONFIDENCE_THRESHOLD", "75.0"))
