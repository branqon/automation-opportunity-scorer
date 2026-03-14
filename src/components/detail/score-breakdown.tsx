import { formatPercent, formatScore } from "@/lib/formatters";
import { getScoreColorClass } from "@/lib/opportunity-badges";
import type { RankedOpportunity } from "@/lib/scoring";

type ScoreBreakdownProps = {
  opportunity: RankedOpportunity;
};

export function ScoreBreakdown({ opportunity }: ScoreBreakdownProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Score breakdown
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Transparent weighted scoring
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Each factor contributes weighted points to the 100-point ranking model.
        </p>
      </div>

      <div className="border border-line bg-surface-subtle p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Composite score
        </p>
        <div className="mt-2 flex items-end gap-2">
          <p className={`text-3xl font-semibold ${getScoreColorClass(opportunity.valueBand)}`}>
            {formatScore(opportunity.score)}
          </p>
          <p className="pb-0.5 text-sm text-muted-foreground">out of 100</p>
        </div>
      </div>

      <div className="space-y-3">
        {opportunity.scoreBreakdown.map((factor) => (
          <div
            key={factor.key}
            className="border border-line bg-surface p-3"
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
              className="mt-3 h-1 overflow-hidden bg-surface-subtle"
              role="progressbar"
              aria-label={`${factor.label} score contribution`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(factor.normalizedScore * 100)}
              aria-valuetext={`${Math.round(factor.normalizedScore * 100)} percent of factor range`}
            >
              <div
                className="h-full bg-accent"
                style={{ width: `${factor.normalizedScore * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
