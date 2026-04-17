"use client";

import { useCallback, useRef, useState } from "react";

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

export function useChat(homeId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionIdRef = useRef<string>("");

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
        }

        if (!response.body) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: CHAT_LABELS.ERROR_MESSAGE }
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
                  ? { ...msg, content: CHAT_LABELS.ERROR_MESSAGE }
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
              ? { ...msg, content: CHAT_LABELS.ERROR_MESSAGE }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [homeId]
  );

  return { messages, isStreaming, sendMessage, setMessages };
}
