# Phase 2 — Frontend Implementation Plan (Hours 2-14)

Owner: Frontend Engineer Agent | Branch: `feat/frontend`

---

## 1. Project Setup (Hour 2-3)

### Scaffold

```bash
npx create-next-app@14 frontend --typescript --tailwind --app --src-dir --no-import-alias
cd frontend
npx shadcn-ui@latest init  # dark mode: class, style: default, base color: slate
```

### Theme Configuration

Override Tailwind + shadcn theme to match E-LUMI-NATE branding:

```typescript
// tailwind.config.ts — extend colors
colors: {
  primary: {
    DEFAULT: '#3B8C2A',
    dark: '#3B8C2A',
    mid: '#639922',
    light: '#EAF3DE',
  },
  accent: {
    DEFAULT: '#EF9F27',
    dark: '#BA7517',
    mid: '#EF9F27',
    light: '#FAEEDA',
  },
  surface: {
    dark: '#1E1E1E',
    card: '#2A2A2A',
    light: '#F5F5F0',
  }
}
```

### Dark/Light Mode

- Use `next-themes` with `class` strategy
- Default: dark mode (matches branding image)
- Toggle button in header

### shadcn Components to Install

```bash
npx shadcn-ui@latest add button card input label select slider tabs badge progress dialog sheet toast
```

### Folder Structure

```
frontend/
  src/
    app/
      layout.tsx                    # Root layout + theme provider + fonts
      page.tsx                      # Landing / redirect to /setup or /dashboard
      setup/
        page.tsx                    # Home Setup Wizard (F1)
      dashboard/
        page.tsx                    # Energy Dashboard (F2)
      chat/
        page.tsx                    # AI Chat with Tro Ly Khoai Tay (F3)
      simulator/
        page.tsx                    # Green Heatmap Simulator (F4)
    components/
      ui/                           # shadcn components (auto-generated)
      layout/
        Header.tsx                  # Logo + nav + theme toggle
        BottomNav.tsx               # Mobile bottom navigation bar
        PageContainer.tsx           # Consistent page wrapper
      setup/
        RoomSelector.tsx            # Room type + size picker
        ApplianceForm.tsx           # Add appliance form
        ApplianceCard.tsx           # Display single appliance
        VoiceInputButton.tsx        # Mic button for speech-to-text (F5)
        ImageCaptureButton.tsx      # Camera/upload button for image recognition (F6)
        ImagePreview.tsx            # Preview captured/uploaded image with AI result
      dashboard/
        EnergyOverview.tsx          # Total kWh, cost, CO2 summary cards
        TopConsumersChart.tsx       # Bar chart: top energy eaters
        EvnTierProgress.tsx         # Progress bar: EVN tier tracker
        MonthComparison.tsx         # Delta % vs last month
        AnomalyAlert.tsx            # Warning banner for outlier appliances
        Co2TreeVisual.tsx           # Tree count visualization
      chat/
        ChatBubble.tsx              # Single chat message (user or AI)
        ChatInput.tsx               # Text input + voice button + send
        StreamingText.tsx           # Progressive text rendering for SSE
      simulator/
        SimulatorSlider.tsx         # Adjust wattage/hours/temperature
        ImpactCard.tsx              # Show delta: kWh, VND, CO2, trees
        HeatmapGrid.tsx             # Color-coded appliance grid
      shared/
        ApplianceIcon.tsx           # Icon resolver by appliance type
        SavingsTag.tsx              # "Save 85,000d/month" badge
        LoadingSpinner.tsx          # Consistent loading state
        ErrorBanner.tsx             # Consistent error state
    lib/
      api.ts                        # ALL backend API calls
      types.ts                      # Shared TypeScript interfaces
      constants.ts                  # EVN tiers, CO2 factor, room size defaults
      format.ts                     # Number formatting (VND, kWh, %)
      speech.ts                     # Web Speech API wrapper
      image.ts                      # Image capture, resize, base64 conversion
      theme.ts                      # Theme configuration
    hooks/
      useHome.ts                    # Home data state management
      useDashboard.ts               # Dashboard data fetching
      useChat.ts                    # Chat state + SSE streaming
      useSimulator.ts               # Simulator state + calculations
      useSpeech.ts                  # Speech-to-text hook
      useImageCapture.ts            # Camera/file upload + AI recognition hook
      useLocalStorage.ts            # Persist homeId across sessions
```

