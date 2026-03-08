import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { compactCurrencyFormatter, formatHours, formatScore } from "@/lib/formatters";
import { getAutomationTypeLabel } from "@/lib/metadata";
import type { RankedOpportunity } from "@/lib/scoring";

function getEffortVariant(tier: RankedOpportunity["effortTier"]) {
  if (tier === "Quick win") {
    return "success";
  }

  if (tier === "Strategic bet") {
    return "critical";
  }

  return "warning";
}

type OpportunityTableProps = {
  opportunities: RankedOpportunity[];
};

export function OpportunityTable({ opportunities }: OpportunityTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="border-b border-line/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Ranked opportunity table
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Deterministic ranking with business value and implementation fit
        </h2>
      </div>

      <div className="md:hidden">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.slug}
            className="border-b border-line/70 px-6 py-5 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Rank #{opportunity.rank}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                  {opportunity.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {opportunity.team.name} |{" "}
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-subtle px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Score
                </p>
                <p className="font-display text-2xl font-semibold">
                  {formatScore(opportunity.score)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={getEffortVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
              <Badge variant="accent">{opportunity.valueBand}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-surface-subtle p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Monthly hours
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-subtle p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Annual savings
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
              </div>
            </div>

            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
            >
              Open detail view
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line/80 bg-surface-subtle/80 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Rank</th>
              <th className="px-6 py-4 font-semibold">Opportunity</th>
              <th className="px-6 py-4 font-semibold">Automation type</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Monthly hours</th>
              <th className="px-6 py-4 font-semibold">Annual savings</th>
              <th className="px-6 py-4 font-semibold">Effort</th>
              <th className="px-6 py-4 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opportunity) => (
              <tr
                key={opportunity.slug}
                className="border-b border-line/70 transition hover:bg-surface-subtle/50"
              >
                <td className="px-6 py-5 align-top">
                  <div className="text-lg font-semibold text-foreground">
                    #{opportunity.rank}
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="max-w-[20rem]">
                    <p className="font-semibold text-foreground">{opportunity.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {opportunity.team.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {opportunity.summary}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5 align-top text-sm text-muted-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="font-display text-2xl font-semibold text-foreground">
                    {formatScore(opportunity.score)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.valueBand}
                  </p>
                </td>
                <td className="px-6 py-5 align-top text-sm font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </td>
                <td className="px-6 py-5 align-top text-sm font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </td>
                <td className="px-6 py-5 align-top">
                  <Badge variant={getEffortVariant(opportunity.effortTier)}>
                    {opportunity.effortTier}
                  </Badge>
                </td>
                <td className="px-6 py-5 align-top">
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
                  >
                    View
                    <ArrowRight className="h-4 w-4" />
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
