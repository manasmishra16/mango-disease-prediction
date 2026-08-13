"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check direct localStorage session as instant fallback
    try {
      const raw = localStorage.getItem("mangodl-auth-session");
      if (raw && raw.includes('"isAuthenticated":true')) {
        setHasSession(true);
      }
    } catch (e) {
      console.warn("Storage check notice:", e);
    }
    checkAuth();
  }, [checkAuth]);

  if (!mounted) {
    return null;
  }

  const isUserAuthed = isAuthenticated || hasSession;

  if (!isUserAuthed) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center space-y-6" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-white font-display text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-400 text-sm">
              Please sign in to access the MangoDL AI Agriculture Intelligence Dashboard.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/login">
              <GlowButton variant="mango" className="w-full" type="button">
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </GlowButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
