"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSessionMessages,
  fetchSessions,
  streamChat,
  streamResume,
  type SessionSummary,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

export interface PendingAction {
  interrupt_id: string;
  thread_id: string;
  tool: string;
  args: Record<string, unknown>;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const threadId = useRef<string>(crypto.randomUUID());

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Load sessions list from the backend — no-op if not authenticated
  const refreshSessions = useCallback(async () => {
    if (!getToken()) return;
    try {
      const list = await fetchSessions();
      setSessions(list);
    } catch {
      // silently ignore — sessions are non-critical
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Load a previous session's message history into the chat window
  const loadSession = useCallback(async (tid: string) => {
    try {
      const history = await fetchSessionMessages(tid);
      setMessages(history);
      setPendingActions([]);
      threadId.current = tid;
      setActiveThreadId(tid);
    } catch (err) {
      addMessage({
        role: "error",
        content: err instanceof Error ? err.message : "Failed to load session",
      });
    }
  }, [addMessage]);

  // Start a fresh session
  const newSession = useCallback(() => {
    threadId.current = crypto.randomUUID();
    setActiveThreadId(null);
    setMessages([]);
    setPendingActions([]);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      addMessage({ role: "user", content: text });
      const tid = threadId.current;
      let assistantBuffer = "";

      streamChat(
        text,
        tid,
        (event) => {
          const type = event.type as string;

          if (type === "thread_id") {
            // Backend may have assigned a new thread_id (e.g. first message)
            const assignedTid = event.thread_id as string;
            if (assignedTid !== threadId.current) {
              threadId.current = assignedTid;
            }
            setActiveThreadId(assignedTid);
          } else if (type === "token") {
            assistantBuffer += event.data as string;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, content: assistantBuffer }];
              }
              return [...prev, { role: "assistant", content: assistantBuffer }];
            });
          } else if (type === "interrupt") {
            setPendingActions((prev) => [
              ...prev,
              {
                interrupt_id: event.id as string,
                thread_id: threadId.current,
                tool: event.tool as string,
                args: (event.args as Record<string, unknown>) ?? {},
              },
            ]);
          } else if (type === "reset") {
            threadId.current = event.new_thread_id as string;
            setActiveThreadId(null);
            setPendingActions([]);
            addMessage({
              role: "error",
              content:
                (event.message as string) ??
                "Conversation was reset due to a state error. Please resend your message.",
            });
          } else if (type === "error") {
            addMessage({ role: "error", content: event.data as string });
          } else if (type === "done") {
            refreshSessions();
          }
        },
        (err) => addMessage({ role: "error", content: err.message })
      );
    },
    [addMessage, refreshSessions]
  );

  const resolveAction = useCallback(
    (
      interruptId: string,
      interruptThreadId: string,
      decision: "approve" | "edit" | "reject",
      editedArgs?: Record<string, unknown>
    ) => {
      setPendingActions((prev) =>
        prev.filter((a) => a.interrupt_id !== interruptId)
      );

      let assistantBuffer = "";

      streamResume(
        {
          interrupt_id: interruptId,
          thread_id: interruptThreadId,
          decision,
          edited_args: editedArgs,
        },
        (event) => {
          const type = event.type as string;

          if (type === "token") {
            assistantBuffer += event.data as string;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, content: assistantBuffer }];
              }
              return [...prev, { role: "assistant", content: assistantBuffer }];
            });
          } else if (type === "interrupt") {
            setPendingActions((prev) => [
              ...prev,
              {
                interrupt_id: event.id as string,
                thread_id: interruptThreadId,
                tool: event.tool as string,
                args: (event.args as Record<string, unknown>) ?? {},
              },
            ]);
          } else if (type === "reset") {
            threadId.current = event.new_thread_id as string;
            setActiveThreadId(null);
            setPendingActions([]);
            addMessage({
              role: "error",
              content:
                (event.message as string) ??
                "Conversation was reset. Please resend your message.",
            });
          } else if (type === "error") {
            addMessage({ role: "error", content: event.data as string });
          } else if (type === "done") {
            refreshSessions();
          }
        },
        (err) => addMessage({ role: "error", content: err.message })
      );
    },
    [addMessage, refreshSessions]
  );

  return {
    messages,
    pendingActions,
    sessions,
    activeThreadId,
    sendMessage,
    resolveAction,
    loadSession,
    newSession,
    refreshSessions,
    threadId: threadId.current,
  };
}
