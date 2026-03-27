"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders, getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

function NovarisMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="13" fill="url(#pCardGrad)" />
      <path d="M13 9L11 11L11 37L13 39" stroke="url(#pNGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 9L37 11L37 37L35 39" stroke="url(#pNGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 35L14 13L34 35L34 13" stroke="url(#pNGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 13L22 7Q24 4 26 7Z" fill="url(#pNGrad)" opacity="0.9"/>
      <defs>
        <linearGradient id="pCardGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1400"/>
          <stop offset="100%" stopColor="#0d0d00"/>
        </linearGradient>
        <linearGradient id="pNGrad" x1="11" y1="4" x2="37" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="100%" stopColor="#c9a84c"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [signOutHover, setSignOutHover] = useState(false);

  useEffect(() => {
    fetch(`${API}/auth/google/status`, { headers: authHeaders() as HeadersInit })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { google_connected: boolean }) => setGoogleConnected(d.google_connected))
      .catch(() => setGoogleConnected(false));
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  function connectGoogle() {
    const token = getToken();
    if (!token) return;
    window.location.href = `${API}/auth/google/connect?token=${encodeURIComponent(token)}`;
  }

  const SERVICES = [
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#c9a84c" strokeWidth="1.4">
          <rect x="1" y="2.5" width="14" height="11" rx="1.5"/>
          <path d="M1 5.5l7 4.5 7-4.5"/>
        </svg>
      ),
      label: "Gmail",
      desc: "Read and send emails",
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#c9a84c" strokeWidth="1.4">
          <rect x="1" y="2" width="14" height="13" rx="1.5"/>
          <path d="M1 7h14M5 1v2M11 1v2"/>
        </svg>
      ),
      label: "Google Calendar",
      desc: "View and create events",
    },
  ];

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "#0a0a0a" }}
    >
      <div className="min-h-full p-6 lg:p-8 max-w-xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3 mb-8">
          <NovarisMark />
          <div>
            <h1
              className="text-[16px] font-bold tracking-wider"
              style={{
                background: "linear-gradient(135deg, #f0d060 0%, #c9a84c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOVARIS
            </h1>
            <p style={{ fontSize: "11px", color: "#444", letterSpacing: "0.05em" }}>
              Account &amp; Profile
            </p>
          </div>
        </div>

        {/* ── Avatar card ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #111111 0%, #0f0f0f 100%)",
            border: "1px solid #1f1f1f",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          {/* Gold banner strip */}
          <div
            style={{
              height: "72px",
              background: "linear-gradient(135deg, #1a1400 0%, #221c00 50%, #1a1400 100%)",
              borderBottom: "1px solid #c9a84c20",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 80% 100% at 50% 0%, #c9a84c0a 0%, transparent 70%)",
              }}
            />
            {/* Subtle pattern lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.04,
                backgroundImage: "linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
                backgroundSize: "24px 100%",
              }}
            />
          </div>

          {/* Avatar + info */}
          <div style={{ padding: "0 24px 24px", position: "relative" }}>
            {/* Avatar circle — overlaps banner */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a1400 0%, #2d2400 100%)",
                border: "3px solid #c9a84c50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 700,
                color: "#c9a84c",
                marginTop: -34,
                boxShadow: "0 0 20px #c9a84c20",
                letterSpacing: "0.05em",
              }}
            >
              {initials}
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "17px", fontWeight: 600, color: "#e5e5e5", marginBottom: 3 }}>
                {user?.full_name ?? "—"}
              </p>
              <p style={{ fontSize: "13px", color: "#555" }}>{user?.email}</p>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 1,
                marginTop: 20,
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {[
                { label: "Plan", value: "Personal" },
                { label: "Status", value: "Active" },
                { label: "Google", value: googleConnected === null ? "…" : googleConnected ? "Connected" : "Not set" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    textAlign: "center",
                    borderRight: i < 2 ? "1px solid #1f1f1f" : "none",
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: 600, color: item.value === "Not set" ? "#ef4444" : item.value === "Active" || item.value === "Connected" ? "#22c55e" : "#e5e5e5" }}>
                    {item.value}
                  </p>
                  <p style={{ fontSize: "10px", color: "#444", marginTop: 2, letterSpacing: "0.04em" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Connected Services ── */}
        <div
          style={{
            background: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "14px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Connected Services
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SERVICES.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#0d0d0d",
                  border: "1px solid #1a1a1a",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "#c9a84c10",
                      border: "1px solid #c9a84c25",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#e5e5e5" }}>{s.label}</p>
                    <p style={{ fontSize: "11px", color: "#555", marginTop: 1 }}>{s.desc}</p>
                  </div>
                </div>

                {googleConnected === null ? (
                  <div style={{ width: 64, height: 20, background: "#1a1a1a", borderRadius: 99, animation: "pulse 2s infinite" }} />
                ) : googleConnected ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 99, padding: "4px 10px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#22c55e" }}>Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={connectGoogle}
                    style={{
                      background: "#c9a84c15",
                      border: "1px solid #c9a84c40",
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#c9a84c",
                      cursor: "pointer",
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Account actions ── */}
        <div
          style={{
            background: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Account
          </p>

          <button
            onClick={logout}
            onMouseEnter={() => setSignOutHover(true)}
            onMouseLeave={() => setSignOutHover(false)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: signOutHover ? "#ef444415" : "transparent",
              border: `1px solid ${signOutHover ? "#ef444430" : "#1a1a1a"}`,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s",
              color: signOutHover ? "#f87171" : "#666",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 500 }}>Sign out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
