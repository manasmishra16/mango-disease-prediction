"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, ShieldAlert, BarChart3, Percent, ArrowUpRight } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { revenueMetrics } from "@/data/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type SeasonalTooltipEntry = {
  value?: number;
  payload?: {
    yield?: number;
  };
};

const metricCards = [
  {
    label: "Expected Revenue",
    value: revenueMetrics.expectedRevenue,
    prefix: "₹",
    suffix: "Cr",
    decimals: 2,
    icon: DollarSign,
    change: 18.2,
    color: "#f59e0b",
  },
  {
    label: "Profit Margin",
    value: revenueMetrics.profitMargin,
    suffix: "%",
    decimals: 1,
    icon: Percent,
    change: 4.7,
    color: "#22c55e",
  },
  {
    label: "Market Price",
    value: revenueMetrics.marketPrice,
    prefix: "₹",
    suffix: "/kg",
    decimals: 2,
    icon: BarChart3,
    change: 8.3,
    color: "#22d3ee",
  },
  {
    label: "Risk Score",
    value: revenueMetrics.riskScore,
    suffix: "%",
    icon: ShieldAlert,
    change: -6.1,
    color: "#ef4444",
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: SeasonalTooltipEntry[];
  label?: string;
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

export default function RevenueAnalyticsPage() {
  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Revenue Analytics</h2>
              <p className="text-gray-400 text-sm mt-1">Premium fintech-grade agricultural revenue intelligence</p>
            </div>
            <NeonBadge label="Q3 2025 Forecast" variant="mango" pulse />
          </div>
        </StaggerItem>

        {/* KPI Row */}
        <StaggerItem>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card, i) => (
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
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.color}15` }}
                  >
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${card.change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change >= 0 ? "+" : ""}{card.change}%
                  </div>
                </div>
                <div className="text-2xl font-display font-bold text-white mb-1">
                  <AnimatedCounter
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    decimals={card.decimals ?? 0}
                    duration={1800}
                  />
                </div>
                <div className="text-xs text-gray-400">{card.label}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* Revenue Chart */}
        <StaggerItem>
          <RevenueChart />
        </StaggerItem>

        {/* Seasonal Revenue + Risk */}
        <StaggerItem>
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Seasonal Comparison Chart */}
            <GlassCard className="p-5 col-span-2" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Seasonal Revenue Comparison</h3>
                <NeonBadge label="5 Seasons" variant="cyan" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueMetrics.seasonalComparison} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="season" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="url(#revenueGrad2)"
                    radius={[6, 6, 0, 0]}
                  />
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
              <h3 className="text-white font-semibold mb-4">Risk Analysis</h3>
              <div className="space-y-4">
                {[
                  { label: "Market Volatility", value: 32, color: "#f59e0b" },
                  { label: "Climate Risk", value: 28, color: "#ef4444" },
                  { label: "Disease Loss Risk", value: 23, color: "#ef4444" },
                  { label: "Logistics Risk", value: 15, color: "#f59e0b" },
                  { label: "Price Risk", value: 18, color: "#22d3ee" },
                ].map((risk, i) => (
                  <motion.div
                    key={risk.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{risk.label}</span>
                      <span className="text-xs font-semibold" style={{ color: risk.color }}>{risk.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: risk.color, boxShadow: `0 0 6px ${risk.color}60` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.06 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Overall Risk Score</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-yellow-400">24%</span>
                    <NeonBadge label="Low" variant="neon" size="sm" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </StaggerItem>

        {/* Loss Prevention */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Loss Prevention Metrics</h3>
              <NeonBadge label="AI Protected" variant="neon" pulse />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Disease Loss Prevented", value: "₹0.38Cr", change: "+12.4%", positive: true },
                { label: "Yield Optimization Gain", value: "₹0.22Cr", change: "+8.7%", positive: true },
                { label: "Early Detection Savings", value: "₹0.15Cr", change: "+5.2%", positive: true },
                { label: "Market Timing Gain", value: "₹0.19Cr", change: "+9.1%", positive: true },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"
                >
                  <div className="flex items-center justify-between mb-2">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] text-green-400 font-medium">{metric.change}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
