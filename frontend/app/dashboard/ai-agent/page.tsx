"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Key,
  RotateCcw,
  Leaf,
  Microscope,
  Droplets,
  DollarSign,
  CloudSun,
  FlaskConical,
  Bug,
  Zap,
  Check,
  Copy,
  Activity,
  Radio,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ExternalLink,
  Mic,
  MicOff,
  Square,
  Globe,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { PageTransition } from "@/components/animations/page-transition";
import { MarkdownMessage } from "@/components/ui/markdown-message";
import {
  sendAgentMessage,
  streamAgentMessage,
  getAgentModels,
  getAgentPresets,
  getAgentStatus,
  type AgentChatMessage,
  type AgentModelInfo,
  type AgentPreset,
  type AgentStatusResponse,
} from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

const defaultWelcomeMessage: AgentChatMessage = {
  role: "assistant",
  content: `### 🌿 Welcome to MangoDL AI Copilot Hub!

I am your **Precision Horticultural Agronomist & AI Decision Engine**, calibrated for **Karnataka Mango Orchards** (Hassan, Kolar, Ramanagara, Chintamani, Srinivaspur).

#### 🎯 Active Real-Time Platform Integrations:
* 📡 **Live IoT & Climate Feed**: Open-Meteo weather parameters for Hassan micro-climate.
* 🔬 **Phase 3 Multi-Task CNN**: Real-time leaf pathology & severity score coupling.
* 📈 **Phase 4 XGBoost + LSTM**: NASA POWER climate & satellite vegetation index yield forecast.
* 💰 **Phase 5 Revenue Model**: APMC Mandi Fresh Market vs. Processing Pulp Factory price optimization.
* 🎤 **Multilingual Voice Recognition**: Speak your questions in **English**, **हिंदी (Hindi)**, or **ಕನ್ನಡ (Kannada)** using the microphone button below.

*Ask any agronomic question, speak your query, or pick from the suggested topics below.*`,
  modelUsed: "Gemini 2.5 Flash / MangoDL Agronomy Engine",
  timestamp: "Live",
  suggestedQuestions: [
    "How to treat Anthracnose in high humidity (>80%)?",
    "Generate precision drip irrigation schedule for Hassan",
    "Calculate revenue comparison: APMC Mandi vs. Pulp Factory",
    "Post-harvest NPK fertilizer formulation for Raspuri",
    "How to protect fruit from sunburn and heat stress (>35°C)?"
  ]
};

