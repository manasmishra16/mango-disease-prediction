"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind, TreePine, TrendingUp, Cpu, Target, BarChart3 } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { YieldChart } from "@/components/charts/yield-chart";
import { yieldPredictionResult as defaultPrediction } from "@/data/mock-data";
import { getStatusColor } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import type { YieldFactor } from "@/types";
import { calculateYield, type YieldCalculateResponse } from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

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
        <span className="text-sm font-bold font-mono" style={{ color }}>
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
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 font-mono">
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
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-display text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center font-medium">{label}</span>
    </div>
  );
}

export default function YieldPredictionPage() {
  const { term } = useLocalizedText();
  const { setYieldResult: publishYieldResult } = useDashboardStore();
  const [inputs, setInputs] = useState({
    rainfall: 140,
    temperature: 30,
    humidity: 75,
    soilQuality: 80,
    orchardSize: 30,
  });

  const defaultResult: YieldCalculateResponse = {
    predictedYield: defaultPrediction.predictedYield,
    confidence: defaultPrediction.confidence,
    optimalYield: defaultPrediction.optimalYield,
    lastSeasonYield: defaultPrediction.lastSeasonYield,
    growthRate: defaultPrediction.growthRate,
    factors: defaultPrediction.factors,
  };

  const [yieldResult, setYieldResult] = useState<YieldCalculateResponse>(defaultResult);

  const [isCalculating, setIsCalculating] = useState(false);

  // Publish default yield on mount so revenue page has data immediately
  useEffect(() => {
    publishYieldResult(defaultResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performCalculation = useCallback(async (customInputs = inputs) => {
    setIsCalculating(true);
    try {
      const res = await calculateYield(customInputs);
      if (res && res.predictedYield) {
        setYieldResult(res);
        publishYieldResult(res);
      }
    } catch (err) {
      console.warn("Using local yield calculation fallback:", err);
      const computedYield = Math.round(
        (customInputs.rainfall / 120) * 0.3 +
        (1 - Math.abs(customInputs.temperature - 32) / 20) * 0.25 +
        (customInputs.humidity / 100) * 0.2 +
        (customInputs.soilQuality / 100) * 0.15 +
        (customInputs.orchardSize / 50) * 0.1
      ) * 1842;
      const fallbackResult = { ...yieldResult, predictedYield: Math.max(computedYield, 500) };
      setYieldResult(fallbackResult);
      publishYieldResult(fallbackResult);
    } finally {
      setIsCalculating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, publishYieldResult]);

  // Real-time calculation on slider drag with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation(inputs);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputs, performCalculation]);

  const handleInput = (key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">{term("Yield Prediction Engine")}</h2>
              <p className="text-gray-400 text-sm mt-1">{term("XGBoost & Environmental AI seasonal yield forecasting")}</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label={term("XGBoost Regressor")} variant="violet" />
              <NeonBadge label={term("89.3% Accuracy")} variant="neon" pulse />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <GlassCard className="p-6 col-span-1" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white font-semibold">{term("Environmental Sliders")}</h3>
                </div>
                {isCalculating && <span className="text-xs text-yellow-400 animate-pulse">{term("Calculating...")}</span>}
              </div>

              <div className="space-y-6">
                <SliderInput
                  label={term("Rainfall")}
                  icon={Droplets}
                  value={inputs.rainfall}
                  min={0}
                  max={300}
                  unit="mm"
                  color="#22d3ee"
                  onChange={(v) => handleInput("rainfall", v)}
                />
                <SliderInput
                  label={term("Temperature")}
                  icon={Thermometer}
                  value={inputs.temperature}
                  min={15}
                  max={45}
                  unit="°C"
                  color="#f59e0b"
                  onChange={(v) => handleInput("temperature", v)}
                />
                <SliderInput
                  label={term("Humidity")}
                  icon={Wind}
                  value={inputs.humidity}
                  min={30}
                  max={100}
                  unit="%"
                  color="#8b5cf6"
                  onChange={(v) => handleInput("humidity", v)}
                />
                <SliderInput
                  label={term("Soil Quality")}
                  icon={TreePine}
                  value={inputs.soilQuality}
                  min={0}
                  max={100}
                  unit="%"
                  color="#22c55e"
                  onChange={(v) => handleInput("soilQuality", v)}
                />
                <SliderInput
                  label={term("Orchard Size")}
                  icon={BarChart3}
                  value={inputs.orchardSize}
                  min={1}
                  max={100}
                  unit="ha"
                  color="#f59e0b"
                  onChange={(v) => handleInput("orchardSize", v)}
                />

                <GlowButton type="button" variant="mango" className="w-full" onClick={() => performCalculation(inputs)} disabled={isCalculating}>
                  <TrendingUp className="w-4 h-4" />
                  {isCalculating ? term("Calculating...") : term("Recalculate Yield Now")}
                </GlowButton>
              </div>
            </GlassCard>

            {/* Prediction Results */}
            <div className="col-span-2 space-y-4">
              {/* Main Prediction Card */}
              <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-5 col-span-3" hover={false}>
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{term("Predicted Total Yield")}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-display font-bold text-white">
                          <AnimatedCounter value={yieldResult.predictedYield} duration={1000} />
                        </span>
                        <span className="text-2xl text-gray-400 font-bold">{term("tonnes")}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <NeonBadge label={`${yieldResult.confidence}% ${term("Confidence")}`} variant="neon" />
                        <span className="text-xs text-green-400 font-semibold">
                          +{yieldResult.growthRate}% {term("vs last season")} ({yieldResult.lastSeasonYield}t)
                        </span>
                      </div>
                    </div>
                    <CircularGauge
                      value={Math.round((yieldResult.predictedYield / yieldResult.optimalYield) * 100)}
                      color="#22c55e"
                      label={term("Capacity Attainment")}
                      size={110}
                    />
                  </div>
                </GlassCard>
              </div>

              {/* Factor Contributions */}
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">{term("Environmental Factor Contributions")}</h3>
                  <Target className="w-4 h-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {yieldResult.factors.map((factor: YieldFactor) => (
                    <div key={factor.name} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 font-medium">{term(factor.name)}</span>
                        <span className="text-xs font-semibold capitalize" style={{ color: getStatusColor(factor.status) }}>
                          {term(factor.status.charAt(0).toUpperCase() + factor.status.slice(1))}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${factor.impact}%`,
                            background: getStatusColor(factor.status),
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 text-right">{factor.impact}% {term("Impact")}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Yield Chart */}
              <YieldChart />
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
