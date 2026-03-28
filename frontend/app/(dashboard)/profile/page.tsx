"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders, getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

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
      style={{ background: "#F0F2F8" }}
    >
      <div className="min-h-full p-6 lg:p-8 max-w-xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid #C9A84C",
              background: "rgba(201,168,76,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 18, lineHeight: 1 }}>N</span>
          </div>
          <div>
            <h1
              style={{
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "#0A0E27",
                fontWeight: 400,
              }}
            >
              Novaris
            </h1>
            <p style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "system-ui" }}>
              Account &amp; Profile
            </p>
          </div>
        </div>

        {/* ── Avatar card ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(10,14,39,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 14,
            padding: 18,
          }}
        >
          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                border: "2px solid #C9A84C",
                background: "rgba(201,168,76,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                fontSize: 18,
                color: "#C9A84C",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 16, color: "#0A0E27", fontWeight: 400 }}>
                {user?.full_name ?? "—"}
              </p>
              <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}>{user?.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginTop: 16,
              background: "#F8F7F4",
              border: "0.5px solid rgba(10,14,39,0.08)",
              borderRadius: 8,
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
                  padding: "10px 8px",
                  textAlign: "center",
                  borderRight: i < 2 ? "0.5px solid rgba(10,14,39,0.08)" : "none",
                }}
              >
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.value === "Not set" ? "#991B1B" : item.value === "Active" || item.value === "Connected" ? "#166534" : "#0A0E27",
                  fontFamily: "system-ui",
                }}>
                  {item.value}
                </p>
                <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2, letterSpacing: "0.04em", fontFamily: "system-ui" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Connected Services ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(10,14,39,0.08)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#9CA3AF",
              textTransform: "uppercase",
              marginBottom: 14,
              fontFamily: "system-ui",
            }}
          >
            Connected Services
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SERVICES.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#F8F7F4",
                  border: "0.5px solid rgba(10,14,39,0.06)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(201,168,76,0.08)",
                      border: "0.5px solid rgba(201,168,76,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0A0E27", fontFamily: "system-ui" }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1, fontFamily: "system-ui" }}>{s.desc}</p>
                  </div>
                </div>

                {googleConnected === null ? (
                  <div style={{ width: 64, height: 20, background: "#F0F2F8", borderRadius: 99, animation: "pulse 2s infinite" }} />
                ) : googleConnected ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(22,101,52,0.08)", border: "none", borderRadius: 99, padding: "4px 10px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#166534" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#166534", fontFamily: "system-ui" }}>Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={connectGoogle}
                    style={{
                      background: "#C9A84C",
                      border: "none",
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#0A0E27",
                      cursor: "pointer",
                      fontFamily: "system-ui",
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
            background: "#FFFFFF",
            border: "0.5px solid rgba(10,14,39,0.08)",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#9CA3AF",
              textTransform: "uppercase",
              marginBottom: 14,
              fontFamily: "system-ui",
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
              background: signOutHover ? "#141830" : "#0A0E27",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              transition: "background 0.15s",
              color: "#C9A84C",
              fontFamily: "system-ui",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6"/>
            </svg>
            <span>Sign out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
