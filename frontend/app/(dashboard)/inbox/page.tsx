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
  const unreadCount = emails.filter((e) => e.is_unread).length;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#F0F2F8" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1
              style={{
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                fontSize: 22,
                color: "#0A0E27",
                fontWeight: 400,
              }}
            >
              Inbox
            </h1>
            <p
              className="mt-1 uppercase tracking-widest"
              style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}
            >
              Today&apos;s emails
            </p>
            <div style={{ width: 40, height: 1.5, background: "#C9A84C", marginTop: 6 }} />
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
              >
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={load}
              className="text-[12px] px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(10,14,39,0.15)",
                color: "#6B7280",
                fontFamily: "system-ui",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F2F8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 mb-4">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[12px] px-3 py-1 rounded-lg transition-colors"
              style={
                filter === f
                  ? {
                      background: "#0A0E27",
                      color: "#C9A84C",
                      fontWeight: 700,
                      border: "none",
                      fontFamily: "system-ui",
                    }
                  : {
                      background: "#FFFFFF",
                      color: "#6B7280",
                      fontFamily: "system-ui",
                      border: "0.5px solid rgba(10,14,39,0.08)",
                    }
              }
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        {/* ── Email List ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)", borderRadius: 12 }}
        >
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 animate-pulse"
                    style={{ background: "#F0F2F8" }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ background: "#F0F2F8", width: "33%" }}
                    />
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ background: "#F0F2F8", width: "60%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "#F0F2F8" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 8l8 5 8-5"/>
                </svg>
              </div>
              <p className="text-[13px]" style={{ color: "#6B7280" }}>No emails to show</p>
            </div>
          ) : (
            <ul>
              {filtered.map((email, i) => {
                const displayName = email.sender_name ?? email.sender_email;
                const initials = displayName.slice(0, 2).toUpperCase();
                return (
                  <li
                    key={email.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors cursor-default"
                    style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F7F4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                      style={{ background: "rgba(10,14,39,0.07)", color: "#0A0E27" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {email.is_unread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "#C9A84C" }}
                          />
                        )}
                        <span
                          className="text-[12px] truncate"
                          style={{
                            color: "#0A0E27",
                            fontWeight: email.is_unread ? 600 : 400,
                            fontFamily: "system-ui",
                          }}
                        >
                          {displayName}
                        </span>
                        <span
                          className="text-[10px] ml-auto shrink-0"
                          style={{ color: "#9CA3AF", fontFamily: "system-ui" }}
                        >
                          {fmtTime(email.received_at)}
                        </span>
                      </div>
                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: "#6B7280", fontFamily: "system-ui" }}
                      >
                        {email.subject}
                      </p>
                      {email.snippet && (
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "#9CA3AF", fontFamily: "system-ui" }}>
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
