"use client";

import { useState } from "react";
import type { SessionSummary } from "@/lib/api";

interface Props {
  sessions: SessionSummary[];
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  onNew: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function detectSessionTag(title: string): "finance" | "calendar" | "email" | null {
  const t = title.toLowerCase();
  if (/budget|expense|bill|money|spent|cost|pay|rupee|finance/.test(t)) return "finance";
  if (/meeting|calendar|schedule|event|standup|appointment/.test(t)) return "calendar";
  if (/email|send|reply|inbox|message|mail/.test(t)) return "email";
  return null;
}

const TAG_STYLES: Record<string, { background: string; color: string; label: string }> = {
  finance:  { background: "rgba(201,168,76,0.12)", color: "#B45309", label: "Finance" },
  calendar: { background: "rgba(10,14,39,0.06)",   color: "#0A0E27", label: "Calendar" },
  email:    { background: "rgba(22,101,52,0.08)",   color: "#166534", label: "Email" },
};

export default function SessionSidebar({ sessions, activeThreadId, onSelect, onNew }: Props) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = search.trim()
    ? sessions.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : sessions;

  return (
    <aside
      style={{
        width: 280,
        minWidth: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderRight: "0.5px solid rgba(10,14,39,0.08)",
      }}
    >
      {/* Top: New Chat + Search */}
      <div style={{ padding: 16, borderBottom: "0.5px solid rgba(10,14,39,0.06)" }}>
        {/* New Chat button */}
        <button
          onClick={onNew}
          style={{
            width: "100%",
            padding: 10,
            background: "#0A0E27",
            color: "#C9A84C",
            fontFamily: "system-ui",
            fontWeight: 700,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#141830"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#0A0E27"; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New Chat
        </button>

        {/* Search input */}
        <div style={{ position: "relative", marginTop: 10 }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="5" cy="5" r="3.5"/>
            <path d="M7.5 7.5L10 10" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%",
              paddingLeft: 30,
              paddingRight: 10,
              paddingTop: 7,
              paddingBottom: 7,
              background: "#F8F7F4",
              border: searchFocused ? "0.5px solid #C9A84C" : "0.5px solid rgba(10,14,39,0.12)",
              borderRadius: 7,
              fontSize: 11,
              color: "#0A0E27",
              fontFamily: "system-ui",
              outline: "none",
              boxShadow: searchFocused ? "0 0 0 2px rgba(201,168,76,0.12)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Session list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(10,14,39,0.1) transparent",
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#9CA3AF",
            padding: "12px 16px 5px",
            fontFamily: "system-ui",
          }}
        >
          {search.trim() ? "Results" : "Recent"}
        </p>

        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F0F2F8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9CA3AF" strokeWidth="1.4">
                <path d="M2 10V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6l-2-1.5H3L2 10z"/>
              </svg>
            </div>
            <p style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui" }}>
              {search.trim() ? "No matching chats" : "No previous chats"}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: "0 8px" }}>
            {filtered.map((s) => {
              const isActive = s.thread_id === activeThreadId;
              const tag = detectSessionTag(s.title);
              const tagStyle = tag ? TAG_STYLES[tag] : null;

              return (
                <li key={s.thread_id} style={{ marginBottom: 2 }}>
                  <button
                    onClick={() => onSelect(s.thread_id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 10px",
                      borderRadius: isActive ? "0 8px 8px 0" : 8,
                      borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                      background: isActive ? "#F5EDD6" : "transparent",
                      cursor: "pointer",
                      border: "none",
                      borderLeftWidth: 2,
                      borderLeftStyle: "solid",
                      borderLeftColor: isActive ? "#C9A84C" : "transparent",
                      display: "block",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#F8F7F4";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isActive ? "#0A0E27" : "#0A0E27",
                        fontFamily: "system-ui",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.title}
                    </p>

                    {/* Meta row: time + tag */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}>
                        {timeAgo(s.last_active_at)}
                      </span>
                      {tagStyle && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 99,
                            background: tagStyle.background,
                            color: tagStyle.color,
                            fontFamily: "system-ui",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {tagStyle.label}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 12px", borderTop: "0.5px solid rgba(10,14,39,0.08)" }}>
        <p style={{ textAlign: "center", fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}>
          Shift + Enter for new line
        </p>
      </div>
    </aside>
  );
}
