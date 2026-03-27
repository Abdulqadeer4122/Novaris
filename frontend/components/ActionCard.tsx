"use client";

import { useState } from "react";
import type { PendingAction } from "@/hooks/useChat";

interface Props {
  action: PendingAction;
  onResolve: (
    interruptId: string,
    threadId: string,
    decision: "approve" | "edit" | "reject",
    editedArgs?: Record<string, unknown>
  ) => void;
}

const TOOL_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  send_email: {
    label: "Send Email",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="2" width="12" height="10" rx="1.5"/>
        <path d="M1 4.5l6 4 6-4"/>
      </svg>
    ),
    color: "#c9a84c",
  },
  create_calendar_event: {
    label: "Create Calendar Event",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="2" width="12" height="11" rx="1.5"/>
        <path d="M1 6h12M4 1v2M10 1v2"/>
      </svg>
    ),
    color: "#c9a84c",
  },
};

function describeAction(action: PendingAction): string {
  const { tool, args } = action;
  if (tool === "send_email") {
    const to = (args.to as string[])?.join(", ") ?? "";
    const subject = (args.subject as string) ?? "";
    return `Send to ${to} — "${subject}"`;
  }
  if (tool === "create_calendar_event") {
    const title = (args.title as string) ?? "";
    const start = (args.start_time as string) ?? "";
    return `"${title}" at ${start}`;
  }
  return JSON.stringify(args);
}

export default function ActionCard({ action, onResolve }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedArgs, setEditedArgs] = useState(JSON.stringify(action.args, null, 2));
  const [parseError, setParseError] = useState(false);

  const meta = TOOL_META[action.tool] ?? {
    label: action.tool,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="6"/><path d="M7 4v4M7 10h.01"/>
      </svg>
    ),
    color: "#c9a84c",
  };

  const handleApprove = () =>
    onResolve(action.interrupt_id, action.thread_id, "approve");

  const handleReject = () =>
    onResolve(action.interrupt_id, action.thread_id, "reject");

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editedArgs);
      setParseError(false);
      onResolve(action.interrupt_id, action.thread_id, "edit", parsed);
    } catch {
      setParseError(true);
    }
  };

  return (
    <div className="flex justify-start">
      <div
        className="w-full max-w-[85%] rounded-2xl rounded-bl-sm overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1a1400 0%, #221c00 100%)",
          border: "1px solid #c9a84c50",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: "1px solid #c9a84c25" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#c9a84c18", color: "#c9a84c" }}
          >
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#c9a84c" }}
              >
                Approval Required
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "#c9a84c18", color: "#c9a84c" }}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-[13px] text-gray-300 truncate mt-0.5">{describeAction(action)}</p>
          </div>
        </div>

        {/* Args */}
        <div className="px-4 py-3">
          {!editing ? (
            <div
              className="rounded-xl px-3 py-2.5 font-mono text-[11.5px] overflow-auto"
              style={{
                background: "#0d0d0d",
                border: "1px solid #2a2a2a",
                color: "#c9a84c",
                maxHeight: 160,
              }}
            >
              <pre className="whitespace-pre-wrap">{JSON.stringify(action.args, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <textarea
                className="w-full font-mono text-[11.5px] rounded-xl px-3 py-2.5 outline-none resize-none"
                style={{
                  background: "#0d0d0d",
                  border: `1px solid ${parseError ? "#ef4444" : "#c9a84c50"}`,
                  color: "#c9a84c",
                  caretColor: "#c9a84c",
                }}
                rows={7}
                value={editedArgs}
                onChange={(e) => { setEditedArgs(e.target.value); setParseError(false); }}
                spellCheck={false}
              />
              {parseError && (
                <p className="text-[11px] text-red-400 mt-1">Invalid JSON — please fix before saving</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderTop: "1px solid #c9a84c20" }}
        >
          {/* Approve */}
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #f0d060)",
              color: "#1a1200",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5.5l2.5 2.5 4.5-4.5"/>
            </svg>
            Approve
          </button>

          {/* Edit / Save */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-80"
              style={{
                background: "#c9a84c15",
                border: "1px solid #c9a84c40",
                color: "#c9a84c",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 9h7M7.5 1.5a1.2 1.2 0 0 1 2 2L3 10 1 10.5.5 8.5z"/>
              </svg>
              Edit
            </button>
          ) : (
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-80"
              style={{
                background: "#c9a84c15",
                border: "1px solid #c9a84c40",
                color: "#c9a84c",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1.5 5.5l3 3 5-5"/>
              </svg>
              Save & Approve
            </button>
          )}

          {/* Reject */}
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-80 ml-auto"
            style={{
              background: "#ef444415",
              border: "1px solid #ef444430",
              color: "#f87171",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l7 7M9 2l-7 7"/>
            </svg>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
