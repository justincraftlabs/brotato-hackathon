# Tech Stack

## Confirmed Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | SSR + client components |
| Backend | Express.js + TypeScript | Fast prototyping |
| AI SDK | `@anthropic-ai/sdk` | Team standard |
| AI Model | `claude-sonnet-4-6` | Best balance of quality + speed for chat |
| Styling | Tailwind CSS | Utility-first, mobile-first responsive |
| UI Components | shadcn/ui | Accessible, customizable, dark mode support |
| Charts | Recharts | Lightweight, React-native charts |
| Voice | Web Speech API (browser) | Zero backend cost, Vietnamese supported |
| Vision | Claude Vision API (base64) | Appliance image recognition via @anthropic-ai/sdk |
| Database | MongoDB + Mongoose | Persistent storage, flexible schema for appliances |
| Image Upload | multer | Memory storage, max 5MB, JPEG/PNG/WebP |
| Auth | None | MVP — skip entirely |

## NPM Packages

### Frontend

```
next@14
react@18
tailwindcss
@shadcn/ui (via npx shadcn-ui@latest init)
recharts
lucide-react
class-variance-authority
clsx + tailwind-merge
next-themes
```

### Backend

```
express
cors
zod
@anthropic-ai/sdk
mongoose
multer
dotenv
uuid
```

### Dev

```
typescript
tsx (for running backend in dev)
@types/express
@types/cors
@types/uuid
@types/multer
```
