"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { diseaseDistributionData } from "@/data/mock-data";
import { useLocalizedText } from "@/lib/localization";

type DiseaseTooltipEntry = {
  payload: {
    color: string;
    name: string;
    value: number;
  };
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: DiseaseTooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;

  return (
    <div className="card-glass min-w-[140px] p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
        <span className="text-xs font-semibold text-white">{entry.name}</span>
      </div>
      <p className="text-2xl font-bold text-white">{entry.value}%</p>
    </div>
  );
}

export function DiseaseChart() {
  const { term } = useLocalizedText();
  const total = diseaseDistributionData.reduce((sum, item) => sum + item.value, 0);
  const healthyPct = diseaseDistributionData.find((item) => item.name === "Healthy")?.value ?? 0;

  return (
    <GlassCard className="p-5" delay={0.35} hover={false}>
      <div className="mb-4">
        <h3 className="font-semibold text-white">{term("Disease Distribution")}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{term("Orchard health breakdown")}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={diseaseDistributionData} cx={75} cy={75} innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {diseaseDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" style={{ filter: `drop-shadow(0 0 8px ${entry.color}60)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{healthyPct}%</span>
            <span className="text-[10px] font-medium text-green-400">{term("Healthy")}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {diseaseDistributionData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.07 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                <span className="text-xs text-gray-300">{term(item.name)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.07 }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-white">{item.value}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
