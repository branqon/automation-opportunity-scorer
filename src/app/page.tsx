import {
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  Layers3,
  LineChart,
  Workflow,
} from "lucide-react";

import { SavingsBarChart } from "@/components/charts/savings-bar-chart";
import { ValueVsEffortChart } from "@/components/charts/value-vs-effort-chart";
import { AiInsightsCard } from "@/components/dashboard/ai-insights-card";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { DashboardFilters } from "@/components/dashboard/filters";
import { OpportunityTable } from "@/components/dashboard/opportunity-table";
import { TopCandidates } from "@/components/dashboard/top-candidates";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/ui/app-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { compactCurrencyFormatter, formatHours, formatScore } from "@/lib/formatters";
import { getDashboardData, parseDashboardFilters } from "@/lib/opportunities";
import { HOURLY_RATE_USD } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: DashboardPageProps) {
  const filters = parseDashboardFilters(await searchParams);
  const data = await getDashboardData(filters);

  const summaryCards = [
    {
      label: "Monthly hours saved",
      value: formatHours(data.stats.totalMonthlyHoursSaved),
      description:
        "Estimated analyst capacity recovered if the visible portfolio is delivered.",
      icon: Workflow,
    },
    {
      label: "Annual cost savings",
      value: compactCurrencyFormatter.format(data.stats.totalAnnualCostSavings),
      description: `ROI uses a visible ${compactCurrencyFormatter
        .format(HOURLY_RATE_USD)
        .replace(".0", "")}/hr labor-rate assumption in code.`,
      icon: Calculator,
    },
    {
      label: "Quick wins",
      value: `${data.stats.quickWinCount}`,
      description:
        "Lower effort items with light approval and manageable delivery scope.",
      icon: ArrowUpRight,
    },
    {
      label: "Strategic bets",
      value: `${data.stats.strategicBetCount}`,
      description:
        "High-upside items that need deeper integration or stronger governance.",
      icon: Layers3,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
          <SurfaceCard className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-soft via-accent to-accent-strong" />
            <Badge variant="accent">Deterministic automation scoring</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              What should we automate next?
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              A focused internal-tool style application that ranks recurring
              operational work by business value, implementation fit, and visible
              ROI assumptions.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Seeded categories
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {data.stats.totalCategories}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Realistic MSP and service-ops examples modeled as recurring
                  process categories, not raw ticket ingestion.
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Baseline workload
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {formatHours(data.stats.baselineHours)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current analyst time spent each month across the visible
                  opportunity set.
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Average score
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {formatScore(data.stats.averageScore)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current portfolio average after applying the active filter
                  lens.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Model stance
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                This is prioritization logic, not a workflow platform
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <LineChart className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Transparent weights</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Volume, time load, repeatability, rework, SLA risk, customer
                    impact, implementation difficulty, and approval complexity
                    all contribute visible weighted points.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Workflow className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Tight v1 scope</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    No ticket ingestion, no automation execution engine, no
                    configurable scoring UI, and no chatbot layer.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Trustworthy detail</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Each opportunity shows why it ranked where it did, what the
                    savings estimate assumes, and the next implementation move.
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </section>

        <DashboardFilters
          filters={filters}
          teams={data.filterOptions.teams}
          automationTypes={data.filterOptions.automationTypes}
        />

        <AiInsightsCard />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SurfaceCard key={card.label} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {card.label}
                </p>
                <card.icon className="h-5 w-5 text-accent" />
              </div>
              <p className="font-display text-4xl font-semibold text-foreground">
                {card.value}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {card.description}
              </p>
            </SurfaceCard>
          ))}
        </section>

        {data.opportunities.length > 0 ? (
          <>
            <TopCandidates opportunities={data.topCandidates} />

            <section className="grid gap-6 xl:grid-cols-2">
              <SurfaceCard className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Quick wins vs higher effort
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                  Opportunity score against delivery effort
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Bubble size shows estimated monthly hours saved. High-scoring
                  items on the left side are the best quick-win candidates.
                </p>
                <div className="mt-6 min-w-0">
                  <ValueVsEffortChart data={data.charts.valueVsEffort} />
                </div>
              </SurfaceCard>

              <SurfaceCard className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Savings concentration
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                  Annual savings by top-ranked opportunity
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  This view makes the ROI story easy to explain in a review with
                  operations leaders or hiring managers.
                </p>
                <div className="mt-6 min-w-0">
                  <SavingsBarChart data={data.charts.savingsByOpportunity} />
                </div>
              </SurfaceCard>
            </section>

            <div className="flex items-center justify-end">
              <CsvExportButton opportunities={data.opportunities} />
            </div>

            <OpportunityTable opportunities={data.opportunities} />
          </>
        ) : (
          <SurfaceCard className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              No matches
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              No opportunities match the current filter combination
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Clear one of the filters to return to the full seeded portfolio or
              switch to a broader focus lens.
            </p>
          </SurfaceCard>
        )}
      </div>
    </AppShell>
  );
}
