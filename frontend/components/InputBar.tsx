"use client";

import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
}

export default function InputBar({ onSend }: Props) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div
      className="shrink-0 px-6 pb-3 pt-3"
      style={{ background: "#FFFFFF", borderTop: "0.5px solid rgba(10,14,39,0.07)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Input wrapper with focus ring */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "#F8F7F4",
            border: focused ? "0.5px solid #C9A84C" : "0.5px solid rgba(10,14,39,0.12)",
            borderRadius: 10,
            padding: "10px 12px",
            transition: "border-color 0.2s",
            boxShadow: focused ? "0 0 0 2px rgba(201,168,76,0.12)" : "none",
          }}
        >
          <textarea
            rows={1}
            className="flex-1 resize-none text-[13px] leading-relaxed"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#0A0E27",
              fontFamily: "system-ui",
              caretColor: "#C9A84C",
              minHeight: 20,
              maxHeight: 100,
              overflowY: "auto",
            }}
            placeholder="Message Novaris..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />

          <button
            onClick={submit}
            disabled={!text.trim()}
            className="shrink-0 transition-all active:scale-95 disabled:opacity-50"
            style={{
              padding: "7px 16px",
              background: text.trim() ? "#0A0E27" : "#E5E7EB",
              color: text.trim() ? "#C9A84C" : "#9CA3AF",
              fontFamily: "system-ui",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderRadius: 7,
              border: "none",
              cursor: text.trim() ? "pointer" : "default",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              if (text.trim()) (e.currentTarget as HTMLButtonElement).style.background = "#141830";
            }}
            onMouseLeave={(e) => {
              if (text.trim()) (e.currentTarget as HTMLButtonElement).style.background = "#0A0E27";
            }}
          >
            Send
          </button>
        </div>

        <p className="text-center mt-2" style={{ fontSize: 9, color: "#C8CACD", fontFamily: "system-ui" }}>
          Novaris can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
