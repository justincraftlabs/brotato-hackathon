# Home Setup Domain

**Features:** F1 (Home Setup Wizard), F5 (Voice Input), F6 (Image Recognition)

## Scope

Everything related to creating and configuring a household: room selection, appliance management, voice-based input, and camera-based appliance recognition. This is the entry point for all users — no other feature works without a configured home.

## Specs

- [wizard.md](wizard.md) — Multi-step home setup wizard (rooms + appliances)
- [voice-input.md](voice-input.md) — Web Speech API for appliance names + chat
- [image-recognition.md](image-recognition.md) — Claude Vision appliance identification

## Dependencies

- `standards/code-conventions.md` — naming, fetch rules
- `standards/architecture.md` — port, SSE pattern
- `standards/tech-stack.md` — confirmed tech decisions

## Downstream Dependents

All other domains depend on home data existing:
- `specs/energy/` — needs appliances to calculate consumption
- `specs/chat/` — needs home context for personalized AI advice
- `specs/simulator/` — needs appliance list to simulate adjustments

## API Endpoints (this domain)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/home/setup` | Create home with rooms |
| POST | `/api/home/:homeId/appliances` | Add appliances to a room |
| GET | `/api/home/:homeId` | Get full home data |
| POST | `/api/ai/estimate-appliance` | AI estimates wattage from name |
| POST | `/api/ai/recognize-appliance` | AI identifies appliance from photo |

## File Ownership

```
backend/src/routes/home.ts
backend/src/services/home-service.ts
backend/src/models/home.model.ts
backend/src/models/room.model.ts
backend/src/models/appliance.model.ts
backend/src/prompts/appliance-estimator.ts
backend/src/prompts/image-recognizer.ts
backend/src/middleware/upload.ts
frontend/src/app/setup/page.tsx
frontend/src/components/setup/*
frontend/src/hooks/useHome.ts
frontend/src/hooks/useSpeech.ts
frontend/src/hooks/useImageCapture.ts
frontend/src/lib/speech.ts
frontend/src/lib/image.ts
```
