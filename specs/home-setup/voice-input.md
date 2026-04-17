# Voice Input (F5)

## User Story

> As a homeowner, I want to speak instead of type so adding appliances is faster and more fun.

## Usage Points

1. **Setup Wizard** — appliance name input (mic button next to text field)
2. **Chat** — message input (mic button in input bar)

## Implementation

Browser-native Web Speech API, zero backend cost.

### Speech Wrapper (`lib/speech.ts`)

```typescript
interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function createSpeechRecognition(
  lang: 'vi-VN' | 'en-US',
  onResult: (result: SpeechResult) => void,
  onEnd: () => void
): { start: () => void; stop: () => void }
```

### Hook (`hooks/useSpeech.ts`)

Wraps the speech wrapper with React state (isListening, transcript, error).

## UX Details

- Mic button: green when idle, pulsing red when recording
- Show live transcript overlay while speaking
- Auto-stop after 2s silence
- Error handling: show toast if mic permission denied or browser not supported
- Fallback: mic button hidden on unsupported browsers

## Integration with Appliance Estimation

When voice input populates the appliance name field:
1. Transcript fills name field
2. Auto-call `POST /api/ai/estimate-appliance` with the transcript
3. Pre-fill wattage, type, standby wattage from AI response

## Success Criteria

- Voice input works for adding at least one appliance in Vietnamese
