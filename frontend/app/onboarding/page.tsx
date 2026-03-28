"use client";

import { getToken } from "@/lib/auth";

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
      style={{ background: "#0A0E27" }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-[460px] mx-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 14,
          padding: "36px 40px",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
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
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 20, lineHeight: 1 }}>N</span>
          </div>
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "#F0F2F8",
              letterSpacing: "0.04em",
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            Novaris
          </h1>
          <p
            style={{
              fontSize: 10,
              color: "rgba(201,168,76,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            AI ASSISTANT
          </p>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 style={{ fontSize: 17, fontWeight: 400, color: "#F0F2F8", marginBottom: 8, fontFamily: "Georgia,serif", fontStyle: "italic" }}>
            Connect your Google account
          </h2>
          <p style={{ fontSize: 13, color: "rgba(240,242,248,0.6)", lineHeight: 1.6, fontFamily: "system-ui" }}>
            Novaris needs access to Gmail and Calendar to help you manage emails,
            schedule meetings, and stay on top of your day.
          </p>
        </div>

        {/* Permissions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {PERMISSIONS.map((p) => (
            <div
              key={p.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#F0F2F8", marginBottom: 2, fontFamily: "system-ui" }}>
                  {p.title}
                </p>
                <p style={{ fontSize: 12, color: "rgba(240,242,248,0.5)", fontFamily: "system-ui" }}>{p.desc}</p>
              </div>
              {/* Check mark */}
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="rgba(22,101,52,0.15)" stroke="rgba(22,101,52,0.4)" strokeWidth="1"/>
                  <path d="M5 8l2 2 4-4" stroke="#166534" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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
            padding: "12px",
            borderRadius: 8,
            background: "#C9A84C",
            color: "#0A0E27",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "background 0.15s",
            fontFamily: "system-ui",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#D4B86A"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C9A84C"; }}
        >
          {/* Google G icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#0A0E27" opacity="0.7"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#0A0E27" opacity="0.6"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#0A0E27" opacity="0.5"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#0A0E27" opacity="0.8"/>
          </svg>
          Connect Google Account
        </button>

        {/* Footer note */}
        <p style={{ marginTop: 16, fontSize: 11, color: "rgba(201,168,76,0.5)", textAlign: "center", lineHeight: 1.5 }}>
          You can revoke access at any time from your{" "}
          <span style={{ color: "rgba(240,242,248,0.4)" }}>Google account settings</span>
        </p>
      </div>
    </div>
  );
}
