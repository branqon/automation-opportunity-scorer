"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  compactCurrencyFormatter,
  formatHours,
  formatScore,
} from "@/lib/formatters";
import type { RankedOpportunity, ScoreFactorKey } from "@/lib/scoring";
import { SCORE_WEIGHTS } from "@/lib/scoring";

type ComparisonViewProps = {
  selectedOpportunities: RankedOpportunity[];
  onClose: () => void;
};

const FACTOR_LABELS: Record<ScoreFactorKey, string> = {
  volume: "Monthly volume",
  laborIntensity: "Analyst time load",
  repeatability: "Repeatability",
  standardization: "Standardization",
  rework: "Rework pressure",
  slaRisk: "SLA risk",
  customerImpact: "Customer impact",
  implementationEase: "Implementation fit",
  approvalEase: "Approval fit",
};

function getEffortVariant(tier: RankedOpportunity["effortTier"]) {
  if (tier === "Quick win") return "success" as const;
  if (tier === "Strategic bet") return "critical" as const;
  return "warning" as const;
}

function getFactorScore(
  opportunity: RankedOpportunity,
  key: ScoreFactorKey,
): number {
  const entry = opportunity.scoreBreakdown.find((b) => b.key === key);
  if (!entry) return 0;
  return Math.round(entry.normalizedScore * 5);
}

type StatRowProps = {
  label: string;
  values: string[];
};

function StatRow({ label, values }: StatRowProps) {
  return (
    <div className="grid border-b border-line/60 last:border-b-0" style={{ gridTemplateColumns: `10rem repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      {values.map((value, i) => (
        <div
          key={i}
          className="flex items-center px-4 py-3 text-sm font-semibold text-foreground"
        >
          {value}
        </div>
      ))}
    </div>
  );
}

type FactorBarRowProps = {
  label: string;
  scores: number[];
};

function FactorBarRow({ label, scores }: FactorBarRowProps) {
  return (
    <div className="grid border-b border-line/60 last:border-b-0" style={{ gridTemplateColumns: `10rem repeat(${scores.length}, 1fr)` }}>
      <div className="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      {scores.map((score, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-xs font-semibold text-foreground">
            {score}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ComparisonView({
  selectedOpportunities,
  onClose,
}: ComparisonViewProps) {
  const factorKeys = Object.keys(SCORE_WEIGHTS) as ScoreFactorKey[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/20 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl rounded-card border border-line/80 bg-surface/95 shadow-card backdrop-blur">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-line/80 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Side-by-side comparison
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
            Comparing {selectedOpportunities.length} opportunities
          </h2>
        </div>

        <div className="overflow-x-auto">
          {/* Header row: name + rank */}
          <div className="grid border-b border-line/80 bg-surface-subtle/60" style={{ gridTemplateColumns: `10rem repeat(${selectedOpportunities.length}, 1fr)` }}>
            <div className="px-4 py-4" />
            {selectedOpportunities.map((o) => (
              <div key={o.slug} className="px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Rank #{o.rank}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">
                  {o.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.team.name}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="border-b border-line/80">
            <div className="bg-surface-subtle/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Key metrics
            </div>
            <StatRow
              label="Score"
              values={selectedOpportunities.map((o) => formatScore(o.score))}
            />
            <StatRow
              label="Monthly volume"
              values={selectedOpportunities.map(
                (o) => `${o.monthlyVolume}/mo`,
              )}
            />
            <StatRow
              label="Hours saved"
              values={selectedOpportunities.map((o) =>
                formatHours(o.monthlyHoursSaved),
              )}
            />
            <StatRow
              label="Annual savings"
              values={selectedOpportunities.map((o) =>
                compactCurrencyFormatter.format(o.annualCostSavings),
              )}
            />
            <div className="grid border-b border-line/60 last:border-b-0" style={{ gridTemplateColumns: `10rem repeat(${selectedOpportunities.length}, 1fr)` }}>
              <div className="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Effort tier
              </div>
              {selectedOpportunities.map((o) => (
                <div key={o.slug} className="flex items-center px-4 py-3">
                  <Badge variant={getEffortVariant(o.effortTier)}>
                    {o.effortTier}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="grid border-b border-line/60 last:border-b-0" style={{ gridTemplateColumns: `10rem repeat(${selectedOpportunities.length}, 1fr)` }}>
              <div className="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Value band
              </div>
              {selectedOpportunities.map((o) => (
                <div key={o.slug} className="flex items-center px-4 py-3">
                  <Badge variant="accent">{o.valueBand}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring factors */}
          <div>
            <div className="bg-surface-subtle/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Scoring factors
            </div>
            {factorKeys.map((key) => (
              <FactorBarRow
                key={key}
                label={FACTOR_LABELS[key]}
                scores={selectedOpportunities.map((o) =>
                  getFactorScore(o, key),
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
