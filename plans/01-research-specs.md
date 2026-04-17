# Phase 1 — Research Specs (Hours 0-2)

Owner: Researcher Agent | Branch: `feat/research`

---

## 1. Product Spec (`specs/research/spec.md`)

### Problem Statement

Millions of Vietnamese households receive monthly electricity bills with a single total number and zero visibility into *why* it's high. "Vampire appliances" silently consume up to 10% of total energy. The real blind spot is not lack of awareness — it's lack of data.

### Target User

- Vietnamese household member (25-45 years old)
- Owns smartphone, pays electricity bills monthly
- Wants to reduce bills but doesn't know where to start
- Not technically savvy — needs simple, actionable advice

### Feature List (Prioritized)

| ID | Feature | Description | MVP? |
|----|---------|-------------|------|
| F1 | Home Setup Wizard | Multi-step wizard: select rooms, add appliances per room with wattage + daily usage hours | Yes |
| F2 | Energy Dashboard | Visual breakdown: top consumers, EVN tier progress, month comparison, anomaly alerts | Yes |
| F3 | AI Recommendations | "Tro Ly Khoai Tay" gives personalized, device-specific savings tips with VND estimates | Yes |
| F4 | Green Heatmap Simulator | Drag-and-adjust simulation: change appliance settings, see CO2/VND impact in real-time | Yes |
| F5 | Voice Input | Speech-to-text for adding appliances and chatting with AI (Vietnamese primary) | Yes |
| F6 | Image Recognition | Camera/upload photo of appliance -> AI Vision identifies type + estimates wattage | Yes |
| F7 | Weather-aware Tips | Daily tips adjusted to current weather/location (stretch: real API, MVP: mock data) | Stretch |

### User Stories

```
US-01: As a homeowner, I want to set up my house layout (rooms + appliances) 
       so the app knows what I have.

US-02: As a homeowner, I want to see which appliances consume the most energy 
       so I know where to cut back.

US-03: As a homeowner, I want personalized savings tips from an AI assistant 
       so I can act immediately.

US-04: As a homeowner, I want to simulate "what if" scenarios 
       so I can see the impact before changing habits.

US-05: As a homeowner, I want to speak instead of type 
       so adding appliances is faster and more fun.

US-06: As a homeowner, I want to take a photo of an appliance 
       so the app can auto-detect what it is and estimate its wattage.

US-07: As a homeowner, I want to see my CO2 impact in tree equivalents 
       so I feel motivated to save.
```

### Out of Scope

- User login / account creation
- Real-time smart meter integration
- Payment / billing integration with EVN
- Social features / leaderboards
- Push notifications
- Multi-household management

### Success Criteria (Demo Day)

1. User can set up a house with 3+ rooms and 5+ appliances in under 2 minutes
2. Dashboard shows energy breakdown with clear visual hierarchy
3. AI assistant gives at least 3 personalized, actionable tips
4. Heatmap simulator shows real-time VND/CO2 changes when adjusting appliances
5. Voice input works for adding at least one appliance in Vietnamese
6. Image recognition identifies at least one appliance from a photo
7. App feels polished, friendly, and mobile-native

---

## 2. Tech Stack Confirmation (`specs/research/tech-stack.md`)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | Team standard, SSR + client components |
| Backend | Express.js + TypeScript | Team standard, fast prototyping |
| AI SDK | `@anthropic-ai/sdk` | Team standard |
| AI Model | `claude-sonnet-4-6` | Best balance of quality + speed for chat |
| Styling | Tailwind CSS | Utility-first, mobile-first responsive |
| UI Components | shadcn/ui | Accessible, customizable, dark mode support |
| Charts | Recharts | Lightweight, React-native charts |
| Voice | Web Speech API (browser) | Zero backend cost, Vietnamese supported |
| Vision | Claude Vision API (base64) | Appliance image recognition via @anthropic-ai/sdk |
| Database | MongoDB + Mongoose | Persistent storage, flexible schema for appliances |
| Weather | Static mock data | MVP simplicity (stretch: OpenWeatherMap) |
| Auth | None | MVP — skip entirely |

