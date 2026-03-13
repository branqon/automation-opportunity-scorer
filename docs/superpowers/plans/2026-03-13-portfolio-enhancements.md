# Portfolio Enhancements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the app to static export for Vercel deployment, add an interactive weight slider to the dashboard, and write Playwright e2e tests.

**Architecture:** The dashboard page becomes a thin server component that fetches all raw data at build time and passes it to a client wrapper. The client wrapper runs scoring with adjustable weights, applies filters, and renders all dashboard content. Detail pages use `generateStaticParams` for static pre-rendering. The scoring engine (`scoring.ts`) gains an optional custom weights parameter. Pure dashboard computation logic is extracted from `opportunities.ts` (which depends on Prisma) into a new `dashboard.ts` file that works client-side.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Prisma (build-time only), Playwright, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-13-portfolio-enhancements-design.md`

---

## Chunk 1: Scoring Engine + Data Layer

### Task 1: Add custom weights support to scoring.ts

**Files:**
- Modify: `src/lib/scoring.ts`
- Modify: `src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Write failing tests for custom weights and normalizeWeights**

Add these tests to `src/lib/__tests__/scoring.test.ts`:

```ts
import {
  enrichOpportunity,
  SCORE_WEIGHTS,
  DEFAULT_IMPORTANCE,
  normalizeWeights,
} from "@/lib/scoring";

describe("normalizeWeights", () => {
  it("normalizes importance values to sum to 1.0", () => {
    const result = normalizeWeights(DEFAULT_IMPORTANCE);
    const sum = Object.values(result).reduce((total, v) => total + v, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("DEFAULT_IMPORTANCE normalizes to SCORE_WEIGHTS", () => {
    const result = normalizeWeights(DEFAULT_IMPORTANCE);
    for (const [key, value] of Object.entries(SCORE_WEIGHTS)) {
      expect(result[key as ScoreFactorKey]).toBeCloseTo(value, 10);
    }
  });
});

describe("enrichOpportunity with custom weights", () => {
  it("produces different scores with different weights", () => {
    const opp = makeOpportunity({
      monthlyVolume: 800,
      repeatabilityScore: 5,
      slaRiskScore: 1,
    });

    const defaultResult = enrichOpportunity(opp);

    const slaHeavyWeights = { ...SCORE_WEIGHTS, slaRisk: 0.5, volume: 0.01 };
    const slaResult = enrichOpportunity(opp, slaHeavyWeights);

    expect(slaResult.score).not.toBeCloseTo(defaultResult.score, 0);
  });

  it("uses SCORE_WEIGHTS when no custom weights provided", () => {
    const opp = makeOpportunity();
    const defaultResult = enrichOpportunity(opp);
    const explicitResult = enrichOpportunity(opp, SCORE_WEIGHTS);
    expect(explicitResult.score).toBe(defaultResult.score);
  });
});
```