---

## 2. Page-by-Page Implementation

### Page 1: Landing (`/`) — Hour 3

**Purpose:** Quick intro + route to setup or dashboard

**Behavior:**
- Check localStorage for existing `homeId`
  - If found: show "Welcome back" + link to Dashboard
  - If not found: show intro + "Get Started" CTA to `/setup`
- Hero section with E-LUMI-NATE logo, tagline, quick value prop
- Mobile-first: full-screen hero with single CTA button

**Components:** Header, PageContainer, Button

---

### Page 2: Home Setup Wizard (`/setup`) — Hours 3-6

**Purpose:** Multi-step wizard to define house layout and appliances (F1 + F5 + F6)

**Steps:**
1. **Step 1: Add Rooms** — Select room types + sizes
2. **Step 2: Add Appliances** — Per room, add appliances (name, wattage, hours)
3. **Step 3: Review & Confirm** — Summary of all rooms and appliances

**Step 1 Detail — Room Selection:**
- Grid of room type cards (icon + label): Bedroom, Living Room, Kitchen, Bathroom, Office, Other
- Tap to add room, tap again to increment count (e.g., 2 Bedrooms)
- Each room gets size selector: Small / Medium / Large
- Size hints: Small (<15m2), Medium (15-25m2), Large (>25m2)
- "Next" button when at least 1 room added

**Step 2 Detail — Appliance Input:**
- Tab per room (horizontal scrollable tabs on mobile)
- Each room shows:
  - "Add Appliance" button -> opens form
  - List of added appliances as cards
- Appliance form fields:
  - Name (text input + voice button)
  - Type (auto-detected from AI if possible, or manual dropdown)
  - Wattage (number input, pre-filled from AI estimation)
  - Daily hours (slider: 0-24h)
  - Usage habit (optional text)
- **Voice Input (F5):** Mic button next to name field
  - Tap to start listening (Web Speech API, lang: 'vi-VN')
  - Show live transcript
  - On stop: populate name field + call appliance estimation API for wattage
- **Image Recognition (F6):** Camera/upload button next to name field
  - Two options: "Take Photo" (opens camera) or "Upload Image" (opens file picker)
  - On mobile: uses `<input type="file" accept="image/*" capture="environment">` for camera
  - Show image preview while AI processes
  - On success: auto-fill name, type, wattage, standby wattage from AI Vision response
  - Show confidence badge: green (high), amber (medium), red (low) — user can override
  - Image is resized client-side to max 1024px before upload (reduce bandwidth + tokens)
- Quick-add presets: common Vietnamese appliances (Dieu hoa, Tu lanh, May giat, Quat, Den, Ti vi, Noi com, May nuoc nong)

**Step 3 Detail — Review:**
- Summary list: each room with appliance count + estimated monthly kWh/cost
- Total household estimate displayed prominently
- "Confirm" button -> POST to `/api/home/setup` + `/api/home/:id/appliances` -> save homeId to localStorage -> redirect to `/dashboard`

**Mobile UX:**
- Full-width cards, large tap targets (min 44px)
- Swipeable steps or stepper indicator at top
- Floating "Next" button fixed at bottom

---

### Page 3: Energy Dashboard (`/dashboard`) — Hours 6-9

**Purpose:** Visual overview of energy consumption (F2)

**Layout (mobile, top to bottom):**

1. **Header Section**
   - Welcome greeting with time of day (Chao buoi sang!)
   - Quick stat: "Thang nay: XXX kWh ~ XXX,000d"

2. **Anomaly Alerts** (if any)
   - Red/amber banner at top: "Tu lanh dang ngon dien hon 34% so voi thang truoc"
   - Tappable -> scrolls to appliance detail

3. **EVN Tier Progress**
   - Visual progress bar showing current kWh vs tier thresholds
   - Color-coded segments (green -> amber -> red as tier increases)
   - Text: "Con 45 kWh nua se len bac 4 (2,860d/kWh)"

4. **Top Consumers Chart**
   - Horizontal bar chart (Recharts)
   - Top 5 appliances by monthly kWh
   - Color: green (normal) -> amber (high) -> red (anomaly)
   - Each bar shows: appliance name, kWh, VND, % of total

5. **Month Comparison**
   - Simple card: "+12% so voi thang truoc" or "-8% so voi thang truoc"
   - Arrow indicator with color (green for down, red for up)

