"use client";

import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/app/auth-guard";
import { AIAgentWidget } from "@/components/dashboard/ai-agent-widget";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <AIAgentWidget />
        <MobileBottomNav />
        <div className="pointer-events-none fixed inset-0 z-0">
          <div
            className="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
              filter: "blur(88px)",
            }}
          />
          <div
            className="absolute bottom-8 right-0 h-[320px] w-[320px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
              filter: "blur(88px)",
            }}
          />
        </div>

        <div className="relative z-20 shrink-0">
          <Sidebar />
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
