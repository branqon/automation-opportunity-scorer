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
