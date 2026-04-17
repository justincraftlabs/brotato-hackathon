"use client";

import { Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSpeech } from "@/hooks/useSpeech";
import {
  VOICE_BUTTON_LABEL,
  VOICE_LISTENING_LABEL,
  type SpeechLang,
  SPEECH_LANG_VI,
} from "@/lib/speech-constants";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: SpeechLang;
  className?: string;
}

export function VoiceInputButton({
  onTranscript,
  lang = SPEECH_LANG_VI,
  className,
}: VoiceInputButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } =
    useSpeech(lang);

  if (!isSupported) {
    return null;
  }

  function handleToggle() {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      return;
    }

    startListening();
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleToggle}
        className={cn(
          "shrink-0",
          isListening && "animate-pulse border-destructive bg-destructive/10",
          className
        )}
        aria-label={isListening ? VOICE_LISTENING_LABEL : VOICE_BUTTON_LABEL}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 text-destructive" />
        ) : (
          <Mic className="h-4 w-4 text-primary" />
        )}
      </Button>

      {isListening && transcript && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">
          {transcript}
        </div>
      )}
    </div>
  );
}
