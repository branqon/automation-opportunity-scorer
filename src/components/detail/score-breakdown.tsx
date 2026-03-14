import { formatPercent, formatScore } from "@/lib/formatters";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getScoreColorClass } from "@/lib/opportunity-badges";
import type { RankedOpportunity } from "@/lib/scoring";

type ScoreBreakdownProps = {
  opportunity: RankedOpportunity;
};

export function ScoreBreakdown({ opportunity }: ScoreBreakdownProps) {
  const topFactors = [...opportunity.scoreBreakdown]
    .sort((left, right) => right.contribution - left.contribution)
    .slice(0, 3);

  const factorCards = opportunity.scoreBreakdown.map((factor) => (
    <div
      key={factor.key}
      className="rounded-card border border-line bg-surface-subtle p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{factor.label}</p>
            <span className="text-xs text-muted-foreground">
              {formatPercent(factor.weight)}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {factor.description}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-sm font-medium text-foreground">
            {factor.displayValue}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatScore(factor.contribution)} pts
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-pill bg-background"
        role="progressbar"
        aria-label={`${factor.label} score contribution`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(factor.normalizedScore * 100)}
        aria-valuetext={`${Math.round(factor.normalizedScore * 100)} percent of factor range`}
      >
        <div
          className="h-full rounded-pill bg-accent"
          style={{ width: `${factor.normalizedScore * 100}%` }}
        />
      </div>
    </div>
  ));

  return (
    <SurfaceCard className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Score breakdown
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Transparent weighted scoring
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Each factor contributes weighted points to the 100-point ranking model.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface-subtle p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Composite score
        </p>
        <div className="mt-2 flex items-end gap-2">
          <p className={`text-3xl font-semibold ${getScoreColorClass(opportunity.valueBand)}`}>
            {formatScore(opportunity.score)}
          </p>
          <p className="pb-0.5 text-sm text-muted-foreground">out of 100</p>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Top score drivers
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              Biggest contributors to the rank
            </h3>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.14em] text-muted-foreground sm:block">
            Summary first, full model below
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {topFactors.map((factor) => (
            <div
              key={factor.key}
              className="rounded-card border border-line bg-surface-elevated p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {factor.label}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatPercent(factor.weight)}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {formatScore(factor.contribution)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  pts
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {factor.displayValue}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden space-y-3 md:block">
        {factorCards}
      </div>

      <details className="group rounded-card border border-line bg-surface-subtle md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span>Expand full 9-factor breakdown</span>
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="space-y-3 border-t border-line px-3 pb-3 pt-3">
          {factorCards}
        </div>
      </details>
      <div className="rounded-card border border-line bg-surface-subtle p-4 text-sm text-muted-foreground md:hidden">
        The mobile view keeps the top drivers visible first and leaves the full
        audit trail one tap away.
      </div>
    </SurfaceCard>
  );
}
