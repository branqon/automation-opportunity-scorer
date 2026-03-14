# De-AI the UI — Design Spec

**Date:** 2026-03-14
**Goal:** Remove the "AI-generated dashboard" aesthetic. Establish visual hierarchy so the ranked table feels like the primary content, not one card among many.
**References:** UiPath (product framing), Airtable (layout polish), Celonis (analytics feel)
**Scope:** Dashboard page, detail page, global styles. Light mode tokens updated for consistency but light mode is not the focus.

## Problem

Every surface uses the same treatment (`rounded-xl border border-line bg-surface p-4 shadow-card`), so nothing feels primary. Combined with a cold dark background and saturated purple accent, the result reads as a generic AI-generated Tailwind dashboard.

## Design Changes

### 1. Color System

| Token | Dark Before | Dark After | Light Before | Light After |
|---|---|---|---|---|
| `--background` | `#0e0e11` | `#111113` | `#ffffff` | `#ffffff` (no change) |
| `--accent` | `#a78bfa` | `#64748b` | `#7c3aed` | `#475569` |
| `--accent-soft` | `#1e1733` | `rgba(100,116,139,0.1)` | `#f3f0ff` | `rgba(71,85,105,0.08)` |
| `--accent-strong` | `#c4b5fd` | `#94a3b8` | `#5b21b6` | `#334155` |
| `--chart-quick-win` | `#a78bfa` | `#64748b` | `#7c3aed` | `#475569` |
| `--chart-cursor-fill` | `rgba(167,139,250,0.08)` | `rgba(100,116,139,0.08)` | `rgba(124,58,237,0.06)` | `rgba(71,85,105,0.06)` |

All other tokens (semantic success/warning/critical, chart-foundation, chart-strategic, chart-bar-start/end) remain unchanged.

### 2. Border Radius

- `--radius-card` changes from `0.75rem` to `0`
- **The token only governs `SurfaceCard`.** Most radius in the codebase is hardcoded Tailwind classes that must be removed manually:
  - `rounded-xl` on chart containers, score boxes, cards, skeletons
  - `rounded-lg` on selects, buttons, tooltips, badges' inner elements, slider panels
  - `rounded-md` on badges
  - `rounded-full` and `rounded-3xl` on error/not-found/loading pages
- Recharts `<Bar radius={[6, 6, 0, 0]}>` prop in `savings-bar-chart.tsx` → change to `[0, 0, 0, 0]`
- Chart custom tooltips with `rounded-lg` → remove
- Exception: none. Everything is square.

### 3. Surface Hierarchy

Three tiers replace the current "everything is a card" approach:

| Tier | Treatment | Used For |
|---|---|---|
| Bare | No background, no border, no shadow — content sits on page `--background` | Summary stats (now inline text), section labels, filters area |
| Subtle | `bg-surface-subtle`, no border, no shadow | Table header row, chart containers (when expanded), metric sub-sections on detail page |
| Full | `bg-surface`, `border-line`, `shadow-card` | Table rows on hover only, detail page primary card |

### 4. Dashboard Layout Changes

#### Header Zone (replaces title + 4 summary cards)
- Title "What should we automate next?" stays
- Subtitle becomes inline stats: `{count} opportunities · {hours} monthly · {savings} annual savings · {quickWins} quick wins`
- The 4 `SurfaceCard` metric cards and their grid wrapper are removed
- Filters row remains in the same position below

#### Primary Zone (replaces top candidates + table)
- **`TopCandidates` component: remove from dashboard render.** The component file can stay but is no longer imported/used.
- **Render order changes:** `OpportunityTable` renders immediately after filters (before charts). Current order is summary cards → filters → TopCandidates → charts → table. New order is filters → table → charts.
- The `OpportunityTable` sheds its `SurfaceCard` wrapper (currently `SurfaceCard className="overflow-hidden p-0"`)
- Table sits directly on page background — no border, no shadow, no radius
- Table header row: `bg-surface-subtle` (already the case, just remove the outer card)
- Table body rows: clean, with `hover:bg-surface-subtle` for interaction feedback
- Mobile card layout within the table: same simplification — remove card-like borders, use dividers only
- Mobile score boxes currently use `bg-accent-soft` and `text-accent-strong` — these will resolve to slate tones via the updated CSS variables