Also add `type ScoreFactorKey` to the existing import from `@/lib/scoring` (must use `type` keyword since it's a type-only export).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/scoring.test.ts`
Expected: FAIL — `normalizeWeights` and `DEFAULT_IMPORTANCE` don't exist yet.

- [ ] **Step 3: Implement normalizeWeights and DEFAULT_IMPORTANCE**

In `src/lib/scoring.ts`, add after the `SCORE_WEIGHTS` definition:

```ts
export const DEFAULT_IMPORTANCE: Record<ScoreFactorKey, number> = {
  volume: 18,
  laborIntensity: 18,
  repeatability: 15,
  standardization: 12,
  rework: 10,
  slaRisk: 10,
  customerImpact: 10,
  implementationEase: 5,
  approvalEase: 2,
};

export function normalizeWeights(
  importance: Record<ScoreFactorKey, number>,
): Record<ScoreFactorKey, number> {
  const total = Object.values(importance).reduce((sum, v) => sum + v, 0);
  return Object.fromEntries(
    Object.entries(importance).map(([key, value]) => [key, value / total]),
  ) as Record<ScoreFactorKey, number>;
}
```

- [ ] **Step 4: Widen input type and add custom weights parameter**

First, widen the input type so `enrichOpportunity` works with both Prisma objects (which have `createdAt`/`updatedAt`) and raw serialized data (which doesn't). Add these type aliases near the top of `scoring.ts`, after the Prisma type imports:

```ts
// Narrowed input types — omit Date fields so scoring works client-side
type OpportunityInput = Omit<Opportunity, 'createdAt' | 'updatedAt'>;
type TeamInput = Omit<Team, 'createdAt' | 'updatedAt'>;
```

Update `EnrichedOpportunity` to use the narrowed types:

```ts
export type EnrichedOpportunity = OpportunityInput & { team: TeamInput } & OpportunityAnalytics;
```

Change the `enrichOpportunity` signature from:

```ts
export function enrichOpportunity(opportunity: Opportunity & { team: Team }): EnrichedOpportunity {
```

to:

```ts
export function enrichOpportunity(
  opportunity: OpportunityInput & { team: TeamInput },
  customWeights?: Record<ScoreFactorKey, number>,
): EnrichedOpportunity {
  const weights = customWeights ?? SCORE_WEIGHTS;
```

Note: `customWeights` must be pre-normalized (values summing to 1.0). The caller is responsible for calling `normalizeWeights()` before passing slider values.

Then replace all references to `SCORE_WEIGHTS` inside the function body with `weights`. Specifically, the `scoreBreakdown` mapping line:

```ts
  const scoreBreakdown: ScoreBreakdownEntry[] = (
    Object.entries(weights) as Array<[ScoreFactorKey, number]>
  ).map(([key, weight]) => {
```

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS — existing tests still work (default weights unchanged), new tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/scoring.ts src/lib/__tests__/scoring.test.ts
git commit -m "feat: support custom weights in scoring engine"
```

---

### Task 2: Extract pure dashboard computation from opportunities.ts

Currently `opportunities.ts` mixes Prisma queries with pure computation. Extract the pure parts into `dashboard.ts` so they can be imported by client components.

**Files:**
- Create: `src/lib/dashboard.ts`
- Modify: `src/lib/opportunities.ts`

- [ ] **Step 1: Create src/lib/dashboard.ts with pure functions**

Extract these functions from `opportunities.ts` into `dashboard.ts`:

```ts
import { AutomationType } from "@/generated/prisma/enums";

import {
  enrichOpportunity,
  type EnrichedOpportunity,
  type RankedOpportunity,
  type ScoreFactorKey,
} from "@/lib/scoring";

export type DashboardFocus = "all" | "quick-wins" | "strategic-bets";

export type DashboardFilterState = {
  team: string;
  automationType: AutomationType | "all";
  focus: DashboardFocus;
};

// --- Raw data types for client-side use (no Date fields) ---

export type RawTeam = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type RawOpportunity = {
  id: string;
  slug: string;
  name: string;
  teamId: string;
  monthlyVolume: number;
  avgHandleTimeMinutes: number;
  repeatabilityScore: number;
  standardizationScore: number;
  approvalComplexityScore: number;
  reworkRateScore: number;
  slaRiskScore: number;
  customerImpactScore: number;
  implementationDifficultyScore: number;
  suggestedAutomationType: AutomationType;
  summary: string;
  suggestedApproach: string;
  implementationConsiderations: string;
  riskNotes: string;
  recommendedNextStep: string;
  team: RawTeam;
};

// --- Parsing ---

type RawSearchParams = Record<string, string | string[] | undefined>;

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDashboardFilters(searchParams: RawSearchParams): DashboardFilterState {
  const requestedTeam = readValue(searchParams.team);
  const requestedAutomationType = readValue(searchParams.automationType);
  const requestedFocus = readValue(searchParams.focus);

  const validAutomationTypes = new Set(Object.values(AutomationType));
  const validFocus = new Set<DashboardFocus>([
    "all",
    "quick-wins",
    "strategic-bets",
  ]);

  return {
    team: requestedTeam ?? "all",
    automationType:
      requestedAutomationType &&
      validAutomationTypes.has(requestedAutomationType as AutomationType)
        ? (requestedAutomationType as AutomationType)
        : "all",
    focus:
      requestedFocus && validFocus.has(requestedFocus as DashboardFocus)
        ? (requestedFocus as DashboardFocus)
        : "all",
  };
}

// --- Ranking & filtering ---

function sortByOpportunityScore(left: EnrichedOpportunity, right: EnrichedOpportunity) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.annualCostSavings !== left.annualCostSavings) {
    return right.annualCostSavings - left.annualCostSavings;
  }

  return left.name.localeCompare(right.name);
}

