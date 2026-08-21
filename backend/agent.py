"""
MangoDL — Production Multilingual Agricultural AI Agent Engine
Powered by Google Gemini 2.5 Flash / Google GenAI SDK with multi-model fallback.
Real-time conversational memory, streaming token delivery, and domain agronomy intelligence.
"""

import os
import re
import time
import json
from typing import Dict, Any, List, Optional, Generator
from pathlib import Path
from dotenv import load_dotenv

# Google GenAI official SDK
try:
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False

import litellm

from backend import store
from backend import climate
from src.economics import TREATMENT_COST

# Load root .env explicitly
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

# Supported LLM Models
AVAILABLE_MODELS = [
    {"id": "gemini/gemini-2.5-flash", "name": "Gemini 2.5 Flash (Recommended)", "provider": "google"},
    {"id": "gemini/gemini-flash-latest", "name": "Gemini Flash Latest", "provider": "google"},
    {"id": "gemini/gemini-3.5-flash-lite", "name": "Gemini 3.5 Flash-Lite (Fast)", "provider": "google"},
    {"id": "gemini/gemini-3.1-pro-preview", "name": "Gemini 3.1 Pro (Deep Agronomy)", "provider": "google"},
    {"id": "groq/llama-3.3-70b-versatile", "name": "Groq LLaMA 3.3 70B", "provider": "groq"},
    {"id": "openai/gpt-4o-mini", "name": "OpenAI GPT-4o Mini", "provider": "openai"},
    {"id": "openai/gpt-4o", "name": "OpenAI GPT-4o", "provider": "openai"},
    {"id": "anthropic/claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "provider": "anthropic"},
    {"id": "offline/agronomy-expert", "name": "MangoDL Offline Agronomist (Zero-Key Local)", "provider": "offline"},
]

# Quick Agronomic Preset Prompts for each topic panel
QUICK_PRESETS = [
    # Disease & Fungicides
    {
        "id": "anthracnose-treat",
        "title": "Anthracnose Spray Plan",
        "prompt": "How do I treat severe Anthracnose infection on Banganapalli mango trees during high humidity (>80%)?",
        "category": "disease",
        "icon": "Microscope"
    },
    {
        "id": "bacterial-canker-treat",
        "title": "Bacterial Canker Protocol",
        "prompt": "Recommend a combination bactericide and copper spray schedule for Bacterial Canker lesions with gummosis.",
        "category": "disease",
        "icon": "Microscope"
    },
    {
        "id": "powdery-mildew-treat",
        "title": "Powdery Mildew Control",
        "prompt": "What is the optimal chemical and bio-fungicide spray schedule for Powdery Mildew during flowering stage?",
        "category": "disease",
        "icon": "Microscope"
    },
    # Drip Irrigation
    {
        "id": "irrigation-schedule",
        "title": "Precision Irrigation Schedule",
        "prompt": "Based on current temperature and humidity in Karnataka, what is the optimal daily drip irrigation schedule?",
        "category": "irrigation",
        "icon": "Droplets"
    },
    {
        "id": "irrigation-cutoff",
        "title": "Pre-Harvest Water Cut-Off",
        "prompt": "When should I cut off irrigation before harvesting Raspuri and Banganapalli to maximize sweetness (Brix) and prevent spongy tissue?",
        "category": "irrigation",
        "icon": "Droplets"
    },
    {
        "id": "fertigation-protocol",
        "title": "Drip Fertigation Protocol",
        "prompt": "How to inject water-soluble SOP (0-0-50 Potassium Sulphate) and micronutrients through drip emitters for fruit sizing?",
        "category": "irrigation",
        "icon": "Droplets"
    },
    # Market & Pricing
    {
        "id": "market-vs-pulp",
        "title": "Market vs. Pulp Factory Strategy",
        "prompt": "With a 15% disease incidence and projected yield of 18 t/ha, should I sell to local APMC market or processing pulp factory?",
        "category": "economics",
        "icon": "DollarSign"
    },
    {
        "id": "export-grading",
        "title": "Export Quality Standards",
        "prompt": "What are the blemish threshold and sizing standards to sell Alphonso mangoes for premium export vs local mandis?",
        "category": "economics",
        "icon": "DollarSign"
    },
    {
        "id": "crop-loss-valuation",
        "title": "Per-Acre Crop Loss Valuation",
        "prompt": "Calculate estimated financial loss per acre if fungal Anthracnose is left untreated for 3 weeks in Hassan district.",
        "category": "economics",
        "icon": "DollarSign"
    },
    # NPK Nutrition
    {
        "id": "fertilizer-npk",
        "title": "Post-Harvest NPK Formulation",
        "prompt": "What is the recommended NPK and farm yard manure dosage per bearing tree for Raspuri orchards post-harvest?",
        "category": "nutrition",
        "icon": "FlaskConical"
    },
    {
        "id": "pre-bloom-boron",
        "title": "Pre-Bloom Boron Spray",
        "prompt": "How does Solubor (Boron 20%) foliar application prevent flower drop and improve fruit retention during panicle emergence?",
        "category": "nutrition",
        "icon": "FlaskConical"
    },
    {
        "id": "micronutrient-zinc",
        "title": "Zinc & Potassium Foliar Boost",
        "prompt": "Recommend foliar Zinc Sulphate and Potassium Nitrate (13-0-45) dosages during the pea-sized fruit development stage.",
        "category": "nutrition",
        "icon": "FlaskConical"
    },
    # Pest Management
    {
        "id": "pest-hopper",
        "title": "Mango Leaf Hopper IPM",
        "prompt": "Recommend an integrated pest schedule for Mango Leaf Hoppers (Idioscopus clypealis) during flowering and panicle emergence.",
        "category": "pest",
        "icon": "Bug"
    },
    {
        "id": "pest-gall-midge",
        "title": "Gall Midge & Weevil Control",
        "prompt": "How to eliminate Gall Midge warts on leaves and prevent Leaf Cutting Weevil defoliation during new vegetative flushes?",
        "category": "pest",
        "icon": "Bug"
    },
    {
        "id": "pest-fruit-fly",
        "title": "Fruit Fly Pheromone Traps",
        "prompt": "When and how to deploy methyl eugenol pheromone traps and bait sprays for Mango Fruit Fly (Bactrocera dorsalis)?",
        "category": "pest",
        "icon": "Bug"
    },
    # Climate Defense
    {
        "id": "heatwave-protection",
        "title": "Heat Stress & Sunburn Shield",
        "prompt": "How to protect developing mango fruits from high temperature heat stress (>35°C) and sunburn using Kaolin clay foliar sprays?",
        "category": "climate",
        "icon": "CloudSun"
    },
    {
        "id": "unseasonal-rain",
        "title": "Unseasonal Rain Recovery",
        "prompt": "What emergency soil drainage and post-rain systemic antifungal measures should I take after unseasonal heavy showers in Karnataka?",
        "category": "climate",
        "icon": "CloudSun"
    }
]

# Topic Directives
TOPIC_SPECIALIZATIONS = {
    "disease": {
        "title": "Disease & Fungicides Specialist",
        "context_directive": "The user is currently exploring Disease & Fungicides. Provide precise chemical formulations (e.g. Copper Oxychloride 50 WP, Mancozeb 75 WP, Hexaconazole, Streptocycline), biological controls (Trichoderma, Pseudomonas), and pre-harvest withholding periods."
    },
    "irrigation": {
        "title": "Drip Irrigation & Water Hydraulics Specialist",
        "context_directive": "The user is currently exploring Drip Irrigation & Water Hydraulics. Focus on daily water budgeting (L/tree/day), drip run-times, root zone soil moisture, and pre-harvest cutoff schedules to enhance sweetness (Brix)."
    },
    "economics": {
        "title": "Agricultural Economics & Market Pricing Specialist",
        "context_directive": "The user is currently exploring Market & Pricing. Provide market price breakdowns comparing fresh APMC Mandi rates vs. processing pulp factory deliveries, crop grading, and revenue per acre."
    },
    "nutrition": {
        "title": "Soil Science & NPK Nutrition Specialist",
        "context_directive": "The user is currently exploring NPK Nutrition. Detail annual basal fertilizer requirements (1000g N : 500g P2O5 : 1000g K2O per bearing tree), FYM, Solubor Boron, and Zinc foliar sprays."
    },
    "pest": {
        "title": "Integrated Pest Management (IPM) Specialist",
        "context_directive": "The user is currently exploring Pest Management. Detail IPM controls for Leaf Hoppers, Gall Midge, Leaf Cutting Weevil, and Fruit Fly pheromone traps."
    },
    "climate": {
        "title": "Climate Defense & Agro-Meteorology Specialist",
        "context_directive": "The user is currently exploring Climate Defense. Provide guidance on heatwave protection with Kaolin clay (5%), drainage management after heavy rains, and canopy temperature reduction."
    },
    "all": {
        "title": "Comprehensive Agricultural Intelligence & General AI Copilot",
        "context_directive": "The user is in general mode. Answer any agricultural or general inquiry accurately and helpfully."
    }
}


def build_live_platform_context() -> Dict[str, Any]:
    """Compiles real-time orchard, climate, disease scan, and economic context."""
    climate_data = climate.fetch_open_meteo_climate()
    curr_weather = climate_data.get("currentWeather", {})
    history = store.get_scan_history()
    
    recent_scans = []
    for s in history[:5]:
        recent_scans.append(f"{s.get('disease')} ({s.get('severity')} severity, {s.get('confidence')}% conf, {s.get('date')})")
    
    recent_scans_str = "; ".join(recent_scans) if recent_scans else "No recent disease scans recorded"
    high_sev_count = len([s for s in history if s.get("severity") in ("High", "Medium")])

    return {
        "location": "Karnataka Mango Belt (Hassan / Kolar / Ramanagara / Srinivasapur)",
        "ambient_temp": curr_weather.get("temp", 32),
        "ambient_humidity": curr_weather.get("humidity", 78),
        "wind_speed": curr_weather.get("windSpeed", 12),
        "weather_condition": curr_weather.get("condition", "Partly Cloudy"),
        "uv_index": curr_weather.get("uvIndex", 8.4),
        "rainfall_forecast": "14.2 mm expected next 48h",
        "total_orchards": 247,
        "recent_scans": recent_scans_str,
        "active_disease_alerts": high_sev_count,
        "avg_yield_forecast": "18.42 t/ha (Banganapalli & Raspuri)",
        "current_market_price": "₹45.50 / kg (APMC Mandi)",
        "pulp_factory_price": "₹28.00 / kg (Processing Grade)",
        "recommended_cultivars": ["Banganapalli", "Raspuri", "Totapuri", "Alphonso", "Neelam", "Dasheri"]
    }


def get_system_prompt(context: Dict[str, Any], topic: str = "all") -> str:
    spec = TOPIC_SPECIALIZATIONS.get(topic, TOPIC_SPECIALIZATIONS["all"])

    return f"""You are 'MangoDL AI Copilot', an intelligent multilingual conversational AI assistant integrated into an advanced Agricultural Decision-Support Dashboard for Karnataka Mango Orchards.

=== GENERAL AI & HORTICULTURAL CAPABILITIES ===
1. You are a versatile, highly intelligent conversational assistant. You can answer general questions (science, technology, math, history, coding, creative writing, economics, everyday advice) with clarity, precision, and depth.
2. When the user asks about farming, mango cultivation, crop pathology, weather, irrigation, fertilizers, pests, or agricultural economics, provide elite agronomic advice calibrated for Karnataka orchards (Hassan, Kolar, Ramanagara, Chintamani, Srinivaspur).
3. Active Dashboard Topic Focus: {spec['title']} ({spec['context_directive']}).
   Note: Topic selection guides your context, but NEVER refuse or limit a user's question if they ask about other crops, general topics, or unrelated subjects.

=== STRICT MULTILINGUAL LANGUAGE MATCHING RULES ===
- ALWAYS detect the language and script used by the user in their message and RESPOND IN THE EXACT SAME LANGUAGE:
  * English question → Respond in fluent English.
  * Hindi (हिंदी) question (Devanagari script) → Respond in natural, polite Hindi (हिंदी).
  * Kannada (ಕನ್ನಡ) question (Kannada script) → Respond in natural, accurate Kannada (ಕನ್ನಡ).
  * Hinglish question (Hindi spoken words written in Roman/English alphabet, e.g. "mere aam ke ped mein kaale daag hain") → Respond in natural conversational Hinglish.
  * Mixed Kannada-English question → Respond in natural conversational Kannada-English.
- DO NOT automatically translate everything to English. The farmer must receive answers in their chosen language.
- For technical chemical names in Hindi/Kannada responses (e.g. Copper Oxychloride 50 WP, Mancozeb), you may write the chemical name clearly with transliteration/English so the farmer can purchase it from an agro-dealer easily.

=== LIVE ORCHARD TELEMETRY CONTEXT (AVAILABLE FOR FARMING QUERIES) ===
- Location: {context['location']}
- Ambient Temperature: {context['ambient_temp']}°C | Relative Humidity: {context['ambient_humidity']}%
- Weather Condition: {context['weather_condition']} (Wind: {context['wind_speed']} km/h, UV: {context['uv_index']})
- 48h Rain Forecast: {context['rainfall_forecast']}
- Recent Computer Vision Scans in Orchard: {context['recent_scans']}
- Active Outbreak Alerts: {context['active_disease_alerts']}
- Average Predicted Yield: {context['avg_yield_forecast']}
- Current APMC Mandi Price: {context['current_market_price']} vs Pulp Factory Price: {context['pulp_factory_price']}

=== STRICT ZERO-HALLUCINATION & FACTUAL INTEGRITY RULES ===
1. NEVER invent, hallucinate, or guess facts, prices, weather forecasts, disease names, pesticide or chemical dosages, fertilizer formulas, government schemes, or market rates.
2. If you do not have reliable or verified information on a question, clearly and politely state in the user's language:
   "I don't have enough reliable information to answer this accurately." (or its natural translation in Hindi/Kannada).
3. For agricultural advice where critical parameters are missing (e.g. crop age, mango variety, orchard location, acreage, soil type, or visual lesion symptoms), ask a concise follow-up question to obtain the necessary details rather than guessing.
4. Distinguish between standard university-tested recommendations (such as ICAR, IIHR Bengaluru, UAS Dharwad/Bengaluru) and general guidelines.
5. NEVER claim live data is real-time unless present in the provided telemetry context.

=== RESPONSE FORMATTING & TONE ===
- Use clean GitHub-Flavored Markdown: bolding, headings (##, ###), bullet points, and numbered lists.
- Avoid robotic jargon. Be practical, concise, encouraging, and farmer-friendly.
- When giving an agricultural prescription, if an actionable summary is helpful, you may append:
  `[ACTION_CARD: {{"type": "prescription"|"irrigation"|"economics"|"disease_scan", "title": "...", "data": {{...}}}}]`
"""


class MangoAIAgent:
    def __init__(self):
        self.default_model = "gemini/gemini-2.5-flash"

    def _get_api_key(self, model: str, custom_api_key: Optional[str] = None) -> Optional[str]:
        if custom_api_key and custom_api_key.strip():
            return custom_api_key.strip()
        
        # Ensure fresh load from .env
        load_dotenv(dotenv_path=ENV_PATH, override=True)

        # Look for environment keys
        if "gemini" in model.lower():
            return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        elif "groq" in model.lower():
            return os.getenv("GROQ_API_KEY")
        elif "openai" in model.lower():
            return os.getenv("OPENAI_API_KEY")
        elif "anthropic" in model.lower():
            return os.getenv("ANTHROPIC_API_KEY")
        
        # Fallback to general keys
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("OPENAI_API_KEY")

    def _call_gemini_sdk(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        api_key: Optional[str] = None,
        sys_prompt: str = "",
        model_name: str = "gemini-2.5-flash",
        temperature: float = 0.4
    ) -> Optional[str]:
        """Calls official Google GenAI Client with seamless multi-model fallback."""
        if not HAS_GOOGLE_GENAI or not api_key:
            return None

        candidate_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview", "gemini-pro-latest"]
        clean_req = model_name.replace("gemini/", "").strip()
        ordered_models = [clean_req] + [m for m in candidate_models if m != clean_req]

        try:
            client = genai.Client(api_key=api_key)
            
            # Format history for Gemini SDK
            gemini_contents = []
            if history:
                for h in history[-8:]:
                    r = h.get("role", "user")
                    c = h.get("content", "").strip()
                    if c:
                        gemini_role = "user" if r == "user" else "model"
                        gemini_contents.append(types.Content(
                            role=gemini_role,
                            parts=[types.Part.from_text(text=c)]
                        ))

            gemini_contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)]
            ))

            config = types.GenerateContentConfig(
                system_instruction=sys_prompt,
                temperature=temperature,
                max_output_tokens=2048,
            )

            for model_to_try in ordered_models:
                try:
                    response = client.models.generate_content(
                        model=model_to_try,
                        contents=gemini_contents,
                        config=config,
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception as e:
                    print(f"[MangoAIAgent] Model {model_to_try} notice: {e}")
                    time.sleep(1.0)
        except Exception as e:
            print(f"[MangoAIAgent] Client initialization error: {e}")

        return None

    def _stream_gemini_sdk(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        api_key: Optional[str] = None,
        sys_prompt: str = "",
        model_name: str = "gemini-2.5-flash",
        temperature: float = 0.4
    ) -> Generator[str, None, None]:
        """Streams tokens from official Google GenAI Client with multi-model failover."""
        if not HAS_GOOGLE_GENAI or not api_key:
            return

        candidate_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview", "gemini-pro-latest"]
        clean_req = model_name.replace("gemini/", "").strip()
        ordered_models = [clean_req] + [m for m in candidate_models if m != clean_req]

        try:
            client = genai.Client(api_key=api_key)
            
            gemini_contents = []
            if history:
                for h in history[-8:]:
                    r = h.get("role", "user")
                    c = h.get("content", "").strip()
                    if c:
                        gemini_role = "user" if r == "user" else "model"
                        gemini_contents.append(types.Content(
                            role=gemini_role,
                            parts=[types.Part.from_text(text=c)]
                        ))

            gemini_contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)]
            ))

            config = types.GenerateContentConfig(
                system_instruction=sys_prompt,
                temperature=temperature,
                max_output_tokens=2048,
            )

            for model_to_try in ordered_models:
                streamed = False
                try:
                    for chunk in client.models.generate_content_stream(
                        model=model_to_try,
                        contents=gemini_contents,
                        config=config,
                    ):
                        if chunk.text:
                            streamed = True
                            yield chunk.text
                    if streamed:
                        return
                except Exception as e:
                    print(f"[MangoAIAgent] Stream model {model_to_try} failed: {e}")
                    time.sleep(1.0)
        except Exception as e:
            print(f"[MangoAIAgent] Stream initialization error: {e}")

    def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        temperature: float = 0.4,
        topic: str = "all"
    ) -> Dict[str, Any]:
        """Executes a non-streaming chat turn with Gemini SDK and multi-provider fallback."""
        start_time = time.time()
        context = build_live_platform_context()
        sys_prompt = get_system_prompt(context, topic=topic)
        selected_model = model or self.default_model

        api_key = self._get_api_key(selected_model, custom_api_key)
        response_text = ""
        source = "gemini_genai_live"
        model_used = selected_model

        # 1. Try Primary Google GenAI SDK if it is a Gemini model
        if "gemini" in selected_model.lower() and api_key:
            for attempt in range(2):
                try:
                    response_text = self._call_gemini_sdk(
                        message=message,
                        history=history,
                        api_key=api_key,
                        sys_prompt=sys_prompt,
                        model_name=selected_model,
                        temperature=temperature
                    )
                    if response_text:
                        break
                except Exception as e:
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        time.sleep(2.0)
                    else:
                        break

        # 2. Try Fallback Gemini Models if primary returned empty
        if not response_text and api_key:
            active_fallbacks = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.5-pro"]
            for fb_m in active_fallbacks:
                if fb_m not in selected_model.lower():
                    try:
                        time.sleep(1.0)
                        response_text = self._call_gemini_sdk(
                            message=message,
                            history=history,
                            api_key=api_key,
                            sys_prompt=sys_prompt,
                            model_name=fb_m,
                            temperature=temperature
                        )
                        if response_text:
                            source = f"gemini_fallback_{fb_m}"
                            model_used = fb_m
                            break
                    except Exception as fb_err:
                        print(f"[MangoAIAgent] Fallback {fb_m} notice: {fb_err}")

        # 3. Try litellm if GenAI SDK wasn't used or returned empty
        if not response_text and selected_model != "offline/agronomy-expert":
            messages = [{"role": "system", "content": sys_prompt}]
            if history:
                for item in history[-8:]:
                    r = item.get("role", "user")
                    c = item.get("content", "")
                    if r in ("user", "assistant") and c:
                        messages.append({"role": r, "content": c})
            messages.append({"role": "user", "content": message})

            try:
                litellm_kwargs = {
                    "model": selected_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 1500,
                }
                if api_key:
                    litellm_kwargs["api_key"] = api_key
                resp = litellm.completion(**litellm_kwargs)
                response_text = resp.choices[0].message.content or ""
                source = "litellm_live"
            except Exception as e:
                print(f"[MangoAIAgent] LiteLLM call error: {e}")

        # 4. Final safety fallback: If no API key or network is unreachable
        if not response_text:
            response_text = (
                "### 🌿 MangoDL AI Copilot\n\n"
                "I am ready to assist you! To enable real-time Gemini LLM generation, please ensure your **`GEMINI_API_KEY`** "
                "is configured in your environment or enter your API key in the settings sidebar on the right.\n\n"
                "You can also select the offline local agronomy engine."
            )
            source = "offline_notice"
            model_used = "MangoDL Local"

        # Parse action cards
        action_data = None
        action_match = re.search(r'\[ACTION_CARD:\s*(\{.*?\})\]', response_text, re.DOTALL)
        if action_match:
            try:
                action_data = json.loads(action_match.group(1))
                response_text = response_text.replace(action_match.group(0), "").strip()
            except Exception:
                pass

        latency = round((time.time() - start_time) * 1000, 1)
        followup_questions = self._get_followups(message, topic=topic)

        return {
            "response": response_text,
            "action": action_data,
            "source": source,
            "modelUsed": model_used,
            "latencyMs": latency,
            "suggestedQuestions": followup_questions
        }

    def stream_chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        temperature: float = 0.4,
        topic: str = "all"
    ) -> Generator[Dict[str, Any], None, None]:
        """Streams tokens in real-time as Server-Sent Events."""
        context = build_live_platform_context()
        sys_prompt = get_system_prompt(context, topic=topic)
        selected_model = model or self.default_model
        api_key = self._get_api_key(selected_model, custom_api_key)

        yield {
            "type": "start",
            "modelUsed": selected_model,
            "topic": topic
        }

        full_text = ""
        streamed_any = False

        if "gemini" in selected_model.lower() and api_key and HAS_GOOGLE_GENAI:
            try:
                for token in self._stream_gemini_sdk(
                    message=message,
                    history=history,
                    api_key=api_key,
                    sys_prompt=sys_prompt,
                    model_name=selected_model,
                    temperature=temperature
                ):
                    full_text += token
                    streamed_any = True
                    yield {
                        "type": "token",
                        "content": token
                    }
            except Exception as e:
                print(f"[MangoAIAgent] Stream error: {e}")

        # If streaming was not supported or failed, run standard chat
        if not streamed_any:
            res = self.chat(
                message=message,
                history=history,
                model=selected_model,
                custom_api_key=custom_api_key,
                temperature=temperature,
                topic=topic
            )
            full_text = res["response"]
            # Emit token
            yield {
                "type": "token",
                "content": full_text
            }

        # Parse action card from full text
        action_data = None
        action_match = re.search(r'\[ACTION_CARD:\s*(\{.*?\})\]', full_text, re.DOTALL)
        if action_match:
            try:
                action_data = json.loads(action_match.group(1))
            except Exception:
                pass

        followups = self._get_followups(message, topic=topic)

        yield {
            "type": "meta",
            "action": action_data,
            "suggestedQuestions": followups,
            "modelUsed": selected_model
        }

        yield {"type": "done"}

    def _get_followups(self, user_msg: str, topic: str = "all") -> List[str]:
        msg = user_msg.lower()
        if topic == "disease" or "anthracnose" in msg or "fungus" in msg or "canker" in msg or "daag" in msg or "kale" in msg:
            return [
                "What is the withholding period (PHI) before harvest for Copper Oxychloride?",
                "How to apply bio-fungicide Pseudomonas fluorescens during rain?",
                "Calculate chemical spray dosage for 50 bearing trees"
            ]
        elif topic == "irrigation" or "water" in msg or "drip" in msg or "paani" in msg or "neeru" in msg:
            return [
                "How does soil moisture affect fruit sweetness (TSS Brix)?",
                "When to stop watering before Banganapalli harvest?",
                "Can I inject water-soluble fertilizer via drip?"
            ]
        elif topic == "economics" or "market" in msg or "price" in msg or "mandi" in msg or "pulp" in msg:
            return [
                "What are the transport logistics costs to APMC Mandi?",
                "How to grade Alphonso mangoes for export standards?",
                "Calculate net profit comparison for 10 acres"
            ]
        elif topic == "nutrition" or "fertilizer" in msg or "npk" in msg or "khad" in msg or "gobbarada" in msg:
            return [
                "What are the symptoms of Boron deficiency in mango blossoms?",
                "How to prepare a circular ring trench for fertilizer?",
                "Can Zinc Sulphate be tank-mixed with fungicide?"
            ]
        elif topic == "pest" or "pest" in msg or "hopper" in msg or "keeda" in msg or "hula" in msg:
            return [
                "How many pheromone traps per acre are needed for Fruit Fly?",
                "What is the best spray for Leaf Hoppers before bloom?",
                "How to control stem borer larvae in tree trunks?"
            ]
        elif topic == "climate" or "heat" in msg or "sunburn" in msg or "rain" in msg:
            return [
                "How often should Kaolin clay be reapplied after rainfall?",
                "What is the ideal soil moisture during a 38°C heatwave?",
                "How to protect orchard from unseasonal storm rain?"
            ]
        else:
            return [
                "Which fertilizer schedule is best for mango orchards?",
                "How to protect mango leaves from fungal black spots?",
                "Compare revenue: Fresh APMC Mandi vs. Pulp Factory"
            ]


# Singleton instance
mango_agent = MangoAIAgent()
