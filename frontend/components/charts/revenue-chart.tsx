"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { revenueData } from "@/data/mock-data";
import { useLocalizedText } from "@/lib/localization";

type RevenueTooltipEntry = {
  color?: string;
  fill?: string;
  name: string;
  value: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: RevenueTooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card-glass min-w-[160px] p-3">
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="mt-1 flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: entry.color || entry.fill }} />
            <span className="capitalize text-gray-300">{entry.name}</span>
          </span>
          <span className="font-semibold text-white">₹{entry.value.toFixed(2)}Cr</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const { term } = useLocalizedText();
  const legend = [
    { color: "#22d3ee", label: term("Revenue") },
    { color: "#f59e0b", label: term("Profit") },
    { color: "#374151", label: term("Cost") },
  ];

  return (
    <GlassCard className="p-5" delay={0.4} hover={false}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{term("Revenue Trends")}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{term("Quarterly revenue & profit analysis")}</p>
        </div>
        <div className="flex items-center gap-4">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2 w-3 rounded-sm" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="quarter" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="cost" name="cost" fill="#1f2937" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" name="revenue" fill="url(#revenueGrad)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="profit" name="profit" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#f59e0b", stroke: "rgba(245,158,11,0.3)", strokeWidth: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
