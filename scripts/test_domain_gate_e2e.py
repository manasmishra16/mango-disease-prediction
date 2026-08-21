import os
import sys
import json
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

def test_endpoint():
    print("=" * 70)
    print("RUNNING STRICT MANGO DOMAIN GATE & DISEASE INFERENCE TESTS")
    print("=" * 70)

    test_items = [
        ("Table Image", BASE_DIR / "data" / "non_mango_dataset" / "wooden_table_5.jpg", "REJECT"),
        ("Paper Image", BASE_DIR / "data" / "non_mango_dataset" / "paper_colored_2.jpg", "REJECT"),
        ("Fan Image", BASE_DIR / "data" / "non_mango_dataset" / "fan_ceiling_1.jpg", "REJECT"),
        ("Pen Image", BASE_DIR / "data" / "non_mango_dataset" / "fountain_pen_3.jpg", "REJECT"),
        ("Other Leaf (Citrus)", BASE_DIR / "data" / "non_mango_dataset" / "other_citrus_plant_4.jpg", "REJECT"),
        ("Other Leaf (Fern)", BASE_DIR / "data" / "non_mango_dataset" / "other_fern_leaf_3.jpg", "REJECT"),
        ("Other Leaf (Pineapple)", BASE_DIR / "data" / "non_mango_dataset" / "other_pineapple_succulent_14.jpg", "REJECT"),
        ("Other Leaf (Monstera)", BASE_DIR / "data" / "non_mango_dataset" / "other_monstera_leaf_3.jpg", "REJECT"),
    ]

    # Add mango leaf samples
    mango_sample_dir = BASE_DIR / "frontend" / "public" / "samples"
    if (mango_sample_dir / "anthracnose.jpg").exists():
        test_items.append(("Diseased Mango (Anthracnose)", mango_sample_dir / "anthracnose.jpg", "ACCEPT"))
    if (mango_sample_dir / "healthy.jpg").exists():
        test_items.append(("Healthy Mango Leaf", mango_sample_dir / "healthy.jpg", "ACCEPT"))
    if (mango_sample_dir / "die_back.jpg").exists():
        test_items.append(("Diseased Mango (Die Back)", mango_sample_dir / "die_back.jpg", "ACCEPT"))

    results_table = []

    for name, path, expected in test_items:
        if not path.exists():
            print(f"[SKIP] {name}: File not found at {path}")
            continue

        with open(path, "rb") as f:
            img_bytes = f.read()

        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
            f"Content-Type: image/jpeg\r\n\r\n"
        ).encode("utf-8") + img_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/predict/disease",
            data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                status = data.get("status")
                is_mango = data.get("is_mango_leaf")
                disease = data.get("disease")
                conf = data.get("confidence", 0)

                actual = "ACCEPT" if (status == "success" and is_mango is True and disease) else "REJECT"
                passed = (actual == expected)

                results_table.append({
                    "input": name,
                    "expected": expected,
                    "actual": actual,
                    "disease": disease or "None",
                    "confidence": f"{conf}%",
                    "result": "PASS" if passed else "FAIL"
                })
        except Exception as e:
            results_table.append({
                "input": name,
                "expected": expected,
                "actual": f"ERROR: {e}",
                "disease": "None",
                "confidence": "0%",
                "result": "FAIL"
            })

    print("\n| Input | Expected | Actual | Disease Output | Confidence | Result |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for r in results_table:
        print(f"| {r['input']} | {r['expected']} | {r['actual']} | {r['disease']} | {r['confidence']} | **{r['result']}** |")

    all_passed = all(r["result"] == "PASS" for r in results_table)
    print("\n" + "=" * 70)
    print(f"ALL TESTS PASSED: {all_passed}")
    print("=" * 70)

if __name__ == "__main__":
    test_endpoint()
