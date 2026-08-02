import base64
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from litellm import Router

load_dotenv()

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

def main():
    print("--- Testing LiteLLM Router Fallback Chain ---")
    
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

    print(f"Fallback chain generated: {fallback_chain}")

    if not model_list:
        print("ERROR: No keys loaded.")
        return

    router = Router(model_list=model_list)

    # Load test image
    img_path = Path("data/raw/mangoleafds2025/HEALTHY/HEA0001.jpg")
    if not img_path.exists():
        print(f"Error: {img_path} not found.")
        return

    img_b64 = base64.b64encode(img_path.read_bytes()).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{img_b64}"

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze this mango leaf image. Return JSON with 'disease', 'confidence', 'severity', 'explanation'."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": data_url}
                }
            ]
        }
    ]

    print("Sending request to fallback router...")
    try:
        response = router.completion(
            model=fallback_chain[0],
            messages=messages,
            fallbacks=fallback_chain[1:],
            response_format={"type": "json_object"}
        )
        print("Success! Response from model:", response.model)
        print(response.choices[0].message.content)
    except Exception as e:
        print("All models failed in fallback chain:", e)

if __name__ == "__main__":
    main()
