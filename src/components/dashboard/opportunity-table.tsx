import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  compactCurrencyFormatter,
  formatHours,
  formatScore,
} from "@/lib/formatters";
import { getAutomationTypeLabel } from "@/lib/metadata";
import { getEffortBadgeVariant } from "@/lib/opportunity-badges";
import type { RankedOpportunity } from "@/lib/scoring";

type OpportunityTableProps = {
  opportunities: RankedOpportunity[];
};

export function OpportunityTable({ opportunities }: OpportunityTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="border-b border-line px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ranked opportunity table
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Deterministic ranking by business value and implementation fit
        </h2>
      </div>

      <div className="md:hidden">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.slug}
            className="border-b border-line px-4 py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rank #{opportunity.rank}
                </p>
                <h3 className="mt-1.5 text-base font-semibold text-foreground">
                  {opportunity.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {opportunity.team.name} |{" "}
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </p>
              </div>
              <div className="rounded-lg bg-accent-soft px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-wider text-accent-strong">
                  Score
                </p>
                <p className="text-xl font-semibold text-accent-strong">
                  {formatScore(opportunity.score)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant={getEffortBadgeVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
              <Badge variant="accent">{opportunity.valueBand}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly hours
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Annual savings
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
              </div>
            </div>

            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-strong"
            >
              Open detail view
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-subtle text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="px-4 py-3 font-medium">Automation type</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Monthly hours</th>
              <th className="px-4 py-3 font-medium">Annual savings</th>
              <th className="px-4 py-3 font-medium">Effort</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opportunity) => (
              <tr
                key={opportunity.slug}
                className="border-b border-line transition hover:bg-surface-subtle"
              >
                <td className="px-4 py-3 align-top">
                  <span className="text-sm font-semibold text-foreground">
                    #{opportunity.rank}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-[18rem]">
                    <p className="font-semibold text-foreground">
                      {opportunity.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {opportunity.team.name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="text-lg font-semibold text-foreground">
                    {formatScore(opportunity.score)}
                  </span>
                </td>
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </td>
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge variant={getEffortBadgeVariant(opportunity.effortTier)}>
                    {opportunity.effortTier}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="inline-flex items-center gap-1.5 font-medium text-accent transition hover:text-accent-strong"
                  >
                    View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
