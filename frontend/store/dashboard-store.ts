import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppLanguage, AppTheme, DiseaseDetectionResult } from "@/types";

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
  yieldInputs: {
    rainfall: number;
    temperature: number;
    humidity: number;
    soilQuality: number;
    orchardSize: number;
  };
  setYieldInput: (key: string, value: number) => void;
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