function rankOpportunities(opportunities: EnrichedOpportunity[]) {
  return opportunities.map((opportunity, index) => ({
    ...opportunity,
    rank: index + 1,
  }));
}

function applyFilters(
  opportunities: RankedOpportunity[],
  filters: DashboardFilterState,
) {
  return opportunities.filter((opportunity) => {
    if (filters.team !== "all" && opportunity.team.slug !== filters.team) {
      return false;
    }

    if (
      filters.automationType !== "all" &&
      opportunity.suggestedAutomationType !== filters.automationType
    ) {
      return false;
    }

    if (filters.focus === "quick-wins" && opportunity.effortTier !== "Quick win") {
      return false;
    }

    if (
      filters.focus === "strategic-bets" &&
      opportunity.effortTier !== "Strategic bet"
    ) {
      return false;
    }

    return true;
  });
}

// --- Main computation ---

export function computeDashboardData(
  rawOpportunities: RawOpportunity[],
  teams: RawTeam[],
  filters: DashboardFilterState,
  customWeights?: Record<ScoreFactorKey, number>,
) {
  const rankedAll = rankOpportunities(
    rawOpportunities
      .map((row) => enrichOpportunity(row, customWeights))
      .sort(sortByOpportunityScore),
  );

  const opportunities = applyFilters(rankedAll, filters);

  return {
    opportunities,
    topCandidates: opportunities.slice(0, 3),
    filterOptions: {
      teams,
      automationTypes: Object.values(AutomationType),
    },
    stats: {
      totalCategories: rankedAll.length,
      visibleCategories: opportunities.length,
      totalMonthlyHoursSaved: opportunities.reduce(
        (total, opportunity) => total + opportunity.monthlyHoursSaved,
        0,
      ),
      totalAnnualCostSavings: opportunities.reduce(
        (total, opportunity) => total + opportunity.annualCostSavings,
        0,
      ),
      quickWinCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Quick win",
      ).length,
      strategicBetCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Strategic bet",
      ).length,
      baselineHours: opportunities.reduce(
        (total, opportunity) => total + opportunity.laborHoursPerMonth,
        0,
      ),
      averageScore:
        opportunities.length > 0
          ? opportunities.reduce((total, opportunity) => total + opportunity.score, 0) /
            opportunities.length
          : 0,
    },
    charts: {
      savingsByOpportunity: opportunities
        .slice(0, 6)
        .map((opportunity) => ({
          name: opportunity.name,
          annualCostSavings: opportunity.annualCostSavings,
          monthlyHoursSaved: opportunity.monthlyHoursSaved,
        })),
      valueVsEffort: opportunities.map((opportunity) => ({
        name: opportunity.name,
        slug: opportunity.slug,
        score: opportunity.score,
        implementationDifficulty: opportunity.implementationDifficultyScore,
        monthlyHoursSaved: opportunity.monthlyHoursSaved,
        effortTier: opportunity.effortTier,
      })),
    },
  };
}
```

- [ ] **Step 2: Update opportunities.ts to import from dashboard.ts**

Replace `opportunities.ts` with a slimmed-down version that imports the pure functions and only provides the Prisma-dependent wrappers:

```ts
import { prisma } from "@/lib/prisma";
import { enrichOpportunity } from "@/lib/scoring";
import {
  computeDashboardData,
  type DashboardFilterState,
  type RawOpportunity,
  type RawTeam,
} from "@/lib/dashboard";

