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
}

/** Novaris "N" mark — small, gold */
function NovarisMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
      <path d="M8 6L6 8L6 24L8 26" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 6L26 8L26 24L24 26" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 23L9 9L23 23L23 9" stroke="url(#g)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="g" x1="6" y1="2" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="100%" stopColor="#c9a84c"/>
        </linearGradient>
      </defs>
    </svg>
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
          <strong className="font-semibold text-amber-300">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-300">{children}</em>
        ),
        h1: ({ children }) => (
          <h1 className="text-[15px] font-bold text-amber-300 mb-2 mt-3 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[14px] font-semibold text-amber-200 mb-1.5 mt-3 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[13px] font-semibold text-gray-200 mb-1 mt-2 first:mt-0">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 space-y-1 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 space-y-1 pl-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-[13px]">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
            <span>{children}</span>
          </li>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-[12px] font-mono text-amber-200 overflow-x-auto my-2 whitespace-pre">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-gray-950 border border-gray-700 rounded px-1.5 py-0.5 text-[12px] font-mono text-amber-300">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <div className="my-2">{children}</div>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-amber-500 pl-3 text-gray-400 italic my-2">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-gray-700 my-3" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-[12px] w-full border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-700 px-3 py-1.5 text-left font-semibold text-amber-300 bg-gray-950">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-700 px-3 py-1.5 text-gray-300">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function ChatWindow({ messages, pendingActions, onResolve }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingActions]);

  const isEmpty = messages.length === 0 && pendingActions.length === 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M8 6L6 8L6 24L8 26" stroke="url(#ge)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M24 6L26 8L26 24L24 26" stroke="url(#ge)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 23L9 9L23 23L23 9" stroke="url(#ge)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 9L14.5 4.5Q16 2 17.5 4.5Z" fill="url(#ge)" opacity="0.9"/>
                <defs>
                  <linearGradient id="ge" x1="6" y1="2" x2="26" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f0d060"/>
                    <stop offset="100%" stopColor="#c9a84c"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-gray-300 mb-1">How can I help you today?</p>
            <p className="text-[13px] text-gray-600">Ask me about emails, calendar, finance, or anything else.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[14px] leading-relaxed shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #2a1f00 0%, #3d2e00 100%)",
                    border: "1px solid #c9a84c40",
                    color: "#f5e8c0",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          if (msg.role === "error") {
            return (
              <div key={i} className="flex justify-start">
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-red-900/30 border border-red-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="1.5">
                      <circle cx="6" cy="6" r="5"/>
                      <path d="M6 3.5v3M6 8.5h.01"/>
                    </svg>
                  </div>
                  <div className="bg-red-900/20 border border-red-800/40 rounded-2xl rounded-bl-sm px-4 py-2.5 text-[13px] text-red-400">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          }

          // assistant
          return (
            <div key={i} className="flex justify-start">
              <div className="flex items-start gap-2.5 max-w-[85%]">
                {/* Novaris avatar */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #1a1600 0%, #2d2400 100%)",
                    border: "1px solid #c9a84c60",
                  }}
                >
                  <NovarisMark />
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-3 text-[13.5px] leading-relaxed shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #111111 0%, #1a1a1a 100%)",
                    border: "1px solid #2a2a2a",
                    color: "#e5e5e5",
                  }}
                >
                  <MarkdownContent content={msg.content} />
                </div>
              </div>
            </div>
          );
        })}

        {pendingActions.map((action) => (
          <ActionCard key={action.interrupt_id} action={action} onResolve={onResolve} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
