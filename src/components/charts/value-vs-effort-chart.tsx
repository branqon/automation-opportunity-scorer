"use client";

import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { formatHours, formatScore } from "@/lib/formatters";
import type { EffortTier } from "@/lib/scoring";
import { useChartSize } from "@/components/charts/use-chart-size";

type ValueVsEffortDatum = {
  name: string;
  slug: string;
  score: number;
  implementationDifficulty: number;
  monthlyHoursSaved: number;
  effortTier: EffortTier;
};

type ValueVsEffortChartProps = {
  data: ValueVsEffortDatum[];
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: ValueVsEffortDatum;
  }>;
};

const DOT_COLORS: Record<EffortTier, string> = {
  "Quick win": "var(--chart-quick-win)",
  "Foundation build": "var(--chart-foundation)",
  "Strategic bet": "var(--chart-strategic)",
};

const CHART_COLORS = {
  axis: "var(--chart-axis)",
  grid: "var(--chart-grid)",
  reference: "var(--chart-reference)",
} as const;

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const dataPoint = payload[0].payload;

  return (
    <div className="rounded-lg border border-line/80 bg-surface px-4 py-3 shadow-sm">
      <p className="font-semibold text-foreground">{dataPoint.name}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Score {formatScore(dataPoint.score)} | Difficulty{" "}
        {dataPoint.implementationDifficulty}/5
      </p>
      <p className="text-sm text-muted-foreground">
        {formatHours(dataPoint.monthlyHoursSaved)} recovered monthly
      </p>
    </div>
  );
}

export function ValueVsEffortChart({ data }: ValueVsEffortChartProps) {
  const { containerRef, size } = useChartSize();
  const isReady = size.width > 0 && size.height > 0;

  const quickWins = data.filter((item) => item.effortTier === "Quick win");
  const foundationBuilds = data.filter(
    (item) => item.effortTier === "Foundation build",
  );
  const strategicBets = data.filter((item) => item.effortTier === "Strategic bet");

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Scatter plot showing opportunity score against implementation difficulty"
      className="relative h-[320px] w-full min-w-0 rounded-xl"
    >
      <div className="pointer-events-none absolute right-4 top-3 z-10 hidden gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted-foreground sm:flex">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: DOT_COLORS["Quick win"] }}
          />
          Quick win
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: DOT_COLORS["Foundation build"] }}
          />
          Foundation build
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: DOT_COLORS["Strategic bet"] }}
          />
          Strategic bet
        </span>
      </div>

      {isReady ? (
        <ScatterChart
          width={size.width}
          height={size.height}
          margin={{ top: 16, right: 18, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            dataKey="implementationDifficulty"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            label={{
              value: "Implementation difficulty",
              position: "insideBottom",
              offset: -6,
              fill: CHART_COLORS.axis,
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="score"
            domain={[40, 95]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            label={{
              value: "Opportunity score",
              angle: -90,
              position: "insideLeft",
              fill: CHART_COLORS.axis,
              fontSize: 12,
            }}
          />
          <ZAxis type="number" dataKey="monthlyHoursSaved" range={[120, 540]} />
          <ReferenceLine x={2.5} stroke={CHART_COLORS.reference} />
          <ReferenceLine y={70} stroke={CHART_COLORS.reference} />
          <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<CustomTooltip />} />
          <Scatter data={quickWins} fill={DOT_COLORS["Quick win"]} />
          <Scatter
            data={foundationBuilds}
            fill={DOT_COLORS["Foundation build"]}
          />
          <Scatter data={strategicBets} fill={DOT_COLORS["Strategic bet"]} />
        </ScatterChart>
      ) : (
        <div className="h-full w-full rounded-xl border border-line bg-surface-subtle" />
      )}
    </div>
  );
}
