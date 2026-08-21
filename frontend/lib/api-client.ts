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

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(data: {
  fullName: string;
  email: string;
  password: string;
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
  status?: string;
  disease: string;
  confidence: number;
  severity: "None" | "Low" | "Medium" | "High";
  severity_score: number;
  treatment: string;
  description: string;
  heatmap_b64: string;
  message?: string;
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

export async function getDiseaseHistory(limit: number = 50): Promise<DiseaseHistoryRecord[]> {
  return fetchJson<DiseaseHistoryRecord[]>(`/api/disease-detection/history?limit=${limit}`);
}

export async function pruneDiseaseHistory(limit: number = 50): Promise<{ status: string; count: number; history: DiseaseHistoryRecord[] }> {
  return fetchJson<{ status: string; count: number; history: DiseaseHistoryRecord[] }>(`/api/disease-detection/history/prune?limit=${limit}`, {
    method: "POST",
  });
}

export async function deleteDiseaseHistoryRecord(recordId: number): Promise<{ status: string; remaining: number }> {
  return fetchJson<{ status: string; remaining: number }>(`/api/disease-detection/history/${recordId}`, {
    method: "DELETE",
  });
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
export interface KarnatakaDistrictInfo {
  name: string;
  region: string;
  mangoZone: string;
  lat: number;
  lon: number;
}

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
    region?: string;
    latitude?: number;
    longitude?: number;
    mangoZone?: string;
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
  allDistricts?: KarnatakaDistrictInfo[];
}

export async function getClimateMonitorData(district?: string): Promise<ClimateMonitorResponse> {
  const query = district ? `?district=${encodeURIComponent(district)}` : "";
  return fetchJson<ClimateMonitorResponse>(`/api/climate-monitor${query}`);
}

export async function getKarnatakaDistricts(): Promise<KarnatakaDistrictInfo[]> {
  return fetchJson<KarnatakaDistrictInfo[]>("/api/climate/districts");
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

// --------------------------------------------
// AI Agronomist Agent
// --------------------------------------------
export interface AgentActionCard {
  type: "prescription" | "irrigation" | "economics" | "disease_scan";
  title: string;
  data: Record<string, any>;
}

export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  action?: AgentActionCard;
  modelUsed?: string;
  latencyMs?: number;
  source?: string;
  suggestedQuestions?: string[];
}

export interface AgentChatResponse {
  response: string;
  action?: AgentActionCard;
  source: string;
  modelUsed: string;
  latencyMs: number;
  context: {
    temp: number;
    humidity: number;
    activeAlerts: number;
  };
  suggestedQuestions?: string[];
}

export interface AgentModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface AgentModelsResponse {
  models: AgentModelInfo[];
  defaultModel: string;
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
}

export interface AgentPreset {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon: string;
}

export interface AgentStatusResponse {
  status: string;
  agentName: string;
  version: string;
  activeModel: string;
  liveContext: {
    location: string;
    ambient_temp: number;
    ambient_humidity: number;
    wind_speed: number;
    weather_condition: string;
    uv_index: number;
    rainfall_forecast: string;
    total_orchards: number;
    recent_scans: string;
    active_disease_alerts: number;
    avg_yield_forecast: string;
    current_market_price: string;
    pulp_factory_price: string;
    recommended_cultivars: string[];
  };
  supportedProviders: string[];
}

export async function sendAgentMessage(params: {
  message: string;
  history?: { role: string; content: string }[];
  model?: string;
  apiKey?: string;
  temperature?: number;
  topic?: string;
}): Promise<AgentChatResponse> {
  return fetchJson<AgentChatResponse>("/api/agent/chat", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function streamAgentMessage(
  params: {
    message: string;
    history?: { role: string; content: string }[];
    model?: string;
    apiKey?: string;
    temperature?: number;
    topic?: string;
  },
  onToken: (token: string) => void,
  onMeta?: (meta: { action?: any; suggestedQuestions?: string[]; modelUsed?: string }) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/agent/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Agent connection notice: Server returned ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          const payload = JSON.parse(trimmed.slice(6));
          if (payload.type === "token" && payload.content) {
            onToken(payload.content);
          } else if (payload.type === "meta" && onMeta) {
            onMeta({
              action: payload.action,
              suggestedQuestions: payload.suggestedQuestions,
              modelUsed: payload.modelUsed,
            });
          }
        } catch (e) {
          // ignore stream parse errors
        }
      }
    }
  }
}

export async function getAgentModels(): Promise<AgentModelsResponse> {
  return fetchJson<AgentModelsResponse>("/api/agent/models");
}

export async function getAgentPresets(): Promise<{ presets: AgentPreset[] }> {
  return fetchJson<{ presets: AgentPreset[] }>("/api/agent/presets");
}

export async function getAgentStatus(): Promise<AgentStatusResponse> {
  return fetchJson<AgentStatusResponse>("/api/agent/status");
}

// --------------------------------------------
// Help Center & Farmer Direct Support
// --------------------------------------------
export interface HelpTicketReply {
  id: string;
  author: string;
  role: string;
  isAdmin: boolean;
  timestamp: string;
  message: string;
}

export interface HelpTicket {
  id: string;
  farmerName: string;
  phone?: string;
  email?: string;
  district: string;
  mangoVariety: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Answered" | "Resolved";
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  replies: HelpTicketReply[];
}

export interface HelpCenterStats {
  totalInquiries: number;
  openInquiries: number;
  inProgress: number;
  answered: number;
  resolved: number;
  resolutionRate: string;
  avgResponseTime: string;
  adminLead: string;
}

export interface CreateTicketParams {
  farmerName: string;
  phone?: string;
  email?: string;
  district: string;
  mangoVariety?: string;
  category: string;
  priority?: string;
  subject: string;
  message: string;
}

export async function getHelpTickets(filters?: {
  status?: string;
  category?: string;
  district?: string;
  search?: string;
}): Promise<HelpTicket[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "All") params.append("status", filters.status);
  if (filters?.category && filters.category !== "All") params.append("category", filters.category);
  if (filters?.district && filters.district !== "All") params.append("district", filters.district);
  if (filters?.search) params.append("search", filters.search);

  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<HelpTicket[]>(`/api/help-center/tickets${qs}`);
}

export async function createHelpTicket(params: CreateTicketParams): Promise<HelpTicket> {
  return fetchJson<HelpTicket>("/api/help-center/tickets", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function replyToHelpTicket(ticketId: string, message: string, author?: string): Promise<HelpTicket> {
  return fetchJson<HelpTicket>(`/api/help-center/tickets/${ticketId}/reply`, {
    method: "POST",
    body: JSON.stringify({
      message,
      author: author || "Manas (Admin / KSIT)",
      role: "Lead Administrator",
      isAdmin: true,
    }),
  });
}

export async function updateTicketStatus(
  ticketId: string,
  status: "Open" | "In Progress" | "Answered" | "Resolved",
  priority?: string
): Promise<HelpTicket> {
  return fetchJson<HelpTicket>(`/api/help-center/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, priority }),
  });
}

export async function deleteHelpTicket(ticketId: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`/api/help-center/tickets/${ticketId}`, {
    method: "DELETE",
  });
}

export async function getHelpCenterStats(): Promise<HelpCenterStats> {
  return fetchJson<HelpCenterStats>("/api/help-center/stats");
}

