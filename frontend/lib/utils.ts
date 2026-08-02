import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 0): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(decimals);
}

export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}Cr`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "high": return "text-red-400";
    case "medium": return "text-yellow-400";
    case "low": return "text-green-400";
    default: return "text-gray-400";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "excellent": return "#22c55e";
    case "good": return "#4ade80";
    case "optimal": return "#22d3ee";
    case "caution": return "#f59e0b";
    case "poor": return "#ef4444";
    default: return "#6b7280";
  }
}

export function interpolateColor(value: number, min = 0, max = 100): string {
  const ratio = (value - min) / (max - min);
  if (ratio > 0.7) return "#22c55e";
  if (ratio > 0.4) return "#f59e0b";
  return "#ef4444";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
