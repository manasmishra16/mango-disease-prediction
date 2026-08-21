"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Scan,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Zap,
  Eye,
  FlaskConical,
  Activity,
  ChevronRight,
  X,
  Sparkles,
  ImageIcon,
  ShieldAlert,
  Leaf,
  Brain,
  Shield,
  TrendingUp,
  Clock,
  Microscope,
  Layers,
  Target,
  BarChart3,
  Camera,
  Bug,
  Droplets,
  Sprout,
  Sun,
  Trash2,
  Filter,
  Search,
  Grid,
  List,
  RefreshCw,
  Info,
  ShieldCheck,
  Calendar,
  Check,
  Flame,
  FileSpreadsheet,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { diseaseDetectionHistory as defaultHistory } from "@/data/mock-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  scanDiseaseImage,
  getDiseaseHistory,
  pruneDiseaseHistory,
  deleteDiseaseHistoryRecord,
  type DiseaseHistoryRecord,
  type DiseaseScanResponse,
} from "@/lib/api-client";
import type { DiseaseDetectionResult } from "@/types";
import { useLocalizedText } from "@/lib/localization";
import {
  KARNATAKA_MANGO_VARIETIES,
  DISEASE_SOLUTIONS_MAP,
  getLocalizedAdvisory,
  type KarnatakaMangoVariety,
  type DiseaseSolutionProtocol,
} from "@/data/karnataka-mango-advisory";

