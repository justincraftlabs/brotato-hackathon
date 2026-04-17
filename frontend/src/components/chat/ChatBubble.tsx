"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const POTATO_LOGO_SRC = "/logo.png";
const POTATO_LOGO_SIZE = 28;
const TYPING_INDICATOR = "...";

type ChatRole = "user" | "assistant";

interface ChatBubbleProps {
  role: ChatRole;
  content: string;
  isStreaming?: boolean;
}

const ROLE_USER: ChatRole = "user";

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === ROLE_USER;

  const showTypingIndicator = isStreaming && content.length === 0;

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "flex max-w-[80%] gap-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {!isUser && (
          <Image
            src={POTATO_LOGO_SRC}
            alt="Khoai Tây"
            width={POTATO_LOGO_SIZE}
            height={POTATO_LOGO_SIZE}
            className="mt-1 shrink-0 rounded-full"
          />
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-accent text-white"
              : "bg-card text-card-foreground"
          )}
        >
          {showTypingIndicator ? (
            <span className="inline-flex animate-pulse">
              {TYPING_INDICATOR}
            </span>
          ) : isUser ? (
            <span className="whitespace-pre-wrap break-words">{content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-1 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
                ol: ({ children }) => <ol className="mb-1 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
