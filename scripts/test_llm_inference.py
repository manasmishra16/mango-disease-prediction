"""Test Gemini LLM-based disease inference on unseen mangoleafds2025 data."""

import base64
import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

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


def test_llm_inference():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: Set GEMINI_API_KEY in .env")
        return

    client = genai.Client(api_key=api_key)

    unseen_dir = Path("data/raw/mangoleafds2025")
    if not unseen_dir.exists():
        print(f"{unseen_dir} not found.")
        return

    print("--- Testing LLM Inference on Unseen Data ---\n")

    correct = 0
    total = 0

    # Map unseen folder names → expected disease
    label_map = {
        "ANTHRECNOSE": "Anthracnose",
        "DIEBACK": "Die Back",
        "GALL MILDGE DAMAGE": "Gall Midge",
        "HEALTHY": "Healthy",
        "INSECT DAMAGE WEBBER": "Cutting Weevil",  # closest match
        "LEAF BLIGHT": "Anthracnose",  # closest match
    }

    for subdir in sorted(unseen_dir.iterdir()):
        if not subdir.is_dir():
            continue

        images = list(subdir.glob("*.jpg")) + list(subdir.glob("*.png")) + list(subdir.glob("*.JPG"))
        if not images:
            continue

        sample_imgs = random.sample(images, min(2, len(images)))
        expected = label_map.get(subdir.name, "Unknown")

        for img_path in sample_imgs:
            img_bytes = img_path.read_bytes()

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                            types.Part.from_text(text=DISEASE_PROMPT),
                        ],
                    )
                ],
            )

            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[1]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3].strip()

            try:
                result = json.loads(raw_text)
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
            except json.JSONDecodeError:
                print(f"❌ True: {subdir.name[:18]:<18} | PARSE ERROR: {raw_text[:80]}")
                total += 1

    print(f"\n--- Results: {correct}/{total} correct ({100*correct/total:.0f}%) ---")


if __name__ == "__main__":
    test_llm_inference()
