"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: (e?: any) => void;
  href?: string;
  variant?: "mango" | "neon" | "cyan" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}

const variantStyles = {
  mango: "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.24)] hover:shadow-[0_0_18px_rgba(245,158,11,0.32)]",
  neon: "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.24)] hover:shadow-[0_0_18px_rgba(34,197,94,0.32)]",
  cyan: "bg-gradient-to-r from-cyan-500 to-sky-500 text-black hover:from-cyan-400 hover:to-sky-400 shadow-[0_0_12px_rgba(34,211,238,0.24)] hover:shadow-[0_0_18px_rgba(34,211,238,0.32)]",
  ghost: "border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-strong)]",
  outline: "border border-yellow-500/35 bg-transparent text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400/55",
};

const sizeStyles = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function GlowButton({
  children,
  onClick,
  variant = "mango",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  title,
}: GlowButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Shimmer overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 hover:translate-x-full" />
      </span>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
