// ============================================
// MANGODL — MOCK DATA
// ============================================
import type { AIRecommendation, OrchardRecord, YieldFactor } from "@/types";

export const kpiData = {
  orchards: 247,
  diseaseRisk: 23,
  predictedYield: 1842,
  estimatedRevenue: 2.47,
  climateHealth: 78,
};

export const yieldForecastData = [
  { month: "Jan", yield: 420, optimal: 500, last_year: 380 },
  { month: "Feb", yield: 380, optimal: 480, last_year: 360 },
  { month: "Mar", yield: 510, optimal: 560, last_year: 420 },
  { month: "Apr", yield: 680, optimal: 700, last_year: 590 },
  { month: "May", yield: 720, optimal: 750, last_year: 640 },
  { month: "Jun", yield: 890, optimal: 920, last_year: 780 },
  { month: "Jul", yield: 1050, optimal: 1100, last_year: 960 },
  { month: "Aug", yield: 980, optimal: 1050, last_year: 890 },
  { month: "Sep", yield: 840, optimal: 900, last_year: 760 },
  { month: "Oct", yield: 650, optimal: 720, last_year: 580 },
  { month: "Nov", yield: 480, optimal: 550, last_year: 420 },
  { month: "Dec", yield: 360, optimal: 430, last_year: 310 },
];

export const diseaseDistributionData = [
  { name: "Healthy", value: 58, color: "#22c55e" },
  { name: "Anthracnose", value: 19, color: "#f59e0b" },
  { name: "Powdery Mildew", value: 13, color: "#22d3ee" },
  { name: "Bacterial Black Spot", value: 7, color: "#ef4444" },
  { name: "Stem End Rot", value: 3, color: "#8b5cf6" },
];

export const revenueData = [
  { quarter: "Q1 '24", revenue: 0.48, cost: 0.18, profit: 0.30 },
  { quarter: "Q2 '24", revenue: 0.72, cost: 0.22, profit: 0.50 },
  { quarter: "Q3 '24", revenue: 1.12, cost: 0.28, profit: 0.84 },
  { quarter: "Q4 '24", revenue: 0.95, cost: 0.25, profit: 0.70 },
  { quarter: "Q1 '25", revenue: 0.58, cost: 0.19, profit: 0.39 },
  { quarter: "Q2 '25", revenue: 0.89, cost: 0.24, profit: 0.65 },
  { quarter: "Q3 '25", revenue: 1.34, cost: 0.31, profit: 1.03 },
  { quarter: "Q4 '25", revenue: 1.15, cost: 0.27, profit: 0.88 },
];

export const climateData = [
  { day: "Mon", temp: 32, rainfall: 12, humidity: 78, wind: 14 },
  { day: "Tue", temp: 34, rainfall: 0, humidity: 65, wind: 18 },
  { day: "Wed", temp: 29, rainfall: 28, humidity: 88, wind: 22 },
  { day: "Thu", temp: 31, rainfall: 5, humidity: 72, wind: 16 },
  { day: "Fri", temp: 35, rainfall: 0, humidity: 58, wind: 12 },
  { day: "Sat", temp: 33, rainfall: 15, humidity: 82, wind: 20 },
  { day: "Sun", temp: 28, rainfall: 42, humidity: 91, wind: 28 },
];

export const climateMonthlyData = [
  { month: "Jan", temp: 28, rainfall: 45, humidity: 72 },
  { month: "Feb", temp: 30, rainfall: 38, humidity: 68 },
  { month: "Mar", temp: 33, rainfall: 52, humidity: 75 },
  { month: "Apr", temp: 36, rainfall: 78, humidity: 82 },
  { month: "May", temp: 34, rainfall: 145, humidity: 88 },
  { month: "Jun", temp: 31, rainfall: 210, humidity: 91 },
  { month: "Jul", temp: 29, rainfall: 280, humidity: 93 },
  { month: "Aug", temp: 30, rainfall: 265, humidity: 92 },
  { month: "Sep", temp: 31, rainfall: 185, humidity: 87 },
  { month: "Oct", temp: 33, rainfall: 95, humidity: 79 },
  { month: "Nov", temp: 32, rainfall: 62, humidity: 74 },
  { month: "Dec", temp: 29, rainfall: 48, humidity: 70 },
];

export const orchardData: OrchardRecord[] = [
  { id: "ORH-001", name: "Sunset Valley Farm", area: 24, yield: 182, risk: "Low", health: 94, location: "Maharashtra" },
  { id: "ORH-002", name: "Green Horizon Estate", area: 18, yield: 134, risk: "Medium", health: 72, location: "Gujarat" },
  { id: "ORH-003", name: "Tropical Crown Gardens", area: 31, yield: 248, risk: "High", health: 45, location: "Kerala" },
  { id: "ORH-004", name: "Golden Valley Orchards", area: 15, yield: 118, risk: "Low", health: 89, location: "Andhra Pradesh" },
  { id: "ORH-005", name: "Mango Paradise Fields", area: 42, yield: 336, risk: "Low", health: 92, location: "Tamil Nadu" },
];

