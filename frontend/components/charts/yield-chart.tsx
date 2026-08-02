"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { yieldForecastData } from "@/data/mock-data";
import { useLocalizedText } from "@/lib/localization";

type YieldTooltipEntry = {
  color?: string;
  name: string;
  value: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: YieldTooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card-glass min-w-[160px] p-3">
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-300">{entry.name}</span>
          </span>
          <span className="font-semibold text-white">{entry.value.toLocaleString()} t</span>
        </div>
      ))}
    </div>
  );
}

export function YieldChart() {
  const { term } = useLocalizedText();
  const legend = [
    { color: "#f59e0b", label: term("Projected") },
    { color: "#22c55e", label: term("Optimal") },
    { color: "#6b7280", label: term("Last Year") },
  ];

  return (
    <GlassCard className="p-5" delay={0.3} hover={false}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{term("Yield Forecast")}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{term("12-month harvest projection")}</p>
        </div>
        <div className="flex items-center gap-4">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-0.5 w-3 rounded" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={yieldForecastData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="optimalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}t`} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(245,158,11,0.2)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="last_year" name={term("Last Year")} stroke="#4b5563" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="optimal" name={term("Optimal")} stroke="#22c55e" strokeWidth={1.5} fill="url(#optimalGrad)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="yield" name={term("Projected")} stroke="#f59e0b" strokeWidth={2} fill="url(#yieldGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
