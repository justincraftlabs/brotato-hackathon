# E-LUMI-NATE — Master Plan Overview

## Project Identity

| Field | Value |
|-------|-------|
| Name | E-LUMI-NATE |
| Tagline | "Illuminate the waste. Eliminate the bill." |
| Type | AI-Powered Home Energy Intelligence |
| AI Persona | "Trợ Lý Khoai Tây" (Potato Assistant) — witty, eco-friendly energy expert |
| Duration | 16 hours hackathon |
| Target | Mobile-first web app, MVP (no auth) |

## Branding

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Dark Green | `#3B8C2A` | Buttons, active states, key highlights |
| Primary Mid Green | `#639922` | Secondary actions, hover states |
| Primary Light Green | `#EAF3DE` | Backgrounds, cards (light mode) |
| Accent Dark Amber | `#BA7517` | Warnings, alert thresholds, accent CTA |
| Accent Mid Amber | `#EF9F27` | Heatmap warm zone, secondary alerts |
| Accent Light Amber | `#FAEEDA` | Background accents, warm surfaces |
| Dark BG | `#1E1E1E` | Dark mode background |
| Text Light | `#FFFFFF` | Dark mode text |
| Text Dark | `#1A1A1A` | Light mode text |

## Architecture

```
Mobile Browser (Next.js 14 App Router, port 3000)
        |
        | HTTP / SSE / WebSocket (Speech)
        |
Express.js API Server (port 3001)
        |
        +--- @anthropic-ai/sdk (Claude Sonnet 4.6)
        |
        +--- Weather API (OpenWeatherMap free tier)
        |
        +--- Web Speech API (browser-native, no backend needed)
        |
        +--- Claude Vision API (appliance image recognition)
        |
        +--- MongoDB (persistent data store)
```

## Core Features (MVP — 5 features max)

| # | Feature | Priority | Complexity |
|---|---------|----------|------------|
| F1 | Home Setup Wizard (rooms + appliances) | P0 | Medium |
| F2 | AI Energy Dashboard (consumption + predictions) | P0 | High |
| F3 | Personalized AI Recommendations (Trợ Lý Khoai Tây) | P0 | High |
| F4 | Green Heatmap Simulator | P1 | Medium |
| F5 | Voice Input (Speech-to-Text) | P1 | Low |
| F6 | Image Recognition for Appliances (camera/upload) | P0 | Medium |

### Explicitly OUT of Scope (MVP)

- User authentication / login
- Real-time weather API integration (use mock/static weather for demo)
- Multi-language AI chat (Vietnamese primary, English stretch goal)
- Push notifications
- PWA offline mode
- CO2 leaderboard / social sharing

## Timeline (16 Hours)

```
Hour  0-2   [RESEARCH]     Specs, API contracts, AI prompts, tech decisions
Hour  2-4   [SCAFFOLD]     Project setup, folder structure, shared types, theme
Hour  4-8   [CORE BUILD]   F1 (Wizard) + F2 (Dashboard) + Backend APIs + AI Service + MongoDB
Hour  8-12  [AI + POLISH]  F3 (Recommendations) + F4 (Heatmap) + F5 (Voice) + F6 (Image Recognition)
Hour 12-14  [INTEGRATION]  End-to-end flow, edge cases, error states
Hour 14-16  [DEMO PREP]    Demo data, presentation polish, bug fixes
```

## Agent Ownership

| Agent | Branch | Owns |
|-------|--------|------|
| Researcher | `feat/research` | All specs in `specs/research/` |
| Frontend Engineer | `feat/frontend` | `frontend/` — pages, components, theme, voice |
| Backend Engineer | `feat/backend` | `backend/` — routes, services, validation, storage |
| AI Integration | `feat/ai` | `backend/src/services/ai-service.ts`, prompts, streaming |

## File Index

| Plan File | Content |
|-----------|---------|
| [01-research-specs.md](01-research-specs.md) | Product spec, tech stack, API contracts, AI design |
| [02-frontend-plan.md](02-frontend-plan.md) | Pages, components, theme, voice, mobile UX |
| [03-backend-plan.md](03-backend-plan.md) | API endpoints, validation, storage, middleware |
| [04-ai-integration-plan.md](04-ai-integration-plan.md) | Prompts, streaming, AI service, context management |
| [05-integration-and-demo.md](05-integration-and-demo.md) | Integration testing, demo data, presentation prep |