6. **CO2 Impact Card**
   - Total CO2 this month (kg)
   - Tree equivalents with visual tree icons
   - "Tuong duong X cay xanh truong thanh/nam"

7. **Quick Actions**
   - "Xem goi y tiet kiem" -> /chat
   - "Mo phong tiet kiem" -> /simulator

**Data Fetching:**
- `GET /api/energy/:homeId/dashboard` on page load
- Pull-to-refresh on mobile
- Show skeleton loaders during fetch

---

### Page 4: AI Chat (`/chat`) — Hours 9-11

**Purpose:** Chat with Tro Ly Khoai Tay for personalized advice (F3)

**Layout:**
- Full-screen chat interface (like messaging app)
- Chat bubbles: user (right, accent color) + AI (left, green)
- Input bar at bottom: text input + mic button + send button

**Behavior:**
1. On first visit: AI sends welcome message with top 3 recommendations pre-loaded
2. User can type or speak (F5) questions in Vietnamese
3. AI responses stream in real-time via SSE
4. Streaming text shows character-by-character with typing indicator

**Pre-loaded Recommendations (on first visit):**
- Call `POST /api/ai/recommendations` with homeId
- Display as tappable recommendation cards above chat
- Tapping a card sends it as a chat message for deeper explanation

**SSE Streaming Implementation:**
```typescript
// hooks/useChat.ts
const streamMessage = async (message: string) => {
  setIsStreaming(true);
  addMessage({ role: 'user', content: message });
  addMessage({ role: 'assistant', content: '' }); // placeholder
  
  const response = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeId, message, sessionId }),
  });
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    updateLastMessage(prev => prev + chunk);
  }
  
  setIsStreaming(false);
};
```

**Voice Input:**
- Mic button in input bar
- Same Web Speech API as setup wizard
- Auto-send after speech ends (with 1.5s silence detection)

---

### Page 5: Green Heatmap Simulator (`/simulator`) — Hours 11-13

**Purpose:** Interactive "what-if" simulation (F4)

**Layout:**
1. **Impact Summary** (top, sticky)
   - Three cards: kWh saved, VND saved, CO2 saved
   - Updates in real-time as user adjusts sliders
   - Tree equivalent visual

2. **Appliance Grid** (main content)
   - List of all appliances grouped by room
   - Each appliance shows:
     - Name + icon + current monthly kWh
     - Adjustment sliders:
       - Daily hours (0-24h)
       - Temperature (for AC: 16-30C)
     - Color indicator: green (efficient) -> amber -> red (heavy)
   - Changes from baseline highlighted

3. **Comparison Bar** (bottom)
   - Before vs After side-by-side
   - Monthly cost: original -> simulated
   - CO2: original -> simulated
   - "Reset" button to restore original values

**Real-time Calculation:**
- Debounced API call (300ms) to `POST /api/simulator/calculate`
- Or local calculation for instant feedback (preferred for UX):
  ```
  monthlyKwh = (wattage / 1000) * dailyHours * 30
  monthlyCost = calculateEvnTieredCost(monthlyKwh)
  co2Kg = monthlyKwh * 0.913
  ```
- Backend call for validated totals on "Save" action

**Heatmap Colors:**
```
Impact level -> color mapping:
  High savings (>20% reduction) -> #3B8C2A (primary green)
  Medium savings (10-20%)       -> #639922 (mid green)
  Low savings (<10%)            -> #EAF3DE (light green)
  No change                     -> #888888 (neutral gray)
  Increased usage               -> #EF9F27 (amber)
  High increase                 -> #BA7517 (dark amber)
```

---

## 3. Mobile Navigation

### Bottom Navigation Bar (fixed, 4 tabs)

| Tab | Icon | Route | Label |
|-----|------|-------|-------|
| Home | House | `/dashboard` | Tong quan |
| Chat | MessageCircle | `/chat` | Khoai Tay |
| Simulate | Sliders | `/simulator` | Mo phong |
| Setup | Settings | `/setup` | Thiet lap |

