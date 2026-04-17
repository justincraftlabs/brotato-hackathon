# Phase 5 — Integration, Testing & Demo (Hours 12-16)

---

## 1. Integration Checklist (Hours 12-14)

### End-to-End Flow Verification

| # | Flow | Frontend | Backend | AI | Status |
|---|------|----------|---------|----|----|
| 1 | User opens app -> sees landing page | `/` page loads | N/A | N/A | [ ] |
| 2 | User starts setup -> adds rooms | `/setup` Step 1 | `POST /api/home/setup` | N/A | [ ] |
| 3a | User adds appliances (type or voice) | `/setup` Step 2 + VoiceInput | `POST /api/home/:id/appliances` + `POST /api/ai/estimate-appliance` | UC3 | [ ] |
| 3b | User takes photo of appliance | `/setup` Step 2 + ImageCapture | `POST /api/ai/recognize-appliance` (multipart) | UC4 | [ ] |
| 4 | User finishes setup -> sees dashboard | Redirect `/dashboard` | `GET /api/energy/:id/dashboard` | N/A | [ ] |
| 5 | Dashboard shows charts and alerts | Charts render | Energy calculations correct | N/A | [ ] |
| 6 | User opens chat -> sees recommendations | `/chat` page | `POST /api/ai/recommendations` | UC1 | [ ] |
| 7 | User chats with Khoai Tay | SSE streaming | `POST /api/ai/chat` (SSE) | UC2 | [ ] |
| 8 | User opens simulator -> adjusts appliances | `/simulator` page | `POST /api/simulator/calculate` | N/A | [ ] |
| 9 | Simulator shows real-time impact | Sliders + cards | Calculation engine | N/A | [ ] |
| 10 | Voice input works in setup and chat | VoiceInputButton | N/A (browser API) | N/A | [ ] |
| 11 | Dark/light mode toggle works | Theme provider | N/A | N/A | [ ] |
| 12 | Bottom navigation works on mobile | BottomNav | N/A | N/A | [ ] |

### Cross-Cutting Checks

- [ ] CORS: Frontend (3000) can reach Backend (3001)
- [ ] MongoDB: Connection established, data persists across server restarts
- [ ] SSE: Chat streaming displays incrementally (not all-at-once)
- [ ] Image Upload: Camera opens on mobile, file picker works, image resized before upload
- [ ] Env vars: `ANTHROPIC_API_KEY` set, `NEXT_PUBLIC_API_URL` set, `MONGODB_URI` set
- [ ] Error states: API failure shows ErrorBanner (not blank screen)
- [ ] Loading states: Skeleton/spinner shows during fetches
- [ ] Mobile: All pages usable on 375px width (iPhone SE)
- [ ] Theme: Both dark and light mode look correct

---

## 2. Bug Fix Priority Matrix (Hour 13-14)

| Priority | Category | Fix If Time |
|----------|----------|-------------|
| P0 | App crashes / blank screen | Always |
| P0 | AI returns error / no response | Always |
| P0 | Setup wizard can't complete | Always |
| P1 | Chart doesn't render | Try hard |
| P1 | Voice input not working | Try hard |
| P1 | Image recognition not working | Try hard |
| P1 | MongoDB connection fails | Try hard |
| P1 | SSE streaming broken | Try hard |
| P2 | Styling issues on specific screen sizes | If easy |
| P2 | Animation glitches | Skip |
| P3 | Edge case error handling | Skip |

---

## 3. Demo Data Preparation (Hour 14-15)

### Pre-built Demo Household

Create a compelling demo scenario that showcases all features:

**Household: "Gia dinh chi Lan - Quan 7, TP.HCM"**

| Room | Appliances | Story |
|------|-----------|-------|
| Phong khach (Large) | Dieu hoa Daikin 1.5HP (1500W, 10h), TV Samsung 55" (120W, 6h), Quat dung Panasonic (60W, 8h) | AC is the biggest power consumer |
| Phong ngu chinh (Medium) | Dieu hoa LG 1HP (1200W, 8h), Den LED (10W, 6h) | Sleeps with AC on all night |
| Phong ngu con (Small) | Quat tran (60W, 10h), Den LED (10W, 8h) | Kid's room, fan only |
| Bep (Small) | Tu lanh Hitachi (150W, 24h), Noi com dien (700W, 1h), Lo vi song (1000W, 0.3h), May loc nuoc (30W, 24h) | Fridge runs 24/7 |
| Phong lam viec (Medium) | Laptop + man hinh (200W, 10h), Den ban (15W, 10h), Router WiFi (12W, 24h) | Work from home |

**Estimated Totals:**
- ~480 kWh/month
- ~1,350,000 VND/month (EVN tier 5-6)
- ~438 kg CO2/month
- ~22 trees/year equivalent

