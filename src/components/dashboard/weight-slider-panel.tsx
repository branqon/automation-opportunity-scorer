"use client";

import { RotateCcw, X } from "lucide-react";
import { SurfaceCard } from "@/components/ui/surface-card";
import { formatPercent } from "@/lib/formatters";
import { SCORE_WEIGHTS, type ScoreFactorKey } from "@/lib/scoring";

const FACTOR_LABELS: Record<ScoreFactorKey, string> = {
  volume: "Volume",
  laborIntensity: "Labor intensity",
  repeatability: "Repeatability",
  standardization: "Standardization",
  rework: "Rework pressure",
  slaRisk: "SLA risk",
  customerImpact: "Customer impact",
  implementationEase: "Implementation ease",
  approvalEase: "Approval ease",
};

const SLIDER_ORDER: ScoreFactorKey[] = Object.keys(
  SCORE_WEIGHTS,
) as ScoreFactorKey[];

type WeightSliderPanelProps = {
  importance: Record<ScoreFactorKey, number>;
  normalizedWeights: Record<ScoreFactorKey, number>;
  isCustom: boolean;
  onImportanceChange: (key: ScoreFactorKey, value: number) => void;
  onReset: () => void;
  onClose: () => void;
};

export function WeightSliderPanel({
  importance,
  normalizedWeights,
  isCustom,
  onImportanceChange,
  onReset,
  onClose,
}: WeightSliderPanelProps) {
  function handleSliderChange(key: ScoreFactorKey, value: number) {
    onImportanceChange(key, value);
  }

  return (
    <SurfaceCard className="w-full shrink-0 bg-surface-elevated lg:sticky lg:top-24 lg:w-72 xl:w-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            What-if analysis
          </p>
          <h2 className="mt-1 text-base font-semibold text-foreground">
            Adjust scoring weights
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Rebalance factor importance, then carry the scenario into detail
            views through the URL.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
          aria-label="Close weight panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {SLIDER_ORDER.map((key) => (
          <div key={key} className="rounded-card border border-line bg-surface p-3">
            <div className="flex items-baseline justify-between text-sm">
              <label
                htmlFor={`weight-${key}`}
                className="font-medium text-foreground"
              >
                {FACTOR_LABELS[key]}
              </label>
              <span className="text-xs text-muted-foreground">
                {formatPercent(normalizedWeights[key])}
              </span>
            </div>
            <input
              id={`weight-${key}`}
              type="range"
              min={1}
              max={20}
              step={1}
              value={importance[key]}
              onChange={(e) =>
                handleSliderChange(key, Number(e.target.value))
              }
              className="mt-1 w-full accent-accent"
              aria-label={`${FACTOR_LABELS[key]} importance`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={!isCustom}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium transition ${
          isCustom
            ? "text-muted-foreground hover:border-accent/25 hover:bg-surface-elevated hover:text-foreground"
            : "cursor-default text-muted-foreground/40"
        }`}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset to defaults
      </button>
    </SurfaceCard>
  );
}
