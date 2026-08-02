"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Scan,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  FlaskConical,
  Activity,
  ChevronRight,
  X,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { diseaseDetectionHistory } from "@/data/mock-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { sleep } from "@/lib/utils";
import type { DiseaseDetectionResult } from "@/types";

const diseaseResults: Record<string, DiseaseDetectionResult & { color: string }> = {
  default: {
    disease: "Anthracnose",
    confidence: 94.2,
    severity: "High",
    treatment: "Apply Copper Hydroxide 0.2% spray every 7 days. Remove infected plant material.",
    description: "Colletotrichum gloeosporioides fungal infection causing dark lesions on leaves and fruits.",
    color: "#f59e0b",
  },
};

const confidenceLevels = [
  { min: 90, label: "Very High", color: "#22c55e" },
  { min: 75, label: "High", color: "#4ade80" },
  { min: 60, label: "Moderate", color: "#f59e0b" },
  { min: 0, label: "Low", color: "#ef4444" },
];

export default function DiseaseDetectionPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isScanning, setIsScanning, scanResult, setScanResult } = useDashboardStore();
  const [scanProgress, setScanProgress] = useState(0);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setScanProgress(0);
  }, [setScanResult]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const runScan = async () => {
    if (!uploadedFile) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 5) {
      setScanProgress(i);
      await sleep(80);
    }

    setScanResult(diseaseResults.default);
    setIsScanning(false);
  };

  const clearScan = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setScanProgress(0);
    if (isScanning) setIsScanning(false);
  };

  const getConfidenceLabel = (conf: number) => {
    return confidenceLevels.find(l => conf >= l.min)?.label ?? "Unknown";
  };

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Disease Detection Engine</h2>
              <p className="text-gray-400 text-sm mt-1">Upload mango leaf images for AI-powered disease diagnosis</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label="ResNet-50" variant="violet" />
              <NeonBadge label="GradCAM" variant="cyan" />
              <NeonBadge label="94.2% Accuracy" variant="neon" pulse />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Panel */}
            <div className="space-y-4">
              {/* Drop Zone */}
              <GlassCard className="overflow-hidden" hover={false}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative min-h-72 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
                    isDragging ? "bg-yellow-500/5" : ""
                  }`}
                  style={{
                    border: isDragging ? "1px dashed rgba(245,158,11,0.5)" : "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Scanner line animation */}
                  {isScanning && (
                    <div className="scanner-line" />
                  )}

                  {previewUrl ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Uploaded leaf"
                        className="w-full h-full object-cover"
                      />
                      {/* Scan overlay */}
                      {isScanning && (
                        <div className="absolute inset-0 bg-cyan-500/5 border border-cyan-500/20">
                          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                            {[...Array(48)].map((_, i) => (
                              <div key={i} className="border border-cyan-400/20" />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Corner brackets */}
                      {isScanning && (
                        <>
                          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
                        </>
                      )}
                      <button
                        onClick={clearScan}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: isDragging ? -8 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 mx-auto">
                          <Upload className="w-9 h-9 text-yellow-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold mb-1">
                            {isDragging ? "Drop your leaf image here" : "Drag & drop mango leaf image"}
                          </p>
                          <p className="text-gray-500 text-sm">or click to browse files</p>
                          <p className="text-gray-600 text-xs mt-2">Supports JPG, PNG, WebP · Max 10MB</p>
                        </div>
                      </motion.div>

                      <label className="cursor-pointer">
                        <GlowButton variant="outline" size="sm">
                          <Upload className="w-4 h-4" />
                          Choose Image
                        </GlowButton>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </label>
                    </>
                  )}
                </div>
              </GlassCard>

              {/* Controls */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <GlowButton
                    variant="mango"
                    onClick={runScan}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    {isScanning ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="w-4 h-4" />
                        </motion.div>
                        Analyzing... {scanProgress}%
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        Run AI Analysis
                      </>
                    )}
                  </GlowButton>
                  <GlowButton variant="ghost" onClick={clearScan} size="md">
                    <X className="w-4 h-4" />
                  </GlowButton>
                </motion.div>
              )}

              {/* Progress bar */}
              {isScanning && (
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">AI Processing Pipeline</span>
                    <span className="text-xs text-cyan-400 font-bold">{scanProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-yellow-500 to-green-500"
                      style={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                    <span>Feature Extraction</span>
                    <span>Classification</span>
                    <span>GradCAM</span>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {scanResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Disease Result */}
                    <GlassCard className="p-5" hover={false}>
                      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-yellow-500/0 via-yellow-500/60 to-yellow-500/0" />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-white font-bold text-lg">{scanResult.disease}</h3>
                          </div>
                          <p className="text-gray-400 text-sm">{scanResult.description}</p>
                        </div>
                        <NeonBadge
                          label={scanResult.severity}
                          variant={scanResult.severity === "High" ? "red" : scanResult.severity === "Medium" ? "mango" : "neon"}
                          pulse
                        />
                      </div>

                      {/* Confidence Meter */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-medium">Confidence Score</span>
                          <span className="text-sm font-bold text-green-400">
                            {scanResult.confidence}% · {getConfidenceLabel(scanResult.confidence)}
                          </span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full rounded-full relative overflow-hidden"
                            style={{
                              background: "linear-gradient(90deg, #22c55e, #4ade80)",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${scanResult.confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          >
                            <div className="absolute inset-0 shimmer" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Disease", value: scanResult.disease, icon: Zap, color: "#f59e0b" },
                          { label: "Severity", value: scanResult.severity, icon: AlertCircle, color: "#ef4444" },
                          { label: "Confidence", value: `${scanResult.confidence}%`, icon: CheckCircle, color: "#22c55e" },
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 rounded-xl bg-white/3 border border-white/5">
                            <stat.icon className="w-4 h-4 mb-1.5" style={{ color: stat.color }} />
                            <div className="text-white text-sm font-semibold">{stat.value}</div>
                            <div className="text-gray-500 text-xs">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Treatment Card */}
                    <GlassCard className="p-5" hover={false}>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="w-4.5 h-4.5 text-cyan-400" />
                        <h3 className="text-white font-semibold">Recommended Treatment</h3>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{scanResult.treatment}</p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>GradCAM visualization available after full analysis</span>
                      </div>
                    </GlassCard>

                    {/* GradCAM Placeholder */}
                    <GlassCard className="p-5 overflow-hidden" hover={false}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">Grad-CAM Heatmap</h3>
                        <NeonBadge label="AI Explainability" variant="violet" />
                      </div>
                      <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-red-900/20 via-yellow-900/10 to-green-900/20">
                        {/* Simulated heatmap */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-28 h-28 rounded-full opacity-60"
                            style={{
                              background: "radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(245,158,11,0.4) 40%, transparent 70%)",
                              filter: "blur(12px)",
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-gray-400 text-xs text-center">
                            Heatmap highlights disease-affected regions<br />
                            <span className="text-yellow-400">Focus area detected in leaf center</span>
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GlassCard className="p-8 text-center" hover={false}>
                      <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mx-auto mb-4">
                        <Scan className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400 font-medium mb-1">No Analysis Yet</p>
                      <p className="text-gray-600 text-sm">Upload a mango leaf image and run the AI scanner to see disease detection results here.</p>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </StaggerItem>

        {/* Detection History */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Detection History</h3>
              <NeonBadge label="Recent Scans" variant="gray" />
            </div>
            <div className="space-y-3">
              {diseaseDetectionHistory.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.06 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                    #{record.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{record.image}</p>
                    <p className="text-gray-500 text-xs">{record.date}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">{record.disease}</p>
                    <p className="text-gray-500 text-xs">{record.confidence}% conf.</p>
                  </div>
                  <NeonBadge
                    label={record.severity}
                    variant={
                      record.severity === "None" ? "neon"
                        : record.severity === "High" ? "red"
                        : "mango"
                    }
                    size="sm"
                  />
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
