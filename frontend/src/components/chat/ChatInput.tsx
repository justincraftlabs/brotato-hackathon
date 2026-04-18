"use client";

import { SendHorizontal } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/use-t";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled: boolean;
}

const ENTER_KEY = "Enter";

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    onChange("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== ENTER_KEY) {
      return;
    }
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    handleSubmit(e);
  }

  const isDisabled = disabled || value.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong flex items-center gap-2 border-t border-border/40 px-3 py-3"
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.CHAT_INPUT_PLACEHOLDER}
        disabled={disabled}
        className="flex-1 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/40"
        aria-label={t.CHAT_INPUT_PLACEHOLDER}
      />
      <Button
        type="submit"
        size="icon"
        disabled={isDisabled}
        className="btn-primary-gradient h-9 w-9 shrink-0 rounded-xl disabled:opacity-40"
        aria-label={t.CHAT_SEND_BUTTON}
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
