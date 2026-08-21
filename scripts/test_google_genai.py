import os
from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

print("--- Testing Live Gemini 2.5 Flash Generation ---")
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain photosynthesis in 2 sentences in Hindi (हिंदी).",
)
print("Hindi Response:")
print(response.text)

print("\n--- Testing Kannada (ಕನ್ನಡ) ---")
response_kn = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="ಮಾವಿನ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಉತ್ತಮ?",
)
print("Kannada Response:")
print(response_kn.text)
