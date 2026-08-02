"use client";

import { motion } from "framer-motion";
import { Activity, Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeLanguageControls } from "@/components/app/theme-language-controls";
import { NeonBadge } from "@/components/ui/neon-badge";
import { useLocalizedText } from "@/lib/localization";
import { useDashboardStore } from "@/store/dashboard-store";

const pageLabels: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard Overview", subtitle: "AI Agriculture Intelligence Platform" },
  "/dashboard/disease-detection": { title: "Disease Detection", subtitle: "AI-powered leaf analysis using ResNet-50 + GradCAM" },
  "/dashboard/yield-prediction": { title: "Yield Prediction", subtitle: "XGBoost-powered seasonal forecasting engine" },
  "/dashboard/revenue-analytics": { title: "Revenue Analytics", subtitle: "Premium fintech-grade agricultural revenue insights" },
  "/dashboard/climate-monitoring": { title: "Climate Intelligence", subtitle: "Real-time weather and environmental monitoring" },
  "/dashboard/ai-recommendations": { title: "AI Recommendations", subtitle: "Automated farmer decision support system" },
  "/dashboard/dataflow": { title: "AI Dataflow", subtitle: "Cinematic AI processing pipeline visualization" },
  "/dashboard/settings": { title: "Settings", subtitle: "Platform configuration and preferences" },
};

export function Navbar() {
  const pathname = usePathname();
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const { term } = useLocalizedText();
  const page = pageLabels[pathname] ?? { title: "MangoDL", subtitle: "AI Agriculture Platform" };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:px-6"
      style={{
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold leading-tight text-[var(--text-primary)]">{term(page.title)}</h1>
          <p className="text-xs text-[var(--text-muted)]">{term(page.subtitle)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-1.5 sm:flex">
          <Activity className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">{term("Live")}</span>
          <NeonBadge label={term("Online")} variant="neon" pulse size="sm" />
        </div>

        <button className="hidden items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] md:flex">
          <Search className="h-4 w-4" />
          <span>{term("Search...")}</span>
          <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
        </button>

        <ThemeLanguageControls compact />

        <button className="relative rounded-xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(245,158,11,0.45)]" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-sm font-bold text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          M
        </div>
      </div>
    </motion.header>
  );
}
