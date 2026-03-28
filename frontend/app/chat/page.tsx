"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import ChatWindow from "@/components/ChatWindow";
import InputBar from "@/components/InputBar";
import SessionSidebar from "@/components/SessionSidebar";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const [dark, setDark] = useState(false);
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
    <AuthGuard>
    <div>
      <div className="flex h-screen" style={{ background: "#F0F2F8" }}>
        {/* Session history sidebar */}
        <SessionSidebar
          sessions={sessions}
          activeThreadId={activeThreadId}
          onSelect={loadSession}
          onNew={newSession}
        />

        {/* Main chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ background: "#FFFFFF", borderBottom: "0.5px solid rgba(10,14,39,0.08)" }}
          >
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
                Personal Assistant
              </h1>
              <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}>
                Gmail · Google Calendar
              </p>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{
                border: "0.5px solid rgba(10,14,39,0.15)",
                color: "#6B7280",
                background: "#FFFFFF",
                fontFamily: "system-ui",
              }}
            >
              {dark ? "Light" : "Dark"}
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <ChatWindow
              messages={messages}
              pendingActions={pendingActions}
              onResolve={resolveAction}
            />
          </div>

          {/* Input */}
          <InputBar onSend={sendMessage} />
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
