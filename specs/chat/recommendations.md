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

## Requirements

RFC 2119 keywords: **MUST** · **SHOULD** · **MAY**.

| ID | Requirement |
|----|-------------|
| REQ-REC-001 | Each recommendation **MUST** target a specific appliance in a specific room. |
| REQ-REC-002 | Each recommendation **MUST** estimate `savingsKwh` and `savingsVnd` per month. |
| REQ-REC-003 | `type` **MUST** ∈ `{behavior, upgrade, schedule, vampire}`. |
| REQ-REC-004 | `priority` **MUST** ∈ `{high, medium, low}`. |
| REQ-REC-005 | `difficulty` **MUST** ∈ `{easy, medium, hard}`. |
| REQ-REC-006 | Response **SHOULD** return between 3 and 5 recommendations focused on highest-impact changes. |
| REQ-REC-007 | If JSON parsing fails, backend **SHOULD** retry once with a stricter prompt. |
| REQ-REC-008 | If retries fail, backend **MUST** return pre-written fallback recommendations (not a 500). |
| REQ-REC-009 | `title` **SHOULD** be ≤ 50 characters; `description` 2–3 Vietnamese sentences. |
| REQ-REC-010 | System **MUST NOT** give generic advice such as "tiết kiệm điện" without concrete action. |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-REC-001 | Given a home with ≥3 appliances, when `POST /api/ai/recommendations`, then `data.recommendations.length ∈ [3, 5]`. | REQ-REC-006 |
| AC-REC-002 | Given AI returns malformed JSON, when parsed, then the service retries exactly once. | REQ-REC-007 |
| AC-REC-003 | Given AI keeps failing, when retries exhausted, then response returns fallback recommendations with `success: true`. | REQ-REC-008 |
| AC-REC-004 | Given any valid response, when inspected, then every recommendation has `applianceName`, `roomName`, `type`, `savingsKwh`, `savingsVnd`. | REQ-REC-001, REQ-REC-002 |
| AC-REC-005 | Given a recommendation, when `type` is validated, then it is one of the 4 allowed values. | REQ-REC-003 |

## Boundaries

**In scope**
- Single-turn generation (no conversational refinement)
- Per-appliance, per-room advice anchored in the user's existing home
- Savings estimated using EVN tiered pricing

**Out of scope**
- Personalized financing / rebate programs
- Cross-user benchmarking
- Real-time re-generation on each home edit (cached once per `/chat` visit)

**Ambiguity policy**
- If the home has zero appliances, return fallback starter tips (never throw).
- If the AI proposes an upgrade without a payback period, drop that recommendation silently rather than surfacing partial data.

## Examples

**Valid recommendation**
```json
{
  "applianceName": "Điều hòa phòng ngủ",
  "roomName": "Phòng ngủ chính",
  "type": "behavior",
  "title": "Đặt nhiệt độ điều hòa ở 26°C",
  "description": "Mỗi 1°C giảm tiêu thụ khoảng 7%. Với 6 tiếng/ngày, bạn tiết kiệm ~12 kWh/tháng.",
  "savingsKwh": 12,
  "savingsVnd": 34320,
  "priority": "high",
  "difficulty": "easy"
}
```

**Invalid — generic advice**
```json
{ "title": "Tiết kiệm điện", "description": "Hãy tiết kiệm điện." }
```
→ **MUST** be rejected / re-prompted per REQ-REC-010.
