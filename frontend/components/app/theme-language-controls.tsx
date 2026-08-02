"use client";

import { Languages, MoonStar, SunMedium } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { languageOptions, useLocalizedText } from "@/lib/localization";
import { cn } from "@/lib/utils";

interface ThemeLanguageControlsProps {
  compact?: boolean;
  className?: string;
}

export function ThemeLanguageControls({
  compact = false,
  className = "",
}: ThemeLanguageControlsProps) {
  const theme = useDashboardStore((state) => state.theme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
  const language = useDashboardStore((state) => state.language);
  const setLanguage = useDashboardStore((state) => state.setLanguage);
  const { term } = useLocalizedText();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]",
          compact ? "px-3 py-2 text-xs" : "px-3.5 py-2 text-sm"
        )}
        aria-label={theme === "dark" ? term("Switch to light theme") : term("Switch to dark theme")}
      >
        {theme === "dark" ? (
          <SunMedium className="h-4 w-4 text-yellow-400" />
        ) : (
          <MoonStar className="h-4 w-4 text-cyan-500" />
        )}
        <span className={compact ? "hidden sm:inline" : ""}>
          {theme === "dark" ? term("Light") : term("Dark")}
        </span>
      </button>

      <label
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 text-[var(--text-secondary)]",
          compact ? "py-2 text-xs" : "py-2 text-sm"
        )}
      >
        <Languages className="h-4 w-4 text-[var(--text-muted)]" />
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
          className="min-w-20 bg-transparent text-[var(--text-primary)] outline-none"
          aria-label={term("Language")}
        >
          {languageOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[var(--background)] text-[var(--text-primary)]"
            >
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
