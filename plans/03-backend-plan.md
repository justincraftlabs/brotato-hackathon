# Phase 3 — Backend Implementation Plan (Hours 2-14)

Owner: Backend Engineer Agent | Branch: `feat/backend`

---

## 1. Project Setup (Hour 2-3)

### Scaffold

```bash
mkdir backend && cd backend
npm init -y
npm install express cors zod dotenv uuid @anthropic-ai/sdk mongoose multer
npm install -D typescript @types/express @types/cors @types/uuid @types/multer tsx
npx tsc --init
```

### tsconfig.json Key Settings

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

### Folder Structure

```
backend/
  src/
    index.ts                    # Express app entry point
    routes/
      home.ts                   # POST /setup, POST /:id/appliances, GET /:id
      energy.ts                 # GET /:homeId/dashboard
      ai.ts                    # POST /recommendations, POST /chat (SSE)
      simulator.ts              # POST /calculate
      tips.ts                   # GET /daily (stretch)
    services/
      home-service.ts           # Home + appliance CRUD logic
      energy-service.ts         # Energy calculation engine
      ai-service.ts             # Claude AI integration (owned by AI agent)
      simulator-service.ts      # Simulation calculations
      evn-pricing-service.ts    # EVN tiered pricing calculator
    middleware/
      error-handler.ts          # Global error handling middleware
      validate.ts               # zod validation middleware factory
      upload.ts                 # Multer config for image uploads
    models/
      home.model.ts             # Mongoose Home schema + model
      room.model.ts             # Mongoose Room schema + model
      appliance.model.ts        # Mongoose Appliance schema + model
      chat-session.model.ts     # Mongoose ChatSession schema + model
    types/
      home.ts                   # Room, Appliance, Home interfaces
      energy.ts                 # Dashboard, EVN, Anomaly interfaces
      ai.ts                     # Recommendation, Chat, ImageRecognition interfaces
      simulator.ts              # Simulator interfaces
      api.ts                    # ApiResponse<T> envelope type
    constants/
      evn-tiers.ts              # EVN pricing tiers 2024
      appliance-defaults.ts     # Default wattage by appliance type
      co2.ts                    # CO2 emission factor
      room-sizes.ts             # Room size -> area mapping
    db/
      connection.ts             # MongoDB connection setup
  .env
  package.json
  tsconfig.json
```

### Entry Point (`src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import { homeRouter } from './routes/home';
import { energyRouter } from './routes/energy';
import { aiRouter } from './routes/ai';
import { simulatorRouter } from './routes/simulator';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' })); // larger limit for base64 images

app.use('/api/home', homeRouter);
app.use('/api/energy', energyRouter);
app.use('/api/ai', aiRouter);
app.use('/api/simulator', simulatorRouter);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});
```

### .env

```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb://localhost:27017/e-lumi-nate
NODE_ENV=development
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 2. Core Types (`src/types/`)

### `types/api.ts`

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### `types/home.ts`

```typescript
export const ROOM_TYPES = [
  'bedroom', 'living_room', 'kitchen', 'bathroom', 'office', 'other'
] as const;
export type RoomType = typeof ROOM_TYPES[number];

export const ROOM_SIZES = ['small', 'medium', 'large'] as const;
export type RoomSize = typeof ROOM_SIZES[number];

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  size: RoomSize;
}

export interface Appliance {
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

export interface Home {
  homeId: string;
  rooms: Array<Room & { appliances: Appliance[] }>;
  totalWattage: number;
  estimatedMonthlyKwh: number;
  estimatedMonthlyCost: number;
}
```

### `types/energy.ts`

```typescript
export interface DashboardData {
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  evnTier: {
    current: number;
    nextThreshold: number;
    currentRate: number;
    nextRate: number;
  };
  topConsumers: Array<{
    applianceName: string;
    roomName: string;
    monthlyKwh: number;
    monthlyCost: number;
    percentOfTotal: number;
  }>;
  comparison: {
    vsLastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  anomalies: Array<{
    applianceName: string;
    deviation: number;
    message: string;
  }>;
  co2: {
    totalKg: number;
    treesEquivalent: number;
  };
}
```

