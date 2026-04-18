"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useT } from "@/hooks/use-t";
import { streamChat } from "@/lib/api";
import { CHAT_LABELS } from "@/lib/constants";

type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const ROLE_USER: ChatRole = "user";
const ROLE_ASSISTANT: ChatRole = "assistant";

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sessionKey(homeId: string): string {
  return `chat_session_id_${homeId}`;
}

function messagesKey(homeId: string): string {
  return `chat_messages_${homeId}`;
}

function loadSessionId(homeId: string): string {
  if (typeof window === "undefined" || !homeId) return "";
  return localStorage.getItem(sessionKey(homeId)) ?? "";
}

function loadMessages(homeId: string): ChatMessage[] {
  if (typeof window === "undefined" || !homeId) return [];
  try {
    const raw = localStorage.getItem(messagesKey(homeId));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function useChat(homeId: string) {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionIdRef = useRef<string>("");
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (!homeId) return;
    skipNextSaveRef.current = true;
    const stored = loadMessages(homeId);
    sessionIdRef.current = loadSessionId(homeId);
    setMessages(stored);
    setIsInitialized(true);
  }, [homeId]);

  useEffect(() => {
    if (!homeId) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    localStorage.setItem(messagesKey(homeId), JSON.stringify(messages));
  }, [homeId, messages]);

  const clearSession = useCallback(() => {
    if (!homeId) return;
    localStorage.removeItem(sessionKey(homeId));
    localStorage.removeItem(messagesKey(homeId));
    sessionIdRef.current = "";
    setMessages([]);
  }, [homeId]);

  const sendMessage = useCallback(
    async (message: string) => {
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: ROLE_USER,
        content: message,
      };

      const assistantMessageId = createMessageId();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: ROLE_ASSISTANT,
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const response = await streamChat(
          homeId,
          message,
          sessionIdRef.current
        );

        const newSessionId = response.headers.get(CHAT_LABELS.SESSION_HEADER);
        if (newSessionId) {
          sessionIdRef.current = newSessionId;
          if (homeId) {
            localStorage.setItem(sessionKey(homeId), newSessionId);
          }
        }

        if (!response.body) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: t.CHAT_ERROR_MESSAGE }
                : msg
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });

          if (chunk.includes(CHAT_LABELS.STREAM_DONE_MARKER)) {
            break;
          }

          if (chunk.includes(CHAT_LABELS.STREAM_ERROR_MARKER)) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: t.CHAT_ERROR_MESSAGE }
                  : msg
              )
            );
            break;
          }

          accumulatedContent += chunk;
          const updatedContent = accumulatedContent;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: updatedContent }
                : msg
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: t.CHAT_ERROR_MESSAGE }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [homeId, t]
  );

  return { messages, isStreaming, isInitialized, sendMessage, setMessages, clearSession };
}
