"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Brain, CloudSun, Leaf, Shield, TrendingUp, Lock, Mail,
  Zap, X, ShieldAlert, AlertTriangle, ShieldCheck, User as UserIcon,
} from "lucide-react";
import { ThemeLanguageControls } from "@/components/app/theme-language-controls";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { ParticleField } from "@/components/animations/particle-field";
import { useLocalizedText } from "@/lib/localization";
import { useAuthStore } from "@/store/auth-store";

const featureIcons = [Shield, TrendingUp, CloudSun, Brain];

export default function LandingPage() {
  const router = useRouter();
  const { term } = useLocalizedText();
  const { login, demoLogin, isLoading, error, clearError } = useAuthStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const openAuthModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    clearError();
    setFormError(null);
    setShowAuthModal(true);
  };

  const handleAuthorizeAndNavigate = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mango_just_clicked", "true");
    }
  };

  const handleInstantDemoLogin = async () => {
    clearError();
    setFormError(null);
    handleAuthorizeAndNavigate();
    const success = await demoLogin();
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    handleAuthorizeAndNavigate();
    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    }
  };

  const features = [
    {
      title: term("Disease Detection"),
      description: term("Upload mango leaf images for AI-powered disease diagnosis"),
    },
    {
      title: term("Yield Prediction"),
      description: term("XGBoost-powered seasonal yield forecasting"),
    },
    {
      title: term("Climate Intelligence"),
      description: term("Real-time weather monitoring and climate risk analysis"),
    },
    {
      title: term("AI Recommendations"),
      description: term("Autonomous farmer decision support powered by MangoDL AI"),
    },
  ];

  const stats = [
    { value: "247+", label: term("Orchards Monitored") },
    { value: "94.2%", label: term("Detection Accuracy") },
    { value: "1,842t", label: term("Tonnes Predicted") },
    { value: "₹2.47Cr", label: term("Revenue Estimated") },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="pointer-events-none fixed inset-0">
        <ParticleField className="opacity-60" />
        <div
          className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%)", filter: "blur(88px)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)", filter: "blur(88px)" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_14px_rgba(245,158,11,0.24)]">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-[var(--text-primary)]">
                Mango<span className="text-yellow-400">DL</span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">AI Agriculture</div>
            </div>
          </div>

          <div className="hidden gap-6 text-sm text-[var(--text-secondary)] md:flex">
            <span>{term("Features")}</span>
            <span>{term("Analytics")}</span>
            <span>{term("AI Engine")}</span>
            <span>{term("Pricing")}</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeLanguageControls compact />
            <GlowButton variant="ghost" size="sm" onClick={openAuthModal}>
              {term("Sign In")}
            </GlowButton>
            <GlowButton variant="mango" size="sm" onClick={openAuthModal}>
              {term("Get Started")}
            </GlowButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <NeonBadge label={term("Powered by Deep Learning")} variant="mango" pulse />
            <NeonBadge label={term("SE-MangoLeafXNet + XGBoost")} variant="violet" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-6xl"
          >
            <span className="gradient-text-hero">{term("Deep Learning Approach for")}</span>
            <br />
            <span>{term("Mango Disease Detection &")}</span>
            <br />
            <span className="gradient-text-mango">{term("Yield Prediction Platform")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg"
          >
            {term("Transforming traditional farming using deep learning and climate intelligence. Monitor, predict, and optimize your mango orchards with military-grade AI.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <GlowButton variant="mango" size="lg" onClick={openAuthModal}>
              {term("Get Started")}
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
            <GlowButton variant="ghost" size="lg" onClick={openAuthModal}>
              {term("Explore Analytics")}
            </GlowButton>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.06 }}
              className="card-glass p-4"
            >
              <div className="font-display text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                className="card-glass p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8"
        >
          <div className="max-w-2xl">
            <NeonBadge label={term("Core Capabilities")} variant="neon" className="mb-3" />
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {term("Ready to Transform Your Farm?")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] md:text-base">
              {term("Join 247+ orchards already using MangoDL to maximize yield and minimize disease risk.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <GlowButton variant="mango" onClick={openAuthModal}>
              {term("Get Started Free")}
            </GlowButton>
            <GlowButton variant="outline" onClick={openAuthModal}>
              {term("Sign In")}
            </GlowButton>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <span>MangoDL © 2026</span>
          <span>{term("AI-Powered Agriculture Intelligence · Built with Deep Learning")}</span>
        </div>
      </footer>

      {/* ─── AUTHENTICATION WARNING & SIGN IN PANEL MODAL ─── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f17]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Warning */}
              <div className="text-center space-y-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(245,158,11,0.2)]">
                  <Lock className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Authentication Required</span>
                  </div>
                  <h2 className="text-white font-display text-xl font-bold">Sign In to Dashboard</h2>
                  <p className="text-gray-400 text-xs mt-1">
                    You must authenticate to access the MangoDL AI Agriculture Intelligence Platform.
                  </p>
                </div>
              </div>

              {/* Instant 1-Click Demo Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstantDemoLogin}
                type="button"
                disabled={isLoading}
                className="w-full mb-5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>⚡ Instant Demo Sign In to Dashboard</span>
                <NeonBadge label="1-Click" variant="cyan" size="sm" />
              </motion.button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-[#0d0f17] text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  Or Sign In with Credentials
                </span>
              </div>

              {/* Form Error Banner */}
              {(error || formError) && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError || error}</span>
                </div>
              )}

              {/* Sign In Credentials Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@mangodl.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                </div>

                <GlowButton type="submit" variant="mango" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? (
                    "Authenticating..."
                  ) : (
                    <>
                      Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </GlowButton>
              </form>

              {/* Modal Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 text-center text-[10px] text-gray-500">
                Protected by MangoDL Security Guard v3.2
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
