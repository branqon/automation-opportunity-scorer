# Portfolio Enhancements Design

Three changes to strengthen this project as a portfolio piece: static deployment, e2e tests, and an interactive weight slider.

## 1. Static Site Generation + Vercel Deployment

Convert the app from server-rendered with SQLite to statically exported at build time. Prisma/SQLite runs only during `npm run build`; no database is needed at runtime.

### Changes

- Set `output: 'export'` in `next.config.ts`
- Add `generateStaticParams` to `opportunities/[slug]/page.tsx` to pre-render all detail pages
- Set `dynamicParams = false` on the detail page — unknown slugs get a 404 automatically, no runtime rendering needed
- Remove `export const dynamic = "force-dynamic"` from both pages
- Convert dashboard to a client component — filtering moves client-side against pre-built data
- Remove or skip API routes (incompatible with static export)
- Embed all raw opportunity data as static JSON for client-side scoring

### Why SSG

The app is read-only with seeded data that never changes. Static export is the architecturally honest choice — no runtime database, deploys anywhere, zero cost.

## 2. E2E Tests (Playwright)

Five tests covering the core flows:

1. **Dashboard loads** — summary cards render, opportunity table has rows
2. **Filters work** — select a team filter, verify table content changes
3. **Opportunity detail loads** — click a row, verify detail page shows score breakdown, metrics, badges
4. **Detail navigation** — higher/lower ranked links navigate between opportunities
5. **Weight slider interaction** — open sidebar, adjust a slider, verify table re-ranks

No snapshot tests, no edge cases. Just proof the app works end to end.

## 3. What-If Weight Slider

Collapsible sidebar panel on the dashboard for adjusting scoring weights interactively.

### Location and Toggle

A button near the existing filters toggles the sidebar open/closed. Panel appears on the left side of the dashboard.

### Slider Mechanics

- 9 sliders, one per scoring factor, each on a 1-20 importance scale
- Defaults match the exact current weight percentages: Volume 18, Labor 18, Repeatability 15, Standardization 12, Rework 10, SLA Risk 10, Customer Impact 10, Implementation Ease 5, Approval Ease 2
- Normalization is invisible: each slider value is divided by the sum of all values to produce the actual weight percentage
- Normalized percentage displays as a subtle secondary label on each slider
- Reset button restores defaults

### Live Re-Ranking

- All raw opportunity data (volumes, handle times, factor scores 1-5) is embedded as static JSON at build time
- `scoring.ts` is pure math with no server dependencies — runs client-side as-is
- On any slider change: recalculate all scores with new weights, re-sort table, update charts, recalculate summary cards
- Default slider positions produce the exact same ranking as the current static scoring

### Detail Page Behavior

Detail pages always show base-case scoring. Custom weights apply only to the dashboard. A user who adjusts weights and clicks into a detail page will see the original score, breakdown, and ranking. This is intentional — the slider is a dashboard exploration tool, not a global mode.

### Explicit Non-Goals

- No URL persistence of custom weights
- No before/after comparison view
- No save/load presets
- No custom weight propagation to detail pages
