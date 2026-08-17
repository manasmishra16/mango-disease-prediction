"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Microscope,
  CheckCircle2,
  Cpu,
  Sprout,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { ParticleField } from "@/components/animations/particle-field";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { ThemeLanguageControls } from "@/components/app/theme-language-controls";
import { useAuthStore } from "@/store/auth-store";
import { useLocalizedText } from "@/lib/localization";

export default function LoginPage() {
  const { term } = useLocalizedText();
  const router = useRouter();
  const { login, register, demoLogin, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Orchard Manager");
  const [organization, setOrganization] = useState("Karnataka Mango Board");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTabChange = (newMode: "login" | "register") => {
    setMode(newMode);
    clearError();
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email || !email.includes("@")) {
      setValidationError(term("Please enter a valid email address."));
      return;
    }

    if (!password || password.length < 6) {
      setValidationError(term("Password must be at least 6 characters long."));
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("mango_just_clicked", "true");
    }

    if (mode === "register") {
      if (!fullName) {
        setValidationError(term("Please enter your full name."));
        return;
      }
      const success = await register({
        fullName,
        email,
        password,
        role,
        organization,
      });
      if (success) {
        router.push("/dashboard");
      }
    } else {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      }
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setValidationError(null);
    setEmail("demo@mangodl.ai");
    setPassword("password123");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mango_just_clicked", "true");
    }
    const success = await demoLogin();
    if (success) {
      router.push("/dashboard");
    }
  };

  const platformHighlights = [
    {
      icon: Microscope,
      title: term("PyTorch Multi-Task CNN"),
      desc: term("99.0% accuracy across 8 mango pathologies & 10 Karnataka cultivars"),
      badge: "SE-Net v2",
    },
    {
      icon: Cpu,
      title: term("Grad-CAM v2 Attention"),
      desc: term("Explainable visual heatmap localization on affected leaf zones"),
      badge: "Real-time",
    },
    {
      icon: Sprout,
      title: term("CIBRC Chemical & Bio-Control"),
      desc: term("District-level agro-prescriptions for Kolar, Hassan, Dharwad & Ramanagara"),
      badge: "Approved",
    },
    {
      icon: BarChart3,
      title: term("Autonomous Yield & Mandi Pricing"),
      desc: term("Live satellite climate sync with APMC mandi pricing forecast"),
      badge: "31 Districts",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* ─── AMBIENT BOTANICAL & NEURAL BACKGROUND FX ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <ParticleField className="opacity-30 dark:opacity-40" />

        {/* Ambient Multi-Hue Gradients */}
        <div
          className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full opacity-30 dark:opacity-20 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(234,179,8,0.1) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[36rem] h-[36rem] rounded-full opacity-30 dark:opacity-20 blur-[130px]"
          style={{
            background: "radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(16,185,129,0.1) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full opacity-20 dark:opacity-15 blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ─── TOP BAR: BACK NAVIGATION & THEME / LANGUAGE SWITCHER ─── */}
      <header className="relative z-20 mx-auto w-full max-w-7xl flex items-center justify-between py-2">
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
          <span>{term("Back to Overview")}</span>
        </Link>

        {/* Theme & Language Controls */}
        <ThemeLanguageControls compact className="shadow-sm" />
      </header>

      {/* ─── MAIN CONTENT CONTAINER (DUAL COLUMN ON DESKTOP) ─── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl my-auto py-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ════ LEFT COLUMN: BRANDING & PLATFORM CAPABILITIES SHOWCASE ════ */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{term("Karnataka Precision Agriculture Intelligence")}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
                {term("Smart Mango Disease")} <br />
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 bg-clip-text text-transparent">
                  {term("Prediction & Advisory")}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {term("Empowering Karnataka mango growers with instant leaf pathology scanning, Grad-CAM deep learning visualizations, exact CIBRC pesticide dosages, and climate-driven yield forecasting.")}
              </p>
            </motion.div>

            {/* Feature Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {platformHighlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4.5 shadow-sm hover:shadow-md transition-all hover:border-amber-500/40"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-[var(--surface-soft)] text-emerald-600 dark:text-emerald-400 border border-[var(--border-subtle)]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Karnataka Regional Mango Belts Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)]">{term("Covering 10 Cultivars:")}</span>
              {[
                "Alphonso (Hapus)",
                "Kesar",
                "Banganapalli",
                "Dasheri",
                "Totapuri",
                "Mallika",
                "Langra",
                "Amrapali",
                "Raspuri",
                "Neelum",
              ].map((cultivar) => (
                <span
                  key={cultivar}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  {cultivar}
                </span>
              ))}
            </div>
          </div>

          {/* ════ RIGHT COLUMN: AUTHENTICATION GLASS CARD ════ */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden"
              style={{
                boxShadow: "0 20px 50px -10px rgba(0,0,0,0.1), 0 0 30px rgba(245,158,11,0.08)",
              }}
            >
              {/* Card Ambient Glow Accent */}
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

              {/* Brand Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.35)] text-black mb-1">
                  <Leaf className="h-7 w-7" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Mango<span className="text-amber-500">DL</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {term("Sign in to access AI diagnosis and orchard telemetry")}
                </p>
              </div>

              {/* Tab Switcher (Sign In vs Create Account) */}
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] mb-5">
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === "login"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {term("Sign In")}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === "register"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {term("Create Account")}
                </button>
              </div>

              {/* Instant 1-Click Demo Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoLogin}
                type="button"
                disabled={isLoading}
                className="w-full mb-5 p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
              >
                <Zap className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                <span>⚡ {term("Instant Demo Sign In")}</span>
                <NeonBadge label="1-Click" variant="cyan" size="sm" />
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <span className="relative px-3 bg-[var(--surface)] text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                  {mode === "login" ? term("Or Sign In with Credentials") : term("Enter Details Below")}
                </span>
              </div>

              {/* Error Banner */}
              <AnimatePresence mode="wait">
                {(error || validationError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-300 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{validationError || error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Register mode) */}
                {mode === "register" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      {term("Full Name")}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manas Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    {term("Email Address")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      placeholder="name@mangodl.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    {term("Password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role & Organization (Register mode) */}
                {mode === "register" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        {term("Professional Role")}
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-amber-500/60 cursor-pointer"
                      >
                        <option value="Orchard Manager">{term("Orchard Manager")}</option>
                        <option value="Senior Agronomist">{term("Senior Agronomist")}</option>
                        <option value="Agricultural Researcher">{term("Agricultural Researcher")}</option>
                        <option value="Farm Owner">{term("Farm Owner")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        {term("Organization / Farm Name")}
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          placeholder="e.g. Karnataka Mango Development Board"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Remember & Forgot */}
                {mode === "login" && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-[var(--border-subtle)] bg-[var(--surface-soft)] text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span>{term("Remember session")}</span>
                    </label>
                    <a href="#forgot" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                      {term("Forgot password?")}
                    </a>
                  </div>
                )}

                {/* Submit Button */}
                <GlowButton type="submit" variant="mango" className="w-full mt-3 font-bold" disabled={isLoading}>
                  {isLoading ? (
                    term("Authenticating...")
                  ) : mode === "login" ? (
                    <>
                      {term("Sign In to Platform")} <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {term("Create Account")} <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </GlowButton>
              </form>

              {/* Footer Note */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-center text-[11px] text-[var(--text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{term("Protected by MangoDL Neural Security v3.2")}</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 py-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <span>MangoDL AI Platform © 2026</span>
        <span>{term("Multi-Lingual Precision Pathology for Karnataka Horticulture")}</span>
      </footer>
    </main>
  );
}
