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
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { PageTransition } from "@/components/animations/page-transition";
import {
  sendAgentMessage,
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

*Ask any agronomic question, request a treatment dosage calculation, or pick from the suggested topics below.*`,
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
  const [models, setModels] = useState<AgentModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini/gemini-2.5-flash");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [presets, setPresets] = useState<AgentPreset[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInputVal, setKeyInputVal] = useState("");
  const [testKeySuccess, setTestKeySuccess] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: AgentChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendAgentMessage({
        message: text.trim(),
        history,
        model: selectedModel,
        apiKey: customApiKey || undefined,
      });

      const assistantMsg: AgentChatMessage = {
        role: "assistant",
        content: res.response,
        action: res.action,
        modelUsed: res.modelUsed,
        latencyMs: res.latencyMs,
        source: res.source,
        suggestedQuestions: res.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
        speakText(res.response);
      }
    } catch (err: any) {
      const errorMsg: AgentChatMessage = {
        role: "assistant",
        content: `### ⚠️ Connection Notice
Could not connect to online LLM endpoint. Fallback active:

* **Recommendation:** Enter a custom Gemini, Groq, or OpenAI API key in the right sidebar or select the Offline Agronomy Engine.
* **Error:** ${err?.message || "Service unavailable"}`,
        modelUsed: "Offline Fallback",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const plain = text.replace(/[*#`_\[\]]/g, "").replace(/\(.*?\)/g, "").slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
    { id: "all", label: "All Topics", icon: Brain },
    { id: "disease", label: "Disease & Fungicides", icon: Microscope },
    { id: "irrigation", label: "Drip Irrigation", icon: Droplets },
    { id: "economics", label: "Market & Pricing", icon: DollarSign },
    { id: "nutrition", label: "NPK Nutrition", icon: FlaskConical },
    { id: "pest", label: "Pest Management", icon: Bug },
    { id: "climate", label: "Climate Defense", icon: CloudSun },
  ];

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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                      active
                        ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
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
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      setTtsEnabled((prev) => !prev);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                      ttsEnabled
                        ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Volume2 className="h-3.5 w-3.5 animate-bounce text-yellow-400" />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                        <span>Audio Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

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
                          : "bg-[#14181f]/90 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md"
                      }`}
                    >
                      {/* Assistant Header Badge */}
                      {msg.role === "assistant" && (
                        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 mb-2 text-[11px] text-gray-400">
                          <span className="font-mono text-yellow-400 font-medium truncate">{msg.modelUsed || "MangoDL AI Copilot"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                            <button
                              onClick={() => handleCopyText(msg.content, index)}
                              className="hover:text-white transition-colors p-0.5"
                              title="Copy message"
                            >
                              {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Formatted */}
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Action Card Rendering */}
                      {msg.action && (
                        <div className="mt-3.5 p-3.5 rounded-xl bg-black/60 border border-yellow-500/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                              <Zap className="h-4 w-4" />
                              {msg.action.title}
                            </span>
                            <NeonBadge label="ACTION CARD" variant="mango" />
                          </div>
                          {msg.action.data && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                              {Object.entries(msg.action.data).map(([k, v]) => (
                                <div key={k} className="p-2 rounded-lg bg-white/5 border border-white/5">
                                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{k.replace("_", " ")}</span>
                                  <span className="font-medium text-white truncate block mt-0.5">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && index === messages.length - 1 && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                          <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Recommended Follow-ups:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedQuestions.map((q, qIdx) => (
                              <button
                                key={qIdx}
                                onClick={() => handleSendMessage(q)}
                                className="text-left text-xs px-3 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/25 transition-all"
                              >
                                → {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white mt-0.5">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-3.5 items-start">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                      <Bot className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-[#14181f] border border-white/10 p-4 text-xs text-gray-400 flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-ping" />
                      <span>Synthesizing live orchard telemetry, disease knowledge, and dosage formulas...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Presets Drawer */}
              <div className="px-5 py-2.5 border-t border-white/10 bg-black/30 flex gap-2 overflow-x-auto scrollbar-none">
                {filteredPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="border-t border-white/10 p-4 bg-black/60">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={term("Ask about mango diseases, treatments, yields...")}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
                  />

                  <GlowButton
                    type="submit"
                    variant="mango"
                    size="sm"
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 px-5 rounded-xl shrink-0 flex items-center gap-2"
                  >
                    <span>{term("Send")}</span>
                    <Send className="h-4 w-4" />
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
