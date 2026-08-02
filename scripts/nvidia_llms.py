"""
Test NVIDIA NIM LLM-based disease inference on unseen mango leaf data.

Models available:
  - meta/llama-3.2-11b-vision-instruct  (smaller, faster)
  - meta/llama-3.2-90b-vision-instruct  (larger, more accurate)

Usage:
  uv run python scripts/nvidia_llms.py
  uv run python scripts/nvidia_llms.py --model meta/llama-3.2-90b-vision-instruct
"""

import argparse
import base64
import json
import os
import random
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

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
    "INSECT DAMAGE WEBBER": "Cutting Weevil",   # closest match in our class list
    "LEAF BLIGHT": "Anthracnose",                # closest match in our class list
}


def parse_freetext_fallback(text: str) -> dict:
    """Extract disease info from free-text when model doesn't return JSON."""
    import re

    diseases = [
        "Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back",
        "Gall Midge", "Healthy", "Powdery Mildew", "Sooty Mould",
    ]

    found_disease = "Unknown"
    for d in diseases:
        if d.lower() in text.lower():
            found_disease = d
            break

    # Try to find severity number
    sev_match = re.search(r'severity[:\s]*(\d+\.?\d*)', text, re.IGNORECASE)
    severity = float(sev_match.group(1)) if sev_match else 1.5

    return {
        "disease": found_disease,
        "confidence": 0.5,  # unknown confidence from free text
        "severity": min(severity, 3.0),
        "explanation": text[:200],
    }


def predict_nvidia(img_bytes: bytes, model: str, api_key: str) -> dict:
    """Send image to NVIDIA NIM vision model, return parsed JSON result."""
    img_b64 = base64.b64encode(img_bytes).decode()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a plant disease expert. Always respond with ONLY valid JSON, no other text.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": DISEASE_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"},
                    },
                ],
            }
        ],
        "max_tokens": 512,
        "temperature": 0.1,  # very low temp for structured output
        "top_p": 0.9,
        "stream": False,
    }

    resp = requests.post(INVOKE_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    raw_text = data["choices"][0]["message"]["content"].strip()

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        # Llama sometimes returns free text — extract what we can
        return parse_freetext_fallback(raw_text)


def main():
    parser = argparse.ArgumentParser(description="Test NVIDIA NIM vision inference")
    parser.add_argument(
        "--model",
        default="meta/llama-3.2-90b-vision-instruct",
        help="NVIDIA NIM model ID (default: 90B)",
    )
    parser.add_argument("--samples", type=int, default=2, help="Images per class")
    args = parser.parse_args()

    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        print("ERROR: Set NVIDIA_API_KEY in .env")
        return

    unseen_dir = Path("data/raw/mangoleafds2025")
    if not unseen_dir.exists():
        print(f"{unseen_dir} not found.")
        return

    print(f"--- NVIDIA NIM: {args.model} ---")
    print(f"--- Testing on {unseen_dir} ---\n")

    correct = 0
    total = 0

    for subdir in sorted(unseen_dir.iterdir()):
        if not subdir.is_dir():
            continue

        images = list(subdir.glob("*.jpg")) + list(subdir.glob("*.png")) + list(subdir.glob("*.JPG"))
        if not images:
            continue

        sample_imgs = random.sample(images, min(args.samples, len(images)))
        expected = LABEL_MAP.get(subdir.name, "Unknown")

        for img_path in sample_imgs:
            img_bytes = img_path.read_bytes()

            try:
                result = predict_nvidia(img_bytes, args.model, api_key)
                pred = result.get("disease", "?")
                conf = result.get("confidence", 0)
                sev = result.get("severity", 0)
                expl = result.get("explanation", "")

                match = "✅" if pred == expected else "❌"
                if pred == expected:
                    correct += 1
                total += 1

                print(f"{match} True: {subdir.name[:18]:<18} | Pred: {pred:<18} | Conf: {conf:.2f} | Sev: {sev}")
                print(f"   {expl}\n")
            except (json.JSONDecodeError, KeyError) as e:
                print(f"❌ True: {subdir.name[:18]:<18} | PARSE ERROR: {e}")
                total += 1
            except requests.exceptions.HTTPError as e:
                print(f"❌ True: {subdir.name[:18]:<18} | API ERROR: {e}")
                total += 1

    if total > 0:
        print(f"\n--- Results: {correct}/{total} correct ({100*correct/total:.0f}%) ---")
    else:
        print("\nNo images tested.")


if __name__ == "__main__":
    main()