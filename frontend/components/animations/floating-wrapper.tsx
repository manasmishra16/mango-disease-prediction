"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingWrapperProps {
  children: ReactNode;
  delay?: number;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export function FloatingWrapper({
  children,
  delay = 0,
  amplitude = 12,
  duration = 6,
  className = "",
}: FloatingWrapperProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
        rotate: [0, 0.5, -0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