---

## 3. Constants (`src/constants/`)

### `evn-tiers.ts`

```typescript
export interface EvnTier {
  tier: number;
  maxKwh: number;
  ratePerKwh: number;
}

export const EVN_TIERS: EvnTier[] = [
  { tier: 1, maxKwh: 50,       ratePerKwh: 1893 },
  { tier: 2, maxKwh: 100,      ratePerKwh: 1956 },
  { tier: 3, maxKwh: 200,      ratePerKwh: 2271 },
  { tier: 4, maxKwh: 300,      ratePerKwh: 2860 },
  { tier: 5, maxKwh: 400,      ratePerKwh: 3197 },
  { tier: 6, maxKwh: Infinity, ratePerKwh: 3302 },
];
```

### `co2.ts`

```typescript
export const CO2_EMISSION_FACTOR_KG_PER_KWH = 0.913;
export const CO2_ABSORPTION_PER_TREE_KG_PER_YEAR = 20;
```

### `appliance-defaults.ts`

```typescript
export interface ApplianceDefault {
  type: string;
  typicalWattage: number;
  typicalStandbyWattage: number;
  typicalDailyHours: number;
}

export const APPLIANCE_DEFAULTS: Record<string, ApplianceDefault> = {
  air_conditioner: { type: 'cooling', typicalWattage: 1500, typicalStandbyWattage: 10, typicalDailyHours: 8 },
  fan: { type: 'cooling', typicalWattage: 60, typicalStandbyWattage: 0, typicalDailyHours: 10 },
  refrigerator: { type: 'kitchen', typicalWattage: 150, typicalStandbyWattage: 150, typicalDailyHours: 24 },
  washing_machine: { type: 'laundry', typicalWattage: 500, typicalStandbyWattage: 5, typicalDailyHours: 1 },
  television: { type: 'entertainment', typicalWattage: 120, typicalStandbyWattage: 10, typicalDailyHours: 5 },
  rice_cooker: { type: 'kitchen', typicalWattage: 700, typicalStandbyWattage: 5, typicalDailyHours: 1 },
  water_heater: { type: 'heating', typicalWattage: 2500, typicalStandbyWattage: 0, typicalDailyHours: 0.5 },
  light_bulb: { type: 'lighting', typicalWattage: 10, typicalStandbyWattage: 0, typicalDailyHours: 8 },
  computer: { type: 'office', typicalWattage: 200, typicalStandbyWattage: 5, typicalDailyHours: 8 },
  microwave: { type: 'kitchen', typicalWattage: 1000, typicalStandbyWattage: 3, typicalDailyHours: 0.3 },
};
```

---

## 4. MongoDB Setup

### Connection (`src/db/connection.ts`)

```typescript
import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-lumi-nate';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
```

### Mongoose Models (`src/models/`)

#### `home.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IHome extends Document {
  homeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema<IHome>(
  { homeId: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export const HomeModel = mongoose.model<IHome>('Home', homeSchema);
```

#### `room.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  homeId: string;
  name: string;
  type: string;
  size: string;
}

const roomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  homeId: { type: String, required: true, index: true },
  name:   { type: String, required: true },
  type:   { type: String, required: true },
  size:   { type: String, required: true },
});

export const RoomModel = mongoose.model<IRoom>('Room', roomSchema);
```

#### `appliance.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppliance extends Document {
  applianceId: string;
  roomId: string;
  homeId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
  imageUrl?: string;          // stored base64 thumbnail or empty
  recognitionConfidence?: string;
}

