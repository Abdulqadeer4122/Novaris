"use client";
import ChatWindow from "@/components/ChatWindow";
import InputBar from "@/components/InputBar";
import SessionSidebar from "@/components/SessionSidebar";
import { useChat } from "@/hooks/useChat";

export default function AssistantPage() {
  const {
    messages,
    pendingActions,
    sessions,
    activeThreadId,
    sendMessage,
    resolveAction,
    loadSession,
    newSession,
  } = useChat();

  return (
    <div className="flex flex-1 min-h-0 h-full">
      <SessionSidebar
        sessions={sessions}
        activeThreadId={activeThreadId}
        onSelect={loadSession}
        onNew={newSession}
      />

      <div className="flex flex-col flex-1 min-w-0 min-h-0" style={{ background: "#F0F2F8" }}>
        {/* Header */}
        <header
          className="shrink-0 flex items-center gap-3 px-6 py-4"
          style={{ background: "#FFFFFF", borderBottom: "0.5px solid rgba(10,14,39,0.07)" }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1.5px solid #C9A84C",
              background: "rgba(201,168,76,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 14, lineHeight: 1 }}>N</span>
          </div>

          {/* Title + subtitle */}
          <div>
            <h1 style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 16, color: "#0A0E27", fontWeight: 400, margin: 0 }}>
              Novaris
            </h1>
            <p style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui", marginTop: 1, letterSpacing: "0.02em" }}>
              Gmail · Google Calendar · Finance
            </p>
          </div>

          {/* Service tags */}
          <div className="flex items-center gap-1.5 ml-auto">
            {(["Gmail", "Calendar", "Finance"] as const).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: "rgba(10,14,39,0.05)",
                  color: "#6B7280",
                  fontFamily: "system-ui",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Chat area — fills remaining height */}
        <ChatWindow
          messages={messages}
          pendingActions={pendingActions}
          onResolve={resolveAction}
          onSuggestion={sendMessage}
        />

        <InputBar onSend={sendMessage} />
      </div>
    </div>
  );
}
