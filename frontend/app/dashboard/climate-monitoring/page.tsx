"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  Activity,
  Eye,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { climateData as defaultDailyData } from "@/data/mock-data";
import { ClimateChart } from "@/components/charts/climate-chart";
import { getClimateMonitorData, type ClimateMonitorResponse } from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

const defaultWeather: ClimateMonitorResponse = {
  currentWeather: {
    temp: 32,
    humidity: 78,
    rainfall: 12,
    windSpeed: 14,
    uvIndex: 7,
    visibility: 10,
    condition: "Partly Cloudy",
    location: "Hassan, Karnataka",
  },
  forecast: [
    { day: "Today", temp: 32, condition: "Partly Cloudy", rainfall: 12 },
    { day: "Tue", temp: 34, condition: "Sunny", rainfall: 0 },
    { day: "Wed", temp: 29, condition: "Rainy", rainfall: 28 },
    { day: "Thu", temp: 31, condition: "Cloudy", rainfall: 5 },
    { day: "Fri", temp: 35, condition: "Sunny", rainfall: 0 },
    { day: "Sat", temp: 33, condition: "Partly Cloudy", rainfall: 15 },
    { day: "Sun", temp: 28, condition: "Heavy Rain", rainfall: 42 },
  ],
  dailyData: defaultDailyData,
};

export default function ClimateMonitoringPage() {
  const { term } = useLocalizedText();
  const [data, setData] = useState<ClimateMonitorResponse>(defaultWeather);

  useEffect(() => {
    getClimateMonitorData()
      .then((res) => {
        if (res && res.currentWeather) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn("Using local climate fallback:", err.message);
      });
  }, []);

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes("rain")) return CloudRain;
    if (c.includes("cloud")) return Cloud;
    return Sun;
  };

  const curr = data.currentWeather;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">{term("Climate Intelligence")}</h2>
              <p className="text-gray-400 text-sm mt-1">{term("Live Open-Meteo weather monitoring for Karnataka mango belt")}</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label={term("Live API")} variant="neon" pulse />
              <NeonBadge label={curr.location || "Hassan, Karnataka"} variant="cyan" />
            </div>
          </div>
        </StaggerItem>

        {/* Current Conditions */}
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: term("Temperature"), value: curr.temp, unit: "°C", icon: Thermometer, color: "#f59e0b" },
              { label: term("Humidity"), value: curr.humidity, unit: "%", icon: Droplets, color: "#22d3ee" },
              { label: term("Rainfall"), value: curr.rainfall, unit: "mm", icon: CloudRain, color: "#8b5cf6" },
              { label: term("Wind Speed"), value: curr.windSpeed, unit: "km/h", icon: Wind, color: "#22c55e" },
              { label: term("UV Index"), value: curr.uvIndex, unit: "", icon: Sun, color: "#ef4444" },
              { label: term("Visibility"), value: curr.visibility, unit: "km", icon: Eye, color: "#6366f1" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="card-glass p-4 text-center transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${item.color}15`, boxShadow: `0 0 15px ${item.color}20` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-xl font-display font-bold text-white">
                  <AnimatedCounter value={item.value} duration={1200} suffix={item.unit} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* 7-Day Forecast */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">{term("7-Day Live Forecast")}</h3>
              <NeonBadge label={term("Open-Meteo API")} variant="violet" />
            </div>
            <div className="grid grid-cols-7 gap-3">
              {data.forecast.map((item, i) => {
                const WeatherIcon = getWeatherIcon(item.condition);
                const isToday = i === 0;
                const isRainy = item.condition.toLowerCase().includes("rain");
                return (
                  <motion.div
                    key={item.day + i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                      isToday
                        ? "bg-yellow-500/10 border border-yellow-500/20"
                        : "bg-white/3 border border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-yellow-400" : "text-gray-400"}`}>
                      {term(item.day)}
                    </span>
                    <WeatherIcon
                      className="w-6 h-6"
                      style={{ color: isRainy ? "#22d3ee" : isToday ? "#f59e0b" : "#9ca3af" }}
                    />
                    <span className="text-white text-sm font-bold">{item.temp}°C</span>
                    <span className="text-[10px] text-gray-500 text-center leading-tight">
                      {term(item.condition)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Climate Chart */}
        <StaggerItem>
          <ClimateChart />
        </StaggerItem>

        {/* Daily Data Table */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">{term("Daily Climate Data")}</h3>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">{term("Updated via Open-Meteo")}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[term("Day"), term("Temp (°C)"), term("Rainfall (mm)"), term("Humidity (%)"), term("Wind (km/h)"), term("Farm Impact")].map((col) => (
                      <th key={col} className="text-left text-xs text-gray-500 font-medium py-2 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {data.dailyData.map((row, i) => {
                    const impact =
                      row.temp > 34 || row.humidity > 85
                        ? { label: term("Stress Risk"), color: "mango" as const }
                        : row.rainfall > 30
                        ? { label: term("Flood Risk"), color: "red" as const }
                        : { label: term("Optimal"), color: "neon" as const };
                    return (
                      <motion.tr
                        key={row.day}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="hover:bg-white/3 transition-colors"
                      >
                        <td className="py-3 px-3 text-white font-medium">{term(row.day)}</td>
                        <td className="py-3 px-3">
                          <span className={row.temp > 34 ? "text-red-400 font-semibold" : "text-gray-300"}>
                            {row.temp}°C
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={row.rainfall > 20 ? "text-cyan-400 font-semibold" : "text-gray-300"}>
                            {row.rainfall}mm
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.humidity}%`,
                                  background: row.humidity > 85 ? "#ef4444" : "#8b5cf6",
                                }}
                              />
                            </div>
                            <span className="text-gray-300 text-xs">{row.humidity}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-300">{row.wind} km/h</td>
                        <td className="py-3 px-3">
                          <NeonBadge label={impact.label} variant={impact.color} size="sm" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
