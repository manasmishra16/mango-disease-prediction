"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Key,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Droplets,
  Microscope,
  DollarSign,
  Zap,
  Check,
  Copy,
  Leaf,
  Sliders,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  sendAgentMessage,
  getAgentModels,
  getAgentPresets,
  getAgentStatus,
  type AgentChatMessage,
  type AgentModelInfo,
  type AgentPreset,
} from "@/lib/api-client";
import { NeonBadge } from "@/components/ui/neon-badge";
import { GlowButton } from "@/components/ui/glow-button";
import { useLocalizedText } from "@/lib/localization";

const initialGreeting: AgentChatMessage = {
  role: "assistant",
  content: `### 🌿 Hello! I am your MangoDL AI Agronomist Copilot.

I have live context of your orchards in **Karnataka** (Hassan / Kolar / Ramanagara).

How can I assist your crop operations today?
* 🔬 **Disease Diagnosis & Fungicide Prescriptions** (Anthracnose, Powdery Mildew, Die Back)
* 💧 **Precision Drip Fertigation & Irrigation Schedules**
* 💰 **Market vs. Pulp Factory Profit Optimization**
* 🧪 **Nutritional NPK & Micronutrient (Boron/Zinc) Planning**`,
  modelUsed: "Gemini 2.5 Flash / MangoDL Agronomy Engine",
  timestamp: "Just now",
  suggestedQuestions: [
    "How to treat Anthracnose in high humidity?",
    "Calculate optimal drip irrigation for Hassan today",
    "Should I sell Banganapalli to APMC market or pulp factory?",
    "Recommended NPK schedule after fruit harvest"
  ]
};

