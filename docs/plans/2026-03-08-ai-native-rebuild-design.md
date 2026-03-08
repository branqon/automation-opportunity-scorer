# AI-Native Rebuild Design

**Date:** 2026-03-08
**Status:** Approved

## Goal

Transform the Automation Opportunity Scorer from a read-only deterministic dashboard into an AI-native tool that demonstrates AI automation engineering skills for a portfolio. The app gains three AI capabilities, a proper API layer, production infrastructure, and polish features.

## Decisions

- **LLM Providers:** Both Claude (Anthropic) and OpenAI, user-configurable. BYOK (bring your own key) — no keys stored server-side.
- **AI execution:** Next.js API routes / server actions. Keys passed in request headers per call.
- **Database:** Postgres via Neon (replaces SQLite). Prisma stays as ORM.
- **Deployment:** Vercel (primary) + Dockerfile + docker-compose for self-hosted.
- **Testing:** Vitest. Unit tests on scoring engine + formatters. Integration tests on API routes with mocked LLM.
- **CI/CD:** GitHub Actions — lint, typecheck, tests. Vercel handles preview deploys.
- **Data model:** Separate Teams table (FK from Opportunity). Add `source` and `aiAnalysis` columns. Keep AutomationType as enum.

## Data Model

### Team (new table)

| Column      | Type     | Notes             |
|-------------|----------|-------------------|
| id          | String   | cuid, PK          |
| slug        | String   | unique             |
| name        | String   |                   |
| description | String   |                   |
| createdAt   | DateTime | default now()      |
| updatedAt   | DateTime | @updatedAt         |

### Opportunity (refactored)

Changes from current schema:
- `team` enum field → `teamId` FK to Team table
- Add `source`: `"seed" | "manual" | "ai-assisted"`
- Add `aiAnalysis`: nullable text (cached AI implementation plan)
- Remove `Team` enum from Prisma schema
- Keep `AutomationType` enum (fixed scoring concept)

## API Layer

```
POST /api/opportunities          — create opportunity
GET  /api/opportunities          — list opportunities (with filters)
GET  /api/opportunities/[slug]   — single opportunity detail

POST /api/ai/analyze-process     — AI extracts fields from process description
POST /api/ai/implementation-plan — AI generates implementation plan for an opportunity
POST /api/ai/portfolio-summary   — AI generates portfolio-wide insights
```

### AI Provider Pattern

- User sets API key + provider in a settings modal (stored in localStorage)
- Key sent in `x-api-key` header, provider in `x-ai-provider` header
- Server-side `callLLM(provider, apiKey, systemPrompt, userPrompt)` dispatches to correct SDK
- No API key → AI features show a prompt to configure one; rest of app works fine

## AI Features

### 1. AI-Powered Intake (`/api/ai/analyze-process`)

- Input: free-text process description
- Output: structured JSON — `monthlyVolume`, `avgHandleTimeMinutes`, 7 scoring factors (1-5), `automationType`, `summary`, `suggestedApproach`
- User reviews/edits pre-filled form, then submits
- Scoring engine runs deterministically on submitted values — AI just helps fill the form

### 2. Implementation Plan (`/api/ai/implementation-plan`)

- Input: opportunity data (name, scores, volume, team, type)
- Output: structured plan — phases, tools, estimated effort, risks, success metrics
- Cached in `aiAnalysis` column (generated once, "Regenerate" option available)
- Triggered by button on opportunity detail page

### 3. Portfolio Summary (`/api/ai/portfolio-summary`)

- Input: all opportunity data (scores, rankings, savings)
- Output: top recommendations, common patterns, suggested roadmap, portfolio health
- Not cached — generated fresh each time
- Triggered by button on dashboard

### Design Principle

AI augments but never replaces the deterministic scoring. Scores are always math-based. AI provides qualitative analysis on top.

## Pages & UI

### New Pages

**`/opportunities/new`** — Create Opportunity
- Two tabs: "AI-Assisted" (default) and "Manual Entry"
- AI tab: textarea → "Analyze" button → pre-filled form
- Manual tab: empty form
- Both share the same form component
- Server action to create

**Settings Modal** (header)
- API key inputs (Claude / OpenAI)
- Provider selector
- "Test Connection" button
- Keys in localStorage only

### Dashboard Changes

- "New Opportunity" button in header
- "Generate AI Insights" button (disabled if no API key)
- AI insights in collapsible card above charts
- `source` badge on table rows (seed / manual / ai-assisted)

### Detail Page Changes

- "Generate AI Analysis" section below score breakdown
- Shows cached plan or generate button
- "Regenerate" option

### New Components

- `ApiKeyProvider` — React context for API key state
- `AiInsightsCard` — collapsible portfolio summary card
- `OpportunityForm` — shared create form
- `SettingsModal` — API key configuration
- `ProviderBadge` — shows which provider was used

## Infrastructure

### Postgres Migration

- Prisma provider: `better-sqlite3` → `postgresql`
- Remove `@prisma/adapter-better-sqlite3`, standard Prisma Postgres client
- `DATABASE_URL` env var (already the pattern)
- Seed script: create Teams first, then Opportunities with FK

### Vercel

- Minimal `vercel.json` if needed
- Env vars: `DATABASE_URL`
- No server-side API key storage

### Docker

- Multi-stage build: deps → build → runtime
- Node 20 Alpine
- `prisma generate` in build stage
- Port 3000
- `.dockerignore`
- `docker-compose.yml`: app + Postgres service

### CI/CD (GitHub Actions)

- `.github/workflows/ci.yml` on push/PR to main
- Steps: lint, typecheck, vitest
- Postgres service container for integration tests

### Testing (Vitest)

- **Unit:** `scoring.test.ts`, `formatters.test.ts`, metadata helpers
- **Integration:** API route tests (CRUD, AI routes with mocked LLM)
- Test utilities: factory functions, mock LLM provider

## Polish Features

### CSV Export

- Dashboard button, client-side generation
- Downloads `automation-opportunities-YYYY-MM-DD.csv`
- Includes: rank, name, team, score, effort tier, value band, hours saved, annual savings

### Dark Mode

- Header toggle (sun/moon)
- `prefers-color-scheme` default, override in localStorage
- `[data-theme="dark"]` CSS variable overrides
- Existing components already use CSS variables

### Comparison View

- Checkbox selection on dashboard table (2-3 opportunities)
- "Compare" button when 2+ selected
- Side-by-side modal: parallel bar charts for 9 factors, stats row
- Not a new page — modal/slide-over

### README Overhaul

- 2-3 embedded screenshots
- Architecture diagram (Mermaid)
- Setup instructions (local, Docker, Vercel)
- Scoring model explanation
- Tech stack badges

### Repo Rename

- `automation-analyizer` → `automation-analyzer`
- `.env.example` with documented env vars
