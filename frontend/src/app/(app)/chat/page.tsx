"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { RecommendationCards } from "@/components/chat/RecommendationCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getRecommendations } from "@/lib/api";
import {
  CHAT_LABELS,
  LOCAL_STORAGE_HOME_ID_KEY,
  NAV_ROUTES,
} from "@/lib/constants";
import type { Recommendation } from "@/lib/types";

const ROLE_ASSISTANT = "assistant" as const;

function createWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: ROLE_ASSISTANT,
    content: CHAT_LABELS.WELCOME_MESSAGE,
  };
}

function EmptyState() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-lg font-semibold">
            {CHAT_LABELS.EMPTY_STATE_TITLE}
          </p>
          <p className="text-sm text-muted-foreground">
            {CHAT_LABELS.EMPTY_STATE_MESSAGE}
          </p>
          <Button asChild>
            <Link href={NAV_ROUTES.SETUP}>
              {CHAT_LABELS.EMPTY_STATE_CTA}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, sendMessage, setMessages } = useChat(
    homeId ?? ""
  );

  useEffect(() => {
    if (!homeId) {
      return;
    }

    setMessages([createWelcomeMessage()]);

    async function loadRecommendations() {
      const result = await getRecommendations(homeId as string);
      if (!result.success) {
        return;
      }
      setRecommendations(result.data.recommendations);
    }

    loadRecommendations();
  }, [homeId, setMessages]);

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

  const handleRecommendationSelect = useCallback(
    (title: string) => {
      sendMessage(title);
    },
    [sendMessage]
  );

  if (!homeId) {
    return <EmptyState />;
  }

  const lastMessageIndex = messages.length - 1;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-4"
      >
        <RecommendationCards
          recommendations={recommendations}
          onSelect={handleRecommendationSelect}
        />
        {messages.map((msg, index) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={isStreaming && index === lastMessageIndex}
          />
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
