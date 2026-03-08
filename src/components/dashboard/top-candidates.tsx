import Link from "next/link";
import { ArrowRight, Clock3, DollarSign, Sparkles } from "lucide-react";

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

function getValueVariant(valueBand: RankedOpportunity["valueBand"]) {
  if (valueBand === "Automate now") {
    return "accent";
  }

  if (valueBand === "Validate next") {
    return "warning";
  }

  return "neutral";
}

type TopCandidatesProps = {
  opportunities: RankedOpportunity[];
};

export function TopCandidates({ opportunities }: TopCandidatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Top candidates
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Highest-confidence automation investments
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {opportunities.map((opportunity) => (
          <SurfaceCard
            key={opportunity.slug}
            className="relative overflow-hidden !border-transparent !bg-foreground !text-background shadow-[0_30px_80px_rgba(12,24,21,0.24)]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-soft via-accent to-accent-strong" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/70">
                  Rank #{opportunity.rank}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {opportunity.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-background/70">
                  {opportunity.summary}
                </p>
              </div>
              <div className="rounded-2xl bg-background/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-background/70">
                  Score
                </p>
                <p className="font-display text-3xl font-semibold">
                  {formatScore(opportunity.score)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant={getValueVariant(opportunity.valueBand)}>
                {opportunity.valueBand}
              </Badge>
              <Badge variant={getEffortVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
              <Badge
                variant="neutral"
                className="border-white/15 bg-white/10 text-background/80"
              >
                {opportunity.team.name}
              </Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-background/70">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.16em]">
                    Monthly hours
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-background/70">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.16em]">
                    Annual savings
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-background/70">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.16em]">
                    Pattern
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/70">
                Recommended next step
              </p>
              <p className="mt-2 text-sm leading-7 text-background/80">
                {opportunity.recommendedNextStep}
              </p>
            </div>

            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-soft transition hover:text-white"
            >
              View full score breakdown
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
