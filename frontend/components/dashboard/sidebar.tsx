"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  DollarSign,
  GitBranch,
  LayoutDashboard,
  Leaf,
  Microscope,
  Settings,
  TrendingUp,
  Zap,
  Bot,
  Sparkles,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import { useLocalizedText } from "@/lib/localization";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "ai-agent", label: "AI Copilot Agent", icon: Sparkles, href: "/dashboard/ai-agent", badge: "LIVE" },
  { id: "disease-detection", label: "Disease Detection", icon: Microscope, href: "/dashboard/disease-detection" },
  { id: "yield-prediction", label: "Yield Prediction", icon: TrendingUp, href: "/dashboard/yield-prediction" },
  { id: "revenue-analytics", label: "Revenue Analytics", icon: DollarSign, href: "/dashboard/revenue-analytics" },
  { id: "climate-monitoring", label: "Climate Monitor", icon: CloudSun, href: "/dashboard/climate-monitoring" },
  { id: "ai-recommendations", label: "AI Recommendations", icon: Brain, href: "/dashboard/ai-recommendations", badge: "6" },
  { id: "dataflow", label: "AI Dataflow", icon: GitBranch, href: "/dashboard/dataflow" },
  { id: "help-center", label: "Help Center", icon: Headphones, href: "/dashboard/help-center", badge: "Direct" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useDashboardStore((state) => state.sidebarOpen);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const setSidebarOpen = useDashboardStore((state) => state.setSidebarOpen);
  const { term } = useLocalizedText();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  const navContent = (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.28)]">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--background)] bg-green-400" />
          </div>
          <AnimatePresence>
            {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth < 768)) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="font-display text-lg font-bold leading-none text-[var(--text-primary)]">
                  Mango<span className="text-yellow-400">DL</span>
                </div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  AI Agriculture
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-gray-400 hover:text-white md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.035, duration: 0.28 }}
            >
              <Link
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "border border-yellow-500/25 bg-yellow-500/10 text-yellow-400 font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-yellow-400"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-yellow-400" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  )}
                />

                <span className="flex-1 whitespace-nowrap text-sm">
                  {term(item.label)}
                </span>

                {item.badge && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      item.badge === "LIVE"
                        ? "border border-yellow-500/30 bg-yellow-500/15 text-yellow-300 animate-pulse"
                        : "border border-violet-500/30 bg-violet-500/15 text-violet-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-green-500/20 bg-green-500/6 p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <Zap className="h-3.5 w-3.5 text-green-400" />
            <div className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-green-400">{term("AI Engine")} Active</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>Model v3.2</span>
            <span className="text-green-400">98.4% uptime</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--surface-soft)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: "0%" }}
              animate={{ width: "98.4%" }}
              transition={{ duration: 1.3, delay: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 250 : 76 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden md:flex h-full flex-col overflow-hidden"
        style={{
          background: "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--background) 88%, transparent))",
          borderRight: "1px solid var(--border-subtle)",
          backdropFilter: "blur(14px)",
        }}
      >
        {navContent}

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--background-elevated)] text-[var(--text-muted)] shadow-lg transition-colors hover:text-[var(--text-primary)]"
        >
          {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>

      {/* ─── MOBILE DRAWER (SLIDE-IN WITH BACKDROP) ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col bg-[#0c0e14] border-r border-white/10 shadow-2xl"
            >
              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
