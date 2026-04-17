# AI Recommendations (UC1)

## Purpose

Generate structured, per-appliance energy saving recommendations using Claude. Single-turn: send home data, get JSON array back.

## API Contract

### POST /api/ai/recommendations

```typescript
// Request
{ homeId: string }

// Response
{
  success: true,
  data: {
    recommendations: Array<{
      id: string;
      applianceName: string;
      roomName: string;
      type: "behavior" | "upgrade" | "schedule" | "vampire";
      title: string;
      description: string;
      savingsKwh: number;
      savingsVnd: number;
      priority: "high" | "medium" | "low";
      difficulty: "easy" | "medium" | "hard";
    }>;
    totalPotentialSavingsVnd: number;
    totalPotentialSavingsKwh: number;
  }
}
```

## Recommendation Types

| Type | Description |
|------|-------------|
| `behavior` | Change usage habit (e.g., set AC to 26°C) |
| `upgrade` | Replace with energy-efficient model |
| `schedule` | Adjust usage times (e.g., off-peak hours) |
| `vampire` | Eliminate standby/phantom consumption |

## AI Service Interface

```typescript
export async function generateRecommendations(
  homeData: Home
): Promise<Recommendation[]>
```

- Model: `claude-sonnet-4-6`
- max_tokens: 16,000
- Single-turn, no history

## System Prompt Rules (`prompts/recommendation.ts`)

1. Each recommendation targets a SPECIFIC appliance in a SPECIFIC room
2. Include a concrete action the user can take TODAY
3. Estimate savings in both kWh and VND per month (using EVN tiered pricing)
4. Written in Vietnamese, casual and friendly tone
5. Focus on top 3-5 highest-impact changes
6. Flag "vampire appliances" (standby consumption)
7. Consider Vietnamese climate and lifestyle habits
8. Never give generic advice like "tiết kiệm điện"
9. Include one fun/surprising fact per recommendation

## Output Format

```json
[{
  "applianceName": "string",
  "roomName": "string",
  "type": "behavior | upgrade | schedule | vampire",
  "title": "string (Vietnamese, max 50 chars)",
  "description": "string (Vietnamese, 2-3 sentences)",
  "savingsKwh": 0,
  "savingsVnd": 0,
  "priority": "high | medium | low",
  "difficulty": "easy | medium | hard"
}]
```

## Error Handling

- JSON parse fails → retry once with stricter prompt
- Still fails → return pre-written fallback recommendations
- Log all AI responses for debugging

## Frontend Integration

- Called on first visit to `/chat` page
- Displayed as tappable recommendation cards above chat
- Tapping a card sends it as a chat message for deeper explanation
