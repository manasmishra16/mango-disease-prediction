"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";
import { useLocalizedText } from "@/lib/localization";

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  color?: "mango" | "neon" | "cyan" | "violet" | "red";
  delay?: number;
  description?: string;
}

const colorConfig = {
  mango: {
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
    border: "hover:border-yellow-500/20",
    change: "text-yellow-400",
    topLine: "from-yellow-500/40 via-yellow-500/20 to-transparent",
  },
  neon: {
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
    glow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]",
    border: "hover:border-green-500/20",
    change: "text-green-400",
    topLine: "from-green-500/40 via-green-500/20 to-transparent",
  },
  cyan: {
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
    border: "hover:border-cyan-500/20",
    change: "text-cyan-400",
    topLine: "from-cyan-500/40 via-cyan-500/20 to-transparent",
  },
  violet: {
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
    border: "hover:border-violet-500/20",
    change: "text-violet-400",
    topLine: "from-violet-500/40 via-violet-500/20 to-transparent",
  },
  red: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]",
    border: "hover:border-red-500/20",
    change: "text-red-400",
    topLine: "from-red-500/40 via-red-500/20 to-transparent",
  },
};

export function KPICard({
  title,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  icon: Icon,
  change,
  changeLabel,
  color = "mango",
  delay = 0,
  description,
}: KPICardProps) {
  const { term } = useLocalizedText();
  const cfg = colorConfig[color];
  const isPositive = change !== undefined ? change >= 0 : true;
  const resolvedChangeLabel = changeLabel ?? term("vs last month");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        "card-glass p-5 transition-all duration-300 group",
        cfg.glow,
        cfg.border
      )}
    >
      {/* Top gradient line */}
      <div className={cn("absolute top-0 left-4 right-4 h-px bg-gradient-to-r", cfg.topLine)} />

      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", cfg.iconBg)}>
          <Icon className={cn("w-5 h-5", cfg.iconColor)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
            isPositive
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}{change}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-white font-display">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            duration={1800}
          />
        </div>
        <div className="text-sm text-gray-400 font-medium">{title}</div>
        {description && (
          <div className="text-xs text-gray-600 pt-1">{description}</div>
        )}
        {change !== undefined && (
          <div className="text-xs text-gray-600">{resolvedChangeLabel}</div>
        )}
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
    </motion.div>
  );
}
