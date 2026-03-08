import { SurfaceCard } from "@/components/ui/surface-card";
import { formatPercent, formatScore } from "@/lib/formatters";
import type { RankedOpportunity } from "@/lib/scoring";

type ScoreBreakdownProps = {
  opportunity: RankedOpportunity;
};

export function ScoreBreakdown({ opportunity }: ScoreBreakdownProps) {
  return (
    <SurfaceCard className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Score breakdown
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Transparent weighted scoring
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          The score is deterministic and fixed in code. Each factor contributes
          weighted points to the 100-point ranking model.
        </p>
      </div>

      <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Composite score
        </p>
        <div className="mt-3 flex items-end gap-3">
          <p className="font-display text-5xl font-semibold text-foreground">
            {formatScore(opportunity.score)}
          </p>
          <p className="pb-1 text-sm text-muted-foreground">out of 100</p>
        </div>
      </div>

      <div className="space-y-4">
        {opportunity.scoreBreakdown.map((factor) => (
          <div
            key={factor.key}
            className="rounded-3xl border border-line/70 bg-surface p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-foreground">{factor.label}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Weight {formatPercent(factor.weight)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {factor.description}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-semibold text-foreground">
                  {factor.displayValue}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatScore(factor.contribution)} pts
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-line/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
                style={{ width: `${factor.normalizedScore * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
