"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "mango" | "neon" | "cyan" | "violet" | "none";
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
}

const glowStyles = {
  mango: "hover:border-yellow-500/30 hover:shadow-[0_0_18px_rgba(245,158,11,0.12)]",
  neon: "hover:border-green-500/30 hover:shadow-[0_0_18px_rgba(34,197,94,0.12)]",
  cyan: "hover:border-cyan-400/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]",
  violet: "hover:border-violet-500/30 hover:shadow-[0_0_18px_rgba(139,92,246,0.12)]",
  none: "",
};

export function GlassCard({
  children,
  className = "",
  glow = "mango",
  hover = true,
  onClick,
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -1.8;
    const rotateY = ((x - centerX) / centerX) * 1.8;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "card-glass transition-all duration-200",
        hover && "cursor-pointer",
        glow !== "none" && glowStyles[glow],
        className
      )}
      style={{ transition: "transform 0.15s ease, border-color 0.3s ease, box-shadow 0.3s ease" }}
    >
      {children}
    </motion.div>
  );
}
