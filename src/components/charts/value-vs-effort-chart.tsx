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
  "Quick win": "#147869",
  "Foundation build": "#d39324",
  "Strategic bet": "#c45f4d",
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const dataPoint = payload[0].payload;

  return (
    <div className="rounded-2xl border border-line/80 bg-surface px-4 py-3 shadow-card">
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
      className="relative h-[320px] w-full min-w-0 rounded-3xl"
    >
      <div className="pointer-events-none absolute right-4 top-3 z-10 hidden gap-3 rounded-full border border-line/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur sm:flex">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#147869]" />
          Quick win
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d39324]" />
          Foundation build
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c45f4d]" />
          Strategic bet
        </span>
      </div>

      {isReady ? (
        <ScatterChart
          width={size.width}
          height={size.height}
          margin={{ top: 16, right: 18, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke="rgba(130, 145, 140, 0.18)" />
          <XAxis
            type="number"
            dataKey="implementationDifficulty"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#60716c", fontSize: 12 }}
            label={{
              value: "Implementation difficulty",
              position: "insideBottom",
              offset: -6,
              fill: "#60716c",
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="score"
            domain={[40, 95]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#60716c", fontSize: 12 }}
            label={{
              value: "Opportunity score",
              angle: -90,
              position: "insideLeft",
              fill: "#60716c",
              fontSize: 12,
            }}
          />
          <ZAxis type="number" dataKey="monthlyHoursSaved" range={[120, 540]} />
          <ReferenceLine x={2.5} stroke="rgba(130, 145, 140, 0.32)" />
          <ReferenceLine y={70} stroke="rgba(130, 145, 140, 0.32)" />
          <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<CustomTooltip />} />
          <Scatter data={quickWins} fill={DOT_COLORS["Quick win"]} />
          <Scatter
            data={foundationBuilds}
            fill={DOT_COLORS["Foundation build"]}
          />
          <Scatter data={strategicBets} fill={DOT_COLORS["Strategic bet"]} />
        </ScatterChart>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-3xl border border-line/70 bg-surface-subtle/40 text-sm text-muted-foreground">
          Loading opportunity map...
        </div>
      )}
    </div>
  );
}
