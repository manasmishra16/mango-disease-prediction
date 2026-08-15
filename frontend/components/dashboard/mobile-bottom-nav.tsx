"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Microscope,
  Sparkles,
  TrendingUp,
  Menu,
  DollarSign,
  CloudSun,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { useLocalizedText } from "@/lib/localization";

export function MobileBottomNav() {
  const pathname = usePathname();
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const { term } = useLocalizedText();

  const primaryMobileTabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard, href: "/dashboard" },
    { id: "disease-detection", label: "Scan Leaf", icon: Microscope, href: "/dashboard/disease-detection", highlight: true },
    { id: "ai-agent", label: "AI Copilot", icon: Sparkles, href: "/dashboard/ai-agent" },
    { id: "yield-prediction", label: "Yield", icon: TrendingUp, href: "/dashboard/yield-prediction" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden pb-safe">
      <div
        className="mx-3 mb-2 flex items-center justify-around rounded-2xl border border-white/10 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        style={{
          background: "rgba(13, 16, 23, 0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        {primaryMobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.highlight) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative -top-3 flex flex-col items-center"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform active:scale-95"
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-yellow-400">
                  {term(tab.label)}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-1 flex-col items-center py-1 transition-all active:scale-95"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-yellow-400" : "text-gray-400"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-yellow-400 shadow-[0_0_6px_#f59e0b]"
                  />
                )}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium transition-colors ${
                  isActive ? "text-yellow-400 font-semibold" : "text-gray-400"
                }`}
              >
                {term(tab.label)}
              </span>
            </Link>
          );
        })}

        {/* More Menu Drawer Toggle */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="flex flex-1 flex-col items-center py-1 text-gray-400 transition-all active:scale-95 hover:text-white"
        >
          <Menu className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-medium">{term("More") || "More"}</span>
        </button>
      </div>
    </div>
  );
}
