"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message, PendingAction } from "@/hooks/useChat";
import ActionCard from "./ActionCard";

interface Props {
  messages: Message[];
  pendingActions: PendingAction[];
  onResolve: (
    interruptId: string,
    threadId: string,
    decision: "approve" | "edit" | "reject",
    editedArgs?: Record<string, unknown>
  ) => void;
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  { label: "Finance", color: "#B45309", text: "Summarise my spending this month" },
  { label: "Calendar", color: "#0A0E27", text: "What meetings do I have today?" },
  { label: "Email", color: "#166534", text: "Any urgent emails needing reply?" },
  { label: "Bills", color: "#B45309", text: "What bills are due this week?" },
] as const;

/** Novaris avatar circle — gold "N" */
function NovarisAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px solid #C9A84C",
        background: "rgba(201,168,76,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: size * 0.46, lineHeight: 1 }}>N</span>
    </div>
  );
}

/** User avatar circle */
function UserAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0A0E27",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#C9A84C", fontSize: 10, fontWeight: 700, fontFamily: "system-ui" }}>Me</span>
    </div>
  );
}

/** Beautiful animated waiting indicator — shown while AI is responding */
function WaitingIndicator() {

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      {/* Spinning arc avatar */}
      <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0, marginTop: 2 }}>
        {/* Rotating gold arc */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            animation: "novarisSpinArc 1.6s linear infinite",
            pointerEvents: "none",
          }}
        >
          <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle
              cx="22" cy="22" r="20"
              stroke="url(#arcGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="44 88"
            />
          </svg>
        </div>
        {/* N circle */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid #C9A84C",
            background: "rgba(201,168,76,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 15, lineHeight: 1 }}>N</span>
        </div>
      </div>

      {/* Bubble — dots only */}
      <div
        style={{
          background: "#FFFFFF",
          border: "0.5px solid rgba(10,14,39,0.07)",
          borderRadius: "0 10px 10px 10px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: i % 2 === 0 ? 5 : 3.5,
              height: i % 2 === 0 ? 5 : 3.5,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#C9A84C" : "#0A0E27",
              animation: "novarisWaveDot 1.3s ease-in-out infinite",
              animationDelay: `${i * 0.11}s`,
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes novarisSpinArc {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes novarisWaveDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.75; }
          30%           { transform: translateY(-5px); opacity: 1;    }
        }
      `}</style>
    </div>
  );
}

/** Renders markdown with Novaris-themed prose styles */
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={{ color: "#0A0E27" }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic" style={{ color: "#6B7280" }}>{children}</em>
        ),
        h1: ({ children }) => (
          <h1 className="text-[15px] font-bold mb-2 mt-3 first:mt-0" style={{ color: "#0A0E27", fontFamily: "Georgia,serif" }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[14px] font-semibold mb-1.5 mt-3 first:mt-0" style={{ color: "#0A0E27", fontFamily: "Georgia,serif" }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[13px] font-semibold mb-1 mt-2 first:mt-0" style={{ color: "#0A0E27" }}>{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 space-y-1 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 space-y-1 pl-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-[13px]">
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: "#C9A84C" }} />
            <span>{children}</span>
          </li>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code
                className="block rounded-lg px-3 py-2.5 text-[12px] font-mono overflow-x-auto my-2 whitespace-pre"
                style={{ background: "#F8F7F4", border: "0.5px solid rgba(10,14,39,0.1)", color: "#0A0E27" }}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded px-1.5 py-0.5 text-[12px] font-mono"
              style={{ background: "#F8F7F4", border: "0.5px solid rgba(10,14,39,0.1)", color: "#0A0E27" }}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <div className="my-2">{children}</div>,
        blockquote: ({ children }) => (
          <blockquote className="italic my-2" style={{ borderLeft: "2px solid #C9A84C", paddingLeft: 12, color: "#6B7280" }}>
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:opacity-70"
            style={{ color: "#C9A84C" }}
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-3" style={{ borderColor: "rgba(10,14,39,0.08)" }} />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-[12px] w-full border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className="px-3 py-1.5 text-left font-semibold"
            style={{ border: "0.5px solid rgba(10,14,39,0.1)", color: "#0A0E27", background: "#F8F7F4" }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="px-3 py-1.5"
            style={{ border: "0.5px solid rgba(10,14,39,0.1)", color: "#6B7280" }}
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function ChatWindow({ messages, pendingActions, onResolve, onSuggestion }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingActions]);

  const isEmpty = messages.length === 0 && pendingActions.length === 0;

  const lastMsg = messages[messages.length - 1];
  // Show waiting indicator between the user's message and the first assistant token
  const isWaiting = lastMsg?.role === "user" && pendingActions.length === 0;

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto"
      style={{
        background: "#F0F2F8",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(10,14,39,0.1) transparent",
      }}
    >
      <div className="max-w-2xl mx-auto px-7 py-6 space-y-4">

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-16 text-center select-none">
            {/* Large logo */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "1.5px solid #C9A84C",
                background: "rgba(201,168,76,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 22, lineHeight: 1 }}>N</span>
            </div>

            <p style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 400, color: "#0A0E27", marginBottom: 6 }}>
              How can I help you today?
            </p>
            <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#9CA3AF", maxWidth: 280, lineHeight: 1.6, marginBottom: 16 }}>
              Ask me about emails, calendar events, finances, or anything else.
            </p>

            {/* Suggestion cards — 2×2 grid */}
            {onSuggestion && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  maxWidth: 440,
                  width: "100%",
                }}
              >
                {SUGGESTIONS.map(({ label, color, text }) => (
                  <button
                    key={label}
                    onClick={() => onSuggestion(text)}
                    style={{
                      padding: "10px 14px",
                      background: "#FFFFFF",
                      border: "0.5px solid rgba(10,14,39,0.08)",
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C";
                      (e.currentTarget as HTMLButtonElement).style.background = "#FFFDF7";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(10,14,39,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                    }}
                  >
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color, fontFamily: "system-ui", marginBottom: 4 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4, fontFamily: "system-ui" }}>
                      {text}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Messages ── */}
        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} className="flex justify-end items-end gap-2">
                <div
                  style={{
                    maxWidth: "78%",
                    background: "#0A0E27",
                    color: "#F0F2F8",
                    borderRadius: "10px 0 10px 10px",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.65,
                    fontFamily: "system-ui",
                  }}
                >
                  {msg.content}
                </div>
                <UserAvatar />
              </div>
            );
          }

          if (msg.role === "error") {
            return (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(153,27,27,0.08)",
                    border: "0.5px solid rgba(153,27,27,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#991B1B" strokeWidth="1.5">
                    <circle cx="6" cy="6" r="5"/>
                    <path d="M6 3.5v3M6 8.5h.01"/>
                  </svg>
                </div>
                <div
                  style={{
                    background: "rgba(153,27,27,0.06)",
                    border: "0.5px solid rgba(153,27,27,0.15)",
                    borderRadius: "0 10px 10px 10px",
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#991B1B",
                    fontFamily: "system-ui",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          /* assistant */
          return (
            <div key={i} className="flex items-start gap-2.5">
              <NovarisAvatar />
              <div
                style={{
                  maxWidth: "78%",
                  background: "#FFFFFF",
                  border: "0.5px solid rgba(10,14,39,0.07)",
                  borderRadius: "0 10px 10px 10px",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#0A0E27",
                  lineHeight: 1.65,
                  fontFamily: "system-ui",
                }}
              >
                <MarkdownContent content={msg.content} />
              </div>
            </div>
          );
        })}

        {/* ── Waiting indicator (between user msg and first token) ── */}
        {isWaiting && <WaitingIndicator />}

        {/* ── HITL Action cards ── */}
        {pendingActions.map((action) => (
          <ActionCard key={action.interrupt_id} action={action} onResolve={onResolve} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
