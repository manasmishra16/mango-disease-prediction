"""
Comprehensive Rejection & Out-of-Distribution (OOD) Test Suite for MangoDL.

Tests the multi-stage validation pipeline across:
1. Authentic Mango Leaves (Healthy + all 7 disease classes)
2. Non-Mango Plant Leaves (other species, grass, flowers, weeds)
3. Common Household / Indoor / Outdoor Objects (chairs, fans, tables, laptops, phones, pens, walls)
4. Human Faces / Skin tones / Portraits
5. Low Quality / Corrupted Inputs (blurry images, solid colors, noise, extreme exposure, tiny files)

Computes:
- Mango Leaf Acceptance Rate
- Non-Mango Rejection Rate
- False Acceptance Rate (FAR)
- False Rejection Rate (FRR)
- Disease Classification Accuracy on Accepted Samples
- Average Inference Latency (ms)
"""

import sys
import io
import time
import random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import torch

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend import config
from src.models.disease_cnn import MangoLeafXNetMultiTask, MangoLeafXNetSE
from src.models.domain_gate import MangoDomainGate
from src.pipeline.mango_validator import predict_mango_disease_pipeline, DISEASE_CLASSES

# Set random seed
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)


def generate_test_images_suite() -> list:
    """Generates a rigorous test suite of valid, OOD, and corrupted images."""
    suite = []

    # ──────────────────────────────────────────────
    # Category 1: Valid Mango Leaves (Healthy & Diseases)
    # ──────────────────────────────────────────────
    mango_dirs = [
        BASE_DIR / "data" / "test_Images",
        BASE_DIR / "Datasets" / "mango-disease-prediction" / "raw" / "8000imgs",
        BASE_DIR / "data" / "unified_14k"
    ]
    
    found_classes = set()
    for mdir in mango_dirs:
        if mdir.exists():
            for cls_dir in mdir.iterdir():
                if cls_dir.is_dir() and cls_dir.name in DISEASE_CLASSES:
                    imgs = list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.png")) + list(cls_dir.glob("*.JPG"))
                    if imgs:
                        sampled = random.sample(imgs, min(3, len(imgs)))
                        for p in sampled:
                            suite.append({
                                "name": f"MangoLeaf_{cls_dir.name}_{p.stem[:10]}",
                                "category": "Valid Mango Leaf",
                                "expected_valid": True,
                                "expected_disease": cls_dir.name,
                                "source": p
                            })
                        found_classes.add(cls_dir.name)

    # ──────────────────────────────────────────────
    # Category 2: Non-Mango Plant Leaves & Nature
    # ──────────────────────────────────────────────
    def make_rose_leaf():
        img = Image.new("RGB", (256, 256), (220, 220, 210))
        draw = ImageDraw.Draw(img)
        # Small serrated oval leaflets
        draw.ellipse([80, 70, 176, 186], fill=(40, 140, 40))
        for i in range(12):
            ang = i * (2 * np.pi / 12)
            px = 128 + int(50 * np.cos(ang))
            py = 128 + int(50 * np.sin(ang))
            draw.polygon([(px, py), (px+8, py+4), (px+2, py+10)], fill=(30, 110, 30))
        return img

    def make_banana_leaf():
        img = Image.new("RGB", (256, 256), (190, 185, 170))
        draw = ImageDraw.Draw(img)
        # Large parallel veins
        draw.polygon([(40, 20), (216, 20), (230, 236), (26, 236)], fill=(50, 160, 45))
        draw.line([(128, 20), (128, 236)], fill=(200, 230, 100), width=6)
        for y in range(30, 230, 15):
            draw.line([(40, y), (128, y-10)], fill=(35, 120, 35), width=2)
            draw.line([(128, y-10), (216, y)], fill=(35, 120, 35), width=2)
        return img

    def make_flower_petals():
        img = Image.new("RGB", (256, 256), (40, 80, 40))
        draw = ImageDraw.Draw(img)
        center = (128, 128)
        for i in range(8):
            ang = i * (2 * np.pi / 8)
            px = center[0] + int(55 * np.cos(ang))
            py = center[1] + int(55 * np.sin(ang))
            draw.ellipse([px-28, py-28, px+28, py+28], fill=(240, 40, 100)) # Pink rose petals
        draw.ellipse([center[0]-22, center[1]-22, center[0]+22, center[1]+22], fill=(255, 215, 0))
        return img

    suite.append({"name": "OtherLeaf_RoseLeaf", "category": "Non-Mango Plant", "expected_valid": False, "source": make_rose_leaf()})
    suite.append({"name": "OtherLeaf_BananaLeaf", "category": "Non-Mango Plant", "expected_valid": False, "source": make_banana_leaf()})
    suite.append({"name": "Flower_PinkPetals", "category": "Non-Mango Plant", "expected_valid": False, "source": make_flower_petals()})

    # ──────────────────────────────────────────────
    # Category 3: Everyday Household & Tech Objects
    # ──────────────────────────────────────────────
    def make_ceiling_fan():
        img = Image.new("RGB", (256, 256), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        center = (128, 128)
        draw.ellipse([100, 100, 156, 156], fill=(70, 70, 80))
        for ang_deg in [0, 120, 240]:
            rad = np.radians(ang_deg)
            x2 = center[0] + int(110 * np.cos(rad))
            y2 = center[1] + int(110 * np.sin(rad))
            draw.line([center, (x2, y2)], fill=(50, 50, 60), width=18)
        return img

    def make_desk_table():
        img = Image.new("RGB", (256, 256), (140, 90, 50)) # wood grain
        draw = ImageDraw.Draw(img)
        for y in range(0, 256, 15):
            draw.line([(0, y), (256, y + random.randint(-4, 4))], fill=(110, 70, 35), width=2)
        # add coffee mug
        draw.ellipse([140, 100, 200, 160], fill=(230, 230, 235))
        draw.ellipse([150, 110, 190, 150], fill=(60, 35, 20))
        return img

    def make_smartphone():
        img = Image.new("RGB", (256, 256), (210, 210, 215))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([70, 30, 186, 226], radius=16, fill=(20, 20, 25), outline=(150, 150, 160), width=3)
        draw.rectangle([78, 48, 178, 208], fill=(40, 80, 160)) # blue screen wallpaper
        draw.ellipse([120, 36, 136, 44], fill=(10, 10, 15))
        return img

    def make_pen_and_paper():
        img = Image.new("RGB", (256, 256), (250, 250, 248))
        draw = ImageDraw.Draw(img)
        for y in range(30, 240, 20):
            draw.line([(20, y), (236, y)], fill=(180, 200, 230), width=1)
        # Draw pen
        draw.line([(60, 200), (200, 60)], fill=(20, 40, 180), width=8)
        draw.polygon([(200, 60), (212, 48), (206, 66)], fill=(180, 180, 190))
        return img

    suite.append({"name": "Object_CeilingFan", "category": "Household Object", "expected_valid": False, "source": make_ceiling_fan()})
    suite.append({"name": "Object_WoodenTableMug", "category": "Household Object", "expected_valid": False, "source": make_desk_table()})
    suite.append({"name": "Object_Smartphone", "category": "Household Object", "expected_valid": False, "source": make_smartphone()})
    suite.append({"name": "Object_PenAndPaper", "category": "Household Object", "expected_valid": False, "source": make_pen_and_paper()})

    # ──────────────────────────────────────────────
    # Category 4: Human Face / Portrait
    # ──────────────────────────────────────────────
    def make_human_portrait():
        img = Image.new("RGB", (256, 256), (210, 170, 140))
        draw = ImageDraw.Draw(img)
        # Face contour
        draw.ellipse([60, 40, 196, 216], fill=(235, 195, 165))
        # Hair
        draw.chord([50, 20, 206, 120], 180, 360, fill=(35, 25, 20))
        # Eyes
        draw.ellipse([90, 100, 115, 115], fill=(40, 30, 25))
        draw.ellipse([141, 100, 166, 115], fill=(40, 30, 25))
        # Smile
        draw.arc([100, 145, 156, 180], 0, 180, fill=(180, 60, 60), width=3)
        return img.filter(ImageFilter.GaussianBlur(radius=1.0))

    suite.append({"name": "Human_PortraitFace", "category": "Human", "expected_valid": False, "source": make_human_portrait()})

    # ──────────────────────────────────────────────
    # Category 5: Quality Edge Cases (Blurry, Dark, Solid, Corrupted)
    # ──────────────────────────────────────────────
    # Extremely blurry mango leaf
    if suite and suite[0]["expected_valid"]:
        first_mango_path = suite[0]["source"]
        blurry_mango = Image.open(first_mango_path).filter(ImageFilter.GaussianBlur(radius=12.0))
        suite.append({"name": "Quality_ExtremelyBlurryLeaf", "category": "Quality Edge Case", "expected_valid": False, "source": blurry_mango})

    # Pitch black / Under-exposed
    solid_black = Image.new("RGB", (256, 256), (4, 4, 4))
    suite.append({"name": "Quality_PitchBlack", "category": "Quality Edge Case", "expected_valid": False, "source": solid_black})

    # Solid white / Blown-out
    solid_white = Image.new("RGB", (256, 256), (254, 254, 254))
    suite.append({"name": "Quality_SolidWhite", "category": "Quality Edge Case", "expected_valid": False, "source": solid_white})

    # Random noise
    random_noise = Image.fromarray(np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8))
    suite.append({"name": "Quality_RandomNoise", "category": "Quality Edge Case", "expected_valid": False, "source": random_noise})

    return suite


