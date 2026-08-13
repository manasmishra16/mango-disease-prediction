"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, DollarSign, MapPin, TreePine, Wheat } from "lucide-react";
import { ClimateChart } from "@/components/charts/climate-chart";
import { DiseaseChart } from "@/components/charts/disease-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { YieldChart } from "@/components/charts/yield-chart";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { KPICard } from "@/components/dashboard/kpi-card";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { orchardData as defaultOrchardData } from "@/data/mock-data";
import { useLocalizedText } from "@/lib/localization";
import { getDashboardStats } from "@/lib/api-client";
import type { OrchardRecord } from "@/types";

const riskColors = {
  Low: "neon",
  Medium: "mango",
  High: "red",
} as const;

export default function DashboardPage() {
  const { term } = useLocalizedText();
  const [stats, setStats] = useState({
    orchards: 247,
    diseaseRisk: 23,
    predictedYield: 1842,
    estimatedRevenue: 2.47,
    climateHealth: 78,
  });
  const [orchardList, setOrchardList] = useState<OrchardRecord[]>(defaultOrchardData);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        if (data && data.kpis) {
          setStats(data.kpis);
        }
        if (data && data.orchards) {
          setOrchardList(data.orchards);
        }
      })
      .catch((err) => {
        console.warn("Using dashboard local data (backend offline):", err.message);
      });
  }, []);

  const kpis = [
    {
      title: term("Orchards Monitored"),
      value: stats.orchards,
      icon: TreePine,
      change: 12.4,
      color: "mango" as const,
      description: term("Active monitoring zones"),
    },
    {
      title: term("Disease Risk Score"),
      value: stats.diseaseRisk,
      suffix: "%",
      icon: AlertTriangle,
      change: -5.2,
      color: "red" as const,
      description: term("Average across all orchards"),
    },
    {
      title: term("Predicted Yield"),
      value: stats.predictedYield,
      suffix: "t",
      icon: Wheat,
      change: 11.4,
      color: "neon" as const,
      description: term("This harvest season"),
    },
    {
      title: term("Estimated Revenue"),
      value: stats.estimatedRevenue,
      prefix: "₹",
      suffix: "Cr",
      decimals: 2,
      icon: DollarSign,
      change: 18.2,
      color: "cyan" as const,
      description: term("Projected for Q3 2025"),
    },
    {
      title: term("Climate Health"),
      value: stats.climateHealth,
      suffix: "%",
      icon: Activity,
      change: 3.1,
      color: "violet" as const,
      description: term("Overall climate favorability"),
    },
  ];

  return (
    <PageTransition>
      <StaggerContainer className="space-y-5">
        <StaggerItem>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {kpis.map((kpi, index) => (
              <KPICard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                suffix={kpi.suffix}
                prefix={kpi.prefix}
                decimals={kpi.decimals}
                icon={kpi.icon}
                change={kpi.change}
                color={kpi.color}
                delay={index * 0.05}
                description={kpi.description}
              />
            ))}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <YieldChart />
            </div>
            <DiseaseChart />
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-5 lg:grid-cols-2">
            <RevenueChart />
            <ClimateChart />
          </div>
        </StaggerItem>

        <StaggerItem>
          <GlassCard className="overflow-hidden p-5" hover={false}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{term("Orchard Intelligence")}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {term("Real-time monitoring across all active orchards")}
                </p>
              </div>
              <NeonBadge label={term("Live Sync")} variant="neon" pulse />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      term("Orchard ID"),
                      term("Name"),
                      term("Area (ha)"),
                      term("Yield (t)"),
                      term("Health"),
                      term("Risk"),
                      term("Location"),
                    ].map((column) => (
                      <th key={column} className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {orchardList.map((orchard, index) => (
                    <motion.tr
                      key={orchard.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="transition-colors hover:bg-white/3"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-[var(--text-muted)]">{orchard.id}</td>
                      <td className="px-3 py-3 font-medium text-[var(--text-primary)]">{orchard.name}</td>
                      <td className="px-3 py-3 text-[var(--text-secondary)]">{orchard.area}</td>
                      <td className="px-3 py-3 text-[var(--text-secondary)]">{orchard.yield}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 max-w-16 flex-1 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${orchard.health}%`,
                                background:
                                  orchard.health > 80 ? "#22c55e" : orchard.health > 60 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">{orchard.health}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <NeonBadge
                          label={term(orchard.risk)}
                          variant={riskColors[orchard.risk]}
                          pulse={orchard.risk === "High"}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <MapPin className="h-3 w-3" />
                          {orchard.location}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
