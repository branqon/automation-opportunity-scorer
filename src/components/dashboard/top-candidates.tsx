import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { compactCurrencyFormatter, formatHours, formatScore } from "@/lib/formatters";
import { getAutomationTypeLabel } from "@/lib/metadata";
import {
  getEffortBadgeVariant,
  getValueBadgeVariant,
} from "@/lib/opportunity-badges";
import type { RankedOpportunity } from "@/lib/scoring";

type TopCandidatesProps = {
  opportunities: RankedOpportunity[];
};

export function TopCandidates({ opportunities }: TopCandidatesProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Top candidates
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Highest-confidence automation investments
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.slug}
            className="rounded-xl border border-line bg-surface p-4 shadow-card border-l-4 border-l-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rank #{opportunity.rank}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">
                  {opportunity.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {opportunity.summary}
                </p>
              </div>
              <div className="rounded-lg bg-accent-soft px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-wider text-accent-strong">
                  Score
                </p>
                <p className="text-2xl font-semibold text-accent-strong">
                  {formatScore(opportunity.score)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant={getValueBadgeVariant(opportunity.valueBand)}>
                {opportunity.valueBand}
              </Badge>
              <Badge variant={getEffortBadgeVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
              <Badge variant="neutral">
                {opportunity.team.name}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly hours
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Annual savings
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pattern
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </p>
              </div>
            </div>

            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-strong"
            >
              View full breakdown
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
