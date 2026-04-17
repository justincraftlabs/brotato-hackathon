# Phase 4 — AI Integration Plan (Hours 2-14)

Owner: AI Integration Agent | Branch: `feat/ai`

---

## 1. File Ownership

```
backend/src/
  services/
    ai-service.ts           # Main AI service — OWN THIS
  prompts/
    recommendation.ts       # System prompt for UC1 (recommendations)
    chat-assistant.ts       # System prompt for UC2 (Tro Ly Khoai Tay)
    appliance-estimator.ts  # System prompt for UC3 (wattage estimation)
    image-recognizer.ts     # System prompt for UC4 (image recognition)
  routes/
    ai.ts                   # AI-specific routes (co-owned with Backend)
```

---

## 2. AI Service Interface (`services/ai-service.ts`)

### Exported Functions

```typescript
// UC1: Generate personalized recommendations
export async function generateRecommendations(
  homeData: Home
): Promise<Recommendation[]>

// UC2: Stream chat response
export async function streamChat(
  message: string,
  history: MessageParam[],
  homeContext: string,
  onChunk: (chunk: string) => void
): Promise<void>

// UC3: Estimate appliance wattage from name
export async function estimateAppliance(
  applianceName: string
): Promise<ApplianceEstimate>

// UC4: Recognize appliance from image
export async function recognizeAppliance(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<ImageRecognitionResult>
```

