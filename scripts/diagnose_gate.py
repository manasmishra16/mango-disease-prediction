import os
import sys
from pathlib import Path
from PIL import Image
import torch

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.models.domain_gate import MangoDomainGate, domain_gate_transform
from src.pipeline.mango_validator import predict_mango_disease_pipeline, disease_eval_transform
from backend.main import get_disease_model, get_domain_gate_model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
d_model = get_disease_model()
g_model = get_domain_gate_model()

print("Disease Model:", type(d_model))
print("Domain Gate Model:", type(g_model))

# Test all non_mango_dataset images
neg_dir = BASE_DIR / "data" / "non_mango_dataset"
neg_files = list(neg_dir.glob("*.jpg"))

print(f"\n--- Testing {len(neg_files)} Non-Mango Images ---")
for f in neg_files[:15]:
    with open(f, "rb") as fp:
        raw_bytes = fp.read()
    res = predict_mango_disease_pipeline(
        image_bytes=raw_bytes,
        disease_model=d_model,
        domain_gate_model=g_model,
        gradcam_generator_fn=None,
        device=device,
        filename=f.name
    )
    print(f"[{f.name}] -> Status: {res.get('status')}, is_mango: {res.get('is_mango_leaf')}, Disease: {res.get('disease')}, Conf: {res.get('confidence')}, P(Mango): {res.get('mango_leaf_prob')}")
