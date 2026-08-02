"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind, TreePine, TrendingUp, Cpu, Target, BarChart3 } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { YieldChart } from "@/components/charts/yield-chart";
import { yieldPredictionResult } from "@/data/mock-data";
import { getStatusColor } from "@/lib/utils";

interface SliderInputProps {
  label: string;
  icon: React.ElementType;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (val: number) => void;
}

function SliderInput({ label, icon: Icon, value, min, max, unit, color, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm text-gray-300 font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all"
          style={{ left: `calc(${pct}% - 8px)`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function CircularGauge({ value, max = 100, color, label, size = 120 }: {
  value: number;
  max?: number;
  color: string;
  label: string;
  size?: number;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const gap = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={8}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${gap}`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${progress} ${gap}` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">
            <AnimatedCounter value={value} duration={1500} />
          </span>
          <span className="text-[10px] text-gray-500">/ {max}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

export default function YieldPredictionPage() {
  const [inputs, setInputs] = useState({
    rainfall: 120,
    temperature: 32,
    humidity: 78,
    soilQuality: 75,
    orchardSize: 25,
  });

  const handleInput = (key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const predictedYield = Math.round(
    (inputs.rainfall / 120) * 0.3 +
    (1 - Math.abs(inputs.temperature - 32) / 20) * 0.25 +
    (inputs.humidity / 100) * 0.2 +
    (inputs.soilQuality / 100) * 0.15 +
    (inputs.orchardSize / 50) * 0.1
  ) * 1842;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Yield Prediction Engine</h2>
              <p className="text-gray-400 text-sm mt-1">XGBoost-powered seasonal yield forecasting</p>
            </div>
            <NeonBadge label="Powered by XGBoost AI Modeling" variant="neon" pulse />
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <GlassCard className="p-6 col-span-1" hover={false}>
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-4 h-4 text-yellow-400" />
                <h3 className="text-white font-semibold">Environmental Inputs</h3>
              </div>

              <div className="space-y-6">
                <SliderInput
                  label="Rainfall"
                  icon={Droplets}
                  value={inputs.rainfall}
                  min={0}
                  max={300}
                  unit="mm"
                  color="#22d3ee"
                  onChange={(v) => handleInput("rainfall", v)}
                />
                <SliderInput
                  label="Temperature"
                  icon={Thermometer}
                  value={inputs.temperature}
                  min={15}
                  max={45}
                  unit="°C"
                  color="#f59e0b"
                  onChange={(v) => handleInput("temperature", v)}
                />
                <SliderInput
                  label="Humidity"
                  icon={Wind}
                  value={inputs.humidity}
                  min={30}
                  max={100}
                  unit="%"
                  color="#8b5cf6"
                  onChange={(v) => handleInput("humidity", v)}
                />
                <SliderInput
                  label="Soil Quality"
                  icon={TreePine}
                  value={inputs.soilQuality}
                  min={0}
                  max={100}
                  unit="%"
                  color="#22c55e"
                  onChange={(v) => handleInput("soilQuality", v)}
                />
                <SliderInput
                  label="Orchard Size"
                  icon={BarChart3}
                  value={inputs.orchardSize}
                  min={1}
                  max={100}
                  unit="ha"
                  color="#f59e0b"
                  onChange={(v) => handleInput("orchardSize", v)}
                />

                <GlowButton variant="mango" className="w-full" onClick={() => {}}>
                  <TrendingUp className="w-4 h-4" />
                  Recalculate Yield
                </GlowButton>
              </div>
            </GlassCard>

            {/* Prediction Results */}
            <div className="col-span-2 space-y-4">
              {/* Main Prediction */}
              <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-5 col-span-3" hover={false}>
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Predicted Yield</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-display font-bold text-white">
                          <AnimatedCounter value={predictedYield} duration={2000} />
                        </span>
                        <span className="text-2xl text-gray-400 font-bold">tonnes</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <NeonBadge label={`${yieldPredictionResult.confidence}% Confidence`} variant="neon" />
                        <span className="text-xs text-green-400">+{yieldPredictionResult.growthRate}% vs last season</span>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <CircularGauge
                        value={predictedYield}
                        max={yieldPredictionResult.optimalYield}
                        color="#22c55e"
                        label="vs Optimal"
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Factor Analysis */}
                {yieldPredictionResult.factors.map((factor, i) => (
                  <motion.div
                    key={factor.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="card-glass p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{factor.name}</span>
                      <span className="text-xs font-bold" style={{ color: getStatusColor(factor.status) }}>
                        {factor.impact}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.impact}%` }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.07 }}
                        style={{ background: getStatusColor(factor.status) }}
                      />
                    </div>
                    <div className="mt-1.5">
                      <span
                        className="text-[10px] font-medium capitalize px-2 py-0.5 rounded-full"
                        style={{
                          color: getStatusColor(factor.status),
                          background: `${getStatusColor(factor.status)}15`,
                        }}
                      >
                        {factor.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Seasonal Comparison */}
              <GlassCard className="p-4" hover={false}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white font-semibold text-sm">Seasonal Comparison</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Predicted", value: predictedYield, unit: "t", color: "#f59e0b" },
                    { label: "Optimal", value: yieldPredictionResult.optimalYield, unit: "t", color: "#22c55e" },
                    { label: "Last Season", value: yieldPredictionResult.lastSeasonYield, unit: "t", color: "#6b7280" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-xl bg-white/3">
                      <div className="text-xl font-bold font-display" style={{ color: item.color }}>
                        <AnimatedCounter value={item.value} duration={1500} suffix={item.unit} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </StaggerItem>

        {/* Yield Forecast Chart */}
        <StaggerItem>
          <YieldChart />
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
