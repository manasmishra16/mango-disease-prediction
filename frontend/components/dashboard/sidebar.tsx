"use client";

import { useEffect, useState } from "react";
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
  Sparkles,
  Headphones,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  const renderNavContent = (isDrawer = false) => {
    const isExpanded = isDrawer || sidebarOpen;

    return (
      <div className="flex h-full flex-col justify-between">
        {/* ─── Header / Brand ─── */}
        <div>
          <div className={cn(
            "flex items-center border-b border-[var(--border-subtle)] py-4 transition-all duration-200",
            isExpanded ? "justify-between px-4" : "justify-center px-2"
          )}>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 group transition-opacity",
                !isExpanded && "justify-center"
              )}
              title="MangoDL - Dashboard"
            >
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.28)] group-hover:scale-105 transition-transform">
                  <Leaf className="h-5 w-5 text-black" />
                </div>
                <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--background)] bg-green-400" />
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div className="font-display text-lg font-bold leading-none text-[var(--text-primary)]">
                    Mango<span className="text-yellow-400">DL</span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                    AI Agriculture
                  </div>
                </motion.div>
              )}
            </Link>

            {/* Collapse/Close Button */}
            {isDrawer ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Navigation"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              isExpanded && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="rounded-xl p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all cursor-pointer"
                  title="Collapse Sidebar (Ctrl + B)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              )
            )}
          </div>

          {/* ─── Navigation Links ─── */}
          <nav className={cn(
            "space-y-1.5 py-4 overflow-y-auto overflow-x-hidden",
            isExpanded ? "px-3" : "px-2"
          )}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={cn(
                      "relative flex items-center rounded-xl transition-all duration-200",
                      isExpanded
                        ? "gap-3 px-3 py-2.5"
                        : "justify-center w-11 h-11 mx-auto",
                      isActive
                        ? "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className={cn(
                          "absolute bg-yellow-400 rounded-full",
                          isExpanded ? "left-0 top-1/2 h-6 w-1 -translate-y-1/2" : "left-0.5 top-1/2 h-5 w-1 -translate-y-1/2"
                        )}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}

                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-yellow-400" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                      )}
                    />

                    {isExpanded && (
                      <>
                        <span className="flex-1 whitespace-nowrap text-sm truncate">
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
                      </>
                    )}
                  </Link>

                  {/* Floating Tooltip in Collapsed Mode */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-gray-950/95 border border-white/15 text-xs text-white shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap flex items-center gap-2">
                      <span className="font-semibold">{term(item.label)}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ─── Bottom Footer & Status ─── */}
        <div className="p-3">
          {isExpanded ? (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-3 relative overflow-hidden">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Zap className="h-3.5 w-3.5 text-green-400" />
                    <div className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <span className="text-xs font-semibold text-green-400">{term("AI Engine")} Active</span>
                </div>
                <span className="text-[10px] text-green-400 font-mono font-bold">98.4%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "98.4%" }}
                  transition={{ duration: 1.3, delay: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-400 relative cursor-pointer group"
                title="AI Engine Active - 98.4% Uptime"
                onClick={toggleSidebar}
              >
                <Zap className="w-4 h-4" />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-gray-950/95 border border-white/15 text-[11px] text-green-300 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  AI Engine Online (98.4%)
                </div>
              </div>

              {/* Expand Toggle Button at Bottom of Collapsed Sidebar */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-yellow-500/15 hover:border-yellow-500/40 hover:text-yellow-400 flex items-center justify-center text-gray-400 transition-all cursor-pointer group relative"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-gray-950/95 border border-white/15 text-[11px] text-white shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Expand Sidebar
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden md:flex h-screen flex-col shrink-0 select-none border-r border-[var(--border-subtle)] backdrop-blur-xl bg-[var(--surface)] z-30 transition-colors duration-200"
        style={{
          boxShadow: sidebarOpen ? "var(--shadow-soft)" : "none",
        }}
      >
        {renderNavContent(false)}
      </motion.aside>

      {/* ─── MOBILE DRAWER (SLIDE-IN WITH BACKDROP) ─── */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col bg-[var(--background-elevated)] border-r border-[var(--border-subtle)] shadow-2xl"
            >
              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