**Demo Talking Points:**
1. "Chi Lan, nhung 2 cai dieu hoa nha chi chiem 65% tien dien!" (show dashboard)
2. "Chi de nhiet do 20 do? Tang len 26 do tiet kiem 96,000d/thang!" (show simulator)
3. "Router WiFi va may loc nuoc chay 24/7, moi thang 'an' them 30,000d ma khong ai biet" (vampire appliances)

### Demo Script (2-minute walkthrough)

```
0:00 - Open app on phone -> Landing page with E-LUMI-NATE branding
0:10 - Tap "Bat dau" -> Setup wizard
0:20 - Quick-add 3 rooms (taps, not typing)
0:30 - Add appliance with voice: "Dieu hoa Daikin" -> AI estimates 1500W
0:40 - Take photo of refrigerator -> AI Vision identifies "Tu lanh Hitachi 150W" (confidence: high)
0:55 - Finish setup -> Dashboard loads
1:00 - Show top consumers chart: "Dieu hoa chiem 65%!"
1:10 - Show EVN tier progress: "Sap len bac 6!"
1:20 - Open Chat -> Khoai Tay gives 3 tips with VND savings
1:30 - Ask "Lam sao giam tien dien?" -> streaming response
1:40 - Open Simulator -> slide AC from 20C to 26C
1:50 - Impact card shows: "-96,000d/thang, -18.3kg CO2"
2:00 - Wrap: "Tiet kiem 200,000d/thang chi bang thay doi thoi quen nho"
```

---

## 4. Presentation Polish (Hour 15-16)

### UI Final Touches

- [ ] Logo displayed correctly in header (E-LUMI-NATE wordmark)
- [ ] Green + amber color scheme consistent across all pages
- [ ] Dark mode is default (matches branding)
- [ ] All Vietnamese text is correct (no typos, diacritics where needed)
- [ ] Number formatting: 1,350,000d (with commas), 480.5 kWh
- [ ] Charts have proper labels and legends
- [ ] CO2 tree visualization is visually appealing
- [ ] Loading states look polished (not jarring)

### Mobile Final Check

- [ ] Test on Chrome mobile emulator: iPhone 14, Pixel 7
- [ ] Bottom nav doesn't overlap content
- [ ] All buttons/inputs have min 44px tap target
- [ ] No horizontal scroll on any page
- [ ] Keyboard doesn't obscure input fields
- [ ] Voice input mic button is easily reachable

### Demo Environment

- [ ] MongoDB running locally with demo data pre-seeded
- [ ] `ANTHROPIC_API_KEY` is valid and funded
- [ ] Disable any console.log spam
- [ ] Browser in full-screen mobile view
- [ ] WiFi/internet stable for AI calls

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API rate limit / timeout | Chat and recommendations broken | Cache recommendations, retry with exponential backoff, show fallback tips |
| Web Speech API not available | Voice input broken | Hide mic button, text input always works as fallback |
| Large home data makes AI slow | Bad demo experience | Limit to 5 rooms, 20 appliances max. Pre-generate recommendations. |
| Image recognition slow/wrong | Demo looks bad | Prepare a pre-tested photo (clear Daikin AC photo). Resize to 1024px. |
| MongoDB not running | App can't save data | Have docker-compose or mongod ready. Seed script runs on startup. |
| SSE connection drops | Chat appears frozen | Auto-reconnect after 3s, show "Reconnecting..." indicator |
| Wrong EVN calculations | Credibility issue | Cross-validate with manual calculation for demo household |
| Browser compatibility | App broken on specific device | Test on Chrome only (most common in Vietnam) |

---

## 6. Scoring Criteria Alignment

| Hackathon Criteria | How We Address It |
|-------------------|-------------------|
| AI Integration Quality | 4 distinct AI use cases (recommendations, chat, text estimation, **image recognition via Vision**), streaming, Vietnamese context-aware |
| User Experience | Mobile-first, voice input, **camera/photo input**, eco-friendly branding, fun AI persona (Khoai Tay) |
| Problem Impact | Measurable: 15-20% bill reduction, CO2 tracking with tree equivalents |
| Technical Execution | TypeScript everywhere, clean architecture, SSE streaming, **MongoDB persistence**, responsive design |
| Presentation | 2-min demo script, pre-built data, compelling before/after numbers |
| Innovation | Voice-first + **camera-first** appliance input, Green Heatmap simulator, Vietnamese-specific EVN tiers |
| CO2 Formula | 0.913 kg CO2/kWh, tree equivalents, integrated into every recommendation |

---

## 7. Post-Integration Quick Wins (If Time Permits)

| Quick Win | Time | Impact |
|-----------|------|--------|
| Add confetti animation when simulator shows big savings | 15 min | Fun, memorable |
| Animate tree count growing in CO2 card | 15 min | Visual impact |
| Add Khoai Tay potato emoji/avatar to chat bubbles | 10 min | Personality |
| Add "Share your savings" button (copies text to clipboard) | 10 min | Social proof |
| Add daily tip on dashboard (static, rotates) | 10 min | Content richness |
