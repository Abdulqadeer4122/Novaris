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
      <div className="flex flex-col flex-1 min-w-0 min-h-0" style={{ background: "#0a0a0a" }}>
        {/* Header */}
        <header
          className="shrink-0 flex items-center px-6 py-4"
          style={{ background: "#0d0d0d", borderBottom: "1px solid #1f1f1f" }}
        >
          <div>
            <h1
              className="text-[18px] font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOVARIS
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: "#444" }}>
              Gmail · Google Calendar · Finance
            </p>
          </div>
        </header>

        {/* Chat — fills remaining height */}
        <ChatWindow
          messages={messages}
          pendingActions={pendingActions}
          onResolve={resolveAction}
        />

        <InputBar onSend={sendMessage} />
      </div>
    </div>
  );
}
