import argparse
import base64
import json
import os
import random
import re
import threading
import time
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from litellm import Router

load_dotenv()

DISEASE_PROMPT = """You are an expert plant pathologist specializing in mango (Mangifera indica) diseases in Karnataka, India.

Analyze this mango leaf image and return a JSON object with exactly these fields:

1. "disease": The disease name. Must be one of: "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back", "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould". If the image shows a disease not in this list, pick the closest match and note it in explanation.
2. "confidence": Your confidence in the diagnosis as a float between 0.0 and 1.0.
3. "severity": Disease severity on a 0-3 scale (0 = healthy/no symptoms, 1 = mild/early, 2 = moderate, 3 = severe/advanced). Use 0.0 for healthy leaves.
4. "explanation": Brief 1-2 sentence explanation of what visual symptoms you observed that led to this diagnosis.

Look for these diagnostic features:
- Anthracnose: dark brown/black irregular spots, often with yellow halo, sunken lesions
- Bacterial Canker: raised, angular, water-soaked lesions with bacterial ooze
- Cutting Weevil: irregular holes, cut marks, tunneling damage on leaf margins
- Die Back: tip/branch drying progressing downward, brown necrotic tissue
- Gall Midge: swollen galls on leaf surface, distorted growth, bumpy texture
- Powdery Mildew: white/gray powdery coating on leaf surface
- Sooty Mould: black sooty coating on leaf surface, often following insect honeydew
- Healthy: uniform green color, no lesions or discoloration

Return ONLY valid JSON, no markdown fences, no extra text."""

# Map unseen folder names → expected disease label
LABEL_MAP = {
    "ANTHRECNOSE": "Anthracnose",
    "DIEBACK": "Die Back",
    "GALL MILDGE DAMAGE": "Gall Midge",
    "HEALTHY": "Healthy",
    "INSECT DAMAGE WEBBER": "Cutting Weevil",
    "LEAF BLIGHT": "Anthracnose",
}

ALL_CLASSES = [
    "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
    "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould",
]


def parse_disease_response(raw_text: str) -> dict:
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        raw_text = "\n".join(lines).strip()

    result = {}
    try:
        result = json.loads(raw_text)
    except Exception as e:
        print(f"JSON decode failed on response: {raw_text}. Running fallback parser. Error: {e}")
        diseases = [
            "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
            "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"
        ]
        found_disease = "Unknown"
        for d in diseases:
            if d.lower() in raw_text.lower():
                found_disease = d
                break
        result["disease"] = found_disease
        result["explanation"] = raw_text[:200]

    diseases = [
        "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
        "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"
    ]
    disease_val = str(result.get("disease", "Unknown")).strip()
    matched_disease = "Unknown"
    for d in diseases:
        if d.lower() in disease_val.lower():
            matched_disease = d
            break
    if matched_disease == "Unknown":
        expl = str(result.get("explanation", ""))
        for d in diseases:
            if d.lower() in expl.lower() or d.lower() in raw_text.lower():
                matched_disease = d
                break
    result["disease"] = matched_disease

    sev_raw = result.get("severity", "1.0")
    severity = 1.0
    if isinstance(sev_raw, (int, float)):
        severity = float(sev_raw)
    elif isinstance(sev_raw, str):
        sev_lower = sev_raw.lower().strip()
        if "healthy" in sev_lower or "none" in sev_lower or "no symptoms" in sev_lower:
            severity = 0.0
        elif "mild" in sev_lower or "early" in sev_lower:
            severity = 1.0
        elif "moderate" in sev_lower:
            severity = 2.0
        elif "severe" in sev_lower or "advanced" in sev_lower:
            severity = 3.0
        else:
            match = re.search(r'(\d+\.?\d*)', sev_lower)
            if match:
                severity = float(match.group(1))
    result["severity"] = min(max(severity, 0.0), 3.0)

    conf_raw = result.get("confidence", "0.5")
    confidence = 0.5
    if isinstance(conf_raw, (int, float)):
        confidence = float(conf_raw)
    elif isinstance(conf_raw, str):
        conf_lower = conf_raw.lower().strip()
        if "high" in conf_lower:
            confidence = 0.8
        elif "medium" in conf_lower or "moderate" in conf_lower:
            confidence = 0.5
        elif "low" in conf_lower:
            confidence = 0.3
        else:
            match = re.search(r'(\d+\.?\d*)', conf_lower)
            if match:
                confidence = float(match.group(1))
    result["confidence"] = min(max(confidence, 0.0), 1.0)

    result["explanation"] = str(result.get("explanation", "")).strip()
    return result


