import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

type SseEvent = Record<string, unknown>;
type SseErrorHandler = (err: Error) => void;

/** Shared SSE reader — used by both /chat and /chat/resume */
function streamPost(
  url: string,
  body: Record<string, unknown>,
  onEvent: (event: SseEvent) => void,
  onError: SseErrorHandler
): () => void {
  const controller = new AbortController();

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (res) => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              onEvent(JSON.parse(line.slice(6)));
            } catch {
              // skip malformed lines
            }
          }
        }
      }
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.name !== "AbortError") onError(err);
    });

  return () => controller.abort();
}

export function streamChat(
  message: string,
  threadId: string,
  onEvent: (event: SseEvent) => void,
  onError: SseErrorHandler
): () => void {
  return streamPost(`${API}/chat`, { message, thread_id: threadId }, onEvent, onError);
}

export function streamResume(
  payload: {
    interrupt_id: string;
    thread_id: string;
    decision: "approve" | "edit" | "reject";
    edited_args?: Record<string, unknown>;
  },
  onEvent: (event: SseEvent) => void,
  onError: SseErrorHandler
): () => void {
  return streamPost(`${API}/chat/resume`, payload, onEvent, onError);
}

// ── Session history ──────────────────────────────────────────────────────────

export interface SessionSummary {
  thread_id: string;
  title: string;
  created_at: string;
  last_active_at: string;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function fetchSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API}/sessions`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json() as Promise<SessionSummary[]>;
}

export async function fetchSessionMessages(threadId: string): Promise<HistoryMessage[]> {
  const res = await fetch(`${API}/sessions/${threadId}/messages`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch session messages");
  return res.json() as Promise<HistoryMessage[]>;
}