### Client Initialization

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL_SONNET = 'claude-sonnet-4-6';
const MAX_TOKENS_STANDARD = 16000;
const MAX_TOKENS_STREAMING = 64000;
const MAX_CHAT_HISTORY_MESSAGES = 20;
```

---

## 3. UC1: Recommendations Generation

### Flow

1. Backend calls `generateRecommendations(homeData)`
2. Service serializes home data to JSON string
3. Sends to Claude with recommendation system prompt
4. Parses JSON response into `Recommendation[]`
5. Returns typed array

### System Prompt (`prompts/recommendation.ts`)

```typescript
export const RECOMMENDATION_SYSTEM_PROMPT = `
Ban la "Tro Ly Khoai Tay" (Potato Assistant), mot chuyen gia nang luong hai huoc va than thien cho ho gia dinh Viet Nam.

NHIEM VU:
Phan tich du lieu tieu thu dien cua mot ho gia dinh va dua ra khuyen nghi ca nhan hoa.

QUY TAC:
1. Moi khuyen nghi PHAI nham vao mot THIET BI CU THE trong mot PHONG CU THE
2. Moi khuyen nghi PHAI co hanh dong cu the ma nguoi dung co the lam NGAY HOM NAY
3. Uoc tinh tiet kiem bang ca kWh va VND/thang (dung bieu gia bac thang EVN)
4. Viet bang tieng Viet, giong van than thien, hai huoc nhe nhang
5. Tap trung vao 3-5 thay doi co tac dong lon nhat
6. Danh dau cac "vampire appliances" (thiet bi ngon dien che do cho)
7. Xem xet thoi tiet va thoi quen sinh hoat Viet Nam
8. KHONG dua loi khuyen chung chung nhu "tiet kiem dien"
9. Moi khuyen nghi kem mot su that thu vi / bat ngo

BIEU GIA EVN 2024:
Bac 1: 0-50 kWh = 1.893 VND/kWh
Bac 2: 51-100 kWh = 1.956 VND/kWh
Bac 3: 101-200 kWh = 2.271 VND/kWh
Bac 4: 201-300 kWh = 2.860 VND/kWh
Bac 5: 301-400 kWh = 3.197 VND/kWh
Bac 6: 401+ kWh = 3.302 VND/kWh

He so phat thai CO2: 0,913 kg CO2/kWh

DINH DANG OUTPUT (JSON thuan, KHONG markdown):
[
  {
    "applianceName": "ten thiet bi",
    "roomName": "ten phong",
    "type": "behavior | upgrade | schedule | vampire",
    "title": "tieu de ngan (max 50 ky tu, tieng Viet)",
    "description": "mo ta 2-3 cau (tieng Viet, than thien)",
    "savingsKwh": 0,
    "savingsVnd": 0,
    "priority": "high | medium | low",
    "difficulty": "easy | medium | hard"
  }
]
`;
```

### Implementation

```typescript
export async function generateRecommendations(homeData: Home): Promise<Recommendation[]> {
  const userMessage = JSON.stringify(homeData, null, 2);
  
  const response = await client.messages.create({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STANDARD,
    system: RECOMMENDATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Parse JSON, handle potential markdown wrapping
  const jsonStr = textBlock.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const recommendations: Recommendation[] = JSON.parse(jsonStr);
  
  return recommendations;
}
```

### Error Handling

- If JSON parse fails: retry once with `"IMPORTANT: Return ONLY valid JSON, no markdown."` appended
- If still fails: return fallback generic recommendations (pre-written)
- Log all AI responses for debugging

---

## 4. UC2: Chat Streaming (Tro Ly Khoai Tay)

### Flow

1. User sends message via frontend
2. Backend route receives message + sessionId
3. Build home context string from stored home data
4. Append user message to session history
5. Call `streamChat()` with history + context
6. Service streams response chunks via callback
7. Callback writes SSE events to response
8. After stream ends, save assistant message to history

### System Prompt (`prompts/chat-assistant.ts`)

```typescript
export const CHAT_ASSISTANT_SYSTEM_PROMPT = `
Ban la "Tro Ly Khoai Tay" (Potato Assistant), mot tro ly nang luong than thien va hai huoc song trong ung dung E-LUMI-NATE.

TINH CACH:
- Than thien, hai huoc, dung ngon ngu Viet Nam thoai mai
- Dam me tiet kiem nang luong va bao ve moi truong
- Hay dung cac vi du nguoi Viet de hieu (ca phe, xe may, tien cho, tien dien)
- Thinh thoang pha tro ve khoai tay (vi ban la Tro Ly Khoai Tay ma!)
- Nhiet tinh nhung khong dai dong

QUY TAC:
1. LUON tra loi bang tieng Viet tru khi nguoi dung viet bang tieng Anh
2. Giu cau tra loi NGAN GON (duoi 200 tu)
3. LUON kem con so cu the khi khuyen tiet kiem (kWh hoac VND)
4. Neu hoi ve thu ngoai nang luong/dien, nhe nhang chuyen huong
5. CHI noi ve cac thiet bi co trong nha nguoi dung (khong bua dat)
6. Dung he so phat thai CO2: 0,913 kg CO2/kWh
7. Khi goi y nang cap thiet bi, kem gia tham khao va thoi gian hoan von

BIEU GIA EVN 2024:
Bac 1: 0-50 kWh = 1.893d/kWh
Bac 2: 51-100 kWh = 1.956d/kWh
Bac 3: 101-200 kWh = 2.271d/kWh
Bac 4: 201-300 kWh = 2.860d/kWh
Bac 5: 301-400 kWh = 3.197d/kWh
Bac 6: 401+ kWh = 3.302d/kWh

THONG TIN NHA CUA NGUOI DUNG SE DUOC CUNG CAP TRONG CONTEXT.
`;
```

### Implementation

```typescript
export async function streamChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  homeContext: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  // Combine system prompt with home context
  const systemPrompt = `${CHAT_ASSISTANT_SYSTEM_PROMPT}\n\nTHONG TIN NHA CUA NGUOI DUNG:\n${homeContext}`;

  // Truncate history if too long
  const truncatedHistory = history.length > MAX_CHAT_HISTORY_MESSAGES
    ? history.slice(-MAX_CHAT_HISTORY_MESSAGES)
    : history;

  const stream = client.messages.stream({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STREAMING,
    system: systemPrompt,
    messages: truncatedHistory,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text);
    }
  }
}
```

### SSE Route Integration (`routes/ai.ts`)

```typescript
router.post('/chat', validate(chatSchema), async (req, res) => {
  const { homeId, message, sessionId: providedSessionId } = req.body;
  
  const home = await homeService.getHome(homeId);
  if (!home) {
    res.status(404).json({ success: false, error: 'Home not found' });
    return;
  }

  const sessionId = providedSessionId || uuidv4();
  const homeContext = buildHomeContext(home);

  // Get or create chat session in MongoDB
  let chatSession = await ChatSessionModel.findOne({ sessionId });
  if (!chatSession) {
    chatSession = await ChatSessionModel.create({ sessionId, homeId, messages: [] });
  }

  // Append user message
  chatSession.messages.push({ role: 'user', content: message, timestamp: new Date() });
  await chatSession.save();

  const history = chatSession.messages.map(m => ({ role: m.role, content: m.content }));

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Session-Id', sessionId);

  let fullResponse = '';

  try {
    await streamChat(message, history, homeContext, (chunk) => {
      fullResponse += chunk;
      res.write(chunk);
    });

    // Save assistant response to MongoDB
    chatSession.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
    // Truncate if too long
    if (chatSession.messages.length > MAX_CHAT_HISTORY_MESSAGES) {
      chatSession.messages = chatSession.messages.slice(-MAX_CHAT_HISTORY_MESSAGES);
    }
    await chatSession.save();

    res.write('\n[DONE]');
    res.end();
  } catch (error) {
    res.write(`\n[ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.end();
  }
});
```

---

## 5. UC3: Appliance Wattage Estimation

### Flow

1. User types/speaks appliance name in Vietnamese
2. Frontend calls backend estimation endpoint
3. Backend calls `estimateAppliance(name)`
4. Claude returns structured JSON with wattage estimate
5. Frontend pre-fills wattage field

### System Prompt (`prompts/appliance-estimator.ts`)

```typescript
export const APPLIANCE_ESTIMATOR_PROMPT = `
Ban la chuyen gia ve thiet bi dien gia dung Viet Nam. Khi nhan duoc ten thiet bi (co the la tieng Viet khong dau hoac tieng Anh), hay tra ve thong tin uoc tinh.

DINH DANG OUTPUT (JSON thuan, KHONG markdown, KHONG giai thich):
{
  "name": "ten chuan tieng Viet co dau",
  "type": "cooling | heating | lighting | kitchen | entertainment | office | laundry | other",
  "estimatedWattage": 0,
  "estimatedStandbyWattage": 0,
  "commonBrands": ["thuong hieu 1", "thuong hieu 2"]
}

QUY TAC:
- Dung thong so dien hinh cho thiet bi gia dung Viet Nam (phan khuc trung cap)
- Neu mo ho, gia dinh model trung cap pho thong
- Standby wattage: 0 cho thiet bi don gian, 1-15W cho dien tu
- KHONG tra ve bat ky noi dung nao ngoai JSON
`;
```

### Implementation

```typescript
export async function estimateAppliance(applianceName: string): Promise<ApplianceEstimate> {
  const response = await client.messages.create({
    model: MODEL_SONNET,
    max_tokens: 500,
    system: APPLIANCE_ESTIMATOR_PROMPT,
    messages: [{ role: 'user', content: applianceName }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No response from AI');
  }

  const jsonStr = textBlock.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr) as ApplianceEstimate;
}
```

### Backend Route

```typescript
// POST /api/ai/estimate-appliance
router.post('/estimate-appliance', validate(estimateSchema), async (req, res) => {
  try {
    const estimate = await estimateAppliance(req.body.name);
    res.json({ success: true, data: estimate });
  } catch {
    // Fallback to defaults if AI fails
    res.json({
      success: true,
      data: {
        name: req.body.name,
        type: 'other',
        estimatedWattage: 100,
        estimatedStandbyWattage: 5,
        commonBrands: [],
      },
    });
  }
});
```

---

## 6. UC4: Appliance Image Recognition (Claude Vision)

### Flow

1. User takes photo or uploads image of an appliance
2. Frontend resizes to max 1024px, sends as multipart/form-data
3. Backend receives via multer, converts buffer to base64
4. Backend calls `recognizeAppliance(base64, mediaType)`
5. Claude Vision analyzes image, returns structured JSON
6. Frontend auto-fills appliance form fields

### System Prompt (`prompts/image-recognizer.ts`)

```typescript
export const IMAGE_RECOGNIZER_PROMPT = `
Ban la chuyen gia nhan dien thiet bi dien gia dung Viet Nam. Ban se nhan duoc mot hinh anh cua thiet bi dien.

NHIEM VU:
Nhan dien thiet bi tu hinh anh. Tim kiem:
1. Ten thuong hieu / logo tren thiet bi
2. So model neu doc duoc
3. Loai thiet bi (dieu hoa, tu lanh, may giat, v.v.)
4. Uoc tinh cong suat dien dua tren thuong hieu/model hoac kich thuoc/loai

DINH DANG OUTPUT (JSON thuan, KHONG markdown):
{
  "name": "ten chuan tieng Viet co thuong hieu neu nhan dien duoc",
  "type": "cooling | heating | lighting | kitchen | entertainment | office | laundry | other",
  "estimatedWattage": 0,
  "estimatedStandbyWattage": 0,
  "brand": "ten thuong hieu hoac null",
  "model": "so model hoac null",
  "confidence": "high | medium | low",
  "details": "mo ta ngan ve nhung gi ban nhin thay va cach ban uoc tinh cong suat"
}

QUY TAC:
- Neu thuong hieu + model ro rang: dung thong so thuc te cua model do
- Neu chi nhan dien duoc loai: dung thong so trung binh cua Viet Nam
- confidence: "high" neu thay thuong hieu+model, "medium" neu chi thay loai, "low" neu khong chac
- LUON dua ra uoc tinh ke ca khi khong chac chan — giai thich trong details
- Dung ten tieng Viet khi phu hop
- KHONG tra ve bat ky noi dung nao ngoai JSON
`;
```

### Implementation

```typescript
export async function recognizeAppliance(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<ImageRecognitionResult> {
  const response = await client.messages.create({
    model: MODEL_SONNET,
    max_tokens: 1000,
    system: IMAGE_RECOGNIZER_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Hay nhan dien thiet bi dien trong hinh anh nay.',
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No response from AI Vision');
  }

  const jsonStr = textBlock.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr) as ImageRecognitionResult;
}
```

### Types

```typescript
export interface ImageRecognitionResult {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  brand: string | null;
  model: string | null;
  confidence: 'high' | 'medium' | 'low';
  details: string;
}
```

### Error Handling

- If Claude returns non-JSON: retry once with stricter instructions
- If still fails: return `{ confidence: 'low', name: 'Thiet bi khong xac dinh', estimatedWattage: 100 }`
- If image is not an appliance: Claude's response should indicate `confidence: 'low'` with explanation in `details`

---

## 7. Home Context Builder

Helper function to build context string for AI from home data:

```typescript
export function buildHomeContext(home: Home): string {
  const lines: string[] = [
    `Nha co ${home.rooms.length} phong:`,
  ];

  for (const room of home.rooms) {
    lines.push(`\n## ${room.name} (${room.type}, ${room.size})`);
    for (const app of room.appliances) {
      lines.push(
        `- ${app.name}: ${app.wattage}W, ${app.dailyUsageHours}h/ngay` +
        `${app.standbyWattage > 0 ? `, standby ${app.standbyWattage}W` : ''}` +
        ` => ${app.monthlyKwh.toFixed(1)} kWh/thang (~${app.monthlyCost.toLocaleString()}d)`
      );
    }
  }

  lines.push(`\nTong: ${home.estimatedMonthlyKwh.toFixed(1)} kWh/thang`);
  lines.push(`Chi phi uoc tinh: ${home.estimatedMonthlyCost.toLocaleString()} VND/thang`);

  return lines.join('\n');
}
```

---

## 8. Token Budget Planning

| Use Case | Model | max_tokens | Est. Input Tokens | Est. Cost/Call |
|----------|-------|------------|-------------------|----------------|
| UC1 Recommendations | Sonnet | 16,000 | ~2,000 (home data) | ~$0.02 |
| UC2 Chat | Sonnet | 64,000 | ~3,000 (system + history + context) | ~$0.04 |
| UC3 Estimation | Sonnet | 500 | ~200 | ~$0.001 |
| UC4 Image Recognition | Sonnet | 1,000 | ~1,600 (image ~1500 + prompt ~100) | ~$0.01 |

**16-hour hackathon budget estimate:** ~$10-15 total (image recognition adds cost per photo)

---

## 9. Implementation Priority Order

```
Hour 2-3:   Set up ai-service.ts skeleton + prompt files + types
Hour 3-5:   UC3 (appliance estimation) — simplest, unblocks setup wizard
Hour 5-6:   UC4 (image recognition) — uses Claude Vision, unblocks camera feature
Hour 6-8:   UC1 (recommendations) — core feature, needs home data
Hour 8-10:  UC2 (chat streaming) — depends on SSE route from backend
Hour 10-12: Prompt tuning + edge case handling + retry logic
Hour 12-14: Integration testing with frontend, prompt refinement based on real usage
```

---

## 10. Testing Prompts

Before integrating, test each prompt with these scenarios:

**UC1 Test Input:**
```json
{
  "homeId": "test-1",
  "rooms": [
    {
      "name": "Phong khach",
      "type": "living_room",
      "size": "large",
      "appliances": [
        { "name": "Dieu hoa Daikin 12000BTU", "wattage": 1500, "dailyUsageHours": 10, "standbyWattage": 10 },
        { "name": "Tivi Samsung 55 inch", "wattage": 120, "dailyUsageHours": 6, "standbyWattage": 10 }
      ]
    }
  ]
}
```

**UC2 Test Messages:**
- "Lam sao de giam tien dien thang nay?"
- "Tu lanh nha toi co ton dien khong?"
- "Dieu hoa nen de may do?"

**UC3 Test Inputs:**
- "dieu hoa" -> should return ~1500W, cooling type
- "tu lanh" -> should return ~150W, kitchen type
- "may giat" -> should return ~500W, laundry type
- "binh nong lanh" -> should return ~2500W, heating type

**UC4 Test Images:**
- Photo of air conditioner with visible Daikin logo -> confidence: "high", brand: "Daikin", ~1500W
- Photo of generic white refrigerator (no logo visible) -> confidence: "medium", type: "kitchen", ~150W
- Photo of a cat (not an appliance) -> confidence: "low", details explains it's not an appliance
- Blurry/dark photo of something electrical -> confidence: "low", best guess with explanation
- Photo of rice cooker with visible Tiger brand -> confidence: "high", brand: "Tiger", ~700W