### Key NPM Packages

**Frontend:**
```
next@14
react@18
tailwindcss
@shadcn/ui (via npx shadcn-ui@latest init)
recharts
lucide-react (icons)
class-variance-authority
clsx + tailwind-merge
```

**Backend:**
```
express
cors
zod
@anthropic-ai/sdk
mongoose
multer (file upload handling)
dotenv
uuid (session IDs)
```

**Dev:**
```
typescript
tsx (for running backend in dev)
concurrently (run FE + BE together)
```

---

## 3. API Contracts (`specs/research/api-contracts.md`)

Base URL: `http://localhost:3001/api`

### 3.1 Home Setup

```
POST /api/home/setup
Request: {
  rooms: Array<{
    id: string;
    name: string;
    type: "bedroom" | "living_room" | "kitchen" | "bathroom" | "office" | "other";
    size: "small" | "medium" | "large";
  }>
}
Response: { success: true, data: { homeId: string, rooms: Room[] } }
```

```
POST /api/home/:homeId/appliances
Request: {
  roomId: string;
  appliances: Array<{
    name: string;
    type: string;
    wattage: number;
    dailyUsageHours: number;
    standbyWattage?: number;
    usageHabit?: string;
  }>
}
Response: { success: true, data: { roomId: string, appliances: Appliance[] } }
```

```
GET /api/home/:homeId
Response: { 
  success: true, 
  data: { 
    homeId: string,
    rooms: Array<Room & { appliances: Appliance[] }>,
    totalWattage: number,
    estimatedMonthlyKwh: number,
    estimatedMonthlyCost: number
  } 
}
```

### 3.2 Energy Dashboard

```
GET /api/energy/:homeId/dashboard
Response: {
  success: true,
  data: {
    totalMonthlyKwh: number;
    totalMonthlyCost: number;
    evnTier: { current: number, nextThreshold: number, currentRate: number, nextRate: number };
    topConsumers: Array<{ applianceName: string, roomName: string, monthlyKwh: number, monthlyCost: number, percentOfTotal: number }>;
    comparison: { vsLastMonth: number, trend: "up" | "down" | "stable" };
    anomalies: Array<{ applianceName: string, deviation: number, message: string }>;
    co2: { totalKg: number, treesEquivalent: number };
  }
}
```

### 3.3 AI Recommendations

```
POST /api/ai/recommendations
Request: { homeId: string }
Response: {
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

### 3.4 AI Chat (Streaming)

```
POST /api/ai/chat
Request: { 
  homeId: string;
  message: string;
  sessionId?: string;
}
Response: SSE stream
  data: <text chunk>
  data: [DONE]
  data: [ERROR] <message>
```

### 3.5 Green Heatmap Simulator

```
POST /api/simulator/calculate
Request: {
  homeId: string;
  adjustments: Array<{
    applianceId: string;
    newWattage?: number;
    newDailyHours?: number;
    newTemperature?: number;
  }>
}
Response: {
  success: true,
  data: {
    original: { monthlyKwh: number, monthlyCost: number, co2Kg: number };
    simulated: { monthlyKwh: number, monthlyCost: number, co2Kg: number };
    delta: { kwhSaved: number, costSaved: number, co2Saved: number, treesEquivalent: number };
    perAppliance: Array<{
      applianceId: string;
      applianceName: string;
      originalKwh: number;
      simulatedKwh: number;
      impact: "high" | "medium" | "low";
    }>;
  }
}
```

### 3.6 Image Recognition

```
POST /api/ai/recognize-appliance
Content-Type: multipart/form-data
Request: {
  image: File (JPEG/PNG, max 5MB)
}
Response: {
  success: true,
  data: {
    name: string;
    type: string;
    estimatedWattage: number;
    estimatedStandbyWattage: number;
    brand?: string;
    model?: string;
    confidence: "high" | "medium" | "low";
    details: string;
  }
}
```

### 3.7 Weather Tips (Stretch)

```
GET /api/tips/daily?location=ho_chi_minh
Response: {
  success: true,
  data: {
    location: string;
    temperature: number;
    condition: string;
    tips: Array<{ text: string, savingsEstimate: string }>;
  }
}
```

### Shared Types

```typescript
interface Room {
  id: string;
  name: string;
  type: RoomType;
  size: RoomSize;
}

