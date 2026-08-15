"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, ShieldAlert, BarChart3, Percent, ArrowUpRight,
  ArrowRight, Leaf, Zap, Package, Truck, Scale, CircleDollarSign, Info, RefreshCw,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { GlowButton } from "@/components/ui/glow-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { revenueMetrics as defaultMetrics } from "@/data/mock-data";
import { useDashboardStore, type YieldResultData } from "@/store/dashboard-store";
import { useLocalizedText } from "@/lib/localization";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Cell, PieChart, Pie,
} from "recharts";

/* ─── Constants ─── */
const MARKET_PRICE_PER_KG = 45.5; // ₹/kg
const PRODUCTION_COST_PER_TONNE = 8500; // ₹/tonne
const DISEASE_LOSS_PCT = 0.12; // 12% average disease loss prevented
const MARKET_GRADES = [
  { grade: "A+ Premium", pctOfYield: 0.35, priceMultiplier: 1.6, color: "#f59e0b" },
  { grade: "A Standard", pctOfYield: 0.40, priceMultiplier: 1.0, color: "#22c55e" },
  { grade: "B Processing", pctOfYield: 0.18, priceMultiplier: 0.55, color: "#22d3ee" },
  { grade: "C Pulp/Juice", pctOfYield: 0.07, priceMultiplier: 0.30, color: "#8b5cf6" },
];

/* ─── Revenue Calculation Engine ─── */
function computeRevenueFromYield(yield_: YieldResultData) {
  const yieldTonnes = yield_.predictedYield;
  const yieldKg = yieldTonnes * 1000;

  // Grade-wise revenue
  const gradeBreakdown = MARKET_GRADES.map((g) => {
    const qty = yieldKg * g.pctOfYield;
    const rev = qty * MARKET_PRICE_PER_KG * g.priceMultiplier;
    return { ...g, qtyKg: qty, revenue: rev };
  });

  const grossRevenue = gradeBreakdown.reduce((s, g) => s + g.revenue, 0);
  const totalCost = yieldTonnes * PRODUCTION_COST_PER_TONNE;
  const netProfit = grossRevenue - totalCost;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Disease-prevented savings
  const diseaseSaved = grossRevenue * DISEASE_LOSS_PCT;

  // Risk score from yield factors
  const avgImpact = yield_.factors.length > 0
    ? yield_.factors.reduce((s, f) => s + f.impact, 0) / yield_.factors.length
    : 75;
  const riskScore = Math.max(5, Math.min(50, Math.round(100 - avgImpact)));

  // Optimal scenario
  const optimalRevenue = (yield_.optimalYield * 1000 * MARKET_PRICE_PER_KG * 1.1);
  const revenueEfficiency = grossRevenue > 0 ? (grossRevenue / optimalRevenue) * 100 : 0;

  // Growth vs last season
  const lastSeasonRevenue = yield_.lastSeasonYield * 1000 * MARKET_PRICE_PER_KG * 0.95;
  const revenueGrowth = lastSeasonRevenue > 0
    ? ((grossRevenue - lastSeasonRevenue) / lastSeasonRevenue) * 100
    : 0;

  return {
    grossRevenueCr: grossRevenue / 1e7,
    netProfitCr: netProfit / 1e7,
    totalCostCr: totalCost / 1e7,
    profitMargin,
    riskScore,
    revenueGrowth,
    diseaseSavedCr: diseaseSaved / 1e7,
    revenueEfficiency,
    gradeBreakdown,
    yieldTonnes,
  };
}

/* ─── Tooltip Components ─── */
type SeasonalTooltipEntry = {
  value?: number;
  payload?: { yield?: number };
};

const SeasonalTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: SeasonalTooltipEntry[]; label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-glass p-3 min-w-[140px]">
        <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
        <div className="text-sm font-bold text-white">₹{payload[0]?.value?.toFixed(2)}Cr</div>
        <div className="text-xs text-gray-500">{payload[0]?.payload?.yield}t yield</div>
      </div>
    );
  }
  return null;
};

