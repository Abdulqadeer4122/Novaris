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
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-white dark:bg-gray-950 transition-colors">
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
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gmail · Google Calendar
              </p>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {dark ? "☀ Light" : "☾ Dark"}
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
