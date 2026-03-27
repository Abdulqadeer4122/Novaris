"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

interface Email {
  id: number;
  sender_name: string | null;
  sender_email: string;
  subject: string;
  snippet: string | null;
  is_unread: boolean;
  received_at: string;
}

type Filter = "all" | "unread";

const AVATAR_PALETTES = [
  { bg: "#1a1040", color: "#a78bfa" },
  { bg: "#0d1f3c", color: "#60a5fa" },
  { bg: "#0d2818", color: "#4ade80" },
  { bg: "#1f1500", color: "#fbbf24" },
  { bg: "#1f0d1a", color: "#f472b6" },
  { bg: "#0d1f1f", color: "#22d3ee" },
];

function avatarPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = () => {
    setLoading(true);
    fetch(`${API}/dashboard/emails`, { headers: authHeaders() as HeadersInit })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setEmails)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "unread" ? emails.filter((e) => e.is_unread) : emails;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0a0a0a" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold" style={{ color: "#e5e5e5" }}>Inbox</h1>
            <p className="text-[13px] mt-1" style={{ color: "#555" }}>Today&apos;s emails</p>
          </div>
          <button
            onClick={load}
            className="text-[12px] px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: "#111111",
              border: "1px solid #1f1f1f",
              color: "#888",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
          >
            Refresh
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 mb-4">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[12px] px-3 py-1 rounded-full transition-colors"
              style={
                filter === f
                  ? {
                      background: "linear-gradient(135deg, #c9a84c, #f0d060)",
                      color: "#1a1200",
                      fontWeight: 600,
                    }
                  : {
                      background: "transparent",
                      color: "#666",
                    }
              }
              onMouseEnter={(e) => {
                if (filter !== f) e.currentTarget.style.background = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                if (filter !== f) e.currentTarget.style.background = "transparent";
              }}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        {/* ── Email List ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
        >
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 animate-pulse"
                    style={{ background: "#1a1a1a" }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ background: "#1a1a1a", width: "33%" }}
                    />
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ background: "#1a1a1a", width: "60%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "#1a1a1a" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#333" strokeWidth="1.5">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 8l8 5 8-5"/>
                </svg>
              </div>
              <p className="text-[13px]" style={{ color: "#444" }}>No emails to show</p>
            </div>
          ) : (
            <ul>
              {filtered.map((email, i) => {
                const displayName = email.sender_name ?? email.sender_email;
                const initials = displayName.slice(0, 2).toUpperCase();
                const palette = avatarPalette(displayName);
                return (
                  <li
                    key={email.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors cursor-default"
                    style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                      style={{ background: palette.bg, color: palette.color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {email.is_unread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "#c9a84c" }}
                          />
                        )}
                        <span
                          className="text-[13px] truncate"
                          style={{
                            color: email.is_unread ? "#e5e5e5" : "#666",
                            fontWeight: email.is_unread ? 600 : 400,
                          }}
                        >
                          {displayName}
                        </span>
                        <span
                          className="text-[11px] ml-auto shrink-0"
                          style={{ color: "#444" }}
                        >
                          {fmtTime(email.received_at)}
                        </span>
                      </div>
                      <p
                        className="text-[12px] truncate mt-0.5"
                        style={{ color: email.is_unread ? "#bbb" : "#555" }}
                      >
                        {email.subject}
                      </p>
                      {email.snippet && (
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "#444" }}>
                          {email.snippet}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
