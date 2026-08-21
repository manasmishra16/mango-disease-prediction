import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_chat_queries():
    queries = [
        ("General EN", "What is the capital of France and what is it known for?", "all"),
        ("Hindi Agri", "मुझे आम के पेड़ में काले धब्बे दिखाई दे रहे हैं, क्या करूं?", "disease"),
        ("Kannada Agri", "ನನ್ನ ಮಾವಿನ ಎಲೆಗಳಲ್ಲಿ ಕಪ್ಪು ಕಲೆಗಳು ಕಾಣಿಸುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?", "disease"),
        ("Hinglish Agri", "Mere mango ke leaves pe black spots hain, kya karu?", "disease"),
    ]

    print("=== Testing /api/agent/chat Endpoint ===")
    for label, prompt, topic in queries:
        payload = json.dumps({
            "message": prompt,
            "topic": topic,
            "model": "gemini/gemini-2.5-flash"
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/api/agent/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            text = data.get("response", "")
            model_used = data.get("modelUsed", "")
            source = data.get("source", "")
            
            print(f"\n[*] Query [{label}]: '{prompt[:40]}...'")
            print(f"    - Model: {model_used} (Source: {source})")
            print(f"    - Length: {len(text)} chars")
            print(f"    - Preview: {text[:150].replace(chr(10), ' ')}...")
            assert len(text) > 30, "Response is too short!"

    print("\n--- Standard Chat Endpoint Passed Successfully! ---")

def test_stream_queries():
    print("\n=== Testing /api/agent/stream Endpoint ===")
    payload = json.dumps({
        "message": "Give 3 quick tips for precision mango drip irrigation in Karnataka.",
        "topic": "irrigation",
        "model": "gemini/gemini-2.5-flash"
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/agent/stream",
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    chunks_received = 0
    full_text = ""
    with urllib.request.urlopen(req) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").strip()
            if line.startswith("data: "):
                try:
                    p = json.loads(line[6:])
                    if p.get("type") == "token":
                        full_text += p.get("content", "")
                        chunks_received += 1
                except Exception:
                    pass

    print(f"[*] Streamed chunks received: {chunks_received}")
    print(f"[*] Streamed response length: {len(full_text)} chars")
    print(f"[*] Streamed preview: {full_text[:160].replace(chr(10), ' ')}...")
    assert len(full_text) > 50, "Streamed text too short!"
    print("\n--- Streaming Endpoint Passed Successfully! ---")

if __name__ == "__main__":
    try:
        test_chat_queries()
        test_stream_queries()
        print("\n==============================================")
        print("ALL REAL LLM MULTILINGUAL TESTS PASSED 100%!")
        print("==============================================")
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
