"use client";

import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Cpu,
  Palette,
  Globe,
  Key,
  Save,
  Leaf,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "ai", label: "AI Engine", icon: Cpu },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Settings</h2>
              <p className="text-gray-400 text-sm mt-1">Configure your MangoDL platform</p>
            </div>
            <GlowButton variant="mango" size="sm">
              <Save className="w-4 h-4" /> Save Changes
            </GlowButton>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Settings Nav */}
            <GlassCard className="p-4 h-fit" hover={false}>
              <div className="space-y-1">
                {settingsSections.map((section, i) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      section.id === "profile"
                        ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-5">
              {/* Profile */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-white font-semibold mb-5">Profile Information</h3>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    M
                  </div>
                  <div>
                    <p className="text-white font-semibold">Manas Kumar</p>
                    <p className="text-gray-400 text-sm">Senior Orchard Manager</p>
                    <NeonBadge label="Pro Plan" variant="mango" className="mt-2" />
                  </div>
                  <GlowButton variant="ghost" size="sm" className="ml-auto">
                    Change Photo
                  </GlowButton>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: "Manas Kumar", type: "text" },
                    { label: "Email Address", value: "manas@mangodl.ai", type: "email" },
                    { label: "Phone Number", value: "+91 98765 43210", type: "tel" },
                    { label: "Location", value: "Maharashtra, India", type: "text" },
                    { label: "Organization", value: "Sunrise Farms Ltd.", type: "text" },
                    { label: "Role", value: "Senior Orchard Manager", type: "text" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-gray-400 font-medium mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500/40 focus:bg-white/6 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* AI Configuration */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center gap-2 mb-5">
                  <Cpu className="w-5 h-5 text-violet-400" />
                  <h3 className="text-white font-semibold">AI Engine Configuration</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Auto-scan Frequency",
                      description: "How often the AI automatically scans orchard images",
                      value: "Every 6 hours",
                      type: "select",
                      options: ["Every 1 hour", "Every 3 hours", "Every 6 hours", "Every 12 hours", "Daily"],
                    },
                    {
                      label: "Disease Detection Threshold",
                      description: "Minimum confidence score to trigger a disease alert",
                      value: "75%",
                      type: "select",
                      options: ["60%", "65%", "70%", "75%", "80%", "85%", "90%"],
                    },
                    {
                      label: "Yield Model Version",
                      description: "XGBoost model version for yield prediction",
                      value: "v3.2 (Latest)",
                      type: "select",
                      options: ["v3.2 (Latest)", "v3.1", "v3.0", "v2.8"],
                    },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-start justify-between gap-6 p-4 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{setting.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{setting.description}</p>
                      </div>
                      <select
                        defaultValue={setting.value}
                        className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500/40 cursor-pointer min-w-36"
                      >
                        {setting.options.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0a0b0f]">{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Toggles */}
                  {[
                    { label: "Auto-notifications", desc: "Send SMS/email alerts for high-severity detections", enabled: true },
                    { label: "GradCAM Visualization", desc: "Generate heatmaps for all disease detections", enabled: true },
                    { label: "Revenue Forecasting", desc: "Enable AI-powered revenue estimation module", enabled: true },
                    { label: "Beta Features", desc: "Access experimental AI features before public release", enabled: false },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                      <div>
                        <p className="text-white text-sm font-medium">{toggle.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{toggle.desc}</p>
                      </div>
                      <div
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          toggle.enabled ? "bg-yellow-500" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            toggle.enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* About Platform */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">MangoDL Platform</p>
                      <p className="text-gray-500 text-xs">AI Agriculture Intelligence v1.0.0</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeonBadge label="Up to date" variant="neon" />
                    <NeonBadge label="Pro" variant="mango" />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
