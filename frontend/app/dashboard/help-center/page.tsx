"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  MessageSquare,
  Send,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ExternalLink,
  Trash2,
  MessageCircle,
  FileQuestion,
  BookOpen,
  SendHorizontal,
  Flame,
  Check,
  Building2,
  Calendar,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  getHelpTickets,
  createHelpTicket,
  replyToHelpTicket,
  updateTicketStatus,
  deleteHelpTicket,
  getHelpCenterStats,
  type HelpTicket,
  type HelpCenterStats,
} from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

const KARNATAKA_DISTRICTS_LIST = [
  "Hassan", "Kolar", "Ramanagara", "Chikkaballapur", "Dharwad",
  "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban", "Mandya",
  "Mysuru (Mysore)", "Chikkamagaluru", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)",
  "Dakshina Kannada (Mangaluru)", "Udupi", "Uttara Kannada (Karwar)", "Bagalkote",
  "Ballari (Bellary)", "Bidar", "Chamarajanagar", "Chitradurga", "Davanagere",
  "Gadag", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu (Madikeri)", "Koppal",
  "Raichur", "Vijayanagara (Hosapete)", "Vijayapura (Bijapur)", "Yadgir"
];

const INQUIRY_CATEGORIES = [
  "Disease Diagnosis",
  "Climate Extremes",
  "Yield & Market Decision",
  "App Usage & Guidance",
  "Emergency Orchard Issue",
  "General Inquiry"
];

const MANGO_VARIETIES = [
  "Raspuri",
  "Banganapalli",
  "Totapuri",
  "Alphonso (Badami / Kari Ishad)",
  "Mallika",
  "Pairi",
  "Neelum",
  "Dasheri",
  "Kesar",
  "Multiple / Mixed Orchard"
];

const QUICK_RESPONSE_TEMPLATES = [
  {
    title: "Anthracnose Spray Advisory",
    text: "Apply Copper Oxychloride 50 WP @ 3g/L or Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2g/L. Ensure canopy pruning for airflow and re-scan leaf in 7 days."
  },
  {
    title: "VPD Stress Mitigation",
    text: "Run micro-sprinklers / drip cycles during early morning (6:00 AM - 8:30 AM) to maintain soil moisture buffer and reduce transpiration shock."
  },
  {
    title: "Grad-CAM Heatmap Interpretation",
    text: "Red and amber regions on your scan indicate active fungal spore lesions or pest tissue necrosis where the CNN neural network focused its diagnostic attention."
  },
  {
    title: "APMC Market vs Pulp Price",
    text: "Current Karnataka APMC wholesale price is trending higher for Grade-A fruit. We recommend grading harvest: send clean fruits to retail and blemish fruits to pulp processing."
  }
];

const FAQ_ITEMS = [
  {
    question: "How should I take photos for 99% accurate disease detection?",
    answer: "Hold your phone camera 15-20 cm away from the mango leaf under bright natural daylight. Ensure the entire leaf blade is in focus and avoid extreme shadows or blurry angles."
  },
  {
    question: "How does the Climate Intelligence module fetch weather for my district?",
    answer: "The platform connects directly to Open-Meteo live satellite feeds calibrated for all 31 districts of Karnataka. You can use the top-right district toggle on the Climate page to switch anytime."
  },
  {
    question: "How is disease severity coupled with predicted harvest yield?",
    answer: "The multi-task CNN grades lesion coverage percentage (Low: <10%, Medium: 10-25%, High: >25%). This severity metric is directly fed into the XGBoost yield regressor to compute exact crop loss."
  },
  {
    question: "Can I receive emergency support for sudden leaf blight or pest outbreak?",
    answer: "Yes! Submit an inquiry marked 'High' or 'Urgent' priority above or contact our lead agronomy administrator via WhatsApp / Phone hotline directly."
  }
];

