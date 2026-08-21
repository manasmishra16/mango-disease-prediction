import os
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print("API Key present:", bool(api_key))

if api_key:
    genai.configure(api_key=api_key)
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print("Available models in Gemini API:")
        for m in models[:10]:
            print(" -", m)
    except Exception as e:
        print("List models error:", e)
