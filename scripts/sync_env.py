import os
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print("Found Gemini Key in environment:", bool(gemini_key))

if gemini_key:
    env_path = "P:/mango-disease-prediction/.env"
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(f"GEMINI_API_KEY={gemini_key}\n")
    print("Wrote GEMINI_API_KEY to .env successfully.")
