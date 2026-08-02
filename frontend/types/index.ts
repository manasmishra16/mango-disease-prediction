// ============================================
// MANGODL — TYPE DEFINITIONS
// ============================================

export interface KPIData {
  orchards: number;
  diseaseRisk: number;
  predictedYield: number;
  estimatedRevenue: number;
  climateHealth: number;
}

export type AppTheme = "dark" | "light";
export type AppLanguage = "en" | "hi" | "kn";

export interface YieldDataPoint {
  month: string;
  yield: number;
  optimal: number;
  last_year: number;
}

export interface DiseaseDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RevenueDataPoint {
  quarter: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ClimateDataPoint {
  day: string;
  temp: number;
  rainfall: number;
  humidity: number;
  wind: number;
}

export interface OrchardRecord {
  id: string;
  name: string;
  area: number;
  yield: number;
  risk: "Low" | "Medium" | "High";
  health: number;
  location: string;
}

export type RecommendationColor = "mango" | "cyan" | "neon" | "violet";
export type RecommendationSeverity = "low" | "medium" | "high";

export interface AIRecommendation {
  id: number;
  type: string;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  action: string;
  icon: string;
  color: RecommendationColor;
}

export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  severity: "None" | "Low" | "Medium" | "High";
  treatment: string;
  description: string;
}

export interface YieldFactor {
  name: string;
  impact: number;
  status: "excellent" | "good" | "optimal" | "caution" | "poor";
}

export interface DataflowNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
}

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
};

export type NavRoute =
  | "/"
  | "/dashboard"
  | "/dashboard/disease-detection"
  | "/dashboard/yield-prediction"
  | "/dashboard/revenue-analytics"
  | "/dashboard/climate-monitoring"
  | "/dashboard/ai-recommendations"
  | "/dashboard/dataflow"
  | "/dashboard/settings";
