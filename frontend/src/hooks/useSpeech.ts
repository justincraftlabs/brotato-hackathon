"use client";

import { useCallback, useRef, useState } from "react";

import {
  SPEECH_LANG_VI,
  type SpeechLang,
} from "@/lib/speech-constants";
import {
  createSpeechRecognition,
  type SpeechControls,
} from "@/lib/speech";

interface UseSpeechReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useSpeech(
  lang: SpeechLang = SPEECH_LANG_VI
): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const win = window as unknown as Record<string, unknown>;
    return !!(win.SpeechRecognition ?? win.webkitSpeechRecognition);
  });
  const controlsRef = useRef<SpeechControls | null>(null);
  const onTranscriptDoneRef = useRef<((text: string) => void) | null>(null);

  const startListening = useCallback(() => {
    setTranscript("");
    setIsListening(true);

    let latestTranscript = "";

    const controls = createSpeechRecognition(
      lang,
      (result) => {
        latestTranscript = result.transcript;
        setTranscript(result.transcript);
      },
      () => {
        setIsListening(false);
        if (onTranscriptDoneRef.current && latestTranscript) {
          onTranscriptDoneRef.current(latestTranscript);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (!controls.isSupported) {
      setIsSupported(false);
      setIsListening(false);
      return;
    }

    controlsRef.current = controls;
    controls.start();
  }, [lang]);

  const stopListening = useCallback(() => {
    controlsRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  };
}