class RobustRouter:
    def __init__(self, router, fallback_chain):
        self.router = router
        self.fallback_chain = fallback_chain
        self.cooldowns = {}
        self.lock = threading.Lock()

    def completion(self, messages, response_format=None):
        with self.lock:
            now = time.time()
            active_chain = [
                m for m in self.fallback_chain 
                if m not in self.cooldowns or now > self.cooldowns[m]
            ]
        
        if not active_chain:
            raise Exception("No active models available in fallback chain (all cooled down).")

        last_error = None
        for model in active_chain:
            try:
                response = self.router.completion(
                    model=model,
                    messages=messages,
                    response_format=response_format
                )
                return response
            except Exception as e:
                print(f"Model {model} failed: {e}. Cooling down for 10 mins.")
                with self.lock:
                    self.cooldowns[model] = time.time() + 600
                last_error = e
                
        raise Exception(f"All models in the fallback chain failed. Last error: {last_error}")


def parse_multi_keys(env_path: Path):
    gemini_keys = []
    nvidia_keys = []
    if env_path.exists():
        content = env_path.read_text()
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip()
            keys = re.findall(r'"([^"]*)"', v)
            if not keys:
                keys = [x.strip() for x in v.split(",") if x.strip()]
            else:
                keys = [x for x in keys if x]
            if k == "GEMINI_API_KEY":
                gemini_keys.extend(keys)
            elif k == "NVIDIA_API_KEY":
                nvidia_keys.extend(keys)
    return gemini_keys, nvidia_keys


def print_confusion_matrix(matrix, classes):
    active = [c for c in classes if matrix.get(c) or any(matrix[t].get(c, 0) for t in matrix)]
    if not active:
        return

    short = {c: c[:8] for c in active}
    label = "True\\Pred"
    header = f"{label:<18}" + "".join(f"{short[c]:>10}" for c in active)
    print(header)
    print("-" * len(header))

    for true_cls in active:
        if true_cls not in matrix:
            continue
        row = f"{true_cls:<18}"
        for pred_cls in active:
            count = matrix[true_cls].get(pred_cls, 0)
            cell = str(count) if count > 0 else "."
            row += f"{cell:>10}"
        print(row)