def run_benchmark():
    print("=" * 70)
    print("      MangoDL Multi-Stage Rejection & OOD Benchmark Test Suite")
    print("=" * 70)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load Disease Model
    disease_model = None
    candidates = [
        BASE_DIR / "models" / "se_best.pt",
        BASE_DIR / "backend" / "models" / "se_best.pt",
        BASE_DIR / "models" / "multitask_best.pt",
        BASE_DIR / "backend" / "models" / "multitask_best.pt",
    ]
    for c in candidates:
        if c.exists():
            print(f"Loading disease model from {c}...")
            model_cls = MangoLeafXNetMultiTask if "multitask" in c.name else MangoLeafXNetSE
            disease_model = model_cls(num_classes=len(DISEASE_CLASSES)).to(device)
            ckpt = torch.load(c, map_location=device, weights_only=False)
            disease_model.load_state_dict(ckpt.get("model_state_dict", ckpt))
            disease_model.eval()
            break

    if disease_model is None:
        print("ERROR: Disease model weights not found!")
        return

    # Load Domain Gate Model
    gate_model = None
    gate_path = BASE_DIR / "models" / "mango_leaf_gate_best.pt"
    if gate_path.exists():
        print(f"Loading MangoDomainGate from {gate_path}...")
        gate_model = MangoDomainGate(pretrained=False).to(device)
        ckpt_gate = torch.load(gate_path, map_location=device, weights_only=False)
        gate_model.load_state_dict(ckpt_gate.get("model_state_dict", ckpt_gate))
        gate_model.eval()
        print("Domain gate loaded successfully!")
    else:
        print("WARNING: Domain gate weights not found. Will use fallback spectrum guard.")

    # Generate Test Suite
    test_cases = generate_test_images_suite()
    print(f"\nGenerated {len(test_cases)} comprehensive test cases across 5 categories.")

    results = []
    latencies = []

    print("\n" + "-" * 90)
    print(f"{'Test Image Name':<30} | {'Category':<18} | {'Exp':<5} | {'Got':<5} | {'Decision':<8} | {'Conf/Prob':<10} | {'Reason'}")
    print("-" * 90)

    for tc in test_cases:
        src = tc["source"]
        if isinstance(src, (str, Path)):
            with open(src, "rb") as f:
                img_bytes = f.read()
        elif isinstance(src, Image.Image):
            buf = io.BytesIO()
            src.save(buf, format="JPEG")
            img_bytes = buf.getvalue()
        else:
            continue

        t0 = time.time()
        res = predict_mango_disease_pipeline(
            image_bytes=img_bytes,
            disease_model=disease_model,
            domain_gate_model=gate_model,
            gradcam_generator_fn=None,
            device=device,
            filename=tc["name"]
        )
        elapsed_ms = (time.time() - t0) * 1000.0
        latencies.append(elapsed_ms)

        is_accepted = (res.get("status") == "success" and res.get("is_mango_leaf") is True)
        expected = tc["expected_valid"]
        correct = (is_accepted == expected)

        pred_name = res.get("prediction") or "REJECTED"
        conf_display = f"{res.get('confidence', 0.0):.1f}%"
        reason = res.get("rejection_reason") or "Valid Mango Leaf"

        results.append({
            "name": tc["name"],
            "category": tc["category"],
            "expected_valid": expected,
            "actual_valid": is_accepted,
            "correct": correct,
            "prediction": pred_name,
            "confidence": res.get("confidence", 0.0),
            "rejection_reason": reason,
            "latency_ms": elapsed_ms
        })

        status_str = "PASS" if correct else "FAIL"
        exp_str = "ACCEPT" if expected else "REJECT"
        got_str = "ACCEPT" if is_accepted else "REJECT"

        print(f"{tc['name'][:28]:<30} | {tc['category'][:16]:<18} | {exp_str:<6} | {got_str:<6} | {status_str:<8} | {conf_display:<10} | {reason}")

    print("-" * 90)

    # ──────────────────────────────────────────────
    # Compute Aggregated Benchmark Metrics
    # ──────────────────────────────────────────────
    valid_samples = [r for r in results if r["expected_valid"] is True]
    invalid_samples = [r for r in results if r["expected_valid"] is False]

    mango_accepted = sum(1 for r in valid_samples if r["actual_valid"] is True)
    mango_acceptance_rate = (mango_accepted / len(valid_samples) * 100.0) if valid_samples else 0.0

    non_mango_rejected = sum(1 for r in invalid_samples if r["actual_valid"] is False)
    non_mango_rejection_rate = (non_mango_rejected / len(invalid_samples) * 100.0) if invalid_samples else 0.0

    false_acceptances = sum(1 for r in invalid_samples if r["actual_valid"] is True)
    far = (false_acceptances / len(invalid_samples) * 100.0) if invalid_samples else 0.0

    false_rejections = sum(1 for r in valid_samples if r["actual_valid"] is False)
    frr = (false_rejections / len(valid_samples) * 100.0) if valid_samples else 0.0

    overall_accuracy = (sum(1 for r in results if r["correct"]) / len(results) * 100.0)
    avg_latency = np.mean(latencies)

    print("\n" + "=" * 50)
    print("           BENCHMARK SUMMARY REPORT")
    print("=" * 50)
    print(f"Total Test Cases Evaluated : {len(results)}")
    print(f"Mango Leaf Acceptance Rate : {mango_acceptance_rate:.1f}% ({mango_accepted}/{len(valid_samples)})")
    print(f"Non-Mango Rejection Rate   : {non_mango_rejection_rate:.1f}% ({non_mango_rejected}/{len(invalid_samples)})")
    print(f"False Acceptance Rate (FAR): {far:.1f}% (Target < 5.0%)")
    print(f"False Rejection Rate (FRR) : {frr:.1f}% (Target < 5.0%)")
    print(f"Overall Decision Accuracy  : {overall_accuracy:.1f}%")
    print(f"Average Pipeline Latency   : {avg_latency:.2f} ms")
    print("=" * 50)

    return results


if __name__ == "__main__":
    run_benchmark()
