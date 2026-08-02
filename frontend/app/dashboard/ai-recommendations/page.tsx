"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  Leaf,
  FlaskConical,
  Bug,
  Wind,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { aiRecommendations } from "@/data/mock-data";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Droplets,
  Leaf,
  FlaskConical,
  Bug,
  Wind,
};

const colorConfig = {
  mango: {
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/20",
    icon: "text-yellow-400",
    iconBg: "bg-yellow-500/15",
    badge: "mango" as const,
    glow: "rgba(245,158,11,0.1)",
  },
  cyan: {
    bg: "bg-cyan-500/8",
    border: "border-cyan-500/20",
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    badge: "cyan" as const,
    glow: "rgba(34,211,238,0.1)",
  },
  neon: {
    bg: "bg-green-500/8",
    border: "border-green-500/20",
    icon: "text-green-400",
    iconBg: "bg-green-500/15",
    badge: "neon" as const,
    glow: "rgba(34,197,94,0.1)",
  },
  violet: {
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
    icon: "text-violet-400",
    iconBg: "bg-violet-500/15",
    badge: "violet" as const,
    glow: "rgba(139,92,246,0.1)",
  },
};

const severityOrder = { high: 0, medium: 1, low: 2 };

export default function AIRecommendationsPage() {
  const sorted = [...aiRecommendations].sort(
    (a, b) =>
      severityOrder[a.severity as keyof typeof severityOrder] -
      severityOrder[b.severity as keyof typeof severityOrder]
  );

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">AI Recommendations</h2>
              <p className="text-gray-400 text-sm mt-1">Autonomous farmer decision support powered by MangoDL AI</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label="6 Active Alerts" variant="mango" pulse />
              <NeonBadge label="AI Autonomous" variant="violet" />
            </div>
          </div>
        </StaggerItem>

        {/* AI Status Bar */}
        <StaggerItem>
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-violet-400" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0a0b0f] flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-2 h-2 text-black" />
                </motion.div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">MangoDL AI Engine</span>
                  <NeonBadge label="Active" variant="neon" pulse size="sm" />
                </div>
                <p className="text-gray-500 text-xs">
                  Continuously analyzing 247 orchards · Last updated 2 minutes ago · Next analysis in 13 minutes
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6 text-center">
                {[
                  { label: "Processed Today", value: "1,842", color: "#f59e0b" },
                  { label: "Alerts Generated", value: "23", color: "#ef4444" },
                  { label: "Actions Taken", value: "17", color: "#22c55e" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[10px] text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Recommendation Cards */}
        <StaggerItem>
          <div className="grid md:grid-cols-2 gap-4">
            {sorted.map((rec, i) => {
              const Icon = iconMap[rec.icon] ?? AlertTriangle;
              const cfg = colorConfig[rec.color as keyof typeof colorConfig];
              const isHigh = rec.severity === "high";
              const isMedium = rec.severity === "medium";

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`card-glass p-5 transition-all duration-300 ${cfg.border} relative overflow-hidden group cursor-pointer`}
                  style={{ background: `${cfg.glow.replace("0.1", "0.04")}` }}
                >
                  {/* Severity indicator */}
                  {isHigh && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                  )}
                  {isMedium && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                  )}

                  {/* Glow orb on hover */}
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
                      filter: "blur(16px)",
                    }}
                  />

                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${cfg.iconBg}`}
                      style={{ boxShadow: `0 0 20px ${cfg.glow}` }}
                    >
                      <Icon className={`w-5 h-5 ${cfg.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm leading-tight">{rec.title}</h3>
                        <div className="flex-shrink-0">
                          <NeonBadge
                            label={rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)}
                            variant={rec.severity === "high" ? "red" : rec.severity === "medium" ? "mango" : "neon"}
                            pulse={rec.severity === "high"}
                            size="sm"
                          />
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed mb-3">{rec.description}</p>

                      {/* Action */}
                      <div className={`flex items-start gap-2 p-2.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                        <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.icon}`} />
                        <p className="text-xs text-gray-300 leading-relaxed">{rec.action}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>2 mins ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className={`text-xs font-medium flex items-center gap-1 ${cfg.icon}`}>
                            Take Action <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </StaggerItem>

        {/* Action Summary */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Today&apos;s AI Actions Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Irrigation Adjusted", value: "3 orchards", color: "#22d3ee" },
                { label: "Alerts Dispatched", value: "12 farmers", color: "#f59e0b" },
                { label: "Treatments Suggested", value: "2 orchards", color: "#ef4444" },
                { label: "Harvest Planned", value: "1 orchard", color: "#22c55e" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.06 }}
                  className="p-4 rounded-xl bg-white/3 border border-white/5 text-center"
                >
                  <div className="text-xl font-display font-bold mb-1" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
