"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { IotActionCard } from "@/components/chat/IotActionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import type { Translations } from "@/lib/translations";

const ROLE_ASSISTANT = "assistant" as const;

const STANDBY_KEYWORDS = ["standby", "rút phích", "điện chờ", "vô hình", "điện ma", "tiêu thụ ngầm", "hút điện", "kẻ hút"];

function hasStandbyContent(content: string): boolean {
  const lower = content.toLowerCase();
  return STANDBY_KEYWORDS.some((kw) => lower.includes(kw));
}

interface EmptyStateProps {
  t: Translations;
}

function EmptyState({ t }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-lg font-semibold">
            {t.CHAT_EMPTY_STATE_TITLE}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.CHAT_EMPTY_STATE_MESSAGE}
          </p>
          <Button asChild>
            <Link href={NAV_ROUTES.SETUP}>
              {t.CHAT_EMPTY_STATE_CTA}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const welcomeSetRef = useRef(false);

  const { messages, isStreaming, sendMessage, setMessages, clearSession } = useChat(
    homeId ?? ""
  );

  useEffect(() => {
    if (!homeId || welcomeSetRef.current) return;
    welcomeSetRef.current = true;
    if (messages.length === 0) {
      setMessages([{ id: "welcome", role: ROLE_ASSISTANT, content: t.CHAT_WELCOME_MESSAGE }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message);
      setInput("");
    },
    [sendMessage]
  );

  const handleNewChat = useCallback(() => {
    clearSession();
    setMessages([{ id: "welcome", role: ROLE_ASSISTANT, content: t.CHAT_WELCOME_MESSAGE }]);
  }, [clearSession, setMessages, t.CHAT_WELCOME_MESSAGE]);

  if (!homeId) {
    return <EmptyState t={t} />;
  }

  const lastMessageIndex = messages.length - 1;

  return (
    <div className="flex h-full flex-col">
      {/* Header with New Chat button */}
      <div className="shrink-0 flex items-center justify-end px-2 py-2 border-b border-border/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          disabled={isStreaming}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t.CHAT_NEW_CONVERSATION}
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-3 px-2 py-4"
      >
        {messages.map((msg: ChatMessage, index: number) => (
          <div key={msg.id} className="flex flex-col">
            <ChatBubble
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming && index === lastMessageIndex}
            />
            {msg.role === ROLE_ASSISTANT &&
              (!isStreaming || index !== lastMessageIndex) &&
              hasStandbyContent(msg.content) && (
                <IotActionCard />
              )}
          </div>
        ))}
      </div>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isStreaming}
      />
    </div>
  );
}
