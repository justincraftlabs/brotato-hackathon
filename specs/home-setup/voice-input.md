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

## Requirements

RFC 2119 keywords: **MUST** · **SHOULD** · **MAY**.

| ID | Requirement |
|----|-------------|
| REQ-VOICE-001 | Default recognition language **MUST** be `vi-VN`. |
| REQ-VOICE-002 | System **MUST** support `vi-VN` and `en-US`; other codes **MUST** be rejected at the type boundary. |
| REQ-VOICE-003 | Mic button **MUST** provide visual feedback (pulsing red) while recording. |
| REQ-VOICE-004 | On browsers without `SpeechRecognition`, the mic button **MUST NOT** render. |
| REQ-VOICE-005 | Recognition **MUST** auto-stop after ~2s of silence. |
| REQ-VOICE-006 | A completed transcript in the appliance-name field **SHOULD** trigger `POST /api/ai/estimate-appliance`. |
| REQ-VOICE-007 | Microphone permission errors **MUST** surface as a toast (not a silent failure). |
| REQ-VOICE-008 | Voice input **MUST NOT** send audio to the backend — everything stays in the browser. |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-VOICE-001 | Given an unsupported browser, when the setup page renders, then the mic button is not in the DOM. | REQ-VOICE-004 |
| AC-VOICE-002 | Given `vi-VN` active, when the user speaks "điều hòa", then the transcript appears in the appliance-name field. | REQ-VOICE-001 |
| AC-VOICE-003 | Given mic permission denied, when the user taps the mic, then a Vietnamese error toast is shown. | REQ-VOICE-007 |
| AC-VOICE-004 | Given a final transcript populating the name field, when 300ms elapses, then `POST /api/ai/estimate-appliance` is called exactly once. | REQ-VOICE-006 |
| AC-VOICE-005 | Given active recording, when ~2s of silence, then recognition ends and the mic button returns to idle. | REQ-VOICE-005 |

## Boundaries

**In scope**
- Web Speech API in supported Chromium-based browsers on mobile and desktop
- Language codes `vi-VN` and `en-US`
- Appliance name input (setup) and chat message input

**Out of scope**
- Server-side transcription fallback
- Voice output / text-to-speech
- Continuous (always-on) recording
- Languages beyond `vi-VN` and `en-US`

**Ambiguity policy**
- If the browser exposes a partial `SpeechRecognition` API but throws on `start()`, treat as unsupported (same as `undefined`).
- If multiple final transcripts arrive, the last one wins.

## Examples

**Valid hook usage**
```ts
const { isListening, transcript, start, stop } = useSpeech({ lang: "vi-VN" });
```

**Invalid — unsupported language**
```ts
useSpeech({ lang: "fr-FR" }); // TypeScript error: Type '"fr-FR"' is not assignable
```

## Success Criteria

- Voice input works for adding at least one appliance in Vietnamese.