interface Appliance {
  id: string;
  roomId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
}

type RoomType = "bedroom" | "living_room" | "kitchen" | "bathroom" | "office" | "other";
type RoomSize = "small" | "medium" | "large";

interface EVNTier {
  tier: number;
  maxKwh: number;
  ratePerKwh: number;
}
```

### EVN Pricing Tiers (2024)

```typescript
const EVN_TIERS: EVNTier[] = [
  { tier: 1, maxKwh: 50,  ratePerKwh: 1893 },
  { tier: 2, maxKwh: 100, ratePerKwh: 1956 },
  { tier: 3, maxKwh: 200, ratePerKwh: 2271 },
  { tier: 4, maxKwh: 300, ratePerKwh: 2860 },
  { tier: 5, maxKwh: 400, ratePerKwh: 3197 },
  { tier: 6, maxKwh: Infinity, ratePerKwh: 3302 },
];
```

---

## 4. AI Design (`specs/research/ai-design.md`)

### AI Use Cases

| # | Use Case | Model | Input | Output |
|---|----------|-------|-------|--------|
| UC1 | Generate Recommendations | `claude-sonnet-4-6` | Home data (rooms, appliances, usage) | Structured JSON: personalized tips per appliance |
| UC2 | Chat Assistant (Tro Ly Khoai Tay) | `claude-sonnet-4-6` | User message + home context | Streamed Vietnamese text with energy advice |
| UC3 | Appliance Wattage Estimation | `claude-sonnet-4-6` | Appliance name (Vietnamese) | Estimated wattage, standby wattage, type |
| UC4 | Appliance Image Recognition | `claude-sonnet-4-6` | Photo of appliance (base64) | Identified appliance name, type, wattage, brand/model |

### System Prompt: Recommendations (UC1)

```
You are "Tro Ly Khoai Tay" (Potato Assistant), a witty and friendly energy advisor for Vietnamese households.

CONTEXT:
You will receive a JSON object describing a Vietnamese household: rooms, appliances, wattage, daily usage hours, and usage habits.

TASK:
Analyze the energy consumption and produce personalized recommendations. Each recommendation must:
1. Target a SPECIFIC appliance in a SPECIFIC room
2. Include a concrete action the user can take TODAY
3. Estimate savings in both kWh and VND per month
4. Be written in Vietnamese, casual and friendly tone
5. Use the EVN tiered pricing to calculate costs

RULES:
- Focus on the top 3-5 highest-impact changes
- Flag any "vampire appliances" (standby consumption)
- Consider Vietnamese climate and lifestyle habits
- Be specific — never give generic advice like "save electricity"
- Include one fun/surprising fact per recommendation

OUTPUT FORMAT:
Return valid JSON array matching this schema:
[{
  "applianceName": string,
  "roomName": string,
  "type": "behavior" | "upgrade" | "schedule" | "vampire",
  "title": string (Vietnamese, max 50 chars),
  "description": string (Vietnamese, 2-3 sentences),
  "savingsKwh": number,
  "savingsVnd": number,
  "priority": "high" | "medium" | "low",
  "difficulty": "easy" | "medium" | "hard"
}]
```

### System Prompt: Chat Assistant (UC2)

```
You are "Tro Ly Khoai Tay" (Potato Assistant), a witty and eco-friendly energy advisor living inside the E-LUMI-NATE app.

PERSONALITY:
- Friendly, humorous, uses Vietnamese casual language
- Passionate about saving energy and the environment
- Uses analogies Vietnamese people relate to (ca phe, xe may, tien dien)
- Occasionally makes potato-related jokes

CONTEXT:
You have access to the user's home data (provided in system context). Use it to personalize every answer.

