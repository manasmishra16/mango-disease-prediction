"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ParticleField } from "@/components/animations/particle-field";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { useAuthStore } from "@/store/auth-store";
import { useLocalizedText } from "@/lib/localization";

export default function LoginPage() {
  const { term } = useLocalizedText();
  const router = useRouter();
  const { login, register, demoLogin, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Orchard Manager");
  const [organization, setOrganization] = useState("MangoDL AI Platform");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTabChange = (newMode: "login" | "register") => {
    setMode(newMode);
    clearError();
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email || !email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "register") {
      if (!fullName) {
        setValidationError("Please enter your full name.");
        return;
      }
      await register({
        fullName,
        email,
        password,
        role,
        organization,
      });
    } else {
      await login(email, password);
    }
    
    // Perform instant navigation to dashboard with navigation authorization
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mango_just_clicked", "true");
    }
    try {
      router.push("/dashboard");
    } catch {
      window.location.href = "/dashboard";
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setValidationError(null);
    setEmail("demo@mangodl.ai");
    setPassword("password123");
    const success = await demoLogin();
    if (success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mango_just_clicked", "true");
      }
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background FX */}
      <div className="pointer-events-none fixed inset-0">
        <ParticleField className="opacity-50" />
        <div
          className="absolute left-1/4 top-1/6 h-[32rem] w-[32rem] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)", filter: "blur(90px)" }}
        />
        <div
          className="absolute bottom-1/6 right-1/4 h-[28rem] w-[28rem] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)", filter: "blur(90px)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 space-y-2"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.35)] mb-2">
            <Leaf className="h-7 w-7 text-black" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            Mango<span className="text-yellow-400">DL</span>
          </h1>
          <p className="text-gray-400 text-xs">AI Agriculture Intelligence Platform</p>
        </motion.div>

        {/* Auth Glass Card */}
        <GlassCard className="p-6 md:p-8 overflow-hidden" hover={false}>
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/8 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {term("Sign In")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {term("Create Account")}
            </button>
          </div>

          {/* Quick Demo Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            type="button"
            disabled={isLoading}
            className="w-full mb-6 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{term("⚡ Instant Demo Sign In")}</span>
            <NeonBadge label={term("1-Click")} variant="cyan" size="sm" />
          </motion.button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#0c0d13] text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              {mode === "login" ? term("Sign In with Credentials") : term("Register New Account")}
            </span>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{validationError || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Register mode) */}
            {mode === "register" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{term("Full Name")}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manas Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{term("Email Address")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@mangodl.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{term("Password")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role & Organization (Register mode) */}
            {mode === "register" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{term("Professional Role")}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0c0d13] border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                  >
                    <option value="Orchard Manager">{term("Orchard Manager")}</option>
                    <option value="Senior Agronomist">{term("Senior Agronomist")}</option>
                    <option value="Agricultural Researcher">{term("Agricultural Researcher")}</option>
                    <option value="Farm Owner">{term("Farm Owner")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{term("Organization / Farm Name")}</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="e.g. Karnataka Mango Development Board"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Remember & Forgot */}
            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300">
                  <input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-yellow-500 focus:ring-0" />
                  <span>{term("Remember session")}</span>
                </label>
                <a href="#forgot" className="text-yellow-400 hover:underline">{term("Forgot password?")}</a>
              </div>
            )}

            {/* Submit Button */}
            <GlowButton type="submit" variant="mango" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                term("Authenticating...")
              ) : mode === "login" ? (
                <>
                  {term("Sign In to Platform")} <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  {term("Create Account")} <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </GlowButton>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-gray-500">
            {term("Protected by MangoDL Neural Security v3.2")}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