- Active tab: primary green (#3B8C2A) icon + label
- Inactive: gray icon + label
- Hide on setup wizard (show stepper instead)

---

## 4. Voice Input (F5) — Speech-to-Text

### Implementation (`lib/speech.ts`)

```typescript
// Web Speech API wrapper
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

### Usage Points

1. **Setup Wizard** — appliance name input (mic button next to text field)
2. **Chat** — message input (mic button in input bar)

### UX Details

- Mic button: green when idle, pulsing red when recording
- Show live transcript overlay while speaking
- Auto-stop after 2s silence
- Error handling: show toast if mic permission denied or browser not supported
- Fallback: mic button hidden on unsupported browsers

---

## 5. Image Recognition (F6) — Camera/Upload

### Implementation (`lib/image.ts`)

```typescript
// Resize image to max dimension, return base64
export async function resizeImageToBase64(
  file: File,
  maxDimension: number // default 1024
): Promise<{ base64: string; mediaType: 'image/jpeg' | 'image/png' }>

// Open camera on mobile (returns File)
export function openCamera(): Promise<File>

// Open file picker (returns File)
export function openFilePicker(): Promise<File>
```

### Hook (`hooks/useImageCapture.ts`)

```typescript
interface UseImageCaptureReturn {
  capturedImage: string | null;       // base64 preview
  recognitionResult: ApplianceEstimate | null;
  isProcessing: boolean;
  error: string | null;
  captureFromCamera: () => Promise<void>;
  uploadFromFile: () => Promise<void>;
  clear: () => void;
}
```

### Component: `ImageCaptureButton.tsx`

- Renders a camera icon button (same row as voice input button)
- On tap: shows bottom sheet with two options
  - "Chup anh" (Take Photo) — opens device camera
  - "Chon tu thu vien" (Choose from Gallery) — opens file picker
- After capture/selection:
  - Shows image thumbnail preview
  - Shows loading spinner overlay: "AI dang nhan dien..."
  - Calls `POST /api/ai/recognize-appliance` with FormData
  - On success: displays result card with name, wattage, confidence
  - "Su dung" (Use) button auto-fills appliance form
  - "Thu lai" (Retry) button to re-capture

### Mobile Camera Integration

```html
<!-- For camera capture -->
<input type="file" accept="image/*" capture="environment" />

<!-- For gallery/file picker -->
<input type="file" accept="image/jpeg,image/png" />
```

### UX Details

- Image resized to max 1024px before upload (client-side, Canvas API)
- Max file size: 5MB (show error toast if exceeded)
- Supported formats: JPEG, PNG
- Camera button: green when idle, shows thumbnail when captured
- Processing state: image shown with green overlay + spinner

---

## 6. Responsive Breakpoints

```
Mobile (default): 0-639px — single column, bottom nav, full-width cards
Tablet: 640-1023px — 2-column grid where applicable
Desktop: 1024px+ — centered max-width container, sidebar nav possible
```

Priority: Mobile ONLY for hackathon. Tablet/desktop is nice-to-have.

---

## 7. Loading & Error States

| State | Component | Behavior |
|-------|-----------|----------|
| Page loading | Skeleton | Pulse animation matching card layout |
| API fetching | Spinner inside card | Small spinner replacing content area |
| API error | ErrorBanner | Red banner with retry button |
| Empty dashboard | EmptyState | Illustration + "Set up your home first" CTA |
| Voice not supported | Toast | "Trinh duyet cua ban khong ho tro giong noi" |
| Image too large | Toast | "Anh qua lon, vui long chon anh duoi 5MB" |
| Image recognition processing | ImagePreview | Thumbnail + spinner overlay |
| Image recognition failed | Toast | "Khong nhan dien duoc, vui long thu lai" |
| Streaming error | ChatBubble | Error message in bubble + retry option |

---

## 8. Implementation Priority Order

```
Hour 2-3:   Scaffold + theme + layout (Header, BottomNav, PageContainer)
Hour 3-4:   Landing page + shared types + api.ts + constants.ts
Hour 4-6:   Setup Wizard (Step 1 rooms + Step 2 appliances + Step 3 review)
Hour 6-8:   Dashboard (overview cards + charts + EVN progress)
Hour 8-9:   Dashboard (anomaly alerts + CO2 visualization)
Hour 9-10:  Chat page (SSE streaming + bubbles + recommendations)
Hour 10-11: Image recognition integration (camera/upload + AI Vision in setup wizard)
Hour 11-12: Simulator page (sliders + real-time calculation + heatmap colors)
Hour 12-13: Voice input integration (setup + chat)
Hour 13-14: Polish (transitions, loading states, error handling, mobile tweaks)
```