RULES:
- Always respond in Vietnamese unless the user writes in English
- Keep responses concise (under 200 words)
- Always include a specific number when giving savings advice (kWh or VND)
- If asked about something outside energy/electricity, gently redirect
- Never make up appliance data — only reference what's in the user's home
- Use the CO2 emission factor: 0.913 kg CO2/kWh for Vietnam

EVN PRICING (2024):
Tier 1: 0-50 kWh = 1,893 VND/kWh
Tier 2: 51-100 kWh = 1,956 VND/kWh
Tier 3: 101-200 kWh = 2,271 VND/kWh
Tier 4: 201-300 kWh = 2,860 VND/kWh
Tier 5: 301-400 kWh = 3,197 VND/kWh
Tier 6: 401+ kWh = 3,302 VND/kWh
```

### System Prompt: Appliance Estimation (UC3)

```
You are an appliance energy expert. Given a Vietnamese appliance name (possibly spoken/informal), return a JSON estimate.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "name": string (standardized Vietnamese name),
  "type": string (category: "cooling", "heating", "lighting", "kitchen", "entertainment", "office", "laundry", "other"),
  "estimatedWattage": number (typical wattage in W),
  "estimatedStandbyWattage": number (standby/vampire wattage in W),
  "commonBrands": string[] (2-3 common brands in Vietnam)
}

RULES:
- Use typical Vietnamese household appliance specs
- If ambiguous, assume mid-range consumer model
- Standby wattage: 0 for simple devices, 1-15W for electronics
```

### System Prompt: Image Recognition (UC4)

```
You are an appliance identification expert for Vietnamese households. You will receive a photo of a household appliance.

TASK:
Identify the appliance from the image. Look for:
1. Brand name / logo visible on the device
2. Model number if readable
3. Type of appliance (AC, fridge, washing machine, etc.)
4. Estimate power consumption based on identified brand/model or visual size/type

OUTPUT FORMAT (strict JSON, no markdown):
{
  "name": "standardized Vietnamese name with brand if identified",
  "type": "cooling | heating | lighting | kitchen | entertainment | office | laundry | other",
  "estimatedWattage": number,
  "estimatedStandbyWattage": number,
  "brand": "brand name or null",
  "model": "model number or null",
  "confidence": "high | medium | low",
  "details": "brief description of what you see and how you estimated the wattage"
}

RULES:
- If brand/model is clearly visible, use actual specs for that model
- If only type is identifiable, use typical Vietnamese mid-range specs
- Set confidence: "high" if brand+model visible, "medium" if only type clear, "low" if uncertain
- Always provide an estimate even if uncertain — explain uncertainty in details field
- Use Vietnamese names where appropriate
```

### Conversation Pattern

- **Recommendations (UC1):** Single-turn. Send home data, get structured JSON back.
- **Chat (UC2):** Multi-turn. Maintain conversation history per session. Include home data in system context.
- **Estimation (UC3):** Single-turn. Send appliance name, get JSON back.
- **Image Recognition (UC4):** Single-turn. Send base64 image, get JSON back.

### Edge Cases

| Scenario | Handling |
|----------|----------|
| AI returns invalid JSON (UC1, UC3) | Retry once with stricter prompt; if still fails, return error to user |
| AI refuses or goes off-topic (UC2) | System prompt includes redirect instruction |
| Very long conversation history | Truncate to last 20 messages |
| Empty home data | Return generic starter tips + prompt to set up home first |
| Vietnamese slang for appliances | UC3 prompt handles informal names |
| Image too dark / blurry (UC4) | Return low confidence estimate + ask user to retake |
| Image not an appliance (UC4) | Return error message: "Khong nhan dien duoc thiet bi dien" |
| Large image file (UC4) | Resize to max 1024px before sending to Claude (reduce tokens) |

---

## Deliverables Checklist

- [ ] `specs/research/spec.md` — product spec with 7 features and 7 user stories
- [ ] `specs/research/tech-stack.md` — confirmed stack with NPM packages (incl. mongoose, multer)
- [ ] `specs/research/api-contracts.md` — 7 API endpoints with full request/response shapes (incl. image recognition)
- [ ] `specs/research/ai-design.md` — 4 system prompts (incl. vision), conversation patterns, edge cases
