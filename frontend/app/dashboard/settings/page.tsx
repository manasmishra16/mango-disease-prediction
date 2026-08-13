"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle,
  Lock,
  Copy,
  RefreshCw,
  Zap,
  Smartphone,
  Mail,
  Check,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { getSettings, saveSettings, type UserSettings } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ai", label: "AI Engine", icon: Cpu },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "api", label: "API Keys", icon: Key },
];

const defaultUserSettings: UserSettings = {
  profile: {
    fullName: "Manas Mishhraa",
    email: "manasmishhraa@gmail.com",
    phone: "+91 98765 43210",
    location: "Karnataka, India",
    organization: "Karnataka Mango Development Board",
    role: "Senior Agricultural Technologist",
  },
  aiConfig: {
    autoScanFrequency: "Every 6 hours",
    detectionThreshold: "75%",
    yieldModelVersion: "v3.2 (Latest)",
    autoNotifications: true,
    gradcamVisualization: true,
    revenueForecasting: true,
    betaFeatures: false,
  },
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState("mg_live_9f8a32b14c7e602d1849a");

  // Notifications state
  const [notifState, setNotifState] = useState({
    emailAlerts: true,
    whatsappAlerts: true,
    climateAlerts: true,
    weeklyDigest: false,
  });

  // Theme state
  const [activeTheme, setActiveTheme] = useState("Cyber Amber");

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data && data.profile) {
          setSettings({
            ...data,
            profile: {
              ...data.profile,
              fullName: user?.fullName || data.profile.fullName,
              email: user?.email || data.profile.email,
              role: user?.role || data.profile.role,
              organization: user?.organization || data.profile.organization,
            },
          });
        }
      })
      .catch((err) => {
        console.warn("Using local settings fallback:", err.message);
      });
  }, [user]);

  const handleProfileChange = (field: keyof UserSettings["profile"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const handleAiConfigChange = (field: keyof UserSettings["aiConfig"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      aiConfig: { ...prev.aiConfig, [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Save settings notice:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const regenerateApiKey = () => {
    const newKey = "mg_live_" + Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setApiKey(newKey);
  };

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Platform Settings</h2>
              <p className="text-gray-400 text-sm mt-1">Configure user account, PyTorch AI engine, notifications, security & integrations</p>
            </div>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Settings Saved
                </span>
              )}
              <GlowButton variant="mango" size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Settings"}
              </GlowButton>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Settings Sidebar Navigation */}
            <GlassCard className="p-4 h-fit" hover={false}>
              <div className="space-y-1">
                {settingsSections.map((section, i) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Main Content Area per Tab */}
            <div className="lg:col-span-3 space-y-5">
              <AnimatePresence mode="wait">
                {/* 1. Profile Tab */}
                {activeSection === "profile" && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6" hover={false}>
                      <h3 className="text-white font-semibold text-base mb-5">Profile & Account Information</h3>
                      <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl bg-white/3 border border-white/5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0">
                          {(settings.profile.fullName || "M").charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{settings.profile.fullName}</p>
                          <p className="text-gray-400 text-sm">{settings.profile.email}</p>
                          <div className="flex gap-2 mt-2">
                            <NeonBadge label={settings.profile.role || "Orchard Manager"} variant="mango" />
                            <NeonBadge label="Verified Account" variant="neon" />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { label: "Full Name", field: "fullName", type: "text" },
                          { label: "Email Address", field: "email", type: "email" },
                          { label: "Phone Number", field: "phone", type: "tel" },
                          { label: "Location / State", field: "location", type: "text" },
                          { label: "Organization", field: "organization", type: "text" },
                          { label: "Platform Role", field: "role", type: "text" },
                        ].map((item) => (
                          <div key={item.label}>
                            <label className="block text-xs text-gray-400 font-medium mb-1.5">{item.label}</label>
                            <input
                              type={item.type}
                              value={settings.profile[item.field as keyof UserSettings["profile"]] || ""}
                              onChange={(e) => handleProfileChange(item.field as keyof UserSettings["profile"], e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500/40 focus:bg-white/6 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 2. AI Engine Tab */}
                {activeSection === "ai" && (
                  <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-5 h-5 text-violet-400" />
                        <h3 className="text-white font-semibold text-base">PyTorch CNN & ML Engine Settings</h3>
                      </div>
                      <div className="space-y-3.5">
                        {[
                          {
                            label: "Disease Detection Architecture",
                            desc: "Active PyTorch deep learning neural model",
                            value: "MangoLeafXNetMultiTask (99% Acc)",
                            field: "modelChoice",
                            options: ["MangoLeafXNetMultiTask (99% Acc)", "EfficientNet-B3 (100% Acc)", "MangoLeafXNetSE (98.75% Acc)", "VGG16 (100% Acc)"],
                          },
                          {
                            label: "Automated Inspection Frequency",
                            desc: "Frequency of background orchard scanning",
                            value: settings.aiConfig.autoScanFrequency,
                            field: "autoScanFrequency",
                            options: ["Every 1 hour", "Every 3 hours", "Every 6 hours", "Every 12 hours", "Daily"],
                          },
                          {
                            label: "Detection Confidence Alert Threshold",
                            desc: "Minimum confidence score to trigger high-severity alert",
                            value: settings.aiConfig.detectionThreshold,
                            field: "detectionThreshold",
                            options: ["60%", "65%", "70%", "75%", "80%", "85%", "90%"],
                          },
                        ].map((setting) => (
                          <div key={setting.label} className="flex items-center justify-between gap-6 p-4 rounded-xl bg-white/3 border border-white/5">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{setting.label}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{setting.desc}</p>
                            </div>
                            <select
                              value={setting.value}
                              onChange={(e) => handleAiConfigChange(setting.field as keyof UserSettings["aiConfig"], e.target.value)}
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
                          { key: "autoNotifications", label: "Auto-notifications", desc: "Send immediate alerts for high-severity disease detections" },
                          { key: "gradcamVisualization", label: "GradCAM Visualization", desc: "Generate real gradient attribution heatmaps for leaf scans" },
                          { key: "revenueForecasting", label: "Revenue Loss Module", desc: "Enable AI-powered economic loss estimation engine" },
                          { key: "betaFeatures", label: "Experimental Features", desc: "Enable experimental CycleGAN domain adaptation models" },
                        ].map((toggle) => {
                          const enabled = Boolean(settings.aiConfig[toggle.key as keyof UserSettings["aiConfig"]]);
                          return (
                            <div key={toggle.key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                              <div>
                                <p className="text-white text-sm font-medium">{toggle.label}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{toggle.desc}</p>
                              </div>
                              <div
                                onClick={() => handleAiConfigChange(toggle.key as keyof UserSettings["aiConfig"], !enabled)}
                                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                  enabled ? "bg-yellow-500" : "bg-white/10"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                    enabled ? "translate-x-5" : "translate-x-0.5"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 3. Notifications Tab */}
                {activeSection === "notifications" && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-semibold text-base">Alert & Notification Channels</h3>
                      </div>
                      {[
                        { key: "emailAlerts", title: "High-Severity Disease Email Alerts", desc: `Send email alerts to ${settings.profile.email} when disease severity reaches High`, icon: Mail },
                        { key: "whatsappAlerts", title: "WhatsApp Farmer Bot Alerts", desc: `Receive instant chemical treatment recommendations on WhatsApp (${settings.profile.phone})`, icon: Smartphone },
                        { key: "climateAlerts", title: "Climate Extremes Warning", desc: "Notify when temperature or humidity exceeds risk thresholds in Hassan, Karnataka", icon: Zap },
                        { key: "weeklyDigest", title: "Weekly Harvest & Pricing Report", desc: "Receive weekly summary of projected yield and market pricing reports", icon: Bell },
                      ].map((item) => {
                        const enabled = notifState[item.key as keyof typeof notifState];
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5 text-yellow-400 shrink-0" />
                              <div>
                                <p className="text-white text-sm font-medium">{item.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                            <div
                              onClick={() => setNotifState((prev) => ({ ...prev, [item.key]: !enabled }))}
                              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                enabled ? "bg-yellow-500" : "bg-white/10"
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                  enabled ? "translate-x-5" : "translate-x-0.5"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </GlassCard>
                  </motion.div>
                )}

                {/* 4. Security Tab */}
                {activeSection === "security" && (
                  <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-semibold text-base">Security & Authentication</h3>
                      </div>
                      <div className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">Two-Factor Authentication (2FA)</p>
                          <p className="text-gray-500 text-xs mt-0.5">Protect account with authenticator app (TOTP)</p>
                        </div>
                        <NeonBadge label="Enabled" variant="neon" />
                      </div>
                      <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-medium">Active Session Token</p>
                          <NeonBadge label="Verified" variant="mango" />
                        </div>
                        <p className="text-gray-400 font-mono text-xs bg-black/40 p-2.5 rounded-lg border border-white/5 truncate">
                          mangodl-session-jwt-active-{settings.profile.email.split("@")[0]}
                        </p>
                        <p className="text-gray-500 text-xs">IP: 127.0.0.1 (Localhost) · Device: Web Client Browser</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 5. Appearance Tab */}
                {activeSection === "appearance" && (
                  <motion.div key="appearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-white font-semibold text-base">Theme & Dashboard Styling</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: "Cyber Amber", color: "from-yellow-500 to-amber-600" },
                          { name: "Emerald AgTech", color: "from-green-500 to-emerald-600" },
                          { name: "Neon Cyan", color: "from-cyan-500 to-blue-600" },
                        ].map((theme) => (
                          <div
                            key={theme.name}
                            onClick={() => setActiveTheme(theme.name)}
                            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                              activeTheme === theme.name ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "border-white/10 bg-white/3 hover:bg-white/5"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.color} mx-auto mb-2`} />
                            <p className="text-white text-xs font-semibold">{theme.name}</p>
                            {activeTheme === theme.name && <span className="text-[10px] text-yellow-400 font-bold block mt-1">Active</span>}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 6. Integrations Tab */}
                {activeSection === "integrations" && (
                  <motion.div key="integrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-sky-400" />
                        <h3 className="text-white font-semibold text-base">Connected AgTech Integrations</h3>
                      </div>
                      {[
                        { name: "Open-Meteo Climate API", status: "Connected", desc: "Live temperature, humidity & rainfall feed for Hassan, Karnataka", variant: "neon" as const },
                        { name: "NHB Yield Database", status: "Synced", desc: "National Horticulture Board 10-year dataset (2015-2024)", variant: "mango" as const },
                        { name: "LiteLLM Router", status: "Active", desc: "Gemini 2.5 Flash & 2.0 Flash fallback vision system", variant: "neon" as const },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                          <div>
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                          </div>
                          <NeonBadge label={item.status} variant={item.variant} />
                        </div>
                      ))}
                    </GlassCard>
                  </motion.div>
                )}

                {/* 7. API Keys Tab */}
                {activeSection === "api" && (
                  <motion.div key="api" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <GlassCard className="p-6 space-y-4" hover={false}>
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-semibold text-base">REST API Secret Key</h3>
                      </div>
                      <p className="text-gray-400 text-xs">Use this secret key to authorize REST API calls to `http://localhost:8000/predict/disease` from mobile devices or IoT orchard sensors.</p>
                      
                      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-yellow-400">
                        <span className="flex-1 truncate">{apiKey}</span>
                        <button
                          onClick={copyApiKey}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all"
                        >
                          {copiedKey ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={regenerateApiKey}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="Regenerate Key"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Platform Info Footer */}
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">MangoDL Deep Learning Platform</p>
                      <p className="text-gray-500 text-xs">Precision Agriculture ML System v1.0.0 · PyTorch 2.x Enabled</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeonBadge label="PyTorch 99% Acc" variant="neon" />
                    <NeonBadge label="Karnataka Belt" variant="mango" />
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
