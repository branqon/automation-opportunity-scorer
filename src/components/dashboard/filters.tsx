"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AutomationType } from "@/generated/prisma/enums";
import { FOCUS_OPTIONS, getAutomationTypeLabel } from "@/lib/metadata";
import type { DashboardFilterState } from "@/lib/opportunities";

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  teams: { id: string; slug: string; name: string }[];
  automationTypes: AutomationType[];
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

    startTransition(() => {
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="rounded-card border border-line/80 bg-surface/80 p-4 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Filter the ranked view
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Slice the model by team, automation pattern, or delivery effort
            while keeping the scoring logic fixed.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Team
            <select
              className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
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

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Automation type
            <select
              className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
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

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Focus
            <select
              className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
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
        </div>
      </div>
    </div>
  );
}
