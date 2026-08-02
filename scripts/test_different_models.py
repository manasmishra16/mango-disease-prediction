import base64
import os
import random
import re
import time
import json
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

LABEL_MAP = {
    "ANTHRECNOSE": "Anthracnose",
    "DIEBACK": "Die Back",
    "GALL MILDGE DAMAGE": "Gall Midge",
    "HEALTHY": "Healthy",
    "INSECT DAMAGE WEBBER": "Cutting Weevil",
    "LEAF BLIGHT": "Anthracnose",
}

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
        diseases = ["Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back", "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould"]
        found_disease = "Unknown"
        for d in diseases:
            if d.lower() in raw_text.lower():
                found_disease = d
                break
        result["disease"] = found_disease
        result["explanation"] = raw_text[:200]
    return result

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

def test_config(router, model_name, temp, test_images):
    print(f"\n--- Testing Model: {model_name} | Temp: {temp} ---")
    correct = 0
    total = 0
    predictions = []
    
    for img_path, expected in test_images:
        img_bytes = img_path.read_bytes()
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{img_b64}"

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": DISEASE_PROMPT},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ]

        try:
            response = router.completion(
                model=model_name,
                messages=messages,
                temperature=temp,
                response_format={"type": "json_object"}
            )
            raw_text = response.choices[0].message.content
            result = parse_disease_response(raw_text)
            pred = result.get("disease", "Unknown")
            
            match = pred == expected
            if match:
                correct += 1
            total += 1
            predictions.append(pred)
            print(f"  Expected: {expected:<15} | Pred: {pred:<15} | Match: {match}")
        except Exception as e:
            print(f"  Expected: {expected:<15} | Failed: {e}")
            total += 1
            predictions.append("Error")
            
    acc = correct / total if total > 0 else 0
    unique_preds = len(set(predictions))
    print(f"  Result: {correct}/{total} correct ({acc*100:.1f}%) | Unique Predictions: {unique_preds}/6")
    return acc, unique_preds

def main():
    gemini_keys, nvidia_keys = parse_multi_keys(Path(".env"))
    if not nvidia_keys and os.getenv("NVIDIA_API_KEY"):
        nvidia_keys = [os.getenv("NVIDIA_API_KEY")]

    if not nvidia_keys:
        print("Error: No NVIDIA API Key.")
        return

    # Initialize a direct router with the candidates
    model_list = [
        {
            "model_name": "nemotron",
            "litellm_params": {
                "model": "nvidia_nim/nvidia/nemotron-nano-12b-v2-vl",
                "api_key": nvidia_keys[0]
            }
        },
        {
            "model_name": "cosmos",
            "litellm_params": {
                "model": "nvidia_nim/nvidia/cosmos-reason2-8b",
                "api_key": nvidia_keys[0]
            }
        },
        {
            "model_name": "llama90b",
            "litellm_params": {
                "model": "nvidia_nim/meta/llama-3.2-90b-vision-instruct",
                "api_key": nvidia_keys[0]
            }
        }
    ]
    router = Router(model_list=model_list, num_retries=0)

    # Pick 1 image per class from the unseen dataset
    unseen_dir = Path("data/raw/mangoleafds2025")
    test_images = []
    random.seed(42)  # consistent set of images

    for subdir in sorted(unseen_dir.iterdir()):
        if not subdir.is_dir():
            continue
        images = list(subdir.glob("*.jpg")) + list(subdir.glob("*.png")) + list(subdir.glob("*.JPG"))
        if not images:
            continue
        selected = random.choice(images)
        expected = LABEL_MAP.get(subdir.name, "Unknown")
        test_images.append((selected, expected))

    print(f"Loaded 6 test images. Configurations to evaluate:")
    
    # Run evaluations
    configs = [
        ("llama90b", 0.1),
        ("llama90b", 0.4),
        ("nemotron", 0.1),
        ("nemotron", 0.4),
        ("cosmos", 0.1),
        ("cosmos", 0.4)
    ]
    
    best_acc = -1
    best_unique = -1
    best_config = None

    for model, temp in configs:
        # Pause slightly between configs
        time.sleep(1)
        acc, unique = test_config(router, model, temp, test_images)
        # We prioritize accuracy, and use unique predictions to break ties (higher uniqueness = less mode collapse)
        if acc > best_acc or (acc == best_acc and unique > best_unique):
            best_acc = acc
            best_unique = unique
            best_config = (model, temp)

    print("\n" + "="*50)
    print(f"BEST CONFIGURATION FOUND: {best_config}")
    print(f"Accuracy: {best_acc*100:.1f}% | Unique Predictions: {best_unique}/6")
    print("="*50)

if __name__ == "__main__":
    main()
