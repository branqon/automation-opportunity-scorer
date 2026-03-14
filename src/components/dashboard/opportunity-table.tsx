import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  compactCurrencyFormatter,
  formatHours,
  formatScore,
} from "@/lib/formatters";
import { getAutomationTypeLabel } from "@/lib/metadata";
import { getEffortBadgeVariant, getScoreColorClass } from "@/lib/opportunity-badges";
import type { RankedOpportunity } from "@/lib/scoring";

type OpportunityTableProps = {
  opportunities: RankedOpportunity[];
  detailQuery?: string;
};

export function OpportunityTable({
  opportunities,
  detailQuery,
}: OpportunityTableProps) {
  function buildOpportunityHref(slug: string) {
    return detailQuery
      ? `/opportunities/${slug}?${detailQuery}`
      : `/opportunities/${slug}`;
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface-elevated shadow-card">
      <div className="border-b border-line bg-surface-subtle/60 px-4 py-4 sm:px-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
            className="border-b border-line bg-surface px-4 py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
              <div className="border border-accent/15 bg-accent-soft px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-accent-strong">
                  Score
                </p>
                <p className={`text-xl font-semibold ${getScoreColorClass(opportunity.valueBand)}`}>
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
              <div className="rounded-card border border-line bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Monthly hours
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Annual savings
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
              </div>
            </div>

            <Link
              href={buildOpportunityHref(opportunity.slug)}
              prefetch={false}
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
          <caption className="sr-only">
            Ranked automation opportunities sorted by composite score
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">Rank</th>
              <th scope="col" className="px-4 py-3 font-medium">Opportunity</th>
              <th scope="col" className="px-4 py-3 font-medium">Automation type</th>
              <th scope="col" className="px-4 py-3 font-medium">Score</th>
              <th scope="col" className="px-4 py-3 font-medium">Monthly hours</th>
              <th scope="col" className="px-4 py-3 font-medium">Annual savings</th>
              <th scope="col" className="px-4 py-3 font-medium">Effort</th>
              <th scope="col" className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opportunity) => (
              <tr
                key={opportunity.slug}
                className="border-b border-line transition hover:bg-surface-subtle/65"
              >
                <td className="px-4 py-3 align-top">
                  <span className="inline-flex min-w-10 justify-center rounded-control border border-line bg-surface-subtle px-2 py-1 text-sm font-semibold text-foreground">
                    #{opportunity.rank}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-[18rem]">
                    <Link
                      href={buildOpportunityHref(opportunity.slug)}
                      prefetch={false}
                      className="font-semibold text-foreground transition hover:text-accent"
                    >
                      {opportunity.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {opportunity.team.name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className={`text-lg font-semibold ${getScoreColorClass(opportunity.valueBand)}`}>
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
                    href={buildOpportunityHref(opportunity.slug)}
                    prefetch={false}
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
    </div>
  );
}
