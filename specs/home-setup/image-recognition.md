# Image Recognition (F6)

## User Story

> As a homeowner, I want to take a photo of an appliance so the app can auto-detect what it is and estimate its wattage.

## Flow

1. User taps camera button in setup wizard
2. Bottom sheet: "Chụp ảnh" (camera) or "Chọn từ thư viện" (gallery)
3. Image resized client-side to max 1024px (Canvas API)
4. Upload as `multipart/form-data` to backend
5. Backend converts to base64, sends to Claude Vision
6. AI returns structured JSON with name, type, wattage, confidence
7. Frontend auto-fills appliance form fields

## API Contract

### POST /api/ai/recognize-appliance

```
Content-Type: multipart/form-data
```

```typescript
// Request: FormData with 'image' field (JPEG/PNG/WebP, max 5MB)

// Response
{
  success: true,
  data: {
    name: string;
    type: string;
    estimatedWattage: number;
    estimatedStandbyWattage: number;
    brand: string | null;
    model: string | null;
    confidence: "high" | "medium" | "low";
    details: string;
  }
}
```

### POST /api/ai/estimate-appliance

```typescript
// Request
{ name: string }

// Response
{
  success: true,
  data: {
    name: string;
    type: string;
    estimatedWattage: number;
    estimatedStandbyWattage: number;
    commonBrands: string[];
  }
}
```

## AI System Prompts

### Image Recognizer (`prompts/image-recognizer.ts`)

Identifies appliance from photo. Looks for brand/logo, model number, appliance type. Returns structured JSON with confidence level.

- `confidence: "high"` — brand + model visible
- `confidence: "medium"` — only type identifiable
- `confidence: "low"` — uncertain

### Appliance Estimator (`prompts/appliance-estimator.ts`)

Estimates wattage from Vietnamese appliance name (handles informal/slang names). Returns standardized name, type, wattage, standby wattage, common brands.

## Frontend Components

### ImageCaptureButton.tsx

- Camera icon button (same row as voice input button)
- On tap: bottom sheet with camera/gallery options
- After capture: shows thumbnail preview + loading spinner
- On success: result card with name, wattage, confidence badge
- "Sử dụng" (Use) button → auto-fills form
- "Thử lại" (Retry) button → re-capture

### Image Utils (`lib/image.ts`)

```typescript
export async function resizeImageToBase64(
  file: File,
  maxDimension: number
): Promise<{ base64: string; mediaType: 'image/jpeg' | 'image/png' }>
```

## Mobile Camera Integration

```html
<!-- Camera capture -->
<input type="file" accept="image/*" capture="environment" />

<!-- Gallery/file picker -->
<input type="file" accept="image/jpeg,image/png" />
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Image too dark / blurry | Return low confidence + ask user to retake |
| Image not an appliance | Return error: "Không nhận diện được thiết bị điện" |
| Large image file (>5MB) | Client-side rejection with toast |
| AI returns invalid JSON | Retry once, then return fallback with `confidence: "low"` |

## Requirements

RFC 2119 keywords: **MUST** · **SHOULD** · **MAY**.

| ID | Requirement |
|----|-------------|
| REQ-IMG-001 | Client **MUST** resize images to max 1024px (longest side) before upload. |
| REQ-IMG-002 | Backend **MUST** reject uploads larger than 5MB with a `400` response. |
| REQ-IMG-003 | System **MUST** accept `image/jpeg`, `image/png`, `image/webp` and reject other MIME types. |
| REQ-IMG-004 | `heic2any` **MUST** be lazy-imported inside an async function (no top-level import) to avoid Next.js SSR `window is not defined`. |
| REQ-IMG-005 | AI response **MUST** include `confidence ∈ {high, medium, low}`. |
| REQ-IMG-006 | If the AI returns invalid JSON, backend **SHOULD** retry once with a stricter prompt before falling back. |
| REQ-IMG-007 | Non-appliance images **MUST** yield a user-facing Vietnamese error message. |
| REQ-IMG-008 | `POST /api/ai/estimate-appliance` **MUST** accept Vietnamese appliance names (including informal/slang spellings). |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-IMG-001 | Given a non-image file, when `POST /api/ai/recognize-appliance`, then response is `400`. | REQ-IMG-003 |
| AC-IMG-002 | Given a 6MB image, when the client attempts to upload, then it is rejected client-side before the network request. | REQ-IMG-001, REQ-IMG-002 |
| AC-IMG-003 | Given a valid appliance image, when `POST /api/ai/recognize-appliance`, then response `data` includes `name`, `estimatedWattage`, `confidence`. | REQ-IMG-005 |
| AC-IMG-004 | Given an image that is not an appliance, when recognized, then response conveys "Không nhận diện được thiết bị điện". | REQ-IMG-007 |
| AC-IMG-005 | Given a Next.js production build, when executed server-side, then no `heic2any` top-level import breaks SSR. | REQ-IMG-004 |

## Boundaries

**In scope**
- Single-image recognition (one appliance per request)
- Claude Vision via backend proxy (frontend never calls Claude directly)
- Heuristic wattage + brand/model extraction

**Out of scope**
- Multi-appliance detection within one photo
- OCR of energy labels / Energy Star ratings
- Offline recognition (all recognition requires network)
- Video frame recognition

**Ambiguity policy**
- If the AI returns `confidence: "low"`, the UI **MUST** still show the result but disable auto-fill — user must confirm manually.
- If the file is HEIC/HEIF, convert via `heic2any` before running size/MIME checks.

## Examples

**Valid response**
```json
{
  "success": true,
  "data": {
    "name": "Điều hòa 12000 BTU",
    "type": "air_conditioner",
    "estimatedWattage": 1100,
    "estimatedStandbyWattage": 2,
    "brand": "Daikin",
    "model": null,
    "confidence": "medium",
    "details": "Dàn lạnh treo tường, 1 chiều"
  }
}
```

**Invalid — wrong MIME**
```
Content-Type: application/pdf
```
→ `400 { success: false, error: "Unsupported media type" }`

## Success Criteria

- Image recognition identifies at least one appliance from a photo.
