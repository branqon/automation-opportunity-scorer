import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  DollarSign,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ScoreBreakdown } from "@/components/detail/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/ui/app-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  compactCurrencyFormatter,
  formatHours,
  formatRatePercent,
  formatScore,
} from "@/lib/formatters";
import {
  AUTOMATION_TYPE_DESCRIPTIONS,
  getAutomationTypeLabel,
} from "@/lib/metadata";
import { getEffortBadgeVariant } from "@/lib/opportunity-badges";
import { getOpportunityDetail } from "@/lib/opportunities";
import { HOURLY_RATE_USD } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type OpportunityPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: OpportunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getOpportunityDetail(slug);

  if (!detail) {
    return {
      title: "Opportunity not found",
    };
  }

  return {
    title: detail.opportunity.name,
    description: detail.opportunity.summary,
  };
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const { slug } = await params;
  const detail = await getOpportunityDetail(slug);

  if (!detail) {
    notFound();
  }

  const { opportunity, neighboring, totalCount } = detail;

  return (
    <AppShell>
      <div className="space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-strong"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <section className="grid gap-5 xl:items-start xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <SurfaceCard>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="neutral">{opportunity.team.name}</Badge>
              <Badge variant="accent">
                {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
              </Badge>
              <Badge variant={getEffortBadgeVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {opportunity.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {opportunity.summary}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Opportunity score
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatScore(opportunity.score)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {opportunity.valueBand}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Monthly hours saved
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatHours(opportunity.laborHoursPerMonth)} current load
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Annual cost savings
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}/hr
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Why this ranked here
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Rank #{opportunity.rank} of {totalCount}
              </h2>
            </div>

            <div className="rounded-xl border border-line bg-surface-subtle p-4">
              <div className="flex items-start gap-2.5">
                <Gauge className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Primary case for action</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {opportunity.whyNow}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface-subtle p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Primary constraint</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {opportunity.keyConstraint}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-accent/15 bg-accent-soft p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-accent-strong">
                Recommended next step
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-accent-strong">
                {opportunity.recommendedNextStep}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {neighboring.higher ? (
                <Link
                  href={`/opportunities/${neighboring.higher.slug}`}
                  className="rounded-xl border border-line bg-surface-subtle p-3 transition hover:border-accent/25 hover:bg-surface"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Ranked higher
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {neighboring.higher.name}
                  </p>
                </Link>
              ) : (
                <div className="rounded-xl border border-line bg-surface-subtle/60 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Ranked higher
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    Highest-ranked opportunity
                  </p>
                </div>
              )}

              {neighboring.lower ? (
                <Link
                  href={`/opportunities/${neighboring.lower.slug}`}
                  className="rounded-xl border border-line bg-surface-subtle p-3 transition hover:border-accent/25 hover:bg-surface"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Ranked lower
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {neighboring.lower.name}
                  </p>
                </Link>
              ) : (
                <div className="rounded-xl border border-line bg-surface-subtle/60 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Ranked lower
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    End of ranked list
                  </p>
                </div>
              )}
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-5 xl:items-start xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <ScoreBreakdown opportunity={opportunity} />

          <div className="space-y-5">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ROI assumptions
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Transparent savings estimate
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface-subtle p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    <p className="text-xs uppercase tracking-wider">
                      Automation rate
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatRatePercent(opportunity.estimatedAutomationRate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Based on repeatability, standardization, difficulty, and pattern.
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-surface-subtle p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    <p className="text-xs uppercase tracking-wider">
                      Annual savings
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatHours(opportunity.annualHoursSaved)} annually at{" "}
                    {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}/hr
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-semibold text-foreground">Formula used</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Monthly minutes saved = monthly volume x average handle time x
                  estimated automation rate. Annual cost savings = annual hours
                  saved x hourly rate.
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Suggested approach
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {
                    AUTOMATION_TYPE_DESCRIPTIONS[
                      opportunity.suggestedAutomationType
                    ]
                  }
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-foreground">Implementation approach</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {opportunity.suggestedApproach}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-foreground">
                  Implementation considerations
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {opportunity.implementationConsiderations}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-foreground">Risk and complexity notes</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {opportunity.riskNotes}
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-strong"
              >
                Return to the ranked portfolio view
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
