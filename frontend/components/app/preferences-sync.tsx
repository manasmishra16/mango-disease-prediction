"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard-store";

const localeMap = {
  en: "en",
  hi: "hi",
  kn: "kn",
} as const;

export function PreferencesSync() {
  const theme = useDashboardStore((state) => state.theme);
  const language = useDashboardStore((state) => state.language);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = localeMap[language];
  }, [language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname !== "/") {
        try {
          const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
          const isNavReload = navEntries.length > 0 ? navEntries[0].type === "reload" : false;
          // Legacy performance API fallback for cross-browser support
          const isLegacyReload = (performance.navigation && performance.navigation.type === 1);
          const isReload = isNavReload || isLegacyReload;
          
          const isJustClicked = sessionStorage.getItem("mango_just_clicked") === "true";

          if (isReload || !isJustClicked) {
            sessionStorage.removeItem("mango_just_clicked");
            window.location.replace("/");
          } else {
            // Reset the flag so subsequent F5 / reload on dashboard will redirect back to Intro page
            sessionStorage.removeItem("mango_just_clicked");
          }
        } catch (err) {
          console.warn("Refresh guard check notice:", err);
        }
      }
    }
  }, []);

  return null;
}
