"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import { SavingsBarChart } from "@/components/charts/savings-bar-chart";
import { ValueVsEffortChart } from "@/components/charts/value-vs-effort-chart";
import { DashboardFilters } from "@/components/dashboard/filters";
import { OpportunityTable } from "@/components/dashboard/opportunity-table";
import { WeightSliderPanel } from "@/components/dashboard/weight-slider-panel";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  applyImportanceSearchParams,
  computeDashboardData,
  hasCustomImportance,
  parseDashboardFilters,
  parseImportance,
  type RawOpportunity,
  type RawTeam,
} from "@/lib/dashboard";
import { compactCurrencyFormatter, formatHours } from "@/lib/formatters";
import { normalizeWeights } from "@/lib/scoring";
import { useClientSearchParams } from "@/lib/use-client-search-params";

type DashboardClientProps = {
  rawOpportunities: RawOpportunity[];
  teams: RawTeam[];
};

export function DashboardClient({
  rawOpportunities,
  teams,
}: DashboardClientProps) {
  const { searchParams, searchString: searchParamsKey, replace: replaceUrl } = useClientSearchParams();
  const urlImportance = useMemo(() => parseImportance(searchParams), [searchParams]);
  const [draftState, setDraftState] = useState(() => ({
    sourceKey: searchParamsKey,
    importance: urlImportance,
  }));
  const importance =
    draftState.sourceKey === searchParamsKey
      ? draftState.importance
      : urlImportance;
  const importanceRef = useRef(importance);
  const [sliderOpen, setSliderOpen] = useState(false);

  useEffect(() => {
    importanceRef.current = importance;
  }, [importance]);

  const filters = useMemo(
    () => parseDashboardFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const customWeights = useMemo(() => normalizeWeights(importance), [importance]);
  const isCustom = useMemo(() => hasCustomImportance(importance), [importance]);

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
  const detailQuery = useMemo(
    () =>
      applyImportanceSearchParams(
        new URLSearchParams(searchParams.toString()),
        importance,
      ).toString(),
    [importance, searchParams],
  );

  function syncImportance(nextImportance: typeof importance) {
    const nextParams = applyImportanceSearchParams(
      new URLSearchParams(searchParams.toString()),
      nextImportance,
    );

    startTransition(() => {
      replaceUrl(nextParams.toString(), { scroll: false });
    });
  }

  function handleImportanceChange(key: keyof typeof importance, value: number) {
    const nextImportance = {
      ...importanceRef.current,
      [key]: value,
    };

    setDraftState({
      sourceKey: searchParamsKey,
      importance: nextImportance,
    });
    syncImportance(nextImportance);
  }

  function resetImportance() {
    const nextImportance = parseImportance(new URLSearchParams());
    setDraftState({
      sourceKey: searchParamsKey,
      importance: nextImportance,
    });
    syncImportance(nextImportance);
  }

  const heroStats = [
    {
      label: "Ranked categories",
      value: String(data.opportunities.length),
      note: "current portfolio view",
      icon: BriefcaseBusiness,
    },
    {
      label: "Recoverable capacity",
      value: formatHours(data.stats.totalMonthlyHoursSaved),
      note: "monthly potential",
      icon: Clock3,
    },
    {
      label: "Annual savings",
      value: compactCurrencyFormatter.format(data.stats.totalAnnualCostSavings),
      note: "at the base labor rate",
      icon: CircleDollarSign,
    },
    {
      label: "Strategic bets",
      value: String(data.stats.strategicBetCount),
      note: "higher-effort investments",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SurfaceCard className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, var(--ambient-primary) 0%, transparent 36%), linear-gradient(180deg, color-mix(in srgb, var(--surface-elevated) 86%, transparent) 0%, transparent 100%)",
            }}
          />

          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-strong">
              Decision support dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              What should we automate next?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Rank recurring operational work by business value, delivery fit,
              and explicit ROI assumptions without turning the product into a
              workflow runner.
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {data.opportunities.length} opportunities |{" "}
              {formatHours(data.stats.totalMonthlyHoursSaved)} monthly |{" "}
              {compactCurrencyFormatter.format(data.stats.totalAnnualCostSavings)}{" "}
              annual savings | {data.stats.quickWinCount} quick wins
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Deterministic 9-factor model
              </span>
              <span className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Read-only portfolio surface
              </span>
              <span className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Shareable what-if scenarios
              </span>
              {isCustom ? (
                <span className="rounded-pill border border-accent/25 bg-accent-soft px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-strong">
                  Custom weighting active
                </span>
              ) : null}
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-3 sm:grid-cols-2">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-line bg-surface-elevated px-4 py-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {sliderOpen && (
          <WeightSliderPanel
            importance={importance}
            normalizedWeights={customWeights}
            isCustom={isCustom}
            onImportanceChange={handleImportanceChange}
            onReset={resetImportance}
            onClose={() => setSliderOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1 space-y-6">
          <DashboardFilters
            filters={filters}
            teams={data.filterOptions.teams}
            automationTypes={data.filterOptions.automationTypes}
            importance={importance}
            searchParams={searchParams}
            onSearchChange={replaceUrl}
            sliderOpen={sliderOpen}
            onToggleSlider={() => setSliderOpen((prev) => !prev)}
          />

          {data.opportunities.length > 0 ? (
            <>
              <OpportunityTable
                opportunities={data.opportunities}
                detailQuery={detailQuery}
              />

              <details className="group">
                <summary className="inline-flex list-none cursor-pointer items-center gap-2 border border-line bg-surface px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-card hover:text-foreground [&::-webkit-details-marker]:hidden">
                  <span className="text-[10px] transition-transform group-open:rotate-90">
                    {">"}
                  </span>
                  Analytics
                </summary>
                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  <SurfaceCard className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Portfolio signals
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">
                      Quick wins against delivery effort
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      The top-right cluster shows the best near-term automation
                      targets. Lower-left items are still useful, but they need
                      more process work or integration effort first.
                    </p>
                    <div className="mt-4 min-w-0">
                      <ValueVsEffortChart data={data.charts.valueVsEffort} />
                    </div>
                  </SurfaceCard>

                  <SurfaceCard className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Savings concentration
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">
                      Annual savings by top-ranked opportunity
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      Savings are not evenly distributed. The first few categories
                      recover a disproportionate share of analyst capacity.
                    </p>
                    <div className="mt-4 min-w-0">
                      <SavingsBarChart data={data.charts.savingsByOpportunity} />
                    </div>
                  </SurfaceCard>
                </div>
              </details>
            </>
          ) : (
            <SurfaceCard className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
