"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { AutomationType } from "@/generated/prisma/enums";
import { SurfaceCard } from "@/components/ui/surface-card";
import { applyImportanceSearchParams } from "@/lib/dashboard";
import { FOCUS_OPTIONS, getAutomationTypeLabel } from "@/lib/metadata";
import type { DashboardFilterState } from "@/lib/dashboard";
import type { ScoreFactorKey } from "@/lib/scoring";

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  teams: { id: string; slug: string; name: string }[];
  automationTypes: AutomationType[];
  importance: Record<ScoreFactorKey, number>;
  sliderOpen: boolean;
  onToggleSlider: () => void;
};

function buildOptions<T extends string>(
  values: T[],
  labelResolver: (value: T) => string,
) {
  return values.map((value) => ({
    value,
    label: labelResolver(value),
  }));
}

export function DashboardFilters({
  filters,
  teams,
  automationTypes,
  importance,
  sliderOpen,
  onToggleSlider,
}: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const automationTypeOptions = buildOptions(
    automationTypes,
    getAutomationTypeLabel,
  );

  function updateFilter(key: keyof DashboardFilterState, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    const nextParamsWithImportance = applyImportanceSearchParams(
      nextParams,
      importance,
    );

    startTransition(() => {
      const query = nextParamsWithImportance.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <SurfaceCard className="bg-surface-elevated">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="xl:max-w-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Filter the ranked view
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Slice the portfolio without losing the model context
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Slice the model by team, automation pattern, or delivery effort
            and optionally carry a what-if weighting scenario into linked detail
            views.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(11rem,1fr))_auto]">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Team
            <select
              className="min-h-11 w-full border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:bg-surface-elevated"
              value={filters.team}
              onChange={(event) => updateFilter("team", event.target.value)}
            >
              <option value="all">All teams</option>
              {teams.map((team) => (
                <option key={team.slug} value={team.slug}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Type
            <select
              className="min-h-11 w-full border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:bg-surface-elevated"
              value={filters.automationType}
              onChange={(event) =>
                updateFilter("automationType", event.target.value)
              }
            >
              <option value="all">All patterns</option>
              {automationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Focus
            <select
              className="min-h-11 w-full border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:bg-surface-elevated"
              value={filters.focus}
              onChange={(event) => updateFilter("focus", event.target.value)}
            >
              {FOCUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onToggleSlider}
            aria-label="Adjust weights"
            className={`inline-flex min-h-11 items-center justify-center gap-2 self-end whitespace-nowrap border px-4 py-2 text-sm font-medium shadow-card transition ${
              sliderOpen
                ? "border-accent/40 bg-accent-soft text-accent-strong"
                : "border-line bg-surface text-muted-foreground hover:border-accent/25 hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Adjust weights</span>
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}
