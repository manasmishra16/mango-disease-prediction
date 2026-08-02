"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonBadgeProps {
  label: string;
  variant?: "mango" | "neon" | "cyan" | "violet" | "red" | "gray";
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const variantConfig = {
  mango: {
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
    glow: "shadow-[0_0_6px_rgba(245,158,11,0.2)]",
  },
  neon: {
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-400",
    glow: "shadow-[0_0_6px_rgba(34,197,94,0.2)]",
  },
  cyan: {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_6px_rgba(34,211,238,0.2)]",
  },
  violet: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-400",
    dot: "bg-violet-400",
    glow: "shadow-[0_0_6px_rgba(139,92,246,0.2)]",
  },
  red: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    glow: "shadow-[0_0_6px_rgba(239,68,68,0.2)]",
  },
  gray: {
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-gray-400",
    dot: "bg-gray-400",
    glow: "",
  },
};

export function NeonBadge({
  label,
  variant = "mango",
  pulse = false,
  className = "",
  size = "md",
}: NeonBadgeProps) {
  const config = variantConfig[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur-sm",
        config.bg,
        config.border,
        config.text,
        config.glow,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[11px]",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <motion.span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.dot)}
            animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      {label}
    </span>
  );
}
