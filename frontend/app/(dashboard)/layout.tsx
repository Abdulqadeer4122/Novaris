"use client";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden" style={{ background: "#F0F2F8" }}>
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">{children}</main>
      </div>
    </AuthGuard>
  );
}
