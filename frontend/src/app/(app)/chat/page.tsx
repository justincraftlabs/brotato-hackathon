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

const CRUD_INTENT_KEYWORDS = [
  "tạo phòng", "thêm phòng", "phòng mới",
  "thêm thiết bị", "sửa thiết bị", "xóa thiết bị", "cập nhật thiết bị",
  "create room", "add room", "new room",
  "add appliance", "update appliance", "delete appliance", "remove appliance",
];

const ACTION_TAG_OPEN_TOKEN = "<action>";

function hasIotActionContent(content: string): boolean {
  const lower = content.toLowerCase();
  return IOT_ACTION_KEYWORDS.some((kw) => lower.includes(kw));
}

function isCrudIntentContent(rawContent: string, visibleContent: string): boolean {
  if (rawContent.includes(ACTION_TAG_OPEN_TOKEN)) {
    return true;
  }
  const lower = visibleContent.toLowerCase();
  return CRUD_INTENT_KEYWORDS.some((kw) => lower.includes(kw));
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
const SUCCESS_ROOM_PLACEHOLDER = "{room}";
const SUCCESS_SIZE_PLACEHOLDER = "{size}";
const SUCCESS_APPLIANCE_PLACEHOLDER = "{appliance}";
const SUCCESS_COUNT_PLACEHOLDER = "{count}";

function createSystemMessageId(): string {
  return `system-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildApplySuccessMessage(action: ChatAction, t: Translations): string {
  if (action.operation === "createRoom") {
    const template =
      action.appliances.length > 0
        ? t.CHAT_ACTION_SUCCESS_CREATE_ROOM_WITH_APPLIANCES
        : t.CHAT_ACTION_SUCCESS_CREATE_ROOM;
    return template
      .replace(SUCCESS_ROOM_PLACEHOLDER, action.room.name)
      .replace(SUCCESS_SIZE_PLACEHOLDER, t.ROOM_SIZE_LABELS[action.room.size])
      .replace(SUCCESS_COUNT_PLACEHOLDER, String(action.appliances.length));
  }
  if (action.operation === "add") {
    return t.CHAT_ACTION_SUCCESS_ADD
      .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.appliance.name)
      .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
  }
  if (action.operation === "update") {
    return t.CHAT_ACTION_SUCCESS_UPDATE
      .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.applianceName)
      .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
  }
  return t.CHAT_ACTION_SUCCESS_DELETE
    .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.applianceName)
    .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
}

function buildApplyCancelMessage(action: ChatAction, t: Translations): string {
  if (action.operation === "createRoom") {
    return t.CHAT_ACTION_CANCELLED_CREATE_ROOM.replace(
      SUCCESS_ROOM_PLACEHOLDER,
      action.room.name
    );
  }
  if (action.operation === "add") {
    return t.CHAT_ACTION_CANCELLED_ADD
      .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.appliance.name)
      .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
  }
  if (action.operation === "update") {
    return t.CHAT_ACTION_CANCELLED_UPDATE
      .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.applianceName)
      .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
  }
  return t.CHAT_ACTION_CANCELLED_DELETE
    .replace(SUCCESS_APPLIANCE_PLACEHOLDER, action.applianceName)
    .replace(SUCCESS_ROOM_PLACEHOLDER, action.roomName);
}

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
        const confirmation: ChatMessage = {
          id: createSystemMessageId(),
          role: ROLE_ASSISTANT,
          content: buildApplySuccessMessage(action, t),
        };
        setMessages((prev) => [...prev, confirmation]);
        return;
      }
      const message = formatApplyError(result.errorKey, result.detail, t);
      setActionStatus((prev) => ({
        ...prev,
        [messageId]: { state: "failed", message },
      }));
    },
    [homeId, setMessages, t]
  );

  const handleCancel = useCallback(
    (messageId: string, action: ChatAction) => {
      setActionStatus((prev) => ({ ...prev, [messageId]: { state: "cancelled" } }));
      const notice: ChatMessage = {
        id: createSystemMessageId(),
        role: ROLE_ASSISTANT,
        content: buildApplyCancelMessage(action, t),
      };
      setMessages((prev) => [...prev, notice]);
    },
    [setMessages, t]
  );

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
  onCancel: (messageId: string, action: ChatAction) => void;
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
    !isCrudIntentContent(msg.content, visibleContent) &&
    hasIotActionContent(visibleContent);

  return (
    <div className="flex flex-col">
      <ChatBubble
        role={msg.role}
        content={visibleContent}
        isStreaming={isLastStreaming}
      />
      {msg.role === ROLE_ASSISTANT &&
        action !== null &&
        !isLastStreaming &&
        status.state !== "cancelled" && (
          <ChatActionCard
            action={action}
            status={status}
            onApply={() => onApply(msg.id, action)}
            onCancel={() => onCancel(msg.id, action)}
          />
        )}
      {showIotCard && <IotActionCard />}
    </div>
  );
}

function formatApplyError(
  errorKey: "ROOM_NOT_FOUND" | "APPLIANCE_NOT_FOUND" | "ROOM_ALREADY_EXISTS" | "API_ERROR",
  detail: string,
  t: Translations
): string {
  if (errorKey === "ROOM_NOT_FOUND") {
    return t.CHAT_ACTION_ROOM_NOT_FOUND.replace(ROOM_NOT_FOUND_PLACEHOLDER, detail);
  }
  if (errorKey === "APPLIANCE_NOT_FOUND") {
    return t.CHAT_ACTION_APPLIANCE_NOT_FOUND.replace(ROOM_NOT_FOUND_PLACEHOLDER, detail);
  }
  if (errorKey === "ROOM_ALREADY_EXISTS") {
    return t.CHAT_ACTION_ROOM_ALREADY_EXISTS.replace(ROOM_NOT_FOUND_PLACEHOLDER, detail);
  }
  return detail;
}