def main():
    parser = argparse.ArgumentParser(description="Comprehensive LLM Router smoke test")
    parser.add_argument("--samples", type=int, default=10, help="Images per class")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    random.seed(args.seed)

    gemini_keys, nvidia_keys = parse_multi_keys(Path(".env"))
    if not gemini_keys and os.getenv("GEMINI_API_KEY"):
        gemini_keys = [os.getenv("GEMINI_API_KEY")]
    if not nvidia_keys and os.getenv("NVIDIA_API_KEY"):
        nvidia_keys = [os.getenv("NVIDIA_API_KEY")]

    print(f"Parsed {len(gemini_keys)} Gemini keys and {len(nvidia_keys)} NVIDIA keys.")

    model_list = []
    fallback_chain = []

    # 1. Primary: gemini-2.5-flash
    for idx, key in enumerate(gemini_keys):
        m_name = f"gemini-primary-key-{idx}"
        model_list.append({
            "model_name": m_name,
            "litellm_params": {
                "model": "gemini/gemini-2.5-flash",
                "api_key": key,
            }
        })
        fallback_chain.append(m_name)

    # 2. Secondary: gemini-2.0-flash
    for idx, key in enumerate(gemini_keys):
        m_name = f"gemini-backup-key-{idx}"
        model_list.append({
            "model_name": m_name,
            "litellm_params": {
                "model": "gemini/gemini-2.0-flash",
                "api_key": key,
            }
        })
        fallback_chain.append(m_name)

    # 3. Tertiary: microsoft/phi-4-multimodal-instruct
    for idx, key in enumerate(nvidia_keys):
        m_name = f"nim-phi4-key-{idx}"
        model_list.append({
            "model_name": m_name,
            "litellm_params": {
                "model": "nvidia_nim/microsoft/phi-4-multimodal-instruct",
                "api_key": key,
            }
        })
        fallback_chain.append(m_name)

    # 4. Quaternary: llama-3.2-90b
    for idx, key in enumerate(nvidia_keys):
        m_name = f"nim-llama90b-key-{idx}"
        model_list.append({
            "model_name": m_name,
            "litellm_params": {
                "model": "nvidia_nim/meta/llama-3.2-90b-vision-instruct",
                "api_key": key,
            }
        })
        fallback_chain.append(m_name)

    if not model_list:
        print("ERROR: No keys loaded.")
        return

    raw_router = Router(model_list=model_list, num_retries=0)
    router = RobustRouter(raw_router, fallback_chain)

    unseen_dir = Path("data/raw/mangoleafds2025")
    if not unseen_dir.exists():
        print(f"{unseen_dir} not found.")
        return

    print("=" * 70)
    print("LITELLM FALLBACK ROUTER — COMPREHENSIVE SMOKE TEST")
    print(f"Samples per class: {args.samples} | Seed: {args.seed}")
    print("=" * 70)

    results = []
    latencies = []
    parse_errors = 0
    api_errors = 0

    confusion = defaultdict(lambda: defaultdict(int))
    class_correct = defaultdict(int)
    class_total = defaultdict(int)
    severity_values = []

    for subdir in sorted(unseen_dir.iterdir()):
        if not subdir.is_dir():
            continue

        images = list(subdir.glob("*.jpg")) + list(subdir.glob("*.png")) + list(subdir.glob("*.JPG"))
        if not images:
            continue

        sample_imgs = random.sample(images, min(args.samples, len(images)))
        expected = LABEL_MAP.get(subdir.name, "Unknown")

        print(f"\n--- {subdir.name} (expect: {expected}, n={len(sample_imgs)}) ---")

        for i, img_path in enumerate(sample_imgs):
            img_bytes = img_path.read_bytes()
            img_b64 = base64.b64encode(img_bytes).decode("utf-8")
            data_url = f"data:image/jpeg;base64,{img_b64}"

            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": DISEASE_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url}
                        }
                    ]
                }
            ]

            t0 = time.time()
            try:
                # Add tiny sleep to avoid aggressive back-to-back hits
                time.sleep(0.5)
                
                response = router.completion(
                    messages=messages,
                    response_format={"type": "json_object"}
                )
                
                latency = time.time() - t0
                raw_text = response.choices[0].message.content
                
                # Robust parser
                result = parse_disease_response(raw_text)
                
                pred = result.get("disease", "Unknown")
                conf = float(result.get("confidence", 0))
                sev = float(result.get("severity", 0))
                expl = result.get("explanation", "")

                latencies.append(latency)
                severity_values.append(sev)

                match = pred == expected
                if match:
                    class_correct[expected] += 1
                class_total[expected] += 1
                confusion[expected][pred] += 1

                icon = "✅" if match else "❌"
                print(f"  {icon} [{i+1:2d}] Pred: {pred:<18} Conf: {conf:.2f}  Sev: {sev:.1f}  ({latency:.1f}s, Model: {response.model})")

                results.append({
                    "true": expected,
                    "pred": pred,
                    "confidence": conf,
                    "severity": sev,
                    "latency": latency,
                    "correct": match,
                    "file": str(img_path.name),
                    "explanation": expl,
                    "model": response.model
                })

            except Exception as e:
                api_errors += 1
                class_total[expected] += 1
                print(f"  ❌ [{i+1:2d}] ERROR: {e}")

    total = sum(class_total.values())
    correct = sum(class_correct.values())

    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)

    print(f"\nOverall Accuracy: {correct}/{total} ({100*correct/total:.1f}%)")
    print(f"Errors: {api_errors}")

    if latencies:
        print(f"\nLatency — Mean: {sum(latencies)/len(latencies):.1f}s | "
              f"Min: {min(latencies):.1f}s | Max: {max(latencies):.1f}s | "
              f"P95: {sorted(latencies)[int(len(latencies)*0.95)]:.1f}s")

    if severity_values:
        print(f"Severity — Mean: {sum(severity_values)/len(severity_values):.2f} | "
              f"Min: {min(severity_values):.1f} | Max: {max(severity_values):.1f}")

    print(f"\n{'Class':<18} {'Correct':>8} {'Total':>8} {'Accuracy':>10}")
    print("-" * 46)
    for cls in sorted(class_total.keys()):
        c = class_correct[cls]
        t = class_total[cls]
        acc = 100 * c / t if t > 0 else 0
        print(f"{cls:<18} {c:>8} {t:>8} {acc:>9.1f}%")

    print(f"\nConfusion Matrix:")
    print_confusion_matrix(dict(confusion), ALL_CLASSES)

    # Save results JSON
    report_path = Path("reports/llm_smoke_test.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w") as f:
        json.dump({
            "model_chain": fallback_chain,
            "samples_per_class": args.samples,
            "total": total,
            "correct": correct,
            "accuracy": correct / total if total > 0 else 0,
            "api_errors": api_errors,
            "mean_latency": sum(latencies) / len(latencies) if latencies else 0,
            "per_class": {cls: {"correct": class_correct[cls], "total": class_total[cls]}
                          for cls in class_total},
            "confusion": {k: dict(v) for k, v in confusion.items()},
            "results": results,
        }, f, indent=2)
    print(f"\nFull report saved: {report_path}")


if __name__ == "__main__":
    main()
