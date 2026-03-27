"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";

function NovarisMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="14" fill="url(#cardGradR)" />
      <path d="M13 9L11 11L11 37L13 39" stroke="url(#nGradR)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 9L37 11L37 37L35 39" stroke="url(#nGradR)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 35L14 13L34 35L34 13" stroke="url(#nGradR)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 13L22 7Q24 4 26 7Z" fill="url(#nGradR)" opacity="0.9"/>
      <defs>
        <linearGradient id="cardGradR" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1400"/>
          <stop offset="100%" stopColor="#0d0d00"/>
        </linearGradient>
        <linearGradient id="nGradR" x1="11" y1="4" x2="37" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="100%" stopColor="#c9a84c"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { detail?: string }).detail ?? "Registration failed");
      return;
    }

    const data = await res.json();
    saveToken(data.access_token);
    router.replace("/onboarding");
  }

  const inputStyle = (field: string) => ({
    width: "100%",
    background: "#0d0d0d",
    border: `1px solid ${focused === field ? "#c9a84c" : "#222"}`,
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#e5e5e5",
    outline: "none",
    caretColor: "#c9a84c",
    transition: "border-color 0.15s",
    boxShadow: focused === field ? "0 0 0 3px #c9a84c12" : "none",
  });

  if (loading) return <LoadingScreen message="Creating your account…" />;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, #c9a84c0d 0%, transparent 70%)",
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[420px] mx-4 my-8"
        style={{
          background: "linear-gradient(160deg, #111111 0%, #0d0d0d 100%)",
          border: "1px solid #222",
          borderRadius: "24px",
          padding: "40px 36px",
          boxShadow: "0 0 80px #c9a84c08, 0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top gold line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "120px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #c9a84c60, transparent)",
          }}
        />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4" style={{ filter: "drop-shadow(0 4px 24px #c9a84c30)" }}>
            <NovarisMark size={52} />
          </div>
          <h1
            className="text-[26px] font-bold tracking-wider"
            style={{
              background: "linear-gradient(135deg, #f0d060 0%, #c9a84c 50%, #e8c060 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NOVARIS
          </h1>
          <p
            className="text-[10px] tracking-[0.3em] uppercase mt-1"
            style={{ color: "#4a4a4a" }}
          >
            AI Assistant
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "28px" }} />

        <p className="text-[13px] mb-6" style={{ color: "#666", textAlign: "center" }}>
          Create your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              style={inputStyle("name")}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              EMAIL
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
              style={inputStyle("email")}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
              style={inputStyle("password")}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#ef444415",
                border: "1px solid #ef444430",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "12px",
              background: loading
                ? "#2a2a2a"
                : "linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%)",
              color: loading ? "#555" : "#1a1200",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.03em",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#444", textAlign: "center" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#c9a84c", textDecoration: "none", fontWeight: 600 }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
