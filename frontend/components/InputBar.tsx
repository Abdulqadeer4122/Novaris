"use client";

import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
}

export default function InputBar({ onSend }: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div
      className="shrink-0 px-4 py-4"
      style={{ background: "#0a0a0a", borderTop: "1px solid #1f1f1f" }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all"
          style={{
            background: "#111111",
            border: "1px solid #2a2a2a",
          }}
          onFocus={() => {}}
        >
          <textarea
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] text-gray-200 placeholder-gray-600 leading-relaxed max-h-36 overflow-y-auto"
            style={{ caretColor: "#c9a84c" }}
            placeholder="Message Novaris..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
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
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            style={{
              background: text.trim()
                ? "linear-gradient(135deg, #c9a84c, #f0d060)"
                : "#1f1f1f",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke={text.trim() ? "#1a1200" : "#555"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 12V2M2 7l5-5 5 5"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-2">
          Novaris can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