export default function AIAgentPage() {
  const { term } = useLocalizedText();
  const [messages, setMessages] = useState<AgentChatMessage[]>([defaultWelcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<AgentModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini/gemini-2.5-flash");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [presets, setPresets] = useState<AgentPreset[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInputVal, setKeyInputVal] = useState("");
  const [testKeySuccess, setTestKeySuccess] = useState<boolean | null>(null);

  // Real Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en-IN" | "hi-IN" | "kn-IN">("en-IN");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load available speech synthesis voices proactively
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      try {
        const vList = window.speechSynthesis.getVoices();
        if (vList && vList.length > 0) {
          setVoices(vList);
        }
      } catch (e) {}
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Load local storage
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("mangodl_user_api_key");
      if (savedKey) {
        setCustomApiKey(savedKey);
        setKeyInputVal(savedKey);
      }
      const savedModel = localStorage.getItem("mangodl_selected_model");
      if (savedModel) setSelectedModel(savedModel);
      const savedVoiceLang = localStorage.getItem("mangodl_voice_lang");
      if (savedVoiceLang && (savedVoiceLang === "en-IN" || savedVoiceLang === "hi-IN" || savedVoiceLang === "kn-IN")) {
        setVoiceLang(savedVoiceLang as any);
      }
    }

    // Fetch Models
    getAgentModels()
      .then((res) => {
        if (res && res.models) {
          setModels(res.models);
          if (res.defaultModel && !localStorage.getItem("mangodl_selected_model")) {
            setSelectedModel(res.defaultModel);
          }
        }
      })
      .catch(() => {});

    // Fetch Presets
    getAgentPresets()
      .then((res) => {
        if (res && res.presets) setPresets(res.presets);
      })
      .catch(() => {});

    // Fetch Status & Live Context
    getAgentStatus()
      .then((res) => {
        if (res) setAgentStatus(res);
      })
      .catch(() => {});

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isStreaming]);

  // Real Speech Recognition Controller
  const startListening = () => {
    setVoiceError(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support live speech recognition. Please use Google Chrome, Microsoft Edge, or a Web Speech-compatible browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      let baseText = inputValue.trim();

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (final) {
          baseText = (baseText ? baseText + " " : "") + final.trim();
          setInputValue(baseText);
        } else if (interim) {
          const preview = baseText ? `${baseText} ${interim}` : interim;
          setInputValue(preview);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setVoiceError("Microphone permission is required. Please click the camera/mic icon in your browser address bar to allow access.");
        } else if (event.error === "no-speech") {
          // User paused silently
        } else if (event.error === "audio-capture") {
          setVoiceError("No microphone was detected on your device. Please plug in a microphone.");
        } else if (event.error === "network") {
          setVoiceError("Network issue during speech recognition. Please check your internet connection.");
        } else {
          setVoiceError(`Voice input stopped (${event.error}). Click the mic to start again.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error("Speech recognition start failed:", e);
      setVoiceError("Could not access microphone: " + (e?.message || "Check device permissions"));
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isListening) stopListening();

    const text = textToSend || inputValue;
    if (!text.trim() || isLoading || isStreaming) return;

    const userMsg: AgentChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue("");
    setIsLoading(true);
    setIsStreaming(true);

    const placeholderMsg: AgentChatMessage = {
      role: "assistant",
      content: "",
      modelUsed: selectedModel,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...nextMessages, placeholderMsg]);

    let accumulatedText = "";
    const historyPayload = nextMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      await streamAgentMessage(
        {
          message: text.trim(),
          history: historyPayload,
          model: selectedModel,
          apiKey: customApiKey || undefined,
          topic: activeCategory,
        },
        (token) => {
          accumulatedText += token;
          setIsLoading(false);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulatedText,
            };
            return updated;
          });
        },
        (meta) => {
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              action: meta.action ?? updated[updated.length - 1].action,
              suggestedQuestions: meta.suggestedQuestions ?? updated[updated.length - 1].suggestedQuestions,
              modelUsed: meta.modelUsed ?? updated[updated.length - 1].modelUsed,
            };
            return updated;
          });
        }
      );

      setIsLoading(false);
      setIsStreaming(false);

      if (ttsEnabled && accumulatedText) {
        speakAIResponse(accumulatedText, nextMessages.length);
      }
    } catch (err: any) {
      console.warn("Stream interrupted, attempting standard fallback...", err);
      // Fallback to standard chat endpoint if stream has an issue
      try {
        const res = await sendAgentMessage({
          message: text.trim(),
          history: historyPayload,
          model: selectedModel,
          apiKey: customApiKey || undefined,
          topic: activeCategory,
        });

        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: res.response,
            action: res.action,
            suggestedQuestions: res.suggestedQuestions,
            modelUsed: res.modelUsed,
            latencyMs: res.latencyMs,
          };
          return updated;
        });

        setIsLoading(false);
        setIsStreaming(false);

        if (ttsEnabled && res.response) {
          speakAIResponse(res.response, nextMessages.length);
        }
      } catch (fallbackErr: any) {
        setIsLoading(false);
        setIsStreaming(false);
        const errorText = "Sorry, I couldn't process that request right now. Please check your connection and try again.";
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: errorText,
            modelUsed: "Error",
          };
          return updated;
        });
      }
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      activeUtteranceRef.current = null;
    }
  };

  const speakAIResponse = (rawText: string, msgIndex?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // If clicking the speaker of the message that is ALREADY speaking -> Stop!
    if (isSpeaking && msgIndex !== undefined && speakingMsgIndex === msgIndex) {
      stopSpeaking();
      return;
    }

    // Stop previous and resume speech synthesis pipeline
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // 1. Clean markdown formatting, action cards, code fences, and special symbols
    const clean = rawText
      .replace(/\[ACTION_CARD:[\s\S]*?\]/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~\[\]()|>-]/g, " ")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!clean) return;

    // Limit initial utterance length for responsive start
    const speechText = clean.slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(speechText);
    activeUtteranceRef.current = utterance;
    (window as any)._currentUtterance = utterance; // Prevent Chrome GC bug

    // 2. Language & Script Detection
    const hasKannada = /[\u0C80-\u0CFF]/.test(clean);
    const hasHindi = /[\u0900-\u097F]/.test(clean);

    let targetLang = "en-IN";
    if (hasKannada) {
      targetLang = "kn-IN";
    } else if (hasHindi) {
      targetLang = "hi-IN";
    } else {
      targetLang = voiceLang || "en-IN";
    }

    utterance.lang = targetLang;

    // 3. Dynamic Voice Selection from browser's available voices
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (hasKannada) {
      selectedVoice = currentVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("kn") ||
          v.name.toLowerCase().includes("kannada") ||
          v.name.toLowerCase().includes("kn-in")
      );
    } else if (hasHindi) {
      selectedVoice = currentVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("hi") ||
          v.name.toLowerCase().includes("hindi") ||
          v.name.toLowerCase().includes("hi-in")
      );
    } else {
      selectedVoice =
        currentVoices.find(
          (v) =>
            v.lang.toLowerCase() === "en-in" ||
            v.lang.toLowerCase().includes("in") ||
            v.name.toLowerCase().includes("india")
        ) || currentVoices.find((v) => v.lang.toLowerCase().startsWith("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgIndex !== undefined) setSpeakingMsgIndex(msgIndex);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      activeUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      activeUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveKey = () => {
    setCustomApiKey(keyInputVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("mangodl_user_api_key", keyInputVal);
    }
    setTestKeySuccess(true);
    setTimeout(() => setTestKeySuccess(null), 3000);
  };

  const handleClearKey = () => {
    setKeyInputVal("");
    setCustomApiKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("mangodl_user_api_key");
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredPresets = activeCategory === "all"
    ? presets
    : presets.filter((p) => p.category === activeCategory);

  const categories = [
    { id: "all", label: "All Topics", icon: Brain, subtitle: "Holistic precision agronomy" },
    { id: "disease", label: "Disease & Fungicides", icon: Microscope, subtitle: "Pathology, fungicides & PHI" },
    { id: "irrigation", label: "Drip Irrigation", icon: Droplets, subtitle: "L/tree/day & moisture schedules" },
    { id: "economics", label: "Market & Pricing", icon: DollarSign, subtitle: "APMC Mandi vs. Pulp factory" },
    { id: "nutrition", label: "NPK Nutrition", icon: FlaskConical, subtitle: "Basal doses, Boron & Zinc" },
    { id: "pest", label: "Pest Management", icon: Bug, subtitle: "IPM, Leaf Hoppers & Traps" },
    { id: "climate", label: "Climate Defense", icon: CloudSun, subtitle: "Heat stress & Kaolin shield" },
  ];

  const activeTopicObj = categories.find((c) => c.id === activeCategory);

  const getPlaceholderText = () => {
    switch (activeCategory) {
      case "disease":
        return "Ask about fungicide dosages, Anthracnose spray schedules, bacterial canker...";
      case "irrigation":
        return "Ask about drip schedules, soil moisture target, VPD, pre-harvest cutoff...";
      case "economics":
        return "Ask about APMC Mandi rates, pulp factory profit, grading standards...";
      case "nutrition":
        return "Ask about NPK basal fertilizer, Solubor Boron sprays, Zinc deficiency...";
      case "pest":
        return "Ask about Mango Leaf Hoppers, Gall Midge, Fruit Fly pheromone traps...";
      case "climate":
        return "Ask about Kaolin clay sunburn protection, heatwaves, unseasonal rain...";
      default:
        return term("Ask about mango diseases, treatments, yields, irrigation, markets...");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {term("MangoDL AI Assistant")}
                  <NeonBadge label="LIVE AGENT" variant="mango" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  {term("Ask anything about mango farming, disease management, or agricultural best practices")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Model Selector in Top Right */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Cpu className="h-4 w-4 text-yellow-400 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("mangodl_selected_model", e.target.value);
                  }
                }}
                className="bg-transparent text-xs text-yellow-300 font-medium focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <GlowButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([defaultWelcomeMessage]);
                stopSpeaking();
              }}
              className="flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">{term("Clear Chat")}</span>
            </GlowButton>
          </div>
        </div>

        {/* Main Grid: Chat Stream (Left) + Live Telemetry & Settings (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Conversation Panel (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                      active
                        ? "bg-yellow-500/25 border-yellow-400/70 text-yellow-300 shadow-[0_0_16px_rgba(245,158,11,0.3)] ring-1 ring-yellow-400/40"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-yellow-400 scale-110" : "text-gray-400"}`} />
                    <span>{cat.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-0.5 animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Chat Container Card */}
            <GlassCard className="flex-1 flex flex-col min-h-[580px] h-[68vh] p-0 overflow-hidden border-yellow-500/20" hover={false}>
              {/* Chat Sub-Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span>Agent Model: <strong className="text-yellow-400 font-mono">{selectedModel}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        setTtsEnabled((prev) => !prev);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                      isSpeaking
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : ttsEnabled
                        ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    title={
                      isSpeaking
                        ? "Click to Stop Audio"
                        : ttsEnabled
                        ? "Auto Audio Voice is ON — responses speak automatically"
                        : "Click to enable Auto Audio Voice"
                    }
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-red-400 animate-pulse text-red-400" />
                        <span className="font-semibold text-red-300">Stop Audio</span>
                      </>
                    ) : (
                      <>
                        {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-yellow-400" /> : <VolumeX className="h-3.5 w-3.5 text-gray-400" />}
                        <span>Auto Voice {ttsEnabled ? "ON" : "OFF"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Specialized Domain Focus Banner */}
              {activeCategory !== "all" && activeTopicObj && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-yellow-500/10 border-b border-yellow-500/20 text-xs">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <activeTopicObj.icon className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>
                      <strong className="text-yellow-200">Active Focus:</strong> {activeTopicObj.label} &mdash;{" "}
                      <span className="text-gray-300">{activeTopicObj.subtitle}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className="text-[11px] text-yellow-400/90 hover:text-yellow-200 underline font-medium ml-2 shrink-0 transition-colors"
                  >
                    Reset to All Topics
                  </button>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-400 mt-0.5">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium shadow-[0_4px_20px_rgba(245,158,11,0.25)] rounded-tr-none"
                          : "bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none backdrop-blur-md"
                      }`}
                    >
                      {/* Assistant Header Badge */}
                      {msg.role === "assistant" && (
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-2 mb-2 text-[11px] text-[var(--text-muted)]">
                          <span className="font-mono text-yellow-500 font-medium truncate">{msg.modelUsed || "MangoDL AI Copilot"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                            {/* Interactive Speaker Button */}
                            <button
                              type="button"
                              onClick={() => speakAIResponse(msg.content, index)}
                              className={`p-1 rounded-lg transition-all flex items-center gap-1 ${
                                speakingMsgIndex === index
                                  ? "text-red-400 bg-red-500/20 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                  : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                              }`}
                              title={
                                speakingMsgIndex === index
                                  ? "Click to Stop Audio"
                                  : "Listen to this response (Kannada/Hindi/English)"
                              }
                            >
                              {speakingMsgIndex === index ? (
                                <>
                                  <Square className="h-3.5 w-3.5 fill-red-400 animate-pulse" />
                                  <span className="text-[10px] font-mono text-red-300 font-semibold pr-0.5">Stop</span>
                                </>
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyText(msg.content, index)}
                              className="hover:text-yellow-400 transition-colors p-0.5"
                              title="Copy message"
                            >
                              {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Formatted */}
                      {msg.role === "assistant" ? (
                        <MarkdownMessage content={msg.content} />
                      ) : (
                        <div className="font-medium whitespace-pre-wrap">{msg.content}</div>
                      )}

                      {/* Action Card Rendering */}
                      {msg.action && (
                        <div className="mt-3.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-yellow-500/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-yellow-500 flex items-center gap-1.5">
                              <Zap className="h-4 w-4" />
                              {msg.action.title}
                            </span>
                            <NeonBadge label="ACTION CARD" variant="mango" />
                          </div>
                          {msg.action.data && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                              {Object.entries(msg.action.data).map(([k, v]) => (
                                <div key={k} className="p-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-subtle)]">
                                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">{k.replace("_", " ")}</span>
                                  <span className="font-medium text-[var(--text-primary)] truncate block mt-0.5">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && index === messages.length - 1 && (
                        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono tracking-wider block">Recommended Follow-ups:</span>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedQuestions.map((q, qIndex) => (
                              <button
                                key={qIndex}
                                onClick={() => handleSendMessage(q)}
                                className="text-left text-xs px-3 py-1.5 rounded-xl bg-[var(--surface-soft)] hover:bg-yellow-500/15 border border-[var(--border-subtle)] hover:border-yellow-500/40 text-[var(--text-primary)] hover:text-yellow-500 transition-all flex items-center gap-1.5"
                              >
                                <Sparkles className="h-3 w-3 text-yellow-500 shrink-0" />
                                <span>{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-500 mt-0.5">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-3.5 items-start">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-500">
                      <Bot className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-[var(--surface)] border border-[var(--border-subtle)] p-4 text-xs text-[var(--text-muted)] flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-ping" />
                      <span>Synthesizing live orchard telemetry, disease knowledge, and dosage formulas...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Presets Drawer */}
              <div className="px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--surface-soft)] flex gap-2 overflow-x-auto scrollbar-none items-center">
                <span className="text-[11px] font-semibold text-gray-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  {activeCategory === "all" ? "Quick Starters:" : `${activeTopicObj?.label} Prompts:`}
                </span>
                {filteredPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[var(--background-elevated)] hover:bg-yellow-500/15 border border-[var(--border-subtle)] hover:border-yellow-500/40 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-left flex items-center gap-1.5"
                  >
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--surface)] space-y-2.5">
                {/* Voice Status Alert / Live Listening Banner */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                        <span className="font-semibold text-white">
                          {voiceLang === "kn-IN"
                            ? "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ... (Listening in Kannada)"
                            : voiceLang === "hi-IN"
                            ? "आवाज रिकॉर्ड हो रही है... (Listening in Hindi)"
                            : "Listening live... Speak in English or Hinglish"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={stopListening}
                        className="px-2.5 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white font-medium text-[11px] transition-colors"
                      >
                        Done Speaking
                      </button>
                    </motion.div>
                  )}

                  {voiceError && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{voiceError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVoiceError(null)}
                        className="text-[11px] text-gray-400 hover:text-white ml-2 underline"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isListening) stopListening();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Multilingual Voice Language Toggle */}
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0" title="Select Voice Recognition Language">
                    {(
                      [
                        { id: "en-IN", label: "EN", name: "English" },
                        { id: "hi-IN", label: "हि", name: "Hindi" },
                        { id: "kn-IN", label: "ಕ", name: "Kannada" },
                      ] as const
                    ).map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setVoiceLang(l.id);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("mangodl_voice_lang", l.id);
                          }
                          if (isListening) stopListening();
                        }}
                        className={`px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                          voiceLang === l.id
                            ? "bg-yellow-500/30 text-yellow-300 border border-yellow-400/40 shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                        title={`Speech Recognition: ${l.name}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {/* Real Voice Input Button */}
                  {isListening ? (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="h-11 w-11 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center transition-all shrink-0 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                      title="Stop Voice Recording"
                    >
                      <Square className="h-4 w-4 fill-red-400" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={isLoading || isStreaming}
                      className="h-11 w-11 rounded-xl bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-400/50 text-gray-300 hover:text-yellow-400 flex items-center justify-center transition-all shrink-0 group disabled:opacity-40 cursor-pointer"
                      title={
                        voiceLang === "kn-IN"
                          ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (Speak in Kannada)"
                          : voiceLang === "hi-IN"
                          ? "बोलकर सवाल पूछें (Speak in Hindi)"
                          : "Speak your agricultural query (English / Hinglish)"
                      }
                    >
                      <Mic className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Listening live to your speech..." : getPlaceholderText()}
                    disabled={isLoading || isStreaming}
                    className={`flex-1 rounded-xl bg-white/5 border px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50 ${
                      isListening ? "border-red-500/60 ring-1 ring-red-500/40" : "border-white/10 focus:border-yellow-500/50"
                    }`}
                  />

                  <GlowButton
                    type="submit"
                    variant="mango"
                    size="sm"
                    disabled={!inputValue.trim() || isLoading || isStreaming}
                    className="h-11 w-11 p-0 rounded-xl shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
                    title={term("Send Message")}
                  >
                    {isLoading || isStreaming ? (
                      <RefreshCw className="h-4 w-4 text-black animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 text-black stroke-[2.5]" />
                    )}
                  </GlowButton>
                </form>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT: Live Telemetry & Platform Context (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Live Orchard Context Card */}
            <GlassCard className="p-5 space-y-4" hover={false}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <h3 className="font-semibold text-sm text-white">Live Orchard Telemetry</h3>
                </div>
                <NeonBadge label="SYNCED" variant="neon" />
              </div>

              {agentStatus?.liveContext ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1.5">
                    <div className="flex justify-between text-gray-400">
                      <span>Location</span>
                      <span className="text-white font-medium">{agentStatus.liveContext.location}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Ambient Temperature</span>
                      <span className="text-yellow-400 font-bold">{agentStatus.liveContext.ambient_temp}°C</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Relative Humidity</span>
                      <span className="text-cyan-400 font-bold">{agentStatus.liveContext.ambient_humidity}%</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Weather Condition</span>
                      <span className="text-white">{agentStatus.liveContext.weather_condition}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1.5">
                    <div className="flex justify-between text-gray-400">
                      <span>APMC Mandi Price</span>
                      <span className="text-green-400 font-bold">{agentStatus.liveContext.current_market_price}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Pulp Factory Price</span>
                      <span className="text-amber-400 font-bold">{agentStatus.liveContext.pulp_factory_price}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Yield Forecast</span>
                      <span className="text-white">{agentStatus.liveContext.avg_yield_forecast}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                    <span className="text-gray-400 block mb-1">Recent Leaf Scan Context:</span>
                    <p className="text-gray-200 italic line-clamp-2">{agentStatus.liveContext.recent_scans}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 p-4 text-center">Loading platform telemetry...</div>
              )}
            </GlassCard>

            {/* Active AI Agent Tools Card */}
            <GlassCard className="p-5 space-y-3" hover={false}>
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <ShieldCheck className="h-4 w-4 text-yellow-400" />
                <h3 className="font-semibold text-sm text-white">Active Agentic Tools</h3>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { name: "get_live_climate()", desc: "Open-Meteo Hassan weather radar", status: "Active" },
                  { name: "diagnose_disease_cv()", desc: "SE-Enhanced MangoLeafXNet CNN", status: "Active" },
                  { name: "calculate_yield_xgb()", desc: "NASA POWER + Satellite NDVI Engine", status: "Active" },
                  { name: "optimize_revenue_rules()", desc: "APMC vs. Pulp Factory Profit Matrix", status: "Active" },
                  { name: "generate_prescription()", desc: "Chemical active ingredient dosage", status: "Active" },
                ].map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/5">
                    <div>
                      <span className="font-mono text-yellow-400 text-[11px] block">{tool.name}</span>
                      <span className="text-gray-400 text-[10px]">{tool.desc}</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Custom LLM API Key Configuration Card */}
            <GlassCard className="p-5 space-y-3 border-yellow-500/20" hover={false}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-yellow-400" />
                  <h3 className="font-semibold text-sm text-white">LLM API Key Settings</h3>
                </div>
                {customApiKey ? (
                  <NeonBadge label="CUSTOM KEY" variant="neon" />
                ) : (
                  <NeonBadge label="SERVER DEFAULT" variant="mango" />
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Connect any <strong>Gemini</strong>, <strong>Groq</strong>, or <strong>OpenAI</strong> API key to power your agent.
              </p>

              <div className="space-y-2">
                <input
                  type="password"
                  value={keyInputVal}
                  onChange={(e) => setKeyInputVal(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-yellow-300 font-mono focus:outline-none focus:border-yellow-500/50"
                />

                <div className="flex gap-2">
                  <GlowButton variant="mango" size="sm" onClick={handleSaveKey} className="flex-1 text-xs">
                    Save Key
                  </GlowButton>
                  {customApiKey && (
                    <GlowButton variant="ghost" size="sm" onClick={handleClearKey} className="text-xs text-red-400">
                      Clear
                    </GlowButton>
                  )}
                </div>

                {testKeySuccess && (
                  <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    <span>API Key saved to browser session!</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
