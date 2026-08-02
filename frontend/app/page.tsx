"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, CloudSun, Leaf, Shield, TrendingUp } from "lucide-react";
import { ThemeLanguageControls } from "@/components/app/theme-language-controls";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { ParticleField } from "@/components/animations/particle-field";
import { useLocalizedText } from "@/lib/localization";

const featureIcons = [Shield, TrendingUp, CloudSun, Brain];

export default function LandingPage() {
  const { term } = useLocalizedText();

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
            <Link href="/dashboard">
              <GlowButton variant="mango" size="sm">
                {term("Get Started")}
              </GlowButton>
            </Link>
          </div>
        </div>
      </motion.nav>

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <NeonBadge label={term("Powered by Deep Learning")} variant="mango" pulse />
            <NeonBadge label={term("ResNet-50 + XGBoost")} variant="violet" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-6xl"
          >
            <span className="gradient-text-hero">{term("AI-Powered Mango")}</span>
            <br />
            <span>{term("Disease Detection &")}</span>
            <br />
            <span className="gradient-text-mango">{term("Yield Prediction")}</span>
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
            <Link href="/dashboard">
              <GlowButton variant="mango" size="lg">
                {term("Launch Dashboard")}
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </Link>
            <Link href="/dashboard">
              <GlowButton variant="ghost" size="lg">
                {term("Explore Analytics")}
              </GlowButton>
            </Link>
          </motion.div>
        </div>

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
            <Link href="/dashboard">
              <GlowButton variant="mango">
                {term("Launch Dashboard Free")}
              </GlowButton>
            </Link>
            <Link href="/dashboard">
              <GlowButton variant="outline">
                {term("View Demo")}
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-[var(--border-subtle)] px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <span>MangoDL © 2026</span>
          <span>{term("AI-Powered Agriculture Intelligence · Built with Deep Learning")}</span>
        </div>
      </footer>
    </main>
  );
}
