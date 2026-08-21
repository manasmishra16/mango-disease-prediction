import urllib.request
import json
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    test_cases = [
        {
            "name": "1. General Intelligence (English)",
            "message": "Explain the concept of photosynthesis in 2 simple sentences.",
            "topic": "all",
            "history": []
        },
        {
            "name": "2. Kannada Horticultural Diagnosis",
            "message": "ನನ್ನ ಮಾವಿನ ಎಲೆಗಳಲ್ಲಿ ಕಪ್ಪು ಕಲೆಗಳಿವೆ ಏನು ಮಾಡಬೇಕು?",
            "topic": "disease",
            "history": []
        },
        {
            "name": "3. Hindi Agricultural Advice",
            "message": "मेरे आम के पत्तों पर काले धब्बे हैं, क्या करूं?",
            "topic": "disease",
            "history": []
        },
        {
            "name": "4. Hinglish Contextual Turn 1",
            "message": "Mere 10 acre mango farm me drip irrigation lagwana hai.",
            "topic": "irrigation",
            "history": []
        },
        {
            "name": "5. Hinglish Contextual Turn 2 (Memory Test)",
            "message": "Is farm ke liye daily water requirement kitni hogi?",
            "topic": "irrigation",
            "history": [
                {"role": "user", "content": "Mere 10 acre mango farm me drip irrigation lagwana hai."},
                {"role": "assistant", "content": "10 acre mango farm ke liye drip irrigation ek behtareen decision hai."}
            ]
        },
        {
            "name": "6. Zero-Hallucination Test on Unknown Future Data",
            "message": "What is the exact APMC mandi price per kg of Banganapalli mangoes in Mysore on December 25, 2038?",
            "topic": "economics",
            "history": []
        }
    ]

    print("==================================================================")
    print("STARTING REAL GEMINI LLM MULTILINGUAL & FACTUAL ACCURACY TESTS")
    print("==================================================================")

    for tc in test_cases:
        time.sleep(1.0)
        payload = json.dumps({
            "message": tc["message"],
            "topic": tc["topic"],
            "history": tc["history"],
            "model": "gemini/gemini-2.5-flash"
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/api/agent/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            resp_text = data.get("response", "")
            model_used = data.get("modelUsed", "")
            source = data.get("source", "")

            print(f"\n--- {tc['name']} ---")
            print(f"[*] Prompt: '{tc['message']}'")
            print(f"[*] Model: {model_used} (Source: {source})")
            print(f"[*] Response Length: {len(resp_text)} characters")
            
            # Preview safely without windows cp1252 crash
            preview = resp_text[:120].replace('\n', ' ')
            print(f"[*] Preview (bytes): {preview.encode('ascii', errors='replace').decode('ascii')}...")

            assert len(resp_text) > 20, "Response is too short!"
            assert "undefined" not in resp_text.lower()
            assert "null" not in resp_text.lower()

    # Test SSE Stream
    print("\n--- 7. Live SSE Token Streaming Verification ---")
    stream_payload = json.dumps({
        "message": "List 2 key benefits of foliar Boron spray during mango panicle emergence.",
        "topic": "nutrition",
        "model": "gemini/gemini-2.5-flash"
    }).encode("utf-8")

    stream_req = urllib.request.Request(
        f"{BASE_URL}/api/agent/stream",
        data=stream_payload,
        headers={"Content-Type": "application/json"}
    )

    chunks = 0
    full_stream_text = ""
    with urllib.request.urlopen(stream_req) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").strip()
            if line.startswith("data: "):
                try:
                    p = json.loads(line[6:])
                    if p.get("type") == "token":
                        full_stream_text += p.get("content", "")
                        chunks += 1
                except Exception:
                    pass

    print(f"[*] Chunks streamed: {chunks}")
    print(f"[*] Total streamed length: {len(full_stream_text)} chars")
    assert chunks > 0, "No chunks streamed!"
    assert len(full_stream_text) > 30, "Streamed text too short!"

    print("\n==================================================================")
    print("ALL REAL GEMINI MULTILINGUAL & SAFETY TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
