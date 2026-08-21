import torch
from pathlib import Path

p = Path("models/mango_leaf_gate_best.pt")
ckpt = torch.load(p, map_location="cpu", weights_only=False)
print("Keys in checkpoint:", ckpt.keys())
state = ckpt.get("model_state_dict", ckpt)
for k, v in state.items():
    if "classifier" in k:
        print(k, v.shape)
