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
  formatPercent,
  formatScore,
} from "@/lib/formatters";
import {
  AUTOMATION_TYPE_DESCRIPTIONS,
  getAutomationTypeLabel,
} from "@/lib/metadata";
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

function getEffortVariant(tier: "Quick win" | "Foundation build" | "Strategic bet") {
  if (tier === "Quick win") {
    return "success";
  }

  if (tier === "Strategic bet") {
    return "critical";
  }

  return "warning";
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
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="grid gap-6 xl:items-start xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <SurfaceCard className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-soft via-accent to-accent-strong" />

            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">{opportunity.team.name}</Badge>
              <Badge variant="accent">
                {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
              </Badge>
              <Badge variant={getEffortVariant(opportunity.effortTier)}>
                {opportunity.effortTier}
              </Badge>
            </div>

            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {opportunity.name}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {opportunity.summary}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Opportunity score
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {formatScore(opportunity.score)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {opportunity.valueBand}
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Monthly hours saved
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {formatHours(opportunity.monthlyHoursSaved)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatHours(opportunity.laborHoursPerMonth)} current analyst
                  load
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Annual cost savings
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                  {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}/hr
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Why this ranked here
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                Rank #{opportunity.rank} of {totalCount}
              </h2>
            </div>

            <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
              <div className="flex items-start gap-3">
                <Gauge className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Primary case for action</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {opportunity.whyNow}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Primary constraint</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {opportunity.keyConstraint}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-accent/15 bg-accent-soft/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                Recommended next step
              </p>
              <p className="mt-2 text-sm leading-7 text-accent-strong">
                {opportunity.recommendedNextStep}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {neighboring.higher ? (
                <Link
                  href={`/opportunities/${neighboring.higher.slug}`}
                  className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-4 transition hover:border-accent/25 hover:bg-surface"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Ranked higher
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {neighboring.higher.name}
                  </p>
                </Link>
              ) : (
                <div className="rounded-3xl border border-line/80 bg-surface-subtle/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Ranked higher
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    Highest-ranked opportunity
                  </p>
                </div>
              )}

              {neighboring.lower ? (
                <Link
                  href={`/opportunities/${neighboring.lower.slug}`}
                  className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-4 transition hover:border-accent/25 hover:bg-surface"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Ranked lower
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {neighboring.lower.name}
                  </p>
                </Link>
              ) : (
                <div className="rounded-3xl border border-line/80 bg-surface-subtle/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Ranked lower
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    End of ranked list
                  </p>
                </div>
              )}
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 xl:items-start xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <ScoreBreakdown opportunity={opportunity} />

          <div className="space-y-6">
            <SurfaceCard className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  ROI assumptions
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                  Transparent savings estimate
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">
                      Automation rate
                    </p>
                  </div>
                  <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                    {formatPercent(opportunity.estimatedAutomationRate)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Based on repeatability, standardization, implementation
                    difficulty, approval complexity, and automation pattern.
                  </p>
                </div>

                <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">
                      Annual savings
                    </p>
                  </div>
                  <p className="mt-3 font-display text-4xl font-semibold text-foreground">
                    {compactCurrencyFormatter.format(opportunity.annualCostSavings)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatHours(opportunity.annualHoursSaved)} annually at{" "}
                    {compactCurrencyFormatter.format(HOURLY_RATE_USD).replace(".0", "")}/hr
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface p-5">
                <p className="font-semibold text-foreground">Formula used</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Monthly minutes saved = monthly volume x average handle time x
                  estimated automation rate. Annual cost savings = annual hours
                  saved x hourly rate.
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Suggested approach
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {getAutomationTypeLabel(opportunity.suggestedAutomationType)}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {
                    AUTOMATION_TYPE_DESCRIPTIONS[
                      opportunity.suggestedAutomationType
                    ]
                  }
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="font-semibold text-foreground">Implementation approach</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {opportunity.suggestedApproach}
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="font-semibold text-foreground">
                  Implementation considerations
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {opportunity.implementationConsiderations}
                </p>
              </div>

              <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
                <p className="font-semibold text-foreground">Risk and complexity notes</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {opportunity.riskNotes}
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
              >
                Compare against the rest of the portfolio
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