#### Charts Zone (replaces interleaved 2-column chart grid)
- Charts move below the table (after `OpportunityTable`)
- Wrapped in a collapsible `<details>` element with `<summary>` toggle
- Default state: collapsed
- Summary text: "Analytics" or "Charts" — simple label
- When expanded: same 2-column responsive grid (`xl:grid-cols-2`) but charts render without `SurfaceCard` wrappers
- Charts get a section label above each, sitting on bare background

### 5. Detail Page Changes

Apply the same surface hierarchy principles:

#### Score Breakdown Section
- Remove `SurfaceCard` wrapper from the main content areas where possible
- Score factor rows: content on bare background with subtle dividers between factors
- Progress bars: keep, they're functional
- The composite score box already uses `bg-surface-subtle` — no change needed there

#### What-If Scenario Banner
- Currently uses `bg-accent-soft` — change to `bg-surface-subtle` with a `border-line` left border for visual distinction

#### Sidebar (Rank Context)
- "Recommended next step" box: `bg-surface-subtle` instead of `bg-accent-soft`
- Navigation cards (higher/lower ranked): keep borders for clickability affordance but remove shadow and radius

#### Lower Sections (ROI, Implementation)
- Remove card wrappers, content sits on bare background with section headers
- Use horizontal rules or spacing to separate sections

#### General
- All `bg-accent-soft` backgrounds become `bg-surface-subtle`
- All `text-accent` / `text-accent-strong` references now resolve to slate tones via the updated CSS variables (no component changes needed for these)
- All `rounded-xl` / `rounded-lg` become square via the radius token change and class removal

### 6. Screenshots

After all changes are implemented:
- Regenerate all screenshots in `docs/screenshots/`:
  - `dashboard-overview.png`
  - `opportunity-detail.png`
  - `score-breakdown.png`
  - `dashboard-mobile.png`
- Use the dev server and Playwright or manual capture at the same viewport sizes as the originals

## Files to Modify

| File | Changes |
|---|---|
| `src/app/globals.css` | Color tokens, radius token |
| `src/components/dashboard/dashboard-client.tsx` | Remove summary cards, remove TopCandidates import/render, inline stats in subtitle, reorder to table-then-charts, wrap charts in collapsible `<details>`, remove SurfaceCard from charts |
| `src/components/dashboard/opportunity-table.tsx` | Remove SurfaceCard wrapper, simplify mobile card styling, remove `rounded-xl` classes |
| `src/components/dashboard/top-candidates.tsx` | No changes (just stop importing it) |
| `src/components/dashboard/filters.tsx` | Remove `rounded-xl`/`rounded-lg` from container, selects, and button; replace `bg-accent-soft`/`text-accent-strong` on active filter state |
| `src/components/ui/surface-card.tsx` | Remove `rounded-xl` |
| `src/components/ui/badge.tsx` | Remove `rounded-md` |
| `src/components/ui/app-shell-header.tsx` | No structural changes |
| `src/components/ui/theme-toggle.tsx` | Remove `rounded-lg` from button |
| `src/components/detail/opportunity-detail-client.tsx` | Flatten surfaces, replace accent-soft with surface-subtle, remove card wrappers from lower sections, remove `rounded-xl`/`rounded-lg` classes, update what-if banner |
| `src/components/detail/score-breakdown.tsx` | Remove `rounded-xl` from composite score box and factor rows |
| `src/components/dashboard/weight-slider-panel.tsx` | Remove `rounded-lg` |
| `src/components/charts/value-vs-effort-chart.tsx` | Remove `rounded-xl`/`rounded-lg` from container and tooltip; quick win color updates via CSS var |
| `src/components/charts/savings-bar-chart.tsx` | Remove `rounded-xl`/`rounded-lg` from container, tooltip, and skeleton; change `<Bar radius={[6,6,0,0]}>` to `[0,0,0,0]` |
| `src/app/error.tsx` | Remove `rounded-full`, `rounded-3xl` |
| `src/app/not-found.tsx` | Remove `rounded-full`, `rounded-3xl` |
| `src/app/loading.tsx` | Remove `rounded-full` |
| `docs/screenshots/*` | Regenerate all 4 |

## Out of Scope

- Light mode visual redesign (tokens updated for consistency only)
- Information architecture changes beyond what's listed
- New components or features
- Detail page structural redesign (only surface/color cleanup)
