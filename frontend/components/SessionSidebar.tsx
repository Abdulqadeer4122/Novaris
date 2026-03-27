"use client";

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

export default function SessionSidebar({ sessions, activeThreadId, onSelect, onNew }: Props) {
  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full"
      style={{ background: "#0d0d0d", borderRight: "1px solid #1f1f1f" }}
    >
      {/* New session */}
      <div className="p-3" style={{ borderBottom: "1px solid #1f1f1f" }}>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #c9a84c18, #c9a84c10)",
            border: "1px solid #c9a84c40",
            color: "#c9a84c",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 1v10M1 6h10"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "#1a1a1a" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#555" strokeWidth="1.4">
                <path d="M2 10V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6l-2-1.5H3L2 10z"/>
              </svg>
            </div>
            <p className="text-[12px] text-gray-600">No previous chats</p>
          </div>
        ) : (
          <ul className="space-y-0.5 px-2">
            {sessions.map((s) => {
              const isActive = s.thread_id === activeThreadId;
              return (
                <li key={s.thread_id}>
                  <button
                    onClick={() => onSelect(s.thread_id)}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition-all group"
                    style={{
                      background: isActive ? "#c9a84c15" : "transparent",
                      border: isActive ? "1px solid #c9a84c30" : "1px solid transparent",
                    }}
                  >
                    <p
                      className="text-[12.5px] truncate leading-tight"
                      style={{ color: isActive ? "#e8c96a" : "#9a9a9a" }}
                    >
                      {s.title}
                    </p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: "#444" }}>
                      {timeAgo(s.last_active_at)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2.5" style={{ borderTop: "1px solid #1a1a1a" }}>
        <p className="text-[10px] text-center" style={{ color: "#333" }}>
          Shift + Enter for new line
        </p>
      </div>
    </aside>
  );
}
