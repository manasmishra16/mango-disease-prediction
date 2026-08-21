"""
Step 12 Verification Script.
Tests exact cases requested by user:
- Table
- Paper
- Fan
- Pen
- Other plant's leaf (Citrus, Rose, Pineapple)
- Healthy mango leaf
- Known mango disease leaf
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.main import app

client = TestClient(app)

tests = [
    ("Table", "data/non_mango_dataset/table_dining_1.jpg", "Reject"),
    ("Paper", "data/non_mango_dataset/paper_colored_2.jpg", "Reject"),
    ("Fan", "data/non_mango_dataset/fan_ceiling_1.jpg", "Reject"),
    ("Pen", "data/non_mango_dataset/fountain_pen_3.jpg", "Reject"),
    ("Other Leaf (Citrus)", "data/non_mango_dataset/other_citrus_plant_4.jpg", "Reject"),
    ("Other Leaf (Rose)", "data/non_mango_dataset/other_rose_leaf_1.jpg", "Reject"),
    ("Other Leaf (Pineapple)", "data/non_mango_dataset/other_pineapple_succulent_14.jpg", "Reject"),
    ("Healthy Mango Leaf", "data/test_Images/Healthy.jpg", "Accept"),
    ("Anthracnose Mango Leaf", "data/test_Images/Anthracnose.jpg", "Accept"),
    ("Bacterial Canker Leaf", "data/test_Images/Bacterial Canker.jpg", "Accept"),
    ("Powdery Mildew Leaf", "data/test_Images/Powdery Mildew.jpg", "Accept"),
]

print("=======================================================================================")
print(f"| {'Input Item':<25} | {'Expected':<8} | {'Actual':<8} | {'Prediction':<18} | {'Result':<6} |")
print("=======================================================================================")

all_pass = True
for name, file_path, expected in tests:
    p = BASE_DIR / file_path
    if not p.exists():
        print(f"File missing: {p}")
        continue

    with open(p, "rb") as f:
        res = client.post("/predict/disease", files={"file": (p.name, f, "image/jpeg")})

    data = res.json()
    status = data.get("status")
    prediction = data.get("prediction")

    if expected == "Reject":
        actual = "Reject" if status == "rejected" and prediction is None else "Accept"
    else:
        actual = "Accept" if status == "success" and prediction is not None else "Reject"

    is_pass = (expected == actual)
    if not is_pass:
        all_pass = False

    res_str = "PASS" if is_pass else "FAIL"
    pred_str = str(prediction) if prediction else "None"
    print(f"| {name:<25} | {expected:<8} | {actual:<8} | {pred_str:<18} | {res_str:<6} |")

print("=======================================================================================")
print(f"ALL STEP 12 TESTS PASSED: {all_pass}")
