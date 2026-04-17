import {
  SPEECH_ERROR_ABORTED,
  SPEECH_ERROR_NETWORK,
  SPEECH_ERROR_NO_SPEECH,
  SPEECH_ERROR_NOT_SUPPORTED,
  SPEECH_ERROR_UNKNOWN,
  type SpeechLang,
} from "./speech-constants";

export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechControls {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const ERROR_NO_SPEECH = "no-speech";
const ERROR_ABORTED = "aborted";
const ERROR_NETWORK = "network";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  [ERROR_NO_SPEECH]: SPEECH_ERROR_NO_SPEECH,
  [ERROR_ABORTED]: SPEECH_ERROR_ABORTED,
  [ERROR_NETWORK]: SPEECH_ERROR_NETWORK,
};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as unknown as Record<string, unknown>;
  const Constructor = win.SpeechRecognition ?? win.webkitSpeechRecognition;

  if (!Constructor) {
    return null;
  }

  return Constructor as SpeechRecognitionConstructor;
}

export function createSpeechRecognition(
  lang: SpeechLang,
  onResult: (result: SpeechResult) => void,
  onEnd: () => void,
  onError: (error: string) => void
): SpeechControls {
  const Constructor = getSpeechRecognitionConstructor();

  if (!Constructor) {
    return {
      start: () => onError(SPEECH_ERROR_NOT_SUPPORTED),
      stop: () => {},
      isSupported: false,
    };
  }

  const recognition = new Constructor();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const lastResultIndex = event.results.length - 1;
    const result = event.results[lastResultIndex];
    const firstAlternativeIndex = 0;
    const transcript = result[firstAlternativeIndex].transcript;
    const isFinal = result.isFinal;

    onResult({ transcript, isFinal });
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    const message = ERROR_MESSAGE_MAP[event.error] ?? SPEECH_ERROR_UNKNOWN;
    onError(message);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true,
  };
}
