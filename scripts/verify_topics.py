import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_presets():
    print("--- 1. Testing /api/agent/presets ---")
    req = urllib.request.Request(f"{BASE_URL}/api/agent/presets")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        presets = data.get("presets", [])
        print(f"Total presets returned: {len(presets)}")
        categories = set(p["category"] for p in presets)
        print(f"Categories present in presets: {categories}")
        assert "disease" in categories
        assert "irrigation" in categories
        assert "economics" in categories
        assert "nutrition" in categories
        assert "pest" in categories
        assert "climate" in categories
        print("Presets test: PASSED\n")

def test_topic_chat():
    topics = [
        ("all", "What is the general overview of our Karnataka orchard operations?"),
        ("disease", "What is the best fungicide spray schedule for Anthracnose?"),
        ("irrigation", "How many litres of water per tree per day should I drip irrigate?"),
        ("economics", "Compare profitability of selling to APMC Mandi vs. Pulp Factory"),
        ("nutrition", "What is the basal NPK dosage per tree post-harvest?"),
        ("pest", "How do I control Mango Leaf Hoppers and deploy Fruit Fly traps?"),
        ("climate", "How to protect fruits from sunburn and heatwaves above 35°C?")
    ]

    print("--- 2. Testing /api/agent/chat across all individual topics ---")
    for topic, prompt in topics:
        payload = json.dumps({
            "message": prompt,
            "topic": topic,
            "model": "offline/agronomy-expert"
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/api/agent/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            response_text = data.get("response", "")
            action = data.get("action")
            followups = data.get("suggestedQuestions", [])

            print(f"[*] Topic: '{topic}'")
            print(f"    - Response Length: {len(response_text)} chars")
            print(f"    - Response Header: {response_text.splitlines()[0] if response_text else 'None'}")
            print(f"    - Action Card: {action.get('title') if action else 'None'}")
            print(f"    - Suggested Follow-ups: {len(followups)} questions ({followups[:1]})")
            
            # Assertions for topic relevance
            if topic == "disease":
                assert "Disease" in response_text or "Fungicide" in response_text or "Prescription" in response_text
            elif topic == "irrigation":
                assert "Irrigation" in response_text or "Water" in response_text or "Drip" in response_text
            elif topic == "economics":
                assert "Economic" in response_text or "APMC" in response_text or "Pulp" in response_text
            elif topic == "nutrition":
                assert "Nutritional" in response_text or "NPK" in response_text or "Fertilizer" in response_text
            elif topic == "pest":
                assert "Pest" in response_text or "Hopper" in response_text or "IPM" in response_text
            elif topic == "climate":
                assert "Climate" in response_text or "Heat" in response_text or "Sunburn" in response_text or "Weather" in response_text

            print(f"    -> Topic '{topic}': PASS\n")

if __name__ == "__main__":
    try:
        test_presets()
        test_topic_chat()
        print("========================================")
        print("ALL TOPIC PANELS FULLY TESTED & VERIFIED!")
        print("========================================")
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)
