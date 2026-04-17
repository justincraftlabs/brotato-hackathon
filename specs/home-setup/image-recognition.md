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

## Success Criteria

- Image recognition identifies at least one appliance from a photo
