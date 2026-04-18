"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatActionCard, type ActionStatus } from "@/components/chat/ChatActionCard";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { IotActionCard } from "@/components/chat/IotActionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import {
  hasActionInProgress,
  parseChatContent,
  stripPartialActionTag,
  type ChatAction,
} from "@/lib/chat-action";
import { applyChatAction } from "@/lib/chat-action-apply";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import type { Translations } from "@/lib/translations";

const ROLE_ASSISTANT = "assistant" as const;

const IOT_ACTION_KEYWORDS = [
  // standby / vampire
  "standby", "rút phích", "điện chờ", "vô hình", "điện ma", "tiêu thụ ngầm", "hút điện", "kẻ hút",
  // scheduling & behavioral savings
  "rút điện", "tắt trước", "tắt máy", "lên lịch", "tiết kiệm", "cắt giảm", "thói quen",
];

function hasIotActionContent(content: string): boolean {
  const lower = content.toLowerCase();
  return IOT_ACTION_KEYWORDS.some((kw) => lower.includes(kw));
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

const ROOM_NOT_FOUND_PLACEHOLDER = "{name}";

export default function ChatPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const welcomeSetRef = useRef(false);

  const { messages, isStreaming, isInitialized, sendMessage, setMessages, clearSession } = useChat(
    homeId ?? ""
  );

  const [actionStatus, setActionStatus] = useState<Record<string, ActionStatus>>({});

  useEffect(() => {
    if (!homeId || !isInitialized || welcomeSetRef.current) return;
    welcomeSetRef.current = true;
    if (messages.length === 0) {
      setMessages([{ id: "welcome", role: ROLE_ASSISTANT, content: t.CHAT_WELCOME_MESSAGE }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeId, isInitialized]);

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
    setActionStatus({});
    setMessages([{ id: "welcome", role: ROLE_ASSISTANT, content: t.CHAT_WELCOME_MESSAGE }]);
  }, [clearSession, setMessages, t.CHAT_WELCOME_MESSAGE]);

  const handleApply = useCallback(
    async (messageId: string, action: ChatAction) => {
      if (!homeId) return;
      setActionStatus((prev) => ({ ...prev, [messageId]: { state: "applying" } }));
      const result = await applyChatAction(homeId, action);
      if (result.success) {
        setActionStatus((prev) => ({ ...prev, [messageId]: { state: "applied" } }));
        return;
      }
      const message = formatApplyError(result.errorKey, result.detail, t);
      setActionStatus((prev) => ({
        ...prev,
        [messageId]: { state: "failed", message },
      }));
    },
    [homeId, t]
  );

  const handleCancel = useCallback((messageId: string) => {
    setActionStatus((prev) => ({ ...prev, [messageId]: { state: "cancelled" } }));
  }, []);

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
          <MessageRow
            key={msg.id}
            msg={msg}
            isLastStreaming={isStreaming && index === lastMessageIndex}
            status={actionStatus[msg.id] ?? { state: "pending" }}
            onApply={handleApply}
            onCancel={handleCancel}
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

interface MessageRowProps {
  msg: ChatMessage;
  isLastStreaming: boolean;
  status: ActionStatus;
  onApply: (messageId: string, action: ChatAction) => void;
  onCancel: (messageId: string) => void;
}

function MessageRow({ msg, isLastStreaming, status, onApply, onCancel }: MessageRowProps) {
  const { visibleContent, action } = useMemo(() => {
    if (msg.role !== ROLE_ASSISTANT) {
      return { visibleContent: msg.content, action: null };
    }
    if (isLastStreaming && hasActionInProgress(msg.content)) {
      return { visibleContent: stripPartialActionTag(msg.content), action: null };
    }
    return parseChatContent(msg.content);
  }, [msg.content, msg.role, isLastStreaming]);

  const showIotCard =
    msg.role === ROLE_ASSISTANT &&
    !isLastStreaming &&
    action === null &&
    hasIotActionContent(visibleContent);

  return (
    <div className="flex flex-col">
      <ChatBubble
        role={msg.role}
        content={visibleContent}
        isStreaming={isLastStreaming}
      />
      {msg.role === ROLE_ASSISTANT && action !== null && !isLastStreaming && (
        <ChatActionCard
          action={action}
          status={status}
          onApply={() => onApply(msg.id, action)}
          onCancel={() => onCancel(msg.id)}
        />
      )}
      {showIotCard && <IotActionCard />}
    </div>
  );
}

function formatApplyError(
  errorKey: "ROOM_NOT_FOUND" | "APPLIANCE_NOT_FOUND" | "API_ERROR",
  detail: string,
  t: Translations
): string {
  if (errorKey === "ROOM_NOT_FOUND") {
    return t.CHAT_ACTION_ROOM_NOT_FOUND.replace(ROOM_NOT_FOUND_PLACEHOLDER, detail);
  }
  if (errorKey === "APPLIANCE_NOT_FOUND") {
    return t.CHAT_ACTION_APPLIANCE_NOT_FOUND.replace(ROOM_NOT_FOUND_PLACEHOLDER, detail);
  }
  return detail;
}