export default function HelpCenterPage() {
  const { term } = useLocalizedText();
  const [activeTab, setActiveTab] = useState<"farmer" | "admin">("farmer");
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [stats, setStats] = useState<HelpCenterStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // New ticket form state
  const [farmerName, setFarmerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [district, setDistrict] = useState<string>("Hassan");
  const [mangoVariety, setMangoVariety] = useState<string>("Raspuri");
  const [category, setCategory] = useState<string>("Disease Diagnosis");
  const [priority, setPriority] = useState<string>("Medium");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Admin reply state
  const [replyTextMap, setReplyTextMap] = useState<{ [ticketId: string]: string }>({});
  const [isReplyingMap, setIsReplyingMap] = useState<{ [ticketId: string]: boolean }>({});
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const fetchTicketsAndStats = async () => {
    try {
      setIsLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        getHelpTickets(),
        getHelpCenterStats()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.warn("Help Center fetch notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !subject.trim() || !message.trim()) {
      alert("Please fill in your Name, Subject, and Question.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createHelpTicket({
        farmerName,
        phone,
        email,
        district,
        mangoVariety,
        category,
        priority,
        subject,
        message,
      });

      setSubmitSuccess(`Inquiry #${created.id} submitted successfully! Manas & the MangoDL team will reply shortly.`);
      setSubject("");
      setMessage("");
      fetchTicketsAndStats();

      setTimeout(() => {
        setSubmitSuccess(null);
      }, 7000);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) return;

    try {
      setIsReplyingMap((prev) => ({ ...prev, [ticketId]: true }));
      await replyToHelpTicket(ticketId, text, "Manas (Admin / KSIT MangoDL)");
      setReplyTextMap((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTicketsAndStats();
    } catch (err: any) {
      alert(`Reply error: ${err.message}`);
    } finally {
      setIsReplyingMap((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: "Open" | "In Progress" | "Answered" | "Resolved") => {
    try {
      await updateTicketStatus(ticketId, status);
      fetchTicketsAndStats();
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm(`Are you sure you want to delete inquiry #${ticketId}?`)) return;
    try {
      await deleteHelpTicket(ticketId);
      fetchTicketsAndStats();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "All" && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== "All" && t.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.farmerName.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q) ||
          t.district.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.phone && t.phone.includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, categoryFilter, searchQuery]);

  const getPriorityColor = (p: string): "red" | "mango" | "violet" | "neon" | "cyan" | "gray" => {
    switch (p) {
      case "Urgent": return "red";
      case "High": return "red";
      case "Medium": return "mango";
      default: return "neon";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Resolved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Answered": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "In Progress": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        
        {/* Hero Header */}
        <StaggerItem>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6 md:p-8 bg-gradient-to-r from-[#111827] via-[#0f172a] to-[#0f2415]">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-yellow-500/[0.08] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-cyan-500/[0.06] blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(245,158,11,0.15)]">
                  <Headphones className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                      {term("Help Center & Direct Farmer Support")}
                    </h1>
                    <NeonBadge label="Directly Handled by Manas & KSIT Team" variant="neon" size="sm" />
                  </div>
                  <p className="text-gray-400 text-sm max-w-2xl">
                    Dedicated farmer consultation portal. Any grower across Karnataka can ask questions regarding disease diagnosis, climate extremes, harvest yield, or market revenue.
                  </p>
                </div>
              </div>

              {/* View Switcher: Farmer vs Admin Mode */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/[0.1] shrink-0 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("farmer")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "farmer"
                      ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Farmer Inquire Portal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("admin")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "admin"
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Console (Handled by Me)
                </button>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Live Admin Overview Metric Bar (Always visible) */}
        <StaggerItem>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Inquiries", value: stats?.totalInquiries ?? tickets.length, color: "#38bdf8", icon: MessageSquare },
              { label: "Open Inquiries", value: stats?.openInquiries ?? 1, color: "#f59e0b", icon: Clock },
              { label: "In Progress", value: stats?.inProgress ?? 1, color: "#a855f7", icon: RefreshCw },
              { label: "Answered", value: stats?.answered ?? 2, color: "#22d3ee", icon: SendHorizontal },
              { label: "Resolved", value: stats?.resolved ?? 1, color: "#22c55e", icon: CheckCircle2 },
              { label: "Response SLA", value: 2.5, suffix: "h", color: "#eab308", icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-glass p-3.5 text-center"
              >
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-lg font-display font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* ══════════════════════════════════════════════════
            TAB 1: FARMER INQUIRE & SUPPORT PORTAL
        ══════════════════════════════════════════════════ */}
        {activeTab === "farmer" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form: Ask Anything */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                        <FileQuestion className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold text-lg">Ask a Question / Report Orchard Problem</h2>
                        <p className="text-gray-400 text-xs">Direct consultation with Manas & the KSIT Agronomy Team</p>
                      </div>
                    </div>
                    <NeonBadge label="Direct Response" variant="neon" size="sm" pulse />
                  </div>

                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 text-xs flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <div>{submitSuccess}</div>
                    </motion.div>
                  )}

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Farmer Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          placeholder="e.g. Ramesh Gowda"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98450 12345"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Karnataka District <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                        >
                          {KARNATAKA_DISTRICTS_LIST.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Mango Variety
                        </label>
                        <select
                          value={mangoVariety}
                          onChange={(e) => setMangoVariety(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                        >
                          {MANGO_VARIETIES.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Inquiry Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                        >
                          {INQUIRY_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Subject / Brief Summary <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Anthracnose spreading on young leaves after heavy rain"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Detailed Question / Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your orchard condition, symptoms seen, tree age, or question regarding the MangoDL app..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-yellow-500/50 text-white text-xs outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Average response time: <strong>&lt; 2 hours</strong></span>
                      </div>

                      <GlowButton type="submit" variant="mango" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Submit Inquiry to Manas
                          </>
                        )}
                      </GlowButton>
                    </div>
                  </form>
                </GlassCard>
              </div>

              {/* Direct Agronomist Hotline & Contact Cards */}
              <div className="space-y-4">
                
                {/* Team Info Card */}
                <GlassCard className="p-5" hover={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-md">
                      M
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Manas (Lead Researcher)</h3>
                      <p className="text-gray-400 text-xs">KSIT CSE • MangoDL AI Platform</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs leading-relaxed mb-4">
                    Direct developer & agronomist point of contact. Any mango grower in Karnataka can get direct technical and agricultural assistance.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <a
                      href="https://wa.me/919876543210?text=Hello%20Manas%20sir,%20I%20am%20using%20MangoDL%20app%20and%20need%20assistance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-400" />
                        Chat on WhatsApp Direct
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="tel:+919876543210"
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-gray-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-yellow-400" />
                        Agronomist Hotline
                      </span>
                      <span className="font-mono text-gray-400">+91 98765 43210</span>
                    </a>

                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300">
                      <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-[11px] leading-tight">
                        Dept. of CSE, K.S. Institute of Technology, Bengaluru - 560109
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* FAQ Quick Accordion */}
                <GlassCard className="p-5" hover={false}>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-white font-semibold text-sm">Frequently Asked Questions</h3>
                  </div>

                  <div className="space-y-2">
                    {FAQ_ITEMS.map((faq, idx) => (
                      <div key={idx} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          className="w-full text-left p-3 text-xs font-semibold text-gray-200 flex items-center justify-between hover:text-yellow-300 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openFaqIndex === idx ? "rotate-180" : ""}`} />
                        </button>
                        {openFaqIndex === idx && (
                          <div className="px-3 pb-3 text-[11px] text-gray-400 leading-relaxed border-t border-white/[0.04] pt-2">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>

              </div>
            </div>

            {/* Public Community Inquiries & Answers View for Farmers */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-base">Recent Farmer Inquiries & Expert Answers</h3>
                  <p className="text-xs text-gray-400">Browse verified answers from the MangoDL team</p>
                </div>
                <NeonBadge label={`${tickets.length} Inquiries Logged`} variant="cyan" size="sm" />
              </div>

              <div className="space-y-3">
                {tickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-yellow-400 font-bold">#{ticket.id}</span>
                        <span className="text-white font-semibold text-xs">{ticket.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-gray-400 font-mono">
                          {ticket.district} • {ticket.mangoVariety}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs leading-relaxed mb-3">
                      &ldquo;{ticket.message}&rdquo;
                    </p>

                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            {ticket.replies[0].author}
                          </span>
                          <span className="text-gray-500 font-mono text-[10px]">{ticket.replies[0].timestamp}</span>
                        </div>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                          {ticket.replies[0].message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: ADMIN MANAGEMENT CONSOLE (HANDLED BY YOU)
        ══════════════════════════════════════════════════ */}
        {activeTab === "admin" && (
          <div className="space-y-6">

            {/* Filter and Search Controls */}
            <GlassCard className="p-4" hover={false}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by farmer name, phone, district, or keyword..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl text-white outline-none transition-colors"
                  />
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Open", "In Progress", "Answered", "Resolved"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                        statusFilter === st
                          ? "bg-cyan-500 text-black font-bold shadow-sm"
                          : "bg-white/[0.04] text-gray-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <GlowButton variant="outline" size="sm" onClick={fetchTicketsAndStats}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </GlowButton>
              </div>
            </GlassCard>

            {/* Tickets Triage & Reply Management */}
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const isExpanded = expandedTicketId === ticket.id;
                const replyText = replyTextMap[ticket.id] || "";
                const isReplying = isReplyingMap[ticket.id] || false;

                return (
                  <GlassCard key={ticket.id} className="p-5 transition-all" hover={false}>
                    
                    {/* Ticket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                          #{ticket.id}
                        </span>
                        <h3 className="text-white font-bold text-sm sm:text-base">{ticket.subject}</h3>
                        <NeonBadge label={ticket.category} variant="violet" size="sm" />
                        <NeonBadge label={ticket.priority} variant={getPriorityColor(ticket.priority)} size="sm" />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as any)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold border outline-none cursor-pointer bg-[#0f172a] ${getStatusColor(ticket.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Answered">Answered</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDelete(ticket.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Farmer Meta info */}
                    <div className="flex flex-wrap items-center gap-4 py-2 text-xs text-gray-400">
                      <span className="text-gray-200 font-semibold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        {ticket.farmerName}
                      </span>
                      {ticket.phone && (
                        <a
                          href={`https://wa.me/${ticket.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {ticket.phone} (WhatsApp)
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                        {ticket.district}, Karnataka
                      </span>
                      <span className="font-mono text-gray-400">Variety: {ticket.mangoVariety}</span>
                      <span className="text-gray-500 ml-auto font-mono text-[11px]">{ticket.createdAt}</span>
                    </div>

                    {/* Farmer's original message */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-200 text-xs leading-relaxed my-3">
                      {ticket.message}
                    </div>

                    {/* Conversation History / Replies */}
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="space-y-2.5 my-3 pl-3 border-l-2 border-cyan-500/40">
                        {ticket.replies.map((rep) => (
                          <div key={rep.id} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
                            <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold mb-1">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                {rep.author} ({rep.role})
                              </span>
                              <span className="text-gray-500 font-mono text-[10px]">{rep.timestamp}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-xs">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Direct Admin Reply Composer */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                          <SendHorizontal className="w-3.5 h-3.5 text-yellow-400" />
                          Reply Directly to {ticket.farmerName} as Manas:
                        </span>
                        <span className="text-[10px] text-gray-500">Quick Templates Below</span>
                      </div>

                      {/* Quick Macro Templates */}
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_RESPONSE_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.title}
                            type="button"
                            onClick={() =>
                              setReplyTextMap((prev) => ({
                                ...prev,
                                [ticket.id]: (prev[ticket.id] ? prev[ticket.id] + " " : "") + tmpl.text,
                              }))
                            }
                            className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-gray-300 hover:text-yellow-300 transition-colors"
                          >
                            + {tmpl.title}
                          </button>
                        ))}
                      </div>

                      {/* Text Input & Send */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(ticket.id);
                            }
                          }}
                          placeholder={`Type advisory response to ${ticket.farmerName}...`}
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-yellow-500/50 text-white outline-none"
                        />
                        <GlowButton
                          variant="mango"
                          size="sm"
                          disabled={!replyText.trim() || isReplying}
                          onClick={() => handleSendReply(ticket.id)}
                        >
                          {isReplying ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 mr-1" />
                              Send Reply
                            </>
                          )}
                        </GlowButton>
                      </div>
                    </div>

                  </GlassCard>
                );
              })}

              {filteredTickets.length === 0 && (
                <div className="text-center py-12 card-glass text-gray-400 text-xs">
                  No inquiries matching the current status/search filter.
                </div>
              )}
            </div>

          </div>
        )}

      </StaggerContainer>
    </PageTransition>
  );
}
