import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppLanguage, AppTheme, DiseaseDetectionResult, YieldFactor } from "@/types";

export interface YieldResultData {
  predictedYield: number;
  confidence: number;
  optimalYield: number;
  lastSeasonYield: number;
  growthRate: number;
  factors: YieldFactor[];
}

export interface YieldInputsData {
  rainfall: number;
  temperature: number;
  humidity: number;
  soilQuality: number;
  orchardSize: number;
}

interface DashboardStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scanResult: DiseaseDetectionResult | null;
  setScanResult: (result: DiseaseDetectionResult | null) => void;
  yieldInputs: YieldInputsData;
  setYieldInput: (key: string, value: number) => void;
  yieldResult: YieldResultData | null;
  setYieldResult: (result: YieldResultData) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      language: "en",
      setLanguage: (language) => set({ language }),

      activeModule: "dashboard",
      setActiveModule: (module) => set({ activeModule: module }),

      isScanning: false,
      setIsScanning: (scanning) => set({ isScanning: scanning }),

      scanResult: null,
      setScanResult: (result) => set({ scanResult: result }),

      yieldInputs: {
        rainfall: 120,
        temperature: 32,
        humidity: 78,
        soilQuality: 75,
        orchardSize: 25,
      },
      setYieldInput: (key, value) =>
        set((s) => ({ yieldInputs: { ...s.yieldInputs, [key]: value } })),

      yieldResult: null,
      setYieldResult: (result) => set({ yieldResult: result }),
    }),
    {
      name: "mangodl-preferences",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