// Re-export types and functions used by other modules
export { parseDashboardFilters, computeDashboardData } from "@/lib/dashboard";
export type { DashboardFilterState, DashboardFocus, RawOpportunity, RawTeam } from "@/lib/dashboard";

function toRawTeam(team: { id: string; slug: string; name: string; description: string; createdAt: Date; updatedAt: Date }): RawTeam {
  return { id: team.id, slug: team.slug, name: team.name, description: team.description };
}

function toRawOpportunity(row: any): RawOpportunity {
  const { createdAt, updatedAt, team, ...opp } = row;
  return { ...opp, team: toRawTeam(team) };
}

export async function getAllRawData(): Promise<{ opportunities: RawOpportunity[]; teams: RawTeam[] }> {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return {
    opportunities: rows.map(toRawOpportunity),
    teams: teams.map(toRawTeam),
  };
}

export async function getDashboardData(filters: DashboardFilterState) {
  const { opportunities, teams } = await getAllRawData();
  return computeDashboardData(opportunities, teams, filters);
}

export async function getOpportunityDetail(slug: string) {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const enriched = rows
    .map((row) => enrichOpportunity(row))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.annualCostSavings !== a.annualCostSavings) return b.annualCostSavings - a.annualCostSavings;
      return a.name.localeCompare(b.name);
    });

  const ranked = enriched.map((opp, i) => ({ ...opp, rank: i + 1 }));
  const opportunity = ranked.find((item) => item.slug === slug);

  if (!opportunity) {
    return null;
  }

  return {
    opportunity,
    totalCount: ranked.length,
    neighboring: {
      higher: ranked.find((item) => item.rank === opportunity.rank - 1) ?? null,
      lower: ranked.find((item) => item.rank === opportunity.rank + 1) ?? null,
    },
  };
}

export async function getAllSlugs() {
  const rows = await prisma.opportunity.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}
```

- [ ] **Step 3: Update imports in DashboardFilters**

In `src/components/dashboard/filters.tsx`, change:
```ts
import type { DashboardFilterState } from "@/lib/opportunities";
```
to:
```ts
import type { DashboardFilterState } from "@/lib/dashboard";
```

- [ ] **Step 4: Run all tests and type check**

Run: `npx vitest run && npx tsc --noEmit`
Expected: ALL PASS, no type errors. The refactor is a pure extraction — behavior unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard.ts src/lib/opportunities.ts src/components/dashboard/filters.tsx
git commit -m "refactor: extract pure dashboard computation from Prisma-dependent code"
```

---

## Chunk 2: Static Site Generation

### Task 3: Create DashboardClient wrapper component

The dashboard becomes a client component that receives raw data as props, runs scoring and filtering client-side, and manages the weight slider state.

**Files:**
- Create: `src/components/dashboard/dashboard-client.tsx`

- [ ] **Step 1: Create the DashboardClient component**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Calculator,
  Layers3,
  Workflow,
} from "lucide-react";

import { SavingsBarChart } from "@/components/charts/savings-bar-chart";
import { ValueVsEffortChart } from "@/components/charts/value-vs-effort-chart";
import { DashboardFilters } from "@/components/dashboard/filters";
import { OpportunityTable } from "@/components/dashboard/opportunity-table";
import { TopCandidates } from "@/components/dashboard/top-candidates";
import { WeightSliderPanel } from "@/components/dashboard/weight-slider-panel";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  computeDashboardData,
  parseDashboardFilters,
  type RawOpportunity,
  type RawTeam,
} from "@/lib/dashboard";
import {
  compactCurrencyFormatter,
  formatHours,
  formatScore,
} from "@/lib/formatters";
import {
  DEFAULT_IMPORTANCE,
  HOURLY_RATE_USD,
  normalizeWeights,
  type ScoreFactorKey,
} from "@/lib/scoring";

type DashboardClientProps = {
  rawOpportunities: RawOpportunity[];
  teams: RawTeam[];
};

