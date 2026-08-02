"use client";

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
import { ClimateChart } from "@/components/charts/climate-chart";
import { climateData } from "@/data/mock-data";

const currentWeather = {
  temp: 32,
  humidity: 78,
  rainfall: 12,
  windSpeed: 14,
  uvIndex: 7,
  visibility: 10,
  condition: "Partly Cloudy",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekTemps = [32, 34, 29, 31, 35, 33, 28];
const weekIcons = [Sun, Sun, CloudRain, Cloud, Sun, Cloud, CloudRain];
const weekConditions = ["Sunny", "Hot", "Rainy", "Cloudy", "Sunny", "Partly Cloudy", "Heavy Rain"];

export default function ClimateMonitoringPage() {
  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Climate Intelligence</h2>
              <p className="text-gray-400 text-sm mt-1">Real-time weather monitoring and climate risk analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label="Live Data" variant="neon" pulse />
              <NeonBadge label="Maharashtra, India" variant="cyan" />
            </div>
          </div>
        </StaggerItem>

        {/* Current Conditions */}
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Temperature", value: currentWeather.temp, unit: "°C", icon: Thermometer, color: "#f59e0b" },
              { label: "Humidity", value: currentWeather.humidity, unit: "%", icon: Droplets, color: "#22d3ee" },
              { label: "Rainfall", value: currentWeather.rainfall, unit: "mm", icon: CloudRain, color: "#8b5cf6" },
              { label: "Wind Speed", value: currentWeather.windSpeed, unit: "km/h", icon: Wind, color: "#22c55e" },
              { label: "UV Index", value: currentWeather.uvIndex, unit: "", icon: Sun, color: "#ef4444" },
              { label: "Visibility", value: currentWeather.visibility, unit: "km", icon: Eye, color: "#6366f1" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
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
                  <AnimatedCounter value={item.value} duration={1500} suffix={item.unit} />
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
              <h3 className="text-white font-semibold">7-Day Forecast</h3>
              <NeonBadge label="AI Weather Model" variant="violet" />
            </div>
            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((day, i) => {
                const WeatherIcon = weekIcons[i];
                const isToday = i === 0;
                const isRainy = weekConditions[i].toLowerCase().includes("rain");
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                      isToday
                        ? "bg-yellow-500/10 border border-yellow-500/20"
                        : "bg-white/3 border border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-yellow-400" : "text-gray-400"}`}>
                      {isToday ? "Today" : day}
                    </span>
                    <WeatherIcon
                      className="w-6 h-6"
                      style={{ color: isRainy ? "#22d3ee" : isToday ? "#f59e0b" : "#9ca3af" }}
                    />
                    <span className="text-white text-sm font-bold">{weekTemps[i]}°C</span>
                    <span className="text-[10px] text-gray-500 text-center leading-tight">
                      {weekConditions[i]}
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
              <h3 className="text-white font-semibold">Daily Climate Data</h3>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Updated every 15 min</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Day", "Temp (°C)", "Rainfall (mm)", "Humidity (%)", "Wind (km/h)", "Farm Impact"].map((col) => (
                      <th key={col} className="text-left text-xs text-gray-500 font-medium py-2 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {climateData.map((row, i) => {
                    const impact =
                      row.temp > 34 || row.humidity > 85
                        ? { label: "Stress Risk", color: "mango" as const }
                        : row.rainfall > 30
                        ? { label: "Flood Risk", color: "red" as const }
                        : { label: "Optimal", color: "neon" as const };
                    return (
                      <motion.tr
                        key={row.day}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.06 }}
                        className="hover:bg-white/3 transition-colors"
                      >
                        <td className="py-3 px-3 text-white font-medium">{row.day}</td>
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