export function AIAgentWidget() {
  const { term } = useLocalizedText();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AgentChatMessage[]>([initialGreeting]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<AgentModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini/gemini-2.5-flash");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [presets, setPresets] = useState<AgentPreset[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved API key and presets on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("mangodl_user_api_key");
      if (savedKey) {
        setCustomApiKey(savedKey);
        setTempApiKey(savedKey);
      }
      const savedModel = localStorage.getItem("mangodl_selected_model");
      if (savedModel) setSelectedModel(savedModel);
    }

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

    getAgentPresets()
      .then((res) => {
        if (res && res.presets) setPresets(res.presets);
      })
      .catch(() => {});
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
      // Build history
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
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

      // Read aloud if enabled
      if (ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
        speakText(res.response);
      }
    } catch (err: any) {
      const errorMsg: AgentChatMessage = {
        role: "assistant",
        content: `### ⚠️ Connection Notice
Could not connect to online LLM router. Using local Agronomy Knowledge Base:

* **Recommendation:** You can configure a custom Gemini / OpenAI / Groq API key in the widget settings (🔑 button above) or switch models.
* **Error details:** ${err?.message || "Service temporarily unavailable."}`,
        modelUsed: "Offline Safe Fallback",
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
    // Strip markdown chars
    const plain = text.replace(/[*#`_\[\]]/g, "").replace(/\(.*?\)/g, "").slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
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

  const handleSaveApiKey = () => {
    setCustomApiKey(tempApiKey);
    if (typeof window !== "undefined") {
      localStorage.setItem("mangodl_user_api_key", tempApiKey);
    }
    setShowKeyModal(false);
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    if (typeof window !== "undefined") {
      localStorage.setItem("mangodl_selected_model", modelId);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
    stopSpeaking();
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full border border-yellow-500/30 bg-[var(--background-elevated)] backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] text-xs text-amber-500 font-medium cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Mango Agronomist AI</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-amber-600 dark:text-yellow-400 font-bold">2.5 LIVE</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setHasUnread(false);
          }}
          className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 text-black shadow-[0_0_28px_rgba(245,158,11,0.45)] border border-yellow-300/60 cursor-pointer transition-all"
          aria-label="Open AI Agronomist Agent"
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          ) : (
            <div className="relative">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-black animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-black" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed z-50 flex flex-col rounded-2xl border border-yellow-500/25 bg-[var(--background-elevated)] shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_32px_rgba(245,158,11,0.15)] backdrop-blur-2xl overflow-hidden transition-all duration-300 ${
              isExpanded
                ? "bottom-3 right-3 left-3 top-3 md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-[720px] md:h-[82vh]"
                : "bottom-20 md:bottom-24 right-3 md:right-6 left-3 sm:left-auto sm:w-[440px] h-[78vh] sm:h-[600px] max-h-[85vh]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-[0_0_14px_rgba(245,158,11,0.3)]">
                  <Leaf className="h-4.5 w-4.5" />
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-black" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white truncate">MangoDL AI Copilot</h3>
                    <NeonBadge label="LIVE" variant="mango" />
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">Hassan / Karnataka Agronomy Specialist</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Speech audio toggle */}
                <button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setTtsEnabled((prev) => !prev);
                  }}
                  className={`p-1.5 rounded-lg border transition-all ${
                    ttsEnabled
                      ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                      : "border-white/5 text-gray-400 hover:text-white"
                  }`}
                  title={ttsEnabled ? "Voice Readout: Enabled" : "Voice Readout: Disabled"}
                >
                  {isSpeaking ? <Volume2 className="h-4 w-4 animate-bounce text-yellow-400" /> : ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                {/* API Key settings button */}
                <button
                  onClick={() => setShowKeyModal(true)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    customApiKey
                      ? "border-green-500/40 bg-green-500/15 text-green-400"
                      : "border-white/5 text-gray-400 hover:text-white"
                  }`}
                  title="Configure LLM API Key (Gemini, Groq, OpenAI)"
                >
                  <Key className="h-4 w-4" />
                </button>

                {/* Open full page hub */}
                <Link
                  href="/dashboard/ai-agent"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-all"
                  title="Open Fullscreen AI Agent Hub"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="hidden md:block p-1.5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-all"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Subheader: Model Selector & Clear action */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-black/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[11px]">{term("AI Model")}:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => handleSelectModel(e.target.value)}
                  className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-yellow-400 font-medium focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                >
                  <option value="gemini/gemini-2.5-flash" className="bg-gray-900 text-white">Gemini 2.5 Flash</option>
                  <option value="gemini/gemini-2.0-flash" className="bg-gray-900 text-white">Gemini 2.0 Flash</option>
                  <option value="groq/llama-3.3-70b-versatile" className="bg-gray-900 text-white">Groq LLaMA 3.3 70B</option>
                  <option value="openai/gpt-4o-mini" className="bg-gray-900 text-white">OpenAI GPT-4o Mini</option>
                  <option value="offline/agronomy-expert" className="bg-gray-900 text-white">{term("Local Knowledge Base")}</option>
                </select>
              </div>

              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-yellow-400 transition-colors"
                title={term("Clear Chat")}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{term("Clear Chat")}</span>
              </button>
            </div>

            {/* Messages Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium shadow-[0_4px_16px_rgba(245,158,11,0.25)] rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md"
                    }`}
                  >
                    {/* Assistant header badges */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2 text-[10px] text-gray-400">
                        <span className="font-mono text-yellow-400/90 truncate">{msg.modelUsed || "MangoDL Agronomist"}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                          <button
                            onClick={() => handleCopyText(msg.content, index)}
                            className="hover:text-white transition-colors p-0.5"
                            title="Copy text"
                          >
                            {copiedIndex === index ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message Body formatted */}
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Action Card if triggered */}
                    {msg.action && (
                      <div className="mt-3 p-3 rounded-xl bg-black/50 border border-yellow-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5" />
                            {msg.action.title}
                          </span>
                          <NeonBadge label="ACTION" variant="mango" />
                        </div>
                        {msg.action.data && (
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-300">
                            {Object.entries(msg.action.data).map(([k, v]) => (
                              <div key={k} className="p-1.5 rounded-lg bg-white/5">
                                <span className="text-gray-400 block text-[9px] uppercase">{k.replace("_", " ")}</span>
                                <span className="font-medium text-white truncate block">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested followups */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && index === messages.length - 1 && (
                      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
                        <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Suggested Questions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 transition-all"
                            >
                              → {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white/5 border border-white/10 p-3.5 text-xs text-gray-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
                    <span>Analyzing orchard climate & agronomic formulation...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips (Carousel) */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex gap-2 overflow-x-auto scrollbar-none">
                {presets.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSendMessage(p.prompt)}
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 hover:text-white transition-all text-left"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="p-3 border-t border-white/5 bg-black/50">
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
                  placeholder={term("Type a message...")}
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="h-9 w-9 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center shrink-0 disabled:opacity-30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-yellow-500/30 bg-[#0e1217] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-base font-semibold text-white">Custom LLM API Key</h3>
                </div>
                <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                You can enter your own **Google Gemini**, **Groq**, or **OpenAI** API key. Keys are securely stored in your local browser session and passed only for your agent requests.
              </p>

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium">API Secret Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy... / gsk_... / sk-..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-yellow-300 font-mono focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey("");
                    setCustomApiKey("");
                    localStorage.removeItem("mangodl_user_api_key");
                    setShowKeyModal(false);
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Clear Key (Use Server Default)
                </button>

                <div className="flex gap-2">
                  <GlowButton variant="ghost" size="sm" onClick={() => setShowKeyModal(false)}>
                    Cancel
                  </GlowButton>
                  <GlowButton variant="mango" size="sm" onClick={handleSaveApiKey}>
                    Save Key
                  </GlowButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