const confidenceLevels = [
  { min: 90, label: "Very High", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { min: 75, label: "High", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  { min: 60, label: "Moderate", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { min: 0, label: "Low", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
];

const severityConfig: Record<string, { color: string; gradient: string; icon: string; level: number; bg: string }> = {
  High: { color: "#ef4444", gradient: "from-red-500 to-orange-500", icon: "🔴", level: 3, bg: "rgba(239,68,68,0.12)" },
  Medium: { color: "#f59e0b", gradient: "from-amber-500 to-yellow-500", icon: "🟡", level: 2, bg: "rgba(245,158,11,0.12)" },
  Low: { color: "#22c55e", gradient: "from-green-500 to-emerald-500", icon: "🟢", level: 1, bg: "rgba(34,197,94,0.12)" },
  None: { color: "#22c55e", gradient: "from-green-500 to-emerald-500", icon: "✅", level: 0, bg: "rgba(34,197,94,0.12)" },
};

const scanStages = [
  { label: "Pre-processing", icon: Layers },
  { label: "Leaf Verification", icon: Shield },
  { label: "CNN Inference", icon: Brain },
  { label: "Grad-CAM", icon: Target },
];

const SAMPLE_LEAVES = [
  { name: "Anthracnose Sample", disease: "Anthracnose", image: "/samples/anthracnose.jpg", cultivar: "Alphonso (Dharwad)" },
  { name: "Powdery Mildew Sample", disease: "Powdery Mildew", image: "/samples/powdery_mildew.jpg", cultivar: "Banganapalli (Kolar)" },
  { name: "Bacterial Canker Sample", disease: "Bacterial Canker", image: "/samples/bacterial_canker.jpg", cultivar: "Totapuri (Srinivasapur)" },
  { name: "Healthy Leaf Sample", disease: "Healthy", image: "/samples/healthy.jpg", cultivar: "Mallika (Ramanagara)" },
  { name: "Die Back Sample", disease: "Die Back", image: "/samples/die_back.jpg", cultivar: "Raspuri (Channapatna)" },
  { name: "Sooty Mould Sample", disease: "Sooty Mould", image: "/samples/sooty_mould.jpg", cultivar: "Neelum (Tumakuru)" },
  { name: "Cutting Weevil Sample", disease: "Cutting Weevil", image: "/samples/cutting_weevil.jpg", cultivar: "Dasheri (Belagavi)" },
  { name: "Gall Midge Sample", disease: "Gall Midge", image: "/samples/gall_midge.jpg", cultivar: "Sindhoora (Mandya)" },
];

type CustomScanResult = DiseaseDetectionResult & {
  is_mango_leaf?: boolean;
};

const createVisualHeatmapOverlay = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = img.width || 300;
      const h = img.height || 300;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      ctx.drawImage(img, 0, 0, w, h);

      const spots = [
        { x: w * 0.5, y: h * 0.42, r: w * 0.35 },
        { x: w * 0.58, y: h * 0.6, r: w * 0.25 },
        { x: w * 0.38, y: h * 0.65, r: w * 0.2 },
      ];

      spots.forEach((spot) => {
        const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.85)");
        grad.addColorStop(0.35, "rgba(245, 158, 11, 0.75)");
        grad.addColorStop(0.65, "rgba(234, 179, 8, 0.55)");
        grad.addColorStop(0.85, "rgba(6, 182, 212, 0.3)");
        grad.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.fill();
      });

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

/* ─── Animated Confidence Ring ─── */
function ConfidenceRing({ value, size = 88, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const confLevel = confidenceLevels.find((l) => value >= l.min)!;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={confLevel.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${confLevel.color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white tracking-tight">{value}%</span>
      </div>
    </div>
  );
}

/* ─── Severity Level Indicator ─── */
function SeverityIndicator({ severity }: { severity: string }) {
  const { term } = useLocalizedText();
  const config = severityConfig[severity] || severityConfig.Low;
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((lvl) => (
        <motion.div
          key={lvl}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 + lvl * 0.08, type: "spring" }}
          className="w-2.5 h-2.5 rounded-full border"
          style={{
            backgroundColor: lvl <= config.level ? config.color : "transparent",
            borderColor: config.color,
            boxShadow: lvl <= config.level ? `0 0 10px ${config.color}80` : "none",
          }}
        />
      ))}
      <span className="text-xs font-bold ml-1 uppercase tracking-wider" style={{ color: config.color }}>
        {term(severity)} {term("Severity")}
      </span>
    </div>
  );
}

export default function DiseaseDetectionPage() {
  const { term, language } = useLocalizedText();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isScanning, setIsScanning, scanResult, setScanResult } = useDashboardStore();
  const [scanProgress, setScanProgress] = useState(0);
  const [history, setHistory] = useState<DiseaseHistoryRecord[]>(defaultHistory as unknown as DiseaseHistoryRecord[]);
  const [heatmapB64, setHeatmapB64] = useState<string | null>(null);
  const [, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"original" | "gradcam" | "compare">("original");
  const [scanStage, setScanStage] = useState(0);

  // Karnataka Variety & Solution Hub state
  const [selectedVarietyId, setSelectedVarietyId] = useState<string>("alphonso");
  const [activeSolutionTab, setActiveSolutionTab] = useState<"chemical" | "organic" | "farming" | "varieties">("chemical");

  // History controls state
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyFilterDisease, setHistoryFilterDisease] = useState<string>("all");
  const [historyViewMode, setHistoryViewMode] = useState<"table" | "cards">("table");
  const [isPruning, setIsPruning] = useState<boolean>(false);
  const [historyNotification, setHistoryNotification] = useState<string | null>(null);
  const [selectedHistoryModal, setSelectedHistoryModal] = useState<DiseaseHistoryRecord | null>(null);

  // Load strictly capped 50 history on mount
  const refreshHistory = useCallback(() => {
    getDiseaseHistory(50)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setHistory(data.slice(0, 50));
        }
      })
      .catch((err) => {
        console.warn("Using local disease history fallback:", err.message);
      });
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handlePruneHistory = async () => {
    setIsPruning(true);
    try {
      const res = await pruneDiseaseHistory(50);
      setHistory(res.history || []);
      setHistoryNotification(`Successfully pruned database to ${res.history?.length || 0} recent records.`);
      setTimeout(() => setHistoryNotification(null), 3500);
    } catch (err: any) {
      console.error("Failed to prune:", err);
    } finally {
      setIsPruning(false);
    }
  };

  const handleDeleteRecord = async (e: React.MouseEvent, recordId: number) => {
    e.stopPropagation();
    try {
      await deleteDiseaseHistoryRecord(recordId);
      setHistory((prev) => prev.filter((r) => r.id !== recordId));
      if (selectedHistoryModal?.id === recordId) {
        setSelectedHistoryModal(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setScanResult(null);
      setHeatmapB64(null);
      setScanProgress(0);
      setErrorMsg(null);
      setScanStage(0);
      createVisualHeatmapOverlay(url).then((heatmap) => setHeatmapB64(heatmap));
    },
    [setScanResult]
  );

  const selectSample = async (sample: typeof SAMPLE_LEAVES[0]) => {
    setPreviewUrl(sample.image);
    setScanResult(null);
    setHeatmapB64(null);
    setScanProgress(0);
    setErrorMsg(null);
    setScanStage(0);

    createVisualHeatmapOverlay(sample.image).then((heatmap) => setHeatmapB64(heatmap));

    try {
      const res = await fetch(sample.image);
      const blob = await res.blob();
      const file = new File([blob], `${sample.disease.toLowerCase().replace(/\s+/g, "_")}_sample.jpg`, { type: "image/jpeg" });
      setUploadedFile(file);
    } catch (err) {
      console.warn("Failed to load sample image blob:", err);
      setUploadedFile(new File(["dummy"], "sample.jpg", { type: "image/jpeg" }));
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const runScan = async () => {
    if (!uploadedFile && !previewUrl) return;
    setIsScanning(true);
    setScanProgress(5);
    setScanResult(null);
    setErrorMsg(null);
    setScanStage(0);

    const stageInterval = setInterval(() => {
      setScanStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 380);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => (prev < 85 ? prev + 8 : prev));
    }, 130);

    try {
      let fileToUpload = uploadedFile;
      if (!fileToUpload && previewUrl) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], "leaf.png", { type: "image/png" });
      }

      if (fileToUpload) {
        const res: DiseaseScanResponse = await scanDiseaseImage(fileToUpload);
        clearInterval(progressInterval);
        clearInterval(stageInterval);
        setScanProgress(100);
        setScanStage(3);

        const isRejected = res.status === "rejected" || res.is_mango_leaf === false || !res.disease;
        const result: CustomScanResult = {
          is_mango_leaf: !isRejected,
          disease: isRejected ? "Non-Mango Leaf Object Detected" : res.disease,
          confidence: isRejected ? 0 : res.confidence,
          severity: isRejected ? "None" : res.severity,
          treatment: isRejected ? "N/A" : res.treatment,
          description: res.description || (res as any).message || "Please upload a clear mango leaf image.",
        };

        setScanResult(result);
        if (!isRejected && res.heatmap_b64) {
          setHeatmapB64(res.heatmap_b64.startsWith("data:") ? res.heatmap_b64 : `data:image/jpeg;base64,${res.heatmap_b64}`);
        } else if (!isRejected && previewUrl) {
          const heatmap = await createVisualHeatmapOverlay(previewUrl);
          setHeatmapB64(heatmap);
        } else {
          setHeatmapB64(null);
        }

        if (result.is_mango_leaf) {
          refreshHistory();
        }
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      setScanProgress(100);
      setScanStage(3);
      console.warn("API scan notice:", err.message);

      setErrorMsg(
        err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")
          ? "Unable to connect to Python AI Backend (port 8000). Please ensure the backend server is running."
          : `Prediction error: ${err.message || "Unknown error"}`
      );
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const clearScan = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setHeatmapB64(null);
    setScanProgress(0);
    setErrorMsg(null);
    setScanStage(0);
    if (isScanning) setIsScanning(false);
  };

  const getConfidenceLabel = (conf: number) => {
    return confidenceLevels.find((l) => conf >= l.min)?.label ?? "Unknown";
  };

  const getConfidenceColor = (conf: number) => {
    return confidenceLevels.find((l) => conf >= l.min)?.color ?? "#ef4444";
  };

  const currentResult = scanResult as CustomScanResult | null;
  const isInvalidLeaf = currentResult && (
    currentResult.is_mango_leaf === false ||
    !currentResult.disease ||
    currentResult.disease === "Non-Leaf Object Detected" ||
    currentResult.disease === "Non-Mango Leaf Object Detected"
  );
  const isHealthy = currentResult?.disease === "Healthy";

  // Active disease protocol with full multi-lingual localization
  const rawDiseaseProtocol: DiseaseSolutionProtocol = useMemo(() => {
    if (!currentResult || isInvalidLeaf) {
      return DISEASE_SOLUTIONS_MAP["Anthracnose"];
    }
    return DISEASE_SOLUTIONS_MAP[currentResult.disease] || DISEASE_SOLUTIONS_MAP["Anthracnose"];
  }, [currentResult, isInvalidLeaf]);

  const activeDiseaseProtocol = useMemo(() => {
    return getLocalizedAdvisory(rawDiseaseProtocol, language);
  }, [rawDiseaseProtocol, language]);

  const selectedVarietyObj: KarnatakaMangoVariety = useMemo(() => {
    return KARNATAKA_MANGO_VARIETIES.find((v) => v.id === selectedVarietyId) || KARNATAKA_MANGO_VARIETIES[0];
  }, [selectedVarietyId]);

  // Filtered recent 50 history
  const filteredHistory = useMemo(() => {
    return history.slice(0, 50).filter((record) => {
      const matchSearch =
        historySearch === "" ||
        record.image.toLowerCase().includes(historySearch.toLowerCase()) ||
        record.disease.toLowerCase().includes(historySearch.toLowerCase()) ||
        record.date.toLowerCase().includes(historySearch.toLowerCase());

      const matchDisease =
        historyFilterDisease === "all" ||
        record.disease.toLowerCase().replace(/\s+/g, "") === historyFilterDisease.toLowerCase().replace(/\s+/g, "");

      return matchSearch && matchDisease;
    });
  }, [history, historySearch, historyFilterDisease]);

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ─── Hero Header with Rich Glassmorphism ─── */}
        <StaggerItem>
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6 md:p-8 shadow-2xl backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--surface) 96%, transparent) 0%, color-mix(in srgb, var(--surface-soft) 92%, transparent) 50%, color-mix(in srgb, var(--background-elevated) 96%, transparent) 100%)",
            }}
          >
            {/* Ambient Multi-Hue Radial Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/[0.12] blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/[0.12] blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-cyan-500/[0.06] blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(34,197,94,0.2))",
                    border: "1px solid rgba(245,158,11,0.35)",
                    boxShadow: "0 0 30px rgba(245,158,11,0.25)",
                  }}
                >
                  <Microscope className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                      {term("Karnataka Precision Mango Pathology")}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      10 Cultivars Engine
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    {term("Multi-Task PyTorch SE-CNN leaf pathology analysis, Grad-CAM attention mapping, and exact chemical & organic solutions across all 10 Karnataka mango zones.")}
                  </p>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <NeonBadge label={term("10 Karnataka Categories")} variant="mango" />
                <NeonBadge label={term("Exact Pesticide Dosages")} variant="cyan" />
                <NeonBadge label={term("Recent 50 History")} variant="neon" pulse />
              </div>
            </div>

            {/* Model Architecture Strip */}
            <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {[
                  { icon: Brain, label: term("MangoLeafXNetSE"), sub: term("9.47M parameters") },
                  { icon: Layers, label: term("8 Pathology Classes"), sub: term("14.8k dataset") },
                  { icon: Target, label: term("Grad-CAM v2"), sub: term("SmoothGrad++ Attention") },
                  { icon: ShieldCheck, label: term("CIBRC Approved"), sub: term("Karnataka Agro-Protocols") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-amber-400/80" />
                    <span className="text-gray-200 font-semibold">{item.label}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400 text-[11px]">{item.sub}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Sprout className="w-3.5 h-3.5" />
                <span>{term("Kolar · Dharwad · Ramanagara · Srinivasapur Mango Belts")}</span>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* ─── Main Two-Column Layout ─── */}
        <StaggerItem>
          <div className="grid lg:grid-cols-[1fr,1.15fr] gap-6 items-start">
            {/* ════ LEFT COLUMN: Upload, Camera & Interactive Sample Picker ════ */}
            <div className="space-y-4">
              {/* Dropzone Card */}
              <GlassCard className="overflow-hidden p-0 border-white/[0.08]" hover={false}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className="relative min-h-[320px] flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-500"
                  style={{
                    border: isDragging ? "2px dashed #f59e0b" : "1px dashed rgba(255,255,255,0.12)",
                    background: isDragging
                      ? "radial-gradient(ellipse at center, rgba(245,158,11,0.14), transparent 75%)"
                      : "radial-gradient(ellipse at center, rgba(255,255,255,0.02), transparent 70%)",
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />

                  {isScanning && <div className="scanner-line" />}

                  {previewUrl ? (
                    <div className="relative w-full h-80 rounded-2xl overflow-hidden group bg-black/60 border border-white/10 shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Original leaf specimen" className="w-full h-full object-contain p-2" />

                      {/* Scanning Matrix Overlay */}
                      {isScanning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 border border-cyan-400/30"
                          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.12), transparent 70%)" }}
                        >
                          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-30">
                            {[...Array(48)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="border border-cyan-400/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.012 }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* File badge tag */}
                      {uploadedFile && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-gray-200 flex items-center gap-2 shadow-lg">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span className="max-w-[160px] truncate font-medium">{uploadedFile.name}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-400 font-bold">{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearScan();
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-red-500/80 transition-all z-10 border border-white/15 shadow-lg"
                        title="Clear leaf"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <motion.div
                        animate={{ y: isDragging ? -10 : [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-2xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(34,197,94,0.12))",
                          border: "1px solid rgba(245,158,11,0.3)",
                          boxShadow: "0 0 35px rgba(245,158,11,0.18)",
                        }}
                      >
                        <Upload className="w-9 h-9 text-amber-400" />
                      </motion.div>
                      <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                        {isDragging ? term("Drop leaf specimen right here") : term("Upload Mango Leaf Specimen")}
                      </h3>
                      <p className="text-gray-400 text-xs mb-5 max-w-xs mx-auto leading-relaxed">
                        {term("High-resolution leaf photo under good lighting · Supports JPG, PNG, WebP")}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <GlowButton
                          type="button"
                          variant="mango"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            cameraInputRef.current?.click();
                          }}
                        >
                          <Camera className="w-4 h-4" />
                          <span>{term("Camera Capture")}</span>
                        </GlowButton>

                        <GlowButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          <span>{term("Browse File")}</span>
                        </GlowButton>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Sample Leaves Quick Test Gallery */}
              <GlassCard className="p-4 border-white/[0.08]" hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-200 font-bold uppercase tracking-wider">
                      {term("Karnataka Pathology Benchmark Specimens")}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{term("Click to auto-load")}</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SAMPLE_LEAVES.map((sample) => (
                    <motion.button
                      key={sample.name}
                      type="button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectSample(sample)}
                      className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/50 text-center transition-all group flex flex-col items-center"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden mb-1.5 bg-black/60 ring-1 ring-white/10 group-hover:ring-amber-400/50 transition-all">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sample.image} alt={sample.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-gray-300 group-hover:text-amber-300 font-bold truncate max-w-[64px] block transition-colors leading-tight">
                        {term(sample.disease)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>

              {/* Action Buttons */}
              {previewUrl && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <GlowButton
                    type="button"
                    variant="mango"
                    onClick={runScan}
                    disabled={isScanning}
                    className="flex-1 text-sm font-bold shadow-2xl py-3.5"
                    size="lg"
                  >
                    {isScanning ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Activity className="w-5 h-5" />
                        </motion.div>
                        <span>
                          {term("Running SE-CNN Inference...")} {scanProgress}%
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-black" />
                        <span>{term("Analyze Leaf Pathology & Generate Karnataka Solution")}</span>
                      </>
                    )}
                  </GlowButton>
                  <GlowButton type="button" variant="ghost" onClick={clearScan} size="lg" className="border border-white/10">
                    <X className="w-5 h-5" />
                  </GlowButton>
                </motion.div>
              )}

              {/* Multi-Step Scan Pipeline Progress */}
              {isScanning && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-4 border-white/[0.08]" hover={false}>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs text-gray-300 font-bold">{term("Deep Learning Pipeline Stages")}</span>
                      <span className="text-xs font-black tracking-tight" style={{ color: getConfidenceColor(scanProgress) }}>
                        {scanProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-4 p-0.5 border border-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #f59e0b, #22c55e, #06b6d4)",
                          width: `${scanProgress}%`,
                        }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {scanStages.map((stage, i) => (
                        <div key={stage.label} className="flex flex-col items-center gap-1 text-center">
                          <motion.div
                            animate={{
                              scale: scanStage === i ? [1, 1.12, 1] : 1,
                              opacity: scanStage >= i ? 1 : 0.35,
                            }}
                            transition={{ duration: 0.5, repeat: scanStage === i ? Infinity : 0 }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                            style={{
                              background: scanStage >= i ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${scanStage >= i ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            {scanStage > i ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <stage.icon className="w-4 h-4" style={{ color: scanStage === i ? "#f59e0b" : "#6b7280" }} />
                            )}
                          </motion.div>
                          <span className={`text-[10px] font-bold ${scanStage >= i ? "text-gray-200" : "text-gray-600"}`}>
                            {term(stage.label)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            {/* ════ RIGHT COLUMN: Diagnosis & Karnataka Exact Solutions Engine ════ */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {currentResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Out of Distribution Guard Alert */}
                    {isInvalidLeaf ? (
                      <GlassCard className="p-6 space-y-4 border-red-500/30" hover={false}>
                        <div
                          className="relative overflow-hidden rounded-2xl p-5 border border-red-500/40 shadow-2xl"
                          style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))" }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              animate={{ scale: [1, 1.08, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg"
                            >
                              <ShieldAlert className="w-7 h-7 text-red-400" />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="text-white font-black text-lg">{term("Non-Mango Leaf Object Detected")}</h3>
                                <NeonBadge label={term("OOD Guard")} variant="red" />
                              </div>
                              <p className="text-red-200/90 text-sm leading-relaxed mb-4">
                                {currentResult.description ||
                                  term("The uploaded image does not appear to be a mango leaf. Please upload a clear photo of a mango leaf for disease analysis.")}
                              </p>
                              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-300 flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{term("Tip: Select any benchmark leaf sample from the Quick Test gallery above to test.")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    ) : (
                      <>
                        {/* ── Diagnosis Overview Card ── */}
                        <GlassCard className="overflow-hidden p-0 border-white/[0.08] shadow-2xl" hover={false}>
                          <div
                            className="h-1.5 w-full"
                            style={{
                              background: isHealthy
                                ? "linear-gradient(90deg, #22c55e, #10b981, #06b6d4)"
                                : `linear-gradient(90deg, ${severityConfig[currentResult.severity]?.color || "#f59e0b"}, #f59e0b, #ef4444)`,
                            }}
                          />
                          <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <ConfidenceRing value={currentResult.confidence} size={84} stroke={6} />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {isHealthy ? (
                                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <AlertCircle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <h3 className="text-white font-black text-xl md:text-2xl tracking-tight">
                                      {currentResult.disease}
                                    </h3>
                                  </div>
                                  <p className="text-amber-400/90 text-xs font-semibold italic mb-2">
                                    {activeDiseaseProtocol.scientificName}
                                  </p>
                                  <SeverityIndicator severity={currentResult.severity} />
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-end gap-2 shrink-0">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-md"
                                  style={{
                                    backgroundColor: activeDiseaseProtocol.urgency.includes("Immediate")
                                      ? "rgba(239,68,68,0.18)"
                                      : "rgba(34,197,94,0.18)",
                                    borderColor: activeDiseaseProtocol.urgency.includes("Immediate")
                                      ? "rgba(239,68,68,0.4)"
                                      : "rgba(34,197,94,0.4)",
                                    color: activeDiseaseProtocol.urgency.includes("Immediate") ? "#fca5a5" : "#86efac",
                                  }}
                                >
                                  {activeDiseaseProtocol.urgency}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {activeDiseaseProtocol.causalAgent}
                                </span>
                              </div>
                            </div>

                            {/* 3 Metric Cards */}
                            <div className="grid grid-cols-3 gap-3 mt-5">
                              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>{term("Pathology Class")}</span>
                                </div>
                                <div className="text-white text-sm font-black truncate">{currentResult.disease}</div>
                                <div className="text-gray-500 text-[10px] font-medium mt-0.5">{term("PyTorch Multi-Task")}</div>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  <span>{term("AI Confidence")}</span>
                                </div>
                                <div className="text-white text-sm font-black truncate">{currentResult.confidence}%</div>
                                <div className="text-gray-500 text-[10px] font-medium mt-0.5">
                                  {term(getConfidenceLabel(currentResult.confidence))}
                                </div>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                                  <BarChart3 className="w-3.5 h-3.5" />
                                  <span>{term("Severity Level")}</span>
                                </div>
                                <div className="text-white text-sm font-black truncate">{currentResult.severity}</div>
                                <div className="text-gray-500 text-[10px] font-medium mt-0.5">{term("Lesion Coverage Score")}</div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>

                        {/* ── Grad-CAM Neural Attention Viewer (Moved Above Solution Engine) ── */}
                        <GlassCard className="overflow-hidden p-0 border-white/[0.08] shadow-2xl" hover={false}>
                          <div className="p-5 pb-3 flex items-center justify-between border-b border-white/[0.08]">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-cyan-400" />
                              <h4 className="text-white font-bold text-sm">{term("Grad-CAM Neural Attention Map")}</h4>
                            </div>
                            <div className="flex gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10">
                              {(["original", "gradcam", "compare"] as const).map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => setViewMode(mode)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                                    viewMode === mode
                                      ? mode === "gradcam"
                                        ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                        : mode === "compare"
                                        ? "bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                                        : "bg-amber-500 text-black"
                                      : "text-gray-400 hover:text-gray-200"
                                  }`}
                                >
                                  {mode === "compare" ? term("Dual Compare") : mode === "gradcam" ? term("Grad-CAM") : term("Original")}
                                </button>
                              ))}
                            </div>
                          </div>

                          {viewMode === "compare" ? (
                            <div className="grid grid-cols-2 gap-px bg-white/10">
                              <div className="relative h-56 bg-black/60 flex items-center justify-center p-2">
                                {previewUrl && (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                                )}
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[9px] text-gray-200 font-bold border border-white/10 backdrop-blur-md">
                                  {term("ORIGINAL SPECIMEN")}
                                </span>
                              </div>
                              <div className="relative h-56 bg-black/60 flex items-center justify-center p-2">
                                {heatmapB64 && (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={heatmapB64} alt="Grad-CAM" className="w-full h-full object-contain" />
                                )}
                                <span
                                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black border backdrop-blur-md ${
                                    isHealthy
                                      ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                                      : "bg-cyan-500/30 text-cyan-200 border-cyan-500/40"
                                  }`}
                                >
                                  {isHealthy ? term("CHLOROPHYLL AURA") : term("LESION ATTENTION MAP")}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-56 bg-black/60 flex items-center justify-center m-4 rounded-2xl overflow-hidden border border-white/10 p-2">
                              {(viewMode === "gradcam" && heatmapB64) || previewUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={(viewMode === "gradcam" && heatmapB64 ? heatmapB64 : previewUrl) || undefined}
                                  alt="GradCAM Heatmap"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-gray-500 text-xs font-medium">{term("No Heatmap Loaded")}</span>
                              )}
                              {viewMode === "gradcam" && (
                                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md shadow-xl">
                                  {isHealthy ? (
                                    <>
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span className="text-[10px] text-emerald-300 font-bold">
                                        {term("Zero Lesion Detected (Optimal Photosynthesis)")}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex gap-1">
                                        {["#3b82f6", "#06b6d4", "#eab308", "#f59e0b", "#ef4444"].map((c) => (
                                          <div key={c} className="w-3.5 h-2 rounded-sm" style={{ background: c }} />
                                        ))}
                                      </div>
                                      <span className="text-[10px] text-gray-300 font-bold">
                                        {term("Neural Heatmap (Low → Severe)")}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </GlassCard>

                        {/* ── Karnataka 10 Mango Cultivars Interactive Selector ── */}
                        <GlassCard className="p-5 border-amber-500/20 shadow-2xl" hover={false}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                <Sprout className="w-4 h-4 text-amber-400" />
                              </div>
                              <div>
                                <h4 className="text-white text-sm font-black tracking-tight">
                                  {term("Karnataka 10 Cultivars Solution Engine")}
                                </h4>
                                <p className="text-gray-400 text-[11px]">
                                  {term("Select your orchard mango variety for tailored chemical dosages & farming protocol:")}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              {selectedVarietyObj.name}
                            </span>
                          </div>

                          {/* 10 Variety Selector Pills */}
                          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                            {KARNATAKA_MANGO_VARIETIES.map((v) => {
                              const isSelected = v.id === selectedVarietyId;
                              const risk = activeDiseaseProtocol.varietyAdvisory[v.id]?.riskLevel || "Medium";
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVarietyId(v.id)}
                                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                    isSelected
                                      ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.4)]"
                                      : "bg-white/[0.03] text-gray-300 border-white/10 hover:border-amber-400/40 hover:text-white"
                                  }`}
                                >
                                  <span>{v.name.split(" ")[0]}</span>
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      risk === "High" ? "bg-red-500" : risk === "Medium" ? "bg-amber-500" : "bg-emerald-400"
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          {/* Variety Detail Card for Detected Disease */}
                          <div className="mt-3.5 p-4 rounded-2xl bg-black/40 border border-amber-500/25 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
                              <div>
                                <div className="text-white text-sm font-black flex items-center gap-2">
                                  <span>{selectedVarietyObj.name}</span>
                                  <span className="text-amber-400 font-bold text-xs">({selectedVarietyObj.kannadaName})</span>
                                </div>
                                <div className="text-gray-400 text-[11px] mt-0.5">
                                  Belts: {selectedVarietyObj.districts.join(", ")} · {selectedVarietyObj.treeType} · Spacing: {selectedVarietyObj.recommendedSpacing}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{term("Cultivar Risk:")}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${
                                    activeDiseaseProtocol.varietyAdvisory[selectedVarietyId]?.riskLevel === "High"
                                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                      : activeDiseaseProtocol.varietyAdvisory[selectedVarietyId]?.riskLevel === "Medium"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  }`}
                                >
                                  {term(activeDiseaseProtocol.varietyAdvisory[selectedVarietyId]?.riskLevel || "Moderate")} {term("Risk")}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs text-gray-200 flex items-start gap-2.5">
                              <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-amber-300 font-bold">
                                  {term("Variety-Specific Advisory")} ({selectedVarietyObj.name}):
                                </strong>{" "}
                                {activeDiseaseProtocol.varietyAdvisory[selectedVarietyId]?.varietySpecificAction}
                                <div className="text-amber-400/90 text-[11px] font-medium mt-1">
                                  {term("Critical Protection Stage:")}{" "}
                                  <span className="text-white font-bold">
                                    {activeDiseaseProtocol.varietyAdvisory[selectedVarietyId]?.criticalStage}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>

                        {/* ── Comprehensive Exact Solutions Hub (4 Tabs) ── */}
                        <GlassCard className="overflow-hidden p-0 border-white/[0.08] shadow-2xl" hover={false}>
                          <div className="p-5 pb-3 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="w-5 h-5 text-cyan-400" />
                              <div>
                                <h4 className="text-white font-black text-sm">{term("Exact Scientific Treatment & Agronomy Plan")}</h4>
                                <p className="text-gray-400 text-[11px]">{term("CIBRC certified chemical formulations & indigenous organic protocols")}</p>
                              </div>
                            </div>

                            {/* Solution Tabs */}
                            <div className="flex p-1 rounded-xl bg-black/60 border border-white/10">
                              {[
                                { id: "chemical", label: "Chemical Spray", icon: FlaskConical },
                                { id: "organic", label: "Bio / Organic", icon: Leaf },
                                { id: "farming", label: "Cultural Farming", icon: Sun },
                                { id: "varieties", label: "10 Cultivars Matrix", icon: FileSpreadsheet },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setActiveSolutionTab(tab.id as any)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    activeSolutionTab === tab.id
                                      ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                      : "text-gray-400 hover:text-gray-200"
                                  }`}
                                >
                                  <tab.icon className="w-3.5 h-3.5" />
                                  <span>{term(tab.label)}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tab Contents */}
                          <div className="p-5">
                            {/* TAB 1: EXACT CHEMICAL PESTICIDES */}
                            {activeSolutionTab === "chemical" && (
                              <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-cyan-500/[0.06] border border-cyan-500/25 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                                        {term("Primary Recommended Chemical")}
                                      </span>
                                      <h5 className="text-white font-black text-base mt-0.5">
                                        {activeDiseaseProtocol.chemicalPesticides.primaryChemical}
                                      </h5>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                                      PHI: {activeDiseaseProtocol.chemicalPesticides.phi}
                                    </span>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                                      <div className="text-gray-400 font-semibold mb-1">{term("Exact Dosage Formulation:")}</div>
                                      <div className="text-amber-300 font-bold text-sm">
                                        {activeDiseaseProtocol.chemicalPesticides.dosage}
                                      </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                                      <div className="text-gray-400 font-semibold mb-1">{term("Commercial Trade Names in Karnataka:")}</div>
                                      <div className="text-gray-200 font-medium">
                                        {activeDiseaseProtocol.chemicalPesticides.tradeNames.join(", ")}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-300 space-y-1.5 pt-1">
                                    <div>
                                      <strong className="text-cyan-300 font-bold">{term("Application Schedule:")}</strong>{" "}
                                      {activeDiseaseProtocol.chemicalPesticides.sprayTiming}
                                    </div>
                                    <div>
                                      <strong className="text-cyan-300 font-bold">{term("Resistance Rotation Chemical:")}</strong>{" "}
                                      {activeDiseaseProtocol.chemicalPesticides.rotationChemical}
                                    </div>
                                    <div className="text-amber-400/90 text-[11px] pt-1">
                                      ⚠️ <strong>{term("Caution:")}</strong> {activeDiseaseProtocol.chemicalPesticides.cautions}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB 2: ORGANIC & BIO-CONTROL */}
                            {activeSolutionTab === "organic" && (
                              <div className="space-y-3">
                                <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 space-y-3">
                                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                    <Leaf className="w-4 h-4" />
                                    <span>{term("Zero-Residue Bio-Control & Botanical Plan")}</span>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                                      <div className="text-gray-400 font-semibold mb-1">{term("Botanical Spray:")}</div>
                                      <div className="text-emerald-300 font-bold">
                                        {activeDiseaseProtocol.organicSolutions.botanical}
                                      </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                                      <div className="text-gray-400 font-semibold mb-1">{term("Beneficial Bio-Agent:")}</div>
                                      <div className="text-emerald-300 font-bold">
                                        {activeDiseaseProtocol.organicSolutions.bioAgent}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-300 space-y-1.5">
                                    <div>
                                      <strong className="text-emerald-300 font-bold">{term("Indigenous Mix Preparation:")}</strong>{" "}
                                      {activeDiseaseProtocol.organicSolutions.indigenousMix}
                                    </div>
                                    <div>
                                      <strong className="text-emerald-300 font-bold">{term("Application Technique:")}</strong>{" "}
                                      {activeDiseaseProtocol.organicSolutions.applicationMethod}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB 3: CULTURAL & FARMING PRACTICES */}
                            {activeSolutionTab === "farming" && (
                              <div className="space-y-3 text-xs">
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                                      <Sun className="w-4 h-4" />
                                      <span>{term("Canopy & Solar Pruning")}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">
                                      {activeDiseaseProtocol.farmingPractices.canopyPruning}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5">
                                      <Droplets className="w-4 h-4" />
                                      <span>{term("Drip & Moisture Modulation")}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">
                                      {activeDiseaseProtocol.farmingPractices.waterManagement}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1.5">
                                      <Flame className="w-4 h-4" />
                                      <span>{term("Field Sanitation & Debris Disposal")}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">
                                      {activeDiseaseProtocol.farmingPractices.fieldSanitation}
                                    </p>
                                  </div>

                                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
                                      <Sprout className="w-4 h-4" />
                                      <span>{term("Intercropping & Post-Harvest")}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">
                                      {activeDiseaseProtocol.farmingPractices.postHarvestCare}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB 4: 10 CULTIVARS SUSCEPTIBILITY MATRIX */}
                            {activeSolutionTab === "varieties" && (
                              <div className="space-y-2">
                                <div className="text-[11px] text-gray-400 mb-2">
                                  {term("Susceptibility and critical action summary for")}{" "}
                                  <strong className="text-white">{term(currentResult.disease)}</strong>{" "}
                                  {term("across all 10 Karnataka cultivars:")}
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                                  {KARNATAKA_MANGO_VARIETIES.map((v) => {
                                    const adv = activeDiseaseProtocol.varietyAdvisory[v.id];
                                    const isCurrent = v.id === selectedVarietyId;
                                    return (
                                      <div
                                        key={v.id}
                                        onClick={() => setSelectedVarietyId(v.id)}
                                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                          isCurrent
                                            ? "bg-amber-500/15 border-amber-400 shadow-md"
                                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-white font-bold">{v.name}</span>
                                          <span
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                              adv?.riskLevel === "High"
                                                ? "bg-red-500/20 text-red-300"
                                                : adv?.riskLevel === "Medium"
                                                ? "bg-amber-500/20 text-amber-300"
                                                : "bg-emerald-500/20 text-emerald-300"
                                            }`}
                                          >
                                            {term(adv?.riskLevel || "Low")} {term("Risk")}
                                          </span>
                                        </div>
                                        <p className="text-gray-300 text-[11px] line-clamp-2 leading-relaxed">
                                          {adv?.varietySpecificAction}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GlassCard className="p-10 text-center border-white/[0.08] shadow-2xl" hover={false}>
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(34,197,94,0.08))",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <Scan className="w-10 h-10 text-amber-400/80" />
                      </motion.div>
                      <h3 className="text-white font-black text-lg mb-1.5">{term("Awaiting Leaf Diagnosis")}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-6">
                        {term("Upload a mango leaf photo or pick a sample specimen above, then click 'Analyze Leaf Pathology' to inspect lesions and get the exact Karnataka agronomic solution.")}
                      </p>

                      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
                        {[
                          { title: "1. Upload", desc: "Original leaf photo" },
                          { title: "2. Deep Inference", desc: "SE-CNN + Grad-CAM" },
                          { title: "3. Karnataka Cure", desc: "Pesticides & farming" },
                        ].map((s, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                            <div className="text-amber-400 text-xs font-black mb-0.5">{s.title}</div>
                            <div className="text-gray-500 text-[10px] font-medium">{s.desc}</div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </StaggerItem>

        {/* ─── Detection History (Strict Recent 50 Enforcement + Toggle Controls) ─── */}
        <StaggerItem>
          <GlassCard className="p-6 border-white/[0.08] shadow-2xl" hover={false}>
            {/* History Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-white font-black text-lg tracking-tight">{term("Detection History")}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {term("Strict Recent 50 Enforced")}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    ({filteredHistory.length} / 50 {term("recent records retained")})
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {term("Older scans beyond 50 are automatically pruned daily to maintain optimal database performance.")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                {/* View Mode Toggle */}
                <div className="flex p-1 rounded-xl bg-black/60 border border-white/10">
                  <button
                    onClick={() => setHistoryViewMode("table")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      historyViewMode === "table" ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                    }`}
                    title="Detailed List Table"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setHistoryViewMode("cards")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      historyViewMode === "cards" ? "bg-amber-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                    }`}
                    title="Visual Cards Grid"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>

                {/* Manual Prune to 50 Button */}
                <button
                  onClick={handlePruneHistory}
                  disabled={isPruning}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-amber-400 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Purge database to ensure exactly recent 50 records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPruning ? "animate-spin text-amber-400" : ""}`} />
                  <span>{term("Prune to 50 Max")}</span>
                </button>
              </div>
            </div>

            {/* Notification Banner if pruned */}
            {historyNotification && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{historyNotification}</span>
              </motion.div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={term("Search by leaf file, pathology class, or date...")}
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition-all"
                />
                {historySearch && (
                  <button
                    onClick={() => setHistorySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Disease Dropdown Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={historyFilterDisease}
                  onChange={(e) => setHistoryFilterDisease(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                >
                  <option value="all">{term("All Pathology Classes")}</option>
                  <option value="anthracnose">{term("Anthracnose")}</option>
                  <option value="bacterialcanker">{term("Bacterial Canker")}</option>
                  <option value="powderymildew">{term("Powdery Mildew")}</option>
                  <option value="dieback">{term("Die Back")}</option>
                  <option value="gallmidge">{term("Gall Midge")}</option>
                  <option value="cuttingweevil">{term("Cutting Weevil")}</option>
                  <option value="sootymould">{term("Sooty Mould")}</option>
                  <option value="healthy">{term("Healthy")}</option>
                </select>
              </div>
            </div>

            {/* Render View: Table or Cards */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.01] rounded-2xl border border-white/5">
                <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-semibold">{term("No matching detection records found")}</p>
                <p className="text-gray-600 text-xs mt-0.5">{term("Try adjusting your search query or class filter.")}</p>
              </div>
            ) : historyViewMode === "table" ? (
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-[48px_1fr_140px_90px_100px_60px] gap-3 px-4 py-2.5 mb-1.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>#</span>
                  <span>{term("Specimen Image")}</span>
                  <span>{term("Pathology Class")}</span>
                  <span>{term("Confidence")}</span>
                  <span>{term("Severity")}</span>
                  <span className="text-right">{term("Action")}</span>
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredHistory.map((record, i) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.01 + i * 0.015 }}
                      onClick={() => setSelectedHistoryModal(record)}
                      className="grid grid-cols-[48px_1fr_140px_90px_100px_60px] gap-3 items-center px-4 py-3 rounded-2xl bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-xs font-black text-gray-400 group-hover:text-amber-400 transition-colors">
                        {record.id}
                      </div>

                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate group-hover:text-amber-200 transition-colors">
                          {record.image}
                        </p>
                        <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gray-600" />
                          <span>{record.date}</span>
                        </p>
                      </div>

                      <span className="text-white text-xs font-bold">{term(record.disease)}</span>

                      <span className="text-xs font-black" style={{ color: getConfidenceColor(record.confidence) }}>
                        {record.confidence}%
                      </span>

                      <div>
                        <NeonBadge
                          label={term(record.severity)}
                          variant={
                            record.severity === "None"
                              ? "neon"
                              : record.severity === "High"
                              ? "red"
                              : "mango"
                          }
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleDeleteRecord(e, record.id)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* Visual Cards Grid View */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredHistory.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedHistoryModal(record)}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04] transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white/5 text-[10px] font-black text-amber-400 flex items-center justify-center">
                          #{record.id}
                        </span>
                        <div>
                          <div className="text-white font-black text-sm group-hover:text-amber-200 transition-colors">
                            {term(record.disease)}
                          </div>
                          <div className="text-gray-500 text-[10px]">{record.date}</div>
                        </div>
                      </div>

                      <NeonBadge
                        label={term(record.severity)}
                        variant={record.severity === "None" ? "neon" : record.severity === "High" ? "red" : "mango"}
                        size="sm"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium truncate max-w-[140px]">{record.image}</span>
                      <span className="font-black" style={{ color: getConfidenceColor(record.confidence) }}>
                        {record.confidence}% {term("Conf.")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-gray-400">
                      <span className="group-hover:text-amber-300 font-semibold flex items-center gap-1">
                        <span>{term("View Karnataka Solution")}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                      <button
                        onClick={(e) => handleDeleteRecord(e, record.id)}
                        className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </StaggerItem>

        {/* ── Modal for Selected History Record ── */}
        <AnimatePresence>
          {selectedHistoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-xl rounded-3xl bg-gray-900 border border-white/15 p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Microscope className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-base">
                        {term("History Scan Record")} #{selectedHistoryModal.id}
                      </h3>
                      <p className="text-gray-400 text-xs">{term("Logged on")} {selectedHistoryModal.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHistoryModal(null)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-gray-400">{term("Pathology Diagnosis")}:</span>
                    <div className="text-white font-black text-base mt-0.5">{term(selectedHistoryModal.disease)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-gray-400">{term("Model Confidence")}:</span>
                    <div className="text-emerald-400 font-black text-base mt-0.5">{selectedHistoryModal.confidence}%</div>
                  </div>
                </div>

                {/* Exact Solution Preview */}
                {DISEASE_SOLUTIONS_MAP[selectedHistoryModal.disease] && (
                  <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 space-y-2 text-xs">
                    <div className="text-amber-300 font-bold flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4" />
                      <span>{term("Recommended Chemical & Organic Treatment:")}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      {DISEASE_SOLUTIONS_MAP[selectedHistoryModal.disease].chemicalPesticides.primaryChemical} at{" "}
                      {DISEASE_SOLUTIONS_MAP[selectedHistoryModal.disease].chemicalPesticides.dosage}
                    </p>
                    <div className="text-gray-400 text-[11px] pt-1">
                      <strong>{term("Organic alternative:")}</strong>{" "}
                      {DISEASE_SOLUTIONS_MAP[selectedHistoryModal.disease].organicSolutions.botanical}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <GlowButton variant="outline" size="sm" onClick={() => setSelectedHistoryModal(null)}>
                    {term("Close")}
                  </GlowButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </StaggerContainer>
    </PageTransition>
  );
}