export function DashboardClient({ rawOpportunities, teams }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const [importance, setImportance] = useState<Record<ScoreFactorKey, number>>(
    () => ({ ...DEFAULT_IMPORTANCE }),
  );
  const [sliderOpen, setSliderOpen] = useState(false);

  const filters = useMemo(
    () => parseDashboardFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const customWeights = useMemo(() => normalizeWeights(importance), [importance]);

  const isCustom = useMemo(
    () =>
      Object.entries(importance).some(
        ([key, value]) => value !== DEFAULT_IMPORTANCE[key as ScoreFactorKey],
      ),
    [importance],
  );

  const data = useMemo(
    () =>
      computeDashboardData(
        rawOpportunities,
        teams,
        filters,
        isCustom ? customWeights : undefined,
      ),
    [rawOpportunities, teams, filters, customWeights, isCustom],
  );

  const summaryCards = [
    {
      label: "Monthly hours saved",
      value: formatHours(data.stats.totalMonthlyHoursSaved),
      icon: Workflow,
    },
    {
      label: "Annual cost savings",
      value: compactCurrencyFormatter.format(data.stats.totalAnnualCostSavings),
      icon: Calculator,
    },
    {
      label: "Quick wins",
      value: `${data.stats.quickWinCount}`,
      icon: ArrowUpRight,
    },
    {
      label: "Strategic bets",
      value: `${data.stats.strategicBetCount}`,
      icon: Layers3,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          What should we automate next?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.stats.totalCategories} seeded categories | Baseline{" "}
          {formatHours(data.stats.baselineHours)} monthly | Avg score{" "}
          {formatScore(data.stats.averageScore)} |{" "}
          {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}
          /hr labor rate
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {sliderOpen && (
          <WeightSliderPanel
            importance={importance}
            normalizedWeights={customWeights}
            isCustom={isCustom}
            onImportanceChange={setImportance}
            onReset={() => setImportance({ ...DEFAULT_IMPORTANCE })}
            onClose={() => setSliderOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1 space-y-6">
          <DashboardFilters
            filters={filters}
            teams={data.filterOptions.teams}
            automationTypes={data.filterOptions.automationTypes}
            sliderOpen={sliderOpen}
            onToggleSlider={() => setSliderOpen((prev) => !prev)}
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SurfaceCard key={card.label}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {card.value}
                </p>
              </SurfaceCard>
            ))}
          </section>

          {data.opportunities.length > 0 ? (
            <>
              <TopCandidates opportunities={data.topCandidates} />

              <section className="grid gap-6 xl:grid-cols-2">
                <SurfaceCard className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Quick wins vs higher effort
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    Score against delivery effort
                  </h2>
                  <div className="mt-4 min-w-0">
                    <ValueVsEffortChart data={data.charts.valueVsEffort} />
                  </div>
                </SurfaceCard>

                <SurfaceCard className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Savings concentration
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    Annual savings by top-ranked opportunity
                  </h2>
                  <div className="mt-4 min-w-0">
                    <SavingsBarChart data={data.charts.savingsByOpportunity} />
                  </div>
                </SurfaceCard>
              </section>

              <OpportunityTable opportunities={data.opportunities} />
            </>
          ) : (
            <SurfaceCard className="py-12 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                No matches
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                No opportunities match the current filters
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Clear a filter to return to the full portfolio.
              </p>
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
}
```

Note: `WeightSliderPanel` is referenced but not yet created — it will be built in Task 6 (before the build step in Task 7).

- [ ] **Step 2: Commit work-in-progress**

```bash
git add src/components/dashboard/dashboard-client.tsx
git commit -m "feat: create DashboardClient wrapper for client-side scoring"
```

---

### Task 4: Restructure dashboard page.tsx for SSG

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/dashboard/filters.tsx`

- [ ] **Step 1: Replace page.tsx with a thin server component**

Replace the entire content of `src/app/page.tsx` with:

```tsx
import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { AppShell } from "@/components/ui/app-shell";
import { getAllRawData } from "@/lib/opportunities";

export default async function Home() {
  const { opportunities, teams } = await getAllRawData();

  return (
    <AppShell>
      <Suspense>
        <DashboardClient rawOpportunities={opportunities} teams={teams} />
      </Suspense>
    </AppShell>
  );
}
```

The `Suspense` boundary is needed because `DashboardClient` uses `useSearchParams`, which requires it in Next.js App Router.

- [ ] **Step 2: Update DashboardFilters to accept slider toggle props**

In `src/components/dashboard/filters.tsx`, update the props type and add a toggle button:

Add to the props type:
```ts
type DashboardFiltersProps = {
  filters: DashboardFilterState;
  teams: { id: string; slug: string; name: string }[];
  automationTypes: AutomationType[];
  sliderOpen: boolean;
  onToggleSlider: () => void;
};
```

Add `import { SlidersHorizontal } from "lucide-react";` to imports.

Update the function signature to destructure the new props:
```ts
export function DashboardFilters({
  filters,
  teams,
  automationTypes,
  sliderOpen,
  onToggleSlider,
}: DashboardFiltersProps) {
```

Add a button before the closing `</div>` of the filter row (inside the outer `flex` container, after the grid of selects):

```tsx
<button
  type="button"
  onClick={onToggleSlider}
  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
    sliderOpen
      ? "border-accent bg-accent-soft text-accent-strong"
      : "border-line bg-background text-muted-foreground hover:text-foreground"
  }`}
>
  <SlidersHorizontal className="h-4 w-4" />
  <span className="hidden sm:inline">Adjust weights</span>
</button>
```

- [ ] **Step 3: Verify the app still runs in dev mode**

Run: `npm run dev`
Open http://localhost:3000 and confirm the dashboard renders. The slider button should appear but clicking it does nothing visible yet (WeightSliderPanel doesn't exist).
Stop the dev server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/dashboard/filters.tsx
git commit -m "feat: restructure dashboard for client-side rendering"
```

---

### Task 5: Update detail page for static generation

**Files:**
- Modify: `src/app/opportunities/[slug]/page.tsx`

- [ ] **Step 1: Add generateStaticParams and set dynamicParams**

At the top of the file, remove `export const dynamic = "force-dynamic";` and add:

```ts
import { getAllSlugs } from "@/lib/opportunities";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}
```

Keep the rest of the page component unchanged — it fetches from Prisma at build time, which works with static export.

- [ ] **Step 2: Commit**

```bash
git add src/app/opportunities/[slug]/page.tsx
git commit -m "feat: add generateStaticParams for static detail pages"
```

---

### Task 6: Build WeightSliderPanel component

Must be created before the build in Task 7, since `DashboardClient` imports it.

**Files:**
- Create: `src/components/dashboard/weight-slider-panel.tsx`

- [ ] **Step 1: Create the slider panel component**

```tsx
"use client";

import { RotateCcw, X } from "lucide-react";
import { SurfaceCard } from "@/components/ui/surface-card";
import { formatPercent } from "@/lib/formatters";
import { SCORE_WEIGHTS, type ScoreFactorKey } from "@/lib/scoring";

const FACTOR_LABELS: Record<ScoreFactorKey, string> = {
  volume: "Volume",
  laborIntensity: "Labor intensity",
  repeatability: "Repeatability",
  standardization: "Standardization",
  rework: "Rework pressure",
  slaRisk: "SLA risk",
  customerImpact: "Customer impact",
  implementationEase: "Implementation ease",
  approvalEase: "Approval ease",
};

const SLIDER_ORDER: ScoreFactorKey[] = Object.keys(
  SCORE_WEIGHTS,
) as ScoreFactorKey[];

type WeightSliderPanelProps = {
  importance: Record<ScoreFactorKey, number>;
  normalizedWeights: Record<ScoreFactorKey, number>;
  isCustom: boolean;
  onImportanceChange: (importance: Record<ScoreFactorKey, number>) => void;
  onReset: () => void;
  onClose: () => void;
};

export function WeightSliderPanel({
  importance,
  normalizedWeights,
  isCustom,
  onImportanceChange,
  onReset,
  onClose,
}: WeightSliderPanelProps) {
  function handleSliderChange(key: ScoreFactorKey, value: number) {
    onImportanceChange({ ...importance, [key]: value });
  }

  return (
    <SurfaceCard className="w-full shrink-0 lg:w-72 xl:w-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            What-if analysis
          </p>
          <h2 className="mt-1 text-base font-semibold text-foreground">
            Adjust scoring weights
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
          aria-label="Close weight panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {SLIDER_ORDER.map((key) => (
          <div key={key}>
            <div className="flex items-baseline justify-between text-sm">
              <label
                htmlFor={`weight-${key}`}
                className="font-medium text-foreground"
              >
                {FACTOR_LABELS[key]}
              </label>
              <span className="text-xs text-muted-foreground">
                {formatPercent(normalizedWeights[key])}
              </span>
            </div>
            <input
              id={`weight-${key}`}
              type="range"
              min={1}
              max={20}
              step={1}
              value={importance[key]}
              onChange={(e) =>
                handleSliderChange(key, Number(e.target.value))
              }
              className="mt-1 w-full accent-accent"
              aria-label={`${FACTOR_LABELS[key]} importance`}
            />
          </div>
        ))}
      </div>

      {isCustom && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </button>
      )}
    </SurfaceCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/weight-slider-panel.tsx
git commit -m "feat: add what-if weight slider panel"
```

---

### Task 7: Configure static export, clean up, and verify build

**Files:**
- Modify: `next.config.ts`
- Delete: `src/app/api/opportunities/route.ts`
- Delete: `src/app/api/opportunities/[slug]/route.ts`

- [ ] **Step 1: Set output to export in next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

- [ ] **Step 2: Delete API routes**

```bash
rm -rf src/app/api
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: Build succeeds. Next.js generates static HTML to the `out/` directory.

If there are errors, fix them. Common issues:
- Missing `Suspense` boundary around `useSearchParams` — addressed in Task 4.
- Date serialization warnings — the `toRawTeam`/`toRawOpportunity` mappers in Task 2 handle this.

- [ ] **Step 4: Verify `out/` is in .gitignore**

Check that `.gitignore` already contains `/out/` (it does by default in Next.js projects). No change needed if present.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts .gitignore
git add -u src/app/api/  # stages deletions
git commit -m "feat: configure static export, remove API routes"
```

---

## Chunk 3: E2E Tests + Deployment

### Task 8: Set up Playwright and write e2e tests

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/dashboard.spec.ts`
- Create: `e2e/detail.spec.ts`
- Modify: `package.json` (add test:e2e script)

- [ ] **Step 1: Install Playwright browsers and serve**

Run: `npm install -D serve && npx playwright install --with-deps chromium`

`serve` is needed to serve the static `out/` directory during e2e tests.

- [ ] **Step 2: Create playwright.config.ts**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "npm run build && npx serve out -l 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Add test:e2e script to package.json**

Add to the `"scripts"` section:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 4: Write dashboard e2e tests**

Create `e2e/dashboard.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads with summary cards and opportunity table", async ({ page }) => {
    await page.goto("/");

    // Summary cards render
    await expect(page.getByText("Monthly hours saved")).toBeVisible();
    await expect(page.getByText("Annual cost savings")).toBeVisible();
    await expect(page.getByText("Quick wins")).toBeVisible();
    await expect(page.getByText("Strategic bets")).toBeVisible();

    // Opportunity table has rows
    await expect(page.getByText("Ranked opportunity table")).toBeVisible();
    await expect(page.getByText("Password reset")).toBeVisible();
  });

  test("filters change displayed data", async ({ page }) => {
    await page.goto("/");

    // Select a specific team
    const teamSelect = page.locator("select").first();
    await teamSelect.selectOption({ label: "Security Ops" });

    // Wait for filter to apply (client-side, should be instant)
    await expect(page.getByText("MFA reset")).toBeVisible();

    // Service Desk items should not be visible
    await expect(page.getByText("Password reset")).not.toBeVisible();
  });

  test("weight slider re-ranks opportunities", async ({ page }) => {
    await page.goto("/");

    // Open slider panel
    await page.getByRole("button", { name: /adjust weights/i }).click();
    await expect(page.getByText("What-if analysis")).toBeVisible();

    // Get initial first-ranked opportunity name
    const firstRankBefore = await page
      .locator("table tbody tr")
      .first()
      .textContent();

    // Drag the SLA risk slider to max (20)
    const slaSlider = page.getByLabel("SLA risk importance");
    await slaSlider.fill("20");

    // Drag volume slider to min (1)
    const volumeSlider = page.getByLabel("Volume importance");
    await volumeSlider.fill("1");

    // Rankings should have changed — verify first row content differs
    const firstRankAfter = await page
      .locator("table tbody tr")
      .first()
      .textContent();

    expect(firstRankAfter).not.toBe(firstRankBefore);

    // Reset button should be visible when weights are custom
    await expect(
      page.getByRole("button", { name: /reset to defaults/i }),
    ).toBeVisible();

    // Reset and verify rankings return to original
    await page.getByRole("button", { name: /reset to defaults/i }).click();
    await expect(
      page.getByRole("button", { name: /reset to defaults/i }),
    ).not.toBeVisible();

    const firstRankAfterReset = await page
      .locator("table tbody tr")
      .first()
      .textContent();
    expect(firstRankAfterReset).toBe(firstRankBefore);
  });
});
```

- [ ] **Step 5: Write detail page e2e tests**

Create `e2e/detail.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Opportunity Detail", () => {
  test("loads score breakdown and metrics", async ({ page }) => {
    await page.goto("/");

    // Click first "View" link in the table
    await page.locator("table").getByRole("link", { name: "View" }).first().click();

    // Detail page loads
    await expect(page.getByText("Opportunity score")).toBeVisible();
    await expect(page.getByText("Monthly hours saved")).toBeVisible();
    await expect(page.getByText("Annual cost savings")).toBeVisible();

    // Score breakdown section exists
    await expect(page.getByText("Monthly volume")).toBeVisible();
    await expect(page.getByText("Repeatability")).toBeVisible();
  });

  test("navigates between neighboring opportunities", async ({ page }) => {
    await page.goto("/");

    // Click first opportunity
    await page.locator("table").getByRole("link", { name: "View" }).first().click();

    // Get current opportunity name
    const heading = page.locator("h1");
    const firstName = await heading.textContent();

    // Click "Ranked lower" link
    const lowerLink = page.getByText("Ranked lower").locator("..");
    if (await lowerLink.locator("a").count()) {
      await lowerLink.locator("a").click();
      const secondName = await heading.textContent();
      expect(secondName).not.toBe(firstName);
    }

    // Navigate back to dashboard
    await page.getByRole("link", { name: /back to dashboard/i }).click();
    await expect(page.getByText("What should we automate next?")).toBeVisible();
  });
});
```

- [ ] **Step 6: Run e2e tests**

Run: `npx playwright test`
Expected: All 5 tests pass. If any fail, fix the selectors or assertions.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts e2e/ package.json
git commit -m "test: add Playwright e2e tests for dashboard and detail pages"
```

---

### Task 9: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI if not present**

Run: `npm install -g vercel` (or use `npx vercel`)

- [ ] **Step 2: Deploy**

Run: `npx vercel --prod`

Follow the prompts to link the project. Vercel will detect the Next.js static export and serve the `out/` directory.

If the build fails on Vercel due to Prisma/SQLite:
- Ensure `postinstall` script runs `prisma generate`
- The build runs `next build` which queries Prisma to generate static pages — the SQLite db must be present
- The `prisma/dev.db` file needs to be committed (it already is)

- [ ] **Step 3: Verify the live URL**

Open the deployed URL. Confirm:
- Dashboard loads with all data
- Filters work
- Weight slider works
- Detail pages load
- Dark/light theme toggle works

- [ ] **Step 4: Update README with the live URL**

Add the deployed URL to the top of `README.md`.

- [ ] **Step 5: Commit and push**

```bash
git add README.md
git commit -m "docs: add live deployment URL to README"
git push origin main
```
