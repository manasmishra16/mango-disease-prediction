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

  return null;
}
