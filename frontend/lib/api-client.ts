// ============================================
// MANGODL — API CLIENT SERVICE LAYER
// ============================================

import type {
  DiseaseDetectionResult,
  YieldFactor,
  OrchardRecord,
  AIRecommendation,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API Error (${res.status})`;
    try {
      const errObj = await res.json();
      if (errObj.detail) errorMsg = errObj.detail;
    } catch {
      const errorText = await res.text();
      if (errorText) errorMsg = errorText;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// --------------------------------------------
// Authentication
// --------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organization: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function loginApi(email: str, password: str): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(data: {
  fullName: string;
  email: string;
  password: str;
  role?: string;
  organization?: string;
}): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeApi(token?: string): Promise<{ user: AuthUser }> {
  return fetchJson<{ user: AuthUser }>("/api/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function logoutApi(token?: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// --------------------------------------------
// Disease Detection
// --------------------------------------------
export interface DiseaseScanResponse {
  is_mango_leaf?: boolean;
  disease: string;
  confidence: number;
  severity: "None" | "Low" | "Medium" | "High";
  severity_score: number;
  treatment: string;
  description: string;
  heatmap_b64: string;
}

export interface DiseaseHistoryRecord {
  id: number;
  date: string;
  image: string;
  disease: string;
  confidence: number;
  severity: "None" | "Low" | "Medium" | "High";
}

export async function scanDiseaseImage(file: File): Promise<DiseaseScanResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict/disease`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Disease scan failed: ${res.statusText}`);
  }

  return res.json();
}

export async function getDiseaseHistory(): Promise<DiseaseHistoryRecord[]> {
  return fetchJson<DiseaseHistoryRecord[]>("/api/disease-detection/history");
}

// --------------------------------------------
// Yield Prediction
// --------------------------------------------
export interface YieldCalculateRequest {
  rainfall: number;
  temperature: number;
  humidity: number;
  soilQuality: number;
  orchardSize: number;
}

export interface YieldCalculateResponse {
  predictedYield: number;
  confidence: number;
  optimalYield: number;
  lastSeasonYield: number;
  growthRate: number;
  factors: YieldFactor[];
}

export async function calculateYield(inputs: YieldCalculateRequest): Promise<YieldCalculateResponse> {
  return fetchJson<YieldCalculateResponse>("/api/yield-prediction/calculate", {
    method: "POST",
    body: JSON.stringify(inputs),
  });
}

// --------------------------------------------
// Dashboard Overview
// --------------------------------------------
export interface DashboardStatsResponse {
  kpis: {
    orchards: number;
    diseaseRisk: number;
    predictedYield: number;
    estimatedRevenue: number;
    climateHealth: number;
  };
  orchards: OrchardRecord[];
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return fetchJson<DashboardStatsResponse>("/api/dashboard/stats");
}

// --------------------------------------------
// Revenue Analytics
// --------------------------------------------
export interface RevenueAnalyticsResponse {
  expectedRevenue: number;
  profitMargin: number;
  costOfProduction: number;
  marketPrice: number;
  revenueGrowth: number;
  riskScore: number;
  seasonalComparison: { season: string; revenue: number; yield: number }[];
  riskAnalysis: { label: string; value: number; color: string }[];
  lossPrevention: { label: string; value: string; change: string; positive: boolean }[];
}

export async function getRevenueAnalytics(): Promise<RevenueAnalyticsResponse> {
  return fetchJson<RevenueAnalyticsResponse>("/api/revenue-analytics");
}

// --------------------------------------------
// Climate Monitoring
// --------------------------------------------
export interface ClimateMonitorResponse {
  currentWeather: {
    temp: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    uvIndex: number;
    visibility: number;
    condition: string;
    location: string;
  };
  forecast: {
    day: string;
    temp: number;
    condition: string;
    rainfall: number;
  }[];
  dailyData: {
    day: string;
    temp: number;
    rainfall: number;
    humidity: number;
    wind: number;
  }[];
}

export async function getClimateMonitorData(): Promise<ClimateMonitorResponse> {
  return fetchJson<ClimateMonitorResponse>("/api/climate-monitor");
}

// --------------------------------------------
// AI Recommendations
// --------------------------------------------
export interface RecommendationsResponse {
  recommendations: AIRecommendation[];
  stats: {
    processedToday: number;
    alertsGenerated: number;
    actionsTaken: number;
  };
}

export async function getRecommendations(): Promise<RecommendationsResponse> {
  return fetchJson<RecommendationsResponse>("/api/recommendations");
}

export async function markRecommendationActioned(id: number): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`/api/recommendations/${id}/action`, {
    method: "POST",
  });
}

// --------------------------------------------
// Dataflow Stats
// --------------------------------------------
export interface DataflowStatsResponse {
  imagesProcessed: number;
  inferencesMade: number;
  avgLatency: string;
  modelAccuracy: string;
}

export async function getDataflowStats(): Promise<DataflowStatsResponse> {
  return fetchJson<DataflowStatsResponse>("/api/dataflow/stats");
}

// --------------------------------------------
// Settings
// --------------------------------------------
export interface UserSettings {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    organization: string;
    role: string;
  };
  aiConfig: {
    autoScanFrequency: string;
    detectionThreshold: string;
    yieldModelVersion: string;
    autoNotifications: boolean;
    gradcamVisualization: boolean;
    revenueForecasting: boolean;
    betaFeatures: boolean;
  };
}

export async function getSettings(): Promise<UserSettings> {
  return fetchJson<UserSettings>("/api/settings");
}

export async function saveSettings(settings: UserSettings): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}
