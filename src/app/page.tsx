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
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            What should we automate next?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.stats.totalCategories} seeded categories | Baseline {formatHours(data.stats.baselineHours)} monthly | Avg score {formatScore(data.stats.averageScore)} | {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}/hr labor rate
          </p>
        </div>

        <DashboardFilters
          filters={filters}
          teams={data.filterOptions.teams}
          automationTypes={data.filterOptions.automationTypes}
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
    </AppShell>
  );
}