const applianceSchema = new Schema<IAppliance>({
  applianceId:     { type: String, required: true, unique: true },
  roomId:          { type: String, required: true, index: true },
  homeId:          { type: String, required: true, index: true },
  name:            { type: String, required: true },
  type:            { type: String, required: true },
  wattage:         { type: Number, required: true },
  dailyUsageHours: { type: Number, required: true },
  standbyWattage:  { type: Number, default: 0 },
  usageHabit:      { type: String, default: '' },
  monthlyKwh:      { type: Number, required: true },
  monthlyCost:     { type: Number, required: true },
  imageUrl:        { type: String },
  recognitionConfidence: { type: String },
});

export const ApplianceModel = mongoose.model<IAppliance>('Appliance', applianceSchema);
```

#### `chat-session.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  homeId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    homeId:    { type: String, required: true, index: true },
    messages:  [{
      role:      { type: String, enum: ['user', 'assistant'], required: true },
      content:   { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

export const ChatSessionModel = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
```

### Multer Config (`src/middleware/upload.ts`)

```typescript
import multer from 'multer';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
      return;
    }
    cb(null, true);
  },
});
```

---

## 5. Middleware

### `middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.errors[0].message });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

### `middleware/error-handler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
```

---

## 6. Services

### `services/evn-pricing-service.ts`

Core calculation engine for EVN tiered pricing.

```typescript
// calculateMonthlyCost(totalKwh: number): number
// Returns total cost in VND using tiered pricing
// Logic: iterate through EVN_TIERS, accumulate cost per tier

// getCurrentTier(totalKwh: number): { current, nextThreshold, currentRate, nextRate }
// Returns which tier the household is currently at

// calculateApplianceMonthlyCost(wattage: number, dailyHours: number): { kwh: number, cost: number }
// Simple: kwh = (wattage/1000) * dailyHours * 30
// Cost requires knowing total household kwh for tier allocation
```

### `services/home-service.ts`

```typescript
// createHome(rooms: RoomInput[]): Promise<Home>
// - Generate homeId (uuid)
// - Create HomeModel document
// - Create RoomModel documents for each room
// - Return Home with calculated estimates

// addAppliances(homeId: string, roomId: string, appliances: ApplianceInput[]): Promise<Appliance[]>
// - Generate appliance IDs
// - Calculate monthlyKwh and monthlyCost per appliance
// - Create ApplianceModel documents
// - Return created appliances

