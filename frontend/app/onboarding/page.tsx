"use client";

import { getToken } from "@/lib/auth";

function NovarisMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="14" fill="url(#cardGradO)" />
      <path d="M13 9L11 11L11 37L13 39" stroke="url(#nGradO)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 9L37 11L37 37L35 39" stroke="url(#nGradO)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 35L14 13L34 35L34 13" stroke="url(#nGradO)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 13L22 7Q24 4 26 7Z" fill="url(#nGradO)" opacity="0.9"/>
      <defs>
        <linearGradient id="cardGradO" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1400"/>
          <stop offset="100%" stopColor="#0d0d00"/>
        </linearGradient>
        <linearGradient id="nGradO" x1="11" y1="4" x2="37" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="100%" stopColor="#c9a84c"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const PERMISSIONS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c9a84c" strokeWidth="1.4">
        <rect x="1" y="2.5" width="14" height="11" rx="1.5"/>
        <path d="M1 5.5l7 4.5 7-4.5"/>
      </svg>
    ),
    title: "Gmail",
    desc: "Read, compose, and send emails on your behalf",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c9a84c" strokeWidth="1.4">
        <rect x="1" y="2" width="14" height="13" rx="1.5"/>
        <path d="M1 7h14M5 1v2M11 1v2"/>
      </svg>
    ),
    title: "Google Calendar",
    desc: "Check your availability and create new events",
  },
];

export default function OnboardingPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  function connectGoogle() {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return; }
    window.location.href = `${apiUrl}/auth/google/connect?token=${encodeURIComponent(token)}`;
  }

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
        className="relative w-full max-w-[460px] mx-4"
        style={{
          background: "linear-gradient(160deg, #111111 0%, #0d0d0d 100%)",
          border: "1px solid #222",
          borderRadius: "24px",
          padding: "44px 40px",
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

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#e5e5e5", marginBottom: "8px" }}>
            Connect your Google account
          </h2>
          <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
            Novaris needs access to Gmail and Calendar to help you manage emails,
            schedule meetings, and stay on top of your day.
          </p>
        </div>

        {/* Permissions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
          {PERMISSIONS.map((p) => (
            <div
              key={p.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "#c9a84c12",
                  border: "1px solid #c9a84c25",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#e5e5e5", marginBottom: "2px" }}>
                  {p.title}
                </p>
                <p style={{ fontSize: "12px", color: "#555" }}>{p.desc}</p>
              </div>
              {/* Check mark */}
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#22c55e18" stroke="#22c55e40" strokeWidth="1"/>
                  <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Connect button */}
        <button
          onClick={connectGoogle}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%)",
            color: "#1a1200",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.03em",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {/* Google G icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1a1200" opacity="0.7"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1a1200" opacity="0.6"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#1a1200" opacity="0.5"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1a1200" opacity="0.8"/>
          </svg>
          Connect Google Account
        </button>

        {/* Footer note */}
        <p style={{ marginTop: "16px", fontSize: "11px", color: "#333", textAlign: "center", lineHeight: "1.5" }}>
          You can revoke access at any time from your{" "}
          <span style={{ color: "#555" }}>Google account settings</span>
        </p>
      </div>
    </div>
  );
}
