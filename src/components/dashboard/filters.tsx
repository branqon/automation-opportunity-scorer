"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { AutomationType } from "@/generated/prisma/enums";
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
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Filter the ranked view
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Slice the model by team, automation pattern, or delivery effort
            and optionally carry a what-if weighting scenario into linked detail
            views.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[14rem] flex-1 flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Team
            <select
              className="min-h-10 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent"
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

          <label className="flex min-w-[14rem] flex-1 flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Type
            <select
              className="min-h-10 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent"
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

          <label className="flex min-w-[14rem] flex-1 flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Focus
            <select
              className="min-h-10 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent"
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
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              sliderOpen
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-line bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Adjust weights</span>
          </button>
        </div>
      </div>
    </div>
  );
}