export const aiRecommendations: AIRecommendation[] = [
  {
    id: 1,
    type: "alert",
    severity: "high",
    title: "Disease Alert Detected",
    description: "Anthracnose outbreak risk high in Sector B. Immediate fungicide application recommended.",
    action: "Apply Copper Hydroxide 0.2% within 48 hours",
    icon: "AlertTriangle",
    color: "mango",
  },
  {
    id: 2,
    type: "irrigation",
    severity: "medium",
    title: "Irrigation Optimization",
    description: "Soil moisture levels dropping. AI recommends drip irrigation schedule adjustment.",
    action: "Increase irrigation by 20% for next 3 days",
    icon: "Droplets",
    color: "cyan",
  },
  {
    id: 3,
    type: "harvest",
    severity: "low",
    title: "Harvest Window Optimal",
    description: "Climate conditions indicate peak harvest timing. Expected yield 15% above projection.",
    action: "Begin harvest in Orchard 4 within 5 days",
    icon: "Leaf",
    color: "neon",
  },
  {
    id: 4,
    type: "fertilizer",
    severity: "medium",
    title: "Fertilizer Schedule",
    description: "Nitrogen deficiency detected via spectral imaging. Potassium levels optimal.",
    action: "Apply NPK 20-10-10 at 150kg/hectare",
    icon: "FlaskConical",
    color: "violet",
  },
  {
    id: 5,
    type: "pesticide",
    severity: "low",
    title: "Pesticide Optimization",
    description: "Mealybug activity detected. AI recommends targeted biological control agents.",
    action: "Deploy Cryptolaemus montrouzieri predators",
    icon: "Bug",
    color: "cyan",
  },
  {
    id: 6,
    type: "climate",
    severity: "high",
    title: "Climate Risk Warning",
    description: "Cyclone formation detected 400km offshore. High wind + rainfall event in 72 hours.",
    action: "Secure young fruits, prepare drainage systems",
    icon: "Wind",
    color: "mango",
  },
];

export const diseaseDetectionHistory = [
  { id: 1, date: "2025-05-27", image: "leaf_001.jpg", disease: "Anthracnose", confidence: 94.2, severity: "High" },
  { id: 2, date: "2025-05-26", image: "leaf_002.jpg", disease: "Healthy", confidence: 98.7, severity: "None" },
  { id: 3, date: "2025-05-25", image: "leaf_003.jpg", disease: "Powdery Mildew", confidence: 87.3, severity: "Medium" },
  { id: 4, date: "2025-05-24", image: "leaf_004.jpg", disease: "Bacterial Black Spot", confidence: 91.5, severity: "High" },
  { id: 5, date: "2025-05-23", image: "leaf_005.jpg", disease: "Healthy", confidence: 96.4, severity: "None" },
];

export const yieldPredictionResult = {
  predictedYield: 1842,
  confidence: 89.3,
  optimalYield: 2100,
  lastSeasonYield: 1654,
  growthRate: 11.4,
  factors: [
    { name: "Rainfall", impact: 78, status: "optimal" },
    { name: "Temperature", impact: 85, status: "good" },
    { name: "Humidity", impact: 72, status: "caution" },
    { name: "Soil Quality", impact: 91, status: "excellent" },
    { name: "Disease Risk", impact: 65, status: "caution" },
    { name: "Sunlight", impact: 88, status: "good" },
  ] as YieldFactor[],
};

export const revenueMetrics = {
  expectedRevenue: 2.47,
  profitMargin: 68.4,
  costOfProduction: 0.78,
  marketPrice: 45.50,
  revenueGrowth: 18.2,
  riskScore: 24,
  seasonalComparison: [
    { season: "Summer '24", revenue: 1.12, yield: 890 },
    { season: "Monsoon '24", revenue: 0.95, yield: 780 },
    { season: "Winter '24", revenue: 0.48, yield: 380 },
    { season: "Summer '25", revenue: 1.34, yield: 1050 },
    { season: "Monsoon '25 (P)", revenue: 1.15, yield: 920 },
  ],
};

export const dataflowNodes = [
  {
    id: "input",
    label: "Input Data",
    sublabel: "Climate · Soil · Images",
    x: 10,
    y: 50,
    color: "#22d3ee",
  },
  {
    id: "ai-hub",
    label: "AI Processing Hub",
    sublabel: "Neural Engine v3.2",
    x: 35,
    y: 50,
    color: "#8b5cf6",
  },
  {
    id: "disease",
    label: "Disease Detection",
    sublabel: "ResNet-50 + GradCAM",
    x: 62,
    y: 20,
    color: "#f59e0b",
  },
  {
    id: "yield",
    label: "Yield Prediction",
    sublabel: "XGBoost Model",
    x: 62,
    y: 50,
    color: "#22c55e",
  },
  {
    id: "revenue",
    label: "Revenue Estimation",
    sublabel: "Market Analytics",
    x: 62,
    y: 80,
    color: "#ef4444",
  },
  {
    id: "decision",
    label: "Farmer Decision Support",
    sublabel: "AI Recommendations",
    x: 87,
    y: 50,
    color: "#f59e0b",
  },
];
