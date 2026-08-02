"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { climateMonthlyData } from "@/data/mock-data";
import { useLocalizedText } from "@/lib/localization";

type ClimateTooltipEntry = {
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
  payload?: ClimateTooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card-glass min-w-[150px] p-3">
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="mt-1 flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-300">{entry.name}</span>
          </span>
          <span className="font-semibold text-white">
            {entry.value}
            {entry.name === "Temp" ? "°C" : entry.name === "Rainfall" ? "mm" : "%"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ClimateChart() {
  const { term } = useLocalizedText();
  const legend = [
    { color: "#f59e0b", label: term("Temp °C") },
    { color: "#22d3ee", label: term("Rainfall mm") },
    { color: "#8b5cf6", label: term("Humidity %") },
  ];

  return (
    <GlassCard className="p-5" delay={0.45} hover={false}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{term("Climate Analytics")}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{term("Annual weather pattern analysis")}</p>
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
        <LineChart data={climateMonthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
          <Line type="monotone" dataKey="temp" name="Temp" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: "#f59e0b" }} />
          <Line type="monotone" dataKey="rainfall" name="Rainfall" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: "#22d3ee" }} />
          <Line type="monotone" dataKey="humidity" name="Humidity" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: "#8b5cf6" }} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