/* ─── Animated Ring ─── */
function MetricRing({ value, max = 100, color, size = 72, stroke = 5 }: {
  value: number; max?: number; color: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - circ * pct }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

export default function RevenueAnalyticsPage() {
  const { term } = useLocalizedText();
  const { yieldResult } = useDashboardStore();

  // Default fallback when yield hasn't been calculated yet
  const defaultYield: YieldResultData = {
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
    ],
  };

  const activeYield = yieldResult || defaultYield;
  const isLinked = !!yieldResult;

  // Compute all revenue metrics from yield
  const revenue = useMemo(() => computeRevenueFromYield(activeYield), [activeYield]);

  // Seasonal comparison data (derived from yield prediction)
  const seasonalData = useMemo(() => {
    const base = activeYield.predictedYield;
    return [
      { season: "Summer '24", revenue: +(base * 0.028 * 0.85).toFixed(2), yield: Math.round(base * 0.85) },
      { season: "Monsoon '24", revenue: +(base * 0.028 * 0.72).toFixed(2), yield: Math.round(base * 0.72) },
      { season: "Winter '24", revenue: +(base * 0.028 * 0.4).toFixed(2), yield: Math.round(base * 0.4) },
      { season: "Summer '25", revenue: +(base * 0.028 * 1.0).toFixed(2), yield: Math.round(base) },
      { season: "Monsoon '25 (P)", revenue: +(base * 0.028 * 0.88).toFixed(2), yield: Math.round(base * 0.88) },
    ];
  }, [activeYield.predictedYield]);

  // Risk analysis derived from yield factors
  const riskAnalysis = useMemo(() => {
    const factorRisks = activeYield.factors.map((f) => ({
      label: `${f.name} Risk`,
      value: Math.max(5, 100 - f.impact),
      color: f.impact >= 80 ? "#22c55e" : f.impact >= 60 ? "#f59e0b" : "#ef4444",
    }));
    return [
      ...factorRisks.slice(0, 3),
      { label: "Market Volatility", value: 22, color: "#f59e0b" },
      { label: "Logistics Risk", value: 15, color: "#22d3ee" },
    ];
  }, [activeYield.factors]);

  // Grade breakdown for pie chart
  const gradeData = useMemo(() => revenue.gradeBreakdown.map((g) => ({
    name: g.grade,
    value: +(g.revenue / 1e7).toFixed(3),
    fill: g.color,
    qty: Math.round(g.qtyKg / 1000),
  })), [revenue.gradeBreakdown]);

  // Loss prevention metrics (derived)
  const lossPrevention = useMemo(() => [
    { label: "Disease Loss Prevented", value: `₹${revenue.diseaseSavedCr.toFixed(2)}Cr`, change: "+12.4%", positive: true, icon: Leaf },
    { label: "Yield Optimization Gain", value: `₹${(revenue.grossRevenueCr * 0.089).toFixed(2)}Cr`, change: "+8.7%", positive: true, icon: TrendingUp },
    { label: "Early Detection Savings", value: `₹${(revenue.grossRevenueCr * 0.061).toFixed(2)}Cr`, change: "+5.2%", positive: true, icon: ShieldAlert },
    { label: "Market Timing Gain", value: `₹${(revenue.grossRevenueCr * 0.077).toFixed(2)}Cr`, change: "+9.1%", positive: true, icon: Zap },
  ], [revenue]);

  // KPI cards
  const metricCards = [
    {
      label: "Gross Revenue",
      value: revenue.grossRevenueCr,
      prefix: "₹",
      suffix: "Cr",
      decimals: 2,
      icon: IndianRupee,
      change: revenue.revenueGrowth,
      color: "#f59e0b",
      sub: `From ${revenue.yieldTonnes.toLocaleString()}t yield`,
    },
    {
      label: "Net Profit",
      value: revenue.netProfitCr,
      prefix: "₹",
      suffix: "Cr",
      decimals: 2,
      icon: CircleDollarSign,
      change: revenue.revenueGrowth * 0.85,
      color: "#22c55e",
      sub: `After ₹${revenue.totalCostCr.toFixed(2)}Cr costs`,
    },
    {
      label: "Profit Margin",
      value: revenue.profitMargin,
      suffix: "%",
      decimals: 1,
      icon: Percent,
      change: 4.7,
      color: "#22d3ee",
      sub: "Revenue efficiency ratio",
    },
    {
      label: "Risk Score",
      value: revenue.riskScore,
      suffix: "%",
      icon: ShieldAlert,
      change: -6.1,
      color: revenue.riskScore > 30 ? "#ef4444" : "#f59e0b",
      sub: "From environmental factors",
    },
  ];

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* ─── Hero Header ─── */}
        <StaggerItem>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
            style={{ background: "linear-gradient(135deg, rgba(18,22,31,0.92) 0%, rgba(24,18,12,0.85) 50%, rgba(18,22,31,0.92) 100%)" }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-yellow-500/[0.07] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-green-500/[0.06] blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(34,197,94,0.12))",
                    border: "1px solid rgba(245,158,11,0.2)",
                    boxShadow: "0 0 24px rgba(245,158,11,0.12)",
                  }}
                >
                  <IndianRupee className="w-7 h-7 text-yellow-400" />
                </motion.div>
                <div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl gradient-text-hero mb-1">
                    {term("Revenue Analytics")}
                  </h1>
                  <p className="text-gray-400 text-sm max-w-lg">
                    {term("Premium fintech-grade agricultural revenue intelligence")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <NeonBadge label={isLinked ? term("Live Yield Data") : term("Revenue Trends")} variant={isLinked ? "neon" : "gray"} pulse={isLinked} />
                <NeonBadge label={`₹${MARKET_PRICE_PER_KG}/kg`} variant="mango" />
                <NeonBadge label={term("Q3 2025 Forecast")} variant="cyan" />
              </div>
            </div>

            {/* ── Data Source Strip ── */}
            <div className="relative mt-5 pt-4 border-t border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    background: isLinked ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                    borderColor: isLinked ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
                  }}
                >
                  {isLinked ? (
                    <Zap className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-yellow-400" />
                  )}
                  <span className="text-xs font-medium" style={{ color: isLinked ? "#4ade80" : "#fbbf24" }}>
                    {isLinked
                      ? `Live from Yield Engine: ${activeYield.predictedYield.toLocaleString()}t @ ${activeYield.confidence}% conf.`
                      : "Using default yield data — Visit Yield Prediction to sync live data"
                    }
                  </span>
                  {!isLinked && (
                    <Link href="/dashboard/yield-prediction" className="ml-2">
                      <GlowButton variant="outline" size="sm" type="button">
                        <ArrowRight className="w-3 h-3" /> Go to Yield Engine
                      </GlowButton>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-auto text-xs">
                  {[
                    { icon: Package, label: `${activeYield.predictedYield.toLocaleString()}t Yield` },
                    { icon: Scale, label: `₹${MARKET_PRICE_PER_KG}/kg Base` },
                    { icon: Truck, label: `₹${(PRODUCTION_COST_PER_TONNE / 1000).toFixed(1)}k/t Cost` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-gray-500">
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* ─── KPI Row ─── */}
        <StaggerItem>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: term("Gross Revenue"),
                value: revenue.grossRevenueCr,
                prefix: "₹",
                suffix: "Cr",
                decimals: 2,
                icon: IndianRupee,
                change: revenue.revenueGrowth,
                color: "#f59e0b",
                sub: `${term("From")} ${revenue.yieldTonnes.toLocaleString()}t ${term("Predicted Yield").toLowerCase()}`,
              },
              {
                label: term("Net Profit"),
                value: revenue.netProfitCr,
                prefix: "₹",
                suffix: "Cr",
                decimals: 2,
                icon: CircleDollarSign,
                change: revenue.revenueGrowth * 0.85,
                color: "#22c55e",
                sub: `${term("Cost")} ₹${revenue.totalCostCr.toFixed(2)}Cr`,
              },
              {
                label: term("Profit Margin"),
                value: revenue.profitMargin,
                suffix: "%",
                decimals: 1,
                icon: Percent,
                change: 4.7,
                color: "#22d3ee",
                sub: term("Revenue Efficiency"),
              },
              {
                label: term("Risk Score"),
                value: revenue.riskScore,
                suffix: "%",
                icon: ShieldAlert,
                change: -6.1,
                color: revenue.riskScore > 30 ? "#ef4444" : "#f59e0b",
                sub: term("Risk Analysis"),
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="card-glass p-5 transition-all duration-300 group"
              >
                <div className="absolute top-0 left-4 right-4 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)` }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.color}15` }}
                  >
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    card.change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change >= 0 ? "+" : ""}{card.change.toFixed(1)}%
                  </div>
                </div>
                <div className="text-2xl font-display font-bold text-white mb-0.5">
                  <AnimatedCounter
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    decimals={card.decimals ?? 0}
                    duration={1500}
                  />
                </div>
                <div className="text-xs text-gray-400 font-medium">{card.label}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{card.sub}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* ─── Revenue by Grade + Efficiency Ring ─── */}
        <StaggerItem>
          <div className="grid lg:grid-cols-[1fr,320px] gap-5">
            {/* Grade Breakdown */}
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{term("Market Grade Breakdown")}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{term("Grade-wise revenue computed from predicted yield")}</p>
                </div>
                <NeonBadge label={term("Grade Distribution")} variant="mango" />
              </div>
              <div className="space-y-3">
                {revenue.gradeBreakdown.map((g, i) => (
                  <motion.div
                    key={g.grade}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}50` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300 font-medium">{g.grade}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-500">{Math.round(g.qtyKg / 1000)}t · {g.priceMultiplier}× {term("Price Risk").replace(" Risk", "")}</span>
                          <span className="text-sm font-bold text-white">₹{(g.revenue / 1e7).toFixed(2)}Cr</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: g.color, boxShadow: `0 0 6px ${g.color}60` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.revenue / revenue.gradeBreakdown[0].revenue) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Grade total */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-gray-400">{term("Gross Revenue")}</span>
                <span className="text-lg font-display font-bold text-yellow-400">₹{revenue.grossRevenueCr.toFixed(2)}Cr</span>
              </div>
            </GlassCard>

            {/* Revenue Efficiency */}
            <GlassCard className="p-5 flex flex-col items-center justify-center" hover={false}>
              <h3 className="text-white font-semibold text-sm mb-5 self-start">{term("Revenue Efficiency")}</h3>
              <MetricRing value={revenue.revenueEfficiency} color="#f59e0b" size={120} stroke={8} />
              <p className="text-gray-400 text-xs mt-3 text-center">{term("of optimal")}</p>

              <div className="w-full mt-5 pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Actual</span>
                  <span className="text-white font-semibold">₹{revenue.grossRevenueCr.toFixed(2)}Cr</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Optimal</span>
                  <span className="text-green-400 font-semibold">₹{(activeYield.optimalYield * 1000 * MARKET_PRICE_PER_KG * 1.1 / 1e7).toFixed(2)}Cr</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Gap</span>
                  <span className="text-yellow-400 font-semibold">
                    ₹{((activeYield.optimalYield * 1000 * MARKET_PRICE_PER_KG * 1.1 / 1e7) - revenue.grossRevenueCr).toFixed(2)}Cr
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </StaggerItem>

        {/* ─── Revenue Trends Chart ─── */}
        <StaggerItem>
          <RevenueChart />
        </StaggerItem>

        {/* ─── Seasonal Revenue + Risk ─── */}
        <StaggerItem>
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Seasonal Comparison Chart */}
            <GlassCard className="p-5 col-span-2" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{term("Seasonal Revenue Comparison")}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{term("5 Seasons")}</p>
                </div>
                <NeonBadge label={term("Live Yield Data")} variant="neon" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={seasonalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="season" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<SeasonalTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="revenue" name={term("Revenue")} fill="url(#revenueGrad2)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Risk Analysis */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-white font-semibold mb-4">{term("Risk Analysis")}</h3>
              <p className="text-[10px] text-gray-500 -mt-3 mb-4">{term("Environmental Inputs")}</p>
              <div className="space-y-4">
                {riskAnalysis.map((risk, i) => (
                  <motion.div
                    key={risk.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{term(risk.label)}</span>
                      <span className="text-xs font-semibold" style={{ color: risk.color }}>{risk.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: risk.color, boxShadow: `0 0 6px ${risk.color}60` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.value}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{term("Overall Risk Score")}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-yellow-400">{revenue.riskScore}%</span>
                    <NeonBadge label={term(revenue.riskScore <= 25 ? "Low" : revenue.riskScore <= 40 ? "Medium" : "High")}
                      variant={revenue.riskScore <= 25 ? "neon" : revenue.riskScore <= 40 ? "mango" : "red"} size="sm"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </StaggerItem>

        {/* ─── Loss Prevention ─── */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{term("Loss Prevention Metrics")}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{term("AI Protected")}</p>
              </div>
              <NeonBadge label={term("AI Engine")} variant="neon" pulse />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lossPrevention.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-4 rounded-xl bg-green-500/5 border border-green-500/15 group hover:border-green-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] text-green-400 font-medium">{metric.change}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{term(metric.label)}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* ─── Data Source Footer ─── */}
        <StaggerItem>
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="flex items-center gap-6 text-[10px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                <span>Yield Prediction → Revenue Analytics data pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                <span>Auto-updates when yield sliders change</span>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
