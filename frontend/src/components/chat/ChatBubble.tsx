"use client";

import { cn } from "@/lib/utils";

const POTATO_AVATAR = "🥔";
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
          <span className="mt-1 shrink-0 text-lg" aria-hidden="true">
            {POTATO_AVATAR}
          </span>
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
          ) : (
            <span className="whitespace-pre-wrap break-words">{content}</span>
          )}
        </div>
      </div>
    </div>
  );
}