// getHome(homeId: string): Promise<Home | null>
// - Query HomeModel, RoomModel, ApplianceModel by homeId
// - Aggregate into Home response shape
```

### `services/energy-service.ts`

```typescript
// getDashboard(homeId: string): Promise<DashboardData>
// Steps:
// 1. Get home from MongoDB
// 2. Calculate total monthly kWh across all appliances
// 3. Calculate total monthly cost using EVN tiered pricing
// 4. Determine current EVN tier + next threshold
// 5. Rank top consumers (sort by monthlyKwh desc, take top 5)
// 6. Generate mock comparison data (±5-15% random for demo)
// 7. Flag anomalies (any appliance >120% of its type's baseline)
// 8. Calculate CO2: totalKwh * 0.913, trees = co2 / 20
```

### `services/simulator-service.ts`

```typescript
// calculateSimulation(homeId: string, adjustments: Adjustment[]): Promise<SimulationResult>
// Steps:
// 1. Get current home data from MongoDB
// 2. Apply adjustments to create simulated appliance list
// 3. Calculate original totals (kWh, cost, CO2)
// 4. Calculate simulated totals
// 5. Compute deltas
// 6. Determine per-appliance impact level (high/medium/low)
```

---

## 7. Route Implementations

### Route 1: `POST /api/home/setup`

**Validation Schema:**
```typescript
const setupSchema = z.object({
  rooms: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.enum(['bedroom', 'living_room', 'kitchen', 'bathroom', 'office', 'other']),
    size: z.enum(['small', 'medium', 'large']),
  })).min(1),
});
```

**Handler:** Delegate to `homeService.createHome(rooms)` -> return home data.

---

### Route 2: `POST /api/home/:homeId/appliances`

**Validation Schema:**
```typescript
const appliancesSchema = z.object({
  roomId: z.string(),
  appliances: z.array(z.object({
    name: z.string().min(1),
    type: z.string(),
    wattage: z.number().positive(),
    dailyUsageHours: z.number().min(0).max(24),
    standbyWattage: z.number().min(0).optional().default(0),
    usageHabit: z.string().optional().default(''),
  })).min(1),
});
```

**Handler:** Validate homeId exists, delegate to `homeService.addAppliances()` -> return appliances.

---

### Route 3: `GET /api/home/:homeId`

**Handler:** `homeService.getHome(homeId)` -> return full home data with all rooms and appliances.

---

### Route 4: `GET /api/energy/:homeId/dashboard`

**Handler:** `energyService.getDashboard(homeId)` -> return dashboard data.

---

### Route 5: `POST /api/ai/recommendations`

**Validation:** `{ homeId: z.string() }`

**Handler:**
1. Get home data from MongoDB
2. Call `aiService.generateRecommendations(homeData)`
3. Parse AI JSON response
4. Return structured recommendations

---

### Route 6: `POST /api/ai/chat` (SSE)

**Validation:** `{ homeId: z.string(), message: z.string(), sessionId: z.string().optional() }`

**Handler:**
1. Set SSE headers
2. Get/create session
3. Build context from home data
4. Call `aiService.streamChat(message, history, context)`
5. Pipe chunks as SSE events
6. End with `[DONE]`

---

### Route 7: `POST /api/simulator/calculate`

**Validation:**
```typescript
const simulatorSchema = z.object({
  homeId: z.string(),
  adjustments: z.array(z.object({
    applianceId: z.string(),
    newWattage: z.number().positive().optional(),
    newDailyHours: z.number().min(0).max(24).optional(),
    newTemperature: z.number().min(16).max(30).optional(),
  })),
});
```

**Handler:** `simulatorService.calculateSimulation(homeId, adjustments)` -> return comparison data.

---

### Route 8: `POST /api/ai/recognize-appliance` (Image Recognition)

**Middleware:** `imageUpload.single('image')` (multer)

**Handler:**
1. Extract image buffer from `req.file`
2. Convert to base64: `req.file.buffer.toString('base64')`
3. Determine media type from `req.file.mimetype`
4. Call `aiService.recognizeAppliance(base64, mediaType)`
5. Parse AI JSON response
6. Return structured recognition result

**Error handling:**
- No file uploaded -> 400 "Image is required"
- File too large (>5MB) -> 400 "Image too large, max 5MB"
- Invalid format -> 400 "Only JPEG, PNG, WebP allowed"
- AI fails to recognize -> return fallback with `confidence: "low"`

---

## 8. Implementation Priority Order

```
Hour 2-3:   Scaffold + types + constants + middleware + MongoDB connection + Mongoose models
Hour 3-4:   evn-pricing-service.ts + home-service.ts + home routes (setup, appliances, get)
Hour 4-6:   energy-service.ts + energy routes (dashboard)
Hour 6-8:   AI routes scaffold (recommendations + chat SSE + image recognition) — awaiting AI agent
Hour 8-10:  simulator-service.ts + simulator routes + multer upload middleware
Hour 10-12: Integration with AI service (once AI agent delivers ai-service.ts + vision)
Hour 12-14: Edge cases, error handling, demo data seeding
```

---

## 9. Demo Data Seed

Create `src/seed/demo-home.ts` — pre-built home for demo:

- **3 rooms:** Living room (large), Bedroom (medium), Kitchen (small)
- **8 appliances:**
  - Living Room: Air Conditioner (1500W, 8h), TV (120W, 5h), Fan (60W, 10h)
  - Bedroom: Air Conditioner (1200W, 8h), Light (10W, 6h)
  - Kitchen: Refrigerator (150W, 24h), Rice Cooker (700W, 1h), Microwave (1000W, 0.3h)
- **Estimated total:** ~450 kWh/month, ~1,200,000 VND/month

Load demo data on startup if `NODE_ENV=development` and no homes exist.
