"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { dataflowNodes } from "@/data/mock-data";
import { getDataflowStats, type DataflowStatsResponse } from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

const connections = [
  { from: "input", to: "ai-hub" },
  { from: "ai-hub", to: "disease" },
  { from: "ai-hub", to: "yield" },
  { from: "ai-hub", to: "revenue" },
  { from: "disease", to: "decision" },
  { from: "yield", to: "decision" },
  { from: "revenue", to: "decision" },
];

function DataPacket({ x1, y1, x2, y2, color, delay = 0 }: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay?: number;
}) {
  return (
    <motion.circle
      r={3}
      fill={color}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      initial={{ cx: x1, cy: y1, opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    />
  );
}

export default function DataflowPage() {
  const { term } = useLocalizedText();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [stats, setStats] = useState<DataflowStatsResponse>({
    imagesProcessed: 12847,
    inferencesMade: 94230,
    avgLatency: "28ms",
    modelAccuracy: "99.0%",
  });

  useEffect(() => {
    getDataflowStats()
      .then((res) => {
        if (res && res.imagesProcessed) setStats(res);
      })
      .catch((err) => {
        console.warn("Using local dataflow stats fallback:", err.message);
      });
  }, []);

  const W = 800;
  const H = 280;

  const getPos = (node: typeof dataflowNodes[0]) => ({
    x: (node.x / 100) * W,
    y: (node.y / 100) * H,
  });

  const getNodeById = (id: string) => dataflowNodes.find((n) => n.id === id)!;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">{term("AI Dataflow Visualization")}</h2>
              <p className="text-gray-400 text-sm mt-1">{term("Cinematic real-time AI processing pipeline")}</p>
            </div>
            <div className="flex items-center gap-2">
              <NeonBadge label={term("PyTorch Multitask Engine")} variant="violet" pulse />
              <NeonBadge label={term("Live Processing")} variant="neon" pulse />
            </div>
          </div>
        </StaggerItem>

        {/* Main Flow Diagram */}
        <StaggerItem>
          <GlassCard className="p-6 overflow-hidden" hover={false}>
            <div className="mb-4">
              <h3 className="text-white font-semibold">{term("Processing Pipeline Architecture")}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{term("Click nodes to explore each AI module")}</p>
            </div>

            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full min-w-[600px]"
                style={{ height: H }}
              >
                <defs>
                  {dataflowNodes.map((node) => (
                    <radialGradient key={node.id} id={`nodeGrad-${node.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={node.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={node.color} stopOpacity={0} />
                    </radialGradient>
                  ))}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connection lines */}
                {connections.map((conn, i) => {
                  const from = getPos(getNodeById(conn.from));
                  const to = getPos(getNodeById(conn.to));
                  const fromNode = getNodeById(conn.from);
                  return (
                    <g key={i}>
                      <motion.line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={fromNode.color}
                        strokeWidth={1.5}
                        strokeOpacity={0.2}
                        strokeDasharray="4 6"
                      />
                      <DataPacket
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        color={fromNode.color}
                        delay={i * 0.4}
                      />
                      <DataPacket
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        color={fromNode.color}
                        delay={i * 0.4 + 1.5}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {dataflowNodes.map((node, i) => {
                  const { x, y } = getPos(node);
                  const isActive = activeNode === node.id;
                  const r = node.id === "ai-hub" ? 40 : 32;

                  return (
                    <g
                      key={node.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setActiveNode(isActive ? null : node.id)}
                    >
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={r + 14}
                        fill={`url(#nodeGrad-${node.id})`}
                        animate={{ r: [r + 14, r + 20, r + 14], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill={`${node.color}18`}
                        stroke={node.color}
                        strokeWidth={isActive ? 2 : 1.5}
                        strokeOpacity={isActive ? 1 : 0.6}
                        filter="url(#glow)"
                        whileHover={{ scale: 1.1 }}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                      />
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={r * 0.5}
                        fill={node.color}
                        fillOpacity={0.3}
                        animate={{ r: [r * 0.4, r * 0.55, r * 0.4], fillOpacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      />
                      <circle cx={x} cy={y} r={5} fill={node.color} filter="url(#glow)" />
                      <text
                        x={x}
                        y={y + r + 16}
                        textAnchor="middle"
                        fill="white"
                        fontSize={11}
                        fontWeight={600}
                        fontFamily="Inter, sans-serif"
                      >
                        {node.label}
                      </text>
                      <text
                        x={x}
                        y={y + r + 28}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize={9}
                        fontFamily="Inter, sans-serif"
                      >
                        {node.sublabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Node Detail */}
            {activeNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl border border-white/10 bg-white/3"
              >
                {(() => {
                  const node = getNodeById(activeNode);
                  return (
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${node.color}20`, border: `1px solid ${node.color}40` }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: node.color }} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{node.label}</h4>
                        <p className="text-gray-400 text-xs">{node.sublabel}</p>
                      </div>
                      <NeonBadge
                        label="Active"
                        variant={
                          node.color === "#22d3ee" ? "cyan"
                            : node.color === "#8b5cf6" ? "violet"
                            : node.color === "#22c55e" ? "neon"
                            : "mango"
                        }
                        pulse
                      />
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </GlassCard>
        </StaggerItem>

        {/* Processing Stats */}
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: term("Images Processed"), value: stats.imagesProcessed.toLocaleString(), color: "#22d3ee", sub: term("Live total") },
              { label: term("Inferences Made"), value: stats.inferencesMade.toLocaleString(), color: "#8b5cf6", sub: term("Live total") },
              { label: term("Avg. Latency"), value: stats.avgLatency, color: "#22c55e", sub: term("PyTorch local") },
              { label: term("Model Accuracy"), value: stats.modelAccuracy, color: "#f59e0b", sub: term("Test accuracy") },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="card-glass p-5 text-center"
              >
                <div className="text-2xl font-display font-bold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* Pipeline Detail Table */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-white font-semibold mb-4">{term("Pipeline Stage Details")}</h3>
            <div className="space-y-3">
              {[
                { stage: term("Data Ingestion"), module: term("Input Sensors + API"), latency: "5ms", throughput: "1,200/s", status: "active" },
                { stage: term("Preprocessing"), module: term("Image Normalization (227x227)"), latency: "8ms", throughput: "800/s", status: "active" },
                { stage: term("Feature Extraction"), module: term("MangoLeafXNet Backbone"), latency: "18ms", throughput: "400/s", status: "active" },
                { stage: term("Classification & Severity"), module: term("MangoLeafXNetMultiTask Head"), latency: "12ms", throughput: "600/s", status: "active" },
                { stage: term("GradCAM Visualization"), module: term("Gradient Attribution Heatmap"), latency: "25ms", throughput: "120/s", status: "active" },
                { stage: term("Yield Prediction"), module: term("XGBoost Regressor Model"), latency: "6ms", throughput: "2,000/s", status: "active" },
                { stage: term("Revenue Estimation"), module: term("Economics Loss Engine"), latency: "3ms", throughput: "5,000/s", status: "active" },
                { stage: term("Decision Engine"), module: term("Dynamic Recommendation System"), latency: "2ms", throughput: "8,000/s", status: "active" },
              ].map((row, i) => (
                <motion.div
                  key={row.stage}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }} />
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium">{row.stage}</span>
                    <span className="text-gray-500 text-xs ml-2">·</span>
                    <span className="text-gray-400 text-xs ml-2">{row.module}</span>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-cyan-400 text-xs font-semibold">{row.latency}</div>
                    <div className="text-gray-600 text-[10px]">{term("latency")}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-yellow-400 text-xs font-semibold">{row.throughput}</div>
                    <div className="text-gray-600 text-[10px]">{term("throughput")}</div>
                  </div>
                  <NeonBadge label={term("Active")} variant="neon" size="sm" />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
